import type { Logger } from '@caporal/core';
import { execSync } from 'child_process';
import { promises as fsPromises, mkdirSync } from 'fs';
import { default as HtmlWebpackPlugin } from 'html-webpack-plugin';
import * as os from 'os';
import * as path from 'path';
import { rimraf } from 'rimraf';
import { promisify } from 'util';
import webpack from 'webpack';
import type { AppArguments } from '../AppArguments';
import { externalLibs } from './Externals';
import { InlineChunkHtmlPlugin } from './InlineChunkHtmlPlugin';
import type { CommonOptions } from './Options';

export async function buildBundle(appArgs: AppArguments, options: CommonOptions, log: Logger): Promise<void> {
  const tempOutputDirectory = path.resolve(
    os.tmpdir(),
    // tslint:disable-next-line: insecure-random
    `bundle-size-viewer.${Math.floor(Math.random() * (1 << 16)).toString(16)}`
  );

  mkdirSync(tempOutputDirectory);
  log.info(`Outputting webpack build to ${tempOutputDirectory}`);

  const isProduction = (options.outputFlavor ?? 'production') === 'production';
  const bundleName =
    appArgs.mode === 'comparison'
      ? appArgs.baseline.length === 1
        ? appArgs.compare[0].bundleName
        : '(Comparison)'
      : appArgs.bundles.length === 1
        ? appArgs.bundles[0].bundleName
        : '(Explore)';

  const config: webpack.Configuration = {
    mode: isProduction ? 'production' : 'development',
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        path: require.resolve('path-browserify')
      }
    },
    output: { path: tempOutputDirectory, filename: '[name].js', chunkFilename: '[name].js' },
    context: path.resolve(__dirname, '../../'),
    entry: ['./lib/View/index.js'],
    externals: options.noCdn
      ? undefined
      : Object.fromEntries(
          externalLibs.map(({ packageName, libraryVariable }) => [packageName, libraryVariable] as const)
        ),
    plugins: [
      // Use banner plugin to inject app_arguments
      new webpack.BannerPlugin({
        raw: true,
        entryOnly: true,
        banner: `window.APP_ARGUMENTS = ${JSON.stringify(appArgs)};`,
        test: /\.[tj]sx?$/
      }),
      new HtmlWebpackPlugin({
        title: `Bundle Size Viewer - ${bundleName}`,
        inject: 'body'
      }),
      new InlineChunkHtmlPlugin({
        tests: [
          // Inline all chunks
          /.*/
        ],
        externals: options.noCdn
          ? undefined
          : externalLibs.map(
              ({ packageName, packageSemver, scriptPath }) =>
                `https://unpkg.com/${packageName}@${packageSemver}${scriptPath}`
            )
      })
    ],
    devtool: 'source-map'
  };

  log.debug('webpack config: ', config);
  const compiler = webpack(config);

  // Run webpack compiler
  const compileResult = await promisify(compiler.run.bind(compiler) as typeof compiler.run)();

  if (compileResult?.hasWarnings()) {
    log.debug('Webpack Warnings', compileResult.compilation.warnings.map(String));
  }

  if (compileResult?.hasErrors()) {
    log.error(compileResult.compilation.errors);
    throw new Error(`Webpack encountered errors: ${compileResult.compilation.errors}`);
  }

  const htmlOutputPath = path.join(tempOutputDirectory, 'index.html');

  // Handle Output

  if (options.outputFile) {
    log.info(`Copying output to ${options.outputFile}`);
    await fsPromises.copyFile(htmlOutputPath, options.outputFile);
    // Clean up temp output directory
    await rimraf(tempOutputDirectory);
  } else {
    // Launch output in a browser
    log.debug('Launching in browser');
    execSync(`start ${htmlOutputPath}`);
  }
}
