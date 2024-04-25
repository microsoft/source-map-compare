#!/usr/bin/env node
import { program, type Action, type ActionParameters } from '@caporal/core';
import type { AppArguments } from '../AppArguments';
import { type CommonOptions, OUTPUT_FLAVORS } from './Options';
import { buildBundle } from './BuildBundle';
import { getStats } from './getStats';

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
