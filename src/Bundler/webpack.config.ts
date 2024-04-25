import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import type { AppArguments } from '../AppArguments';
import { notReached } from '../Helpers';

export interface ConfigOptions {
  bundleName: string;
  appArgs?: AppArguments;
}

export default function config({ bundleName, appArgs }: ConfigOptions): webpack.Configuration {
  return {
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        fs: path.dirname(require.resolve('./browser/fs')),
        //'fs/promises': require.resolve('./browser/fs/promises'),
        inspector: require.resolve('./browser/inspector'),
        process: require.resolve('./browser/process'),
        path: require.resolve('path-browserify'),
        util: require.resolve('util/'),
        assert: require.resolve('assert/'),
        os: require.resolve('os-browserify/browser'),
        zlib: require.resolve('browserify-zlib')
      }
    },
    target: 'web',
    // output: { path: tempOutputDirectory, filename: '[name].js', chunkFilename: '[name].js' },
    context: path.resolve(__dirname, '../../'),
    entry: [require.resolve('../View/index') ?? notReached()],
    plugins: [
      // Use banner plugin to inject app_arguments
      new webpack.BannerPlugin({
        raw: true,
        entryOnly: true,
        banner: `
          window.APP_ARGUMENTS = ${JSON.stringify(appArgs)};
          window.process = { platform: 'linux', cwd: () => '/', env: {} };
        `,
        test: /\.[tj]sx?$/
      }),
      new HtmlWebpackPlugin({
        title: `Bundle Size Viewer - ${bundleName}`,
        inject: 'body',
        template: require.resolve('../../public/index.html')
      })
    ],
    devtool: 'source-map'
  };
}
