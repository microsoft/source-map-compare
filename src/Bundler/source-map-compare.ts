#!/usr/bin/env node
import { program, type Action, type Logger, type ActionParameters } from '@caporal/core';
import { readFile as readFileAsync } from 'fs';
import * as path from 'path';
import type * as SME from 'source-map-explorer/lib/types';
import { explore } from 'source-map-explorer';
import { promisify } from 'util';
import type { AppArguments, BundleStats } from '../AppArguments';
import { buildBundle } from './BuildBundle';
import { type CommonOptions, OUTPUT_FLAVORS } from './Options';

const readFile = promisify(readFileAsync);

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

function isSMEExploreResultError(value: unknown): value is SME.ExploreResult {
  const exploreResult = value as SME.ExploreResult;
  return exploreResult.errors !== undefined && Array.isArray(exploreResult.errors);
}

async function getStats(log: Logger, mainPath: string, sourcemapPath?: string): Promise<SME.ExploreResult> {
  if (path.extname(mainPath) === '.json') {
    // Already processed stats file
    log.info(`Reading stats file from ${mainPath}`);
    const stats = JSON.parse((await readFile(mainPath)).toString()) as BundleStats;
    return { bundles: stats.results, errors: [] };
  }

  log.info(`Parsing bundle at ${mainPath}`);

  let result: SME.ExploreResult;

  try {
    result = await explore({ code: mainPath, map: sourcemapPath }, { output: { format: 'json' } });
  } catch (err) {
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
  const leftExploreResult = await getStats(logger, args.left, args.leftSourcemap);
  const rightExploreResult = await getStats(logger, args.right, args.rightSourcemap);

  const appArgs: AppArguments = {
    mode: 'comparison',
    baseline: leftExploreResult.bundles[0],
    compare: rightExploreResult.bundles[0]
  };

  return buildBundle(appArgs, options, logger);
});

const analyzeBundle = actionWrapper<SingleBundleArgs, CommonOptions>(async ({ logger, args, options }) => {
  logger.debug('args: ', args);
  logger.debug('options: ', options);
  const exploreResult = await getStats(logger, args.bundle, args.sourcemap);

  const appArgs: AppArguments = {
    mode: 'single',
    bundle: exploreResult.bundles[0]
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
    .argument('<left>', 'Path to either left bundle file or stats json file')
    .argument('<right>', 'Path to either right bundle file or stats json file')
    .argument('[left_sourcemap]', 'If <left> argument is a bundle, this optionally points to its source-map')
    .argument('[right_sourcemap]', 'If <right> argument is a bundle, this optionally points to its source-map')
    .action(compareBundles)
    .command('analyze', 'View a single bundle')
    .argument('<bundle>', 'Path to either bundle file or stats json file')
    .argument('[sourcemap]', 'If <bundle> argument is a bundle, this optionally points to its source-map')
    .action(analyzeBundle);

  program.run();
}
