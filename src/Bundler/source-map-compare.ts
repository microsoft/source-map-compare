#!/usr/bin/env node
import { program, type Action, type Logger, type ActionParameters } from '@caporal/core';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import * as path from 'path';
import { explore } from 'source-map-explorer';
import type { ExploreResult, Bundle } from 'source-map-explorer/lib/types';
import type { AppArguments, BundleStats } from '../AppArguments';
import { type CommonOptions, OUTPUT_FLAVORS } from './Options';
import { buildBundle } from './BuildBundle';
import { truncate } from '../Helpers';

interface CompareArgs {
  left: string;
  right: string;
  leftSourcemap?: string;
  rightSourcemap?: string;
}

interface SingleBundleArgs {
  bundle: string;
  sourcemap?: string;
}

function isSMEExploreResultError(value: unknown): value is ExploreResult {
  const exploreResult = value as ExploreResult;
  return exploreResult.errors !== undefined && Array.isArray(exploreResult.errors);
}

async function getStats(log: Logger, mainPath: string, sourcemapPath?: string): Promise<ExploreResult> {
  if (path.extname(mainPath) === '.json') {
    // Already processed stats file
    log.info(truncate`Reading stats file from ${truncate.tail(mainPath)}`);
    const stats = JSON.parse((await readFile(mainPath)).toString()) as BundleStats;
    return { bundles: stats.results, errors: [] };
  }

  log.info(truncate`Parsing bundle at ${truncate.tail(mainPath)}`);

  let result: ExploreResult;

  const bundles: Bundle[] = [];
  // if file exists, it isn't a glob pattern
  if (existsSync(mainPath) || sourcemapPath) {
    bundles.push({ code: mainPath, map: sourcemapPath });
    log.verbose(truncate`Loaded:  ${truncate.tail(mainPath)}`);
  } else {
    for await (const bundle of scanBundles(mainPath)) {
      if (bundle.map === undefined) {
        log.verbose(truncate`Skipped: ${truncate.tail(bundle.code.toString())} (no sourcemap)`);
        continue;
      }
      log.verbose(truncate`Loaded:  ${truncate.tail(bundle.code.toString())}`);
      bundles.push(bundle);
    }
  }

  try {
    result = await explore(bundles, { output: { format: 'json' } });
  } catch (err: unknown) {
    if (isSMEExploreResultError(err)) {
      // SME throws a ExploreResult object in case of errors
      result = err;
    } else {
      throw err;
    }
  }

  const errors = result.errors.filter(error => !error.isWarning);

  if (errors.length) {
    throw new Error(`Encountered errors exploring bundle: ${JSON.stringify(errors)}`);
  }

  return result;
}

async function* scanBundles(mainPath: string): AsyncGenerator<Bundle> {
  for await (const code of glob.iterate(mainPath, { absolute: true })) {
    let map: string | undefined;
    const fileContents = await readFile(code, 'utf8');
    const lastLine = fileContents.split(/(\r\n|\n)/g).pop();
    // auto-detect sourcemaps
    if (lastLine) {
      const sourceMappingURLMatch = lastLine.match(/^\/\/# sourceMappingURL=(.*)$/);
      if (sourceMappingURLMatch) {
        map = path.join(path.dirname(code), sourceMappingURLMatch[1]);
      }
    }
    if (!map) {
      const sourcemapFile = `${code}.map`;
      if (existsSync(sourcemapFile)) {
        map = sourcemapFile;
      }
    }
    yield { code, map };
  }
}

/**
 * Wraps action callbacks, providing error handling and better types
 */
function actionWrapper<
  Args,
  Options,
  TModifiedParams = Omit<ActionParameters, 'args' | 'options'> & { args: Args; options: Options }
>(cb: (params: TModifiedParams) => Promise<void>): Action {
  return (params: ActionParameters) =>
    cb(params as unknown as TModifiedParams).catch(err => {
      const { logger } = params;
      logger.error(String(err));
      process.exit(1);
    });
}

const compareBundles: Action = actionWrapper<CompareArgs, CommonOptions>(async ({ logger, args, options }) => {
  logger.debug('args: ', args);
  logger.debug('options: ', options);
  const baseline = await getStats(logger, args.left, args.leftSourcemap);
  const compare = await getStats(logger, args.right, args.rightSourcemap);

  const appArgs: AppArguments = {
    mode: 'comparison',
    baseline: baseline.bundles,
    compare: compare.bundles
  };

  return buildBundle(appArgs, options, logger);
});

const analyzeBundle = actionWrapper<SingleBundleArgs, CommonOptions>(async ({ logger, args, options }) => {
  logger.debug('args: ', args);
  logger.debug('options: ', options);
  const exploreResult = await getStats(logger, args.bundle, args.sourcemap);

  const appArgs: AppArguments = {
    mode: 'single',
    bundles: exploreResult.bundles
  };

  return buildBundle(appArgs, options, logger);
});

if (require.main === module) {
  program
    .option(
      '-o, --output-file <outputFile>',
      "File to output html view to. If specified, output won't automatically be launched",
      { global: true }
    )
    .option('--noCdn', 'If specified, bundle all dependencies rather than loading from CDN', {
      validator: program.BOOLEAN,
      global: true
    })
    .option(
      '--output-flavor <outputFlavor>',
      `Whether to minify and optimize the output. Options: ${OUTPUT_FLAVORS.join('|')}`,
      { validator: [...OUTPUT_FLAVORS], global: true }
    )
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require('../../package.json').version);

  program
    .command('compare', 'Compares two bundles')
    .argument('<left>', 'Path to either left bundle file, glob pattern, or stats json file')
    .argument('<right>', 'Path to either right bundle file, glob pattern, or stats json file')
    .argument('[left_sourcemap]', 'If <left> argument is a bundle file, this optionally points to its source-map')
    .argument('[right_sourcemap]', 'If <right> argument is a bundle file, this optionally points to its source-map')
    .action(compareBundles)
    .command('analyze', 'View a single bundle')
    .argument('<bundle>', 'Path to either bundle file or stats json file')
    .argument('[sourcemap]', 'If <bundle> argument is a bundle file, this optionally points to its source-map')
    .action(analyzeBundle);

  program.run();
}
