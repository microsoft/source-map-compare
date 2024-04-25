import type webpack from 'webpack';
import { merge } from 'webpack-merge';
import 'webpack-dev-server';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ForkTsCheckerNotifierWebpackPlugin from 'fork-ts-checker-notifier-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import buildConfig from './src/Bundler/webpack.config';

const isDevelopment = process.env.NODE_ENV !== 'production';

const config: webpack.Configuration = merge(buildConfig({ bundleName: 'Local Development' }), {
  devServer: {
    hot: true,
    compress: true,
    port: 9000
  },
  mode: isDevelopment ? 'development' : 'production',
  output: {
    publicPath: '/'
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new ForkTsCheckerNotifierWebpackPlugin({
      title: 'TypeScript',
      excludeWarnings: false
    }),
    isDevelopment && new ReactRefreshWebpackPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              getCustomTransformers: () => ({
                before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean)
              }),
              transpileOnly: isDevelopment
            }
          }
        ]
      }
    ]
  }
});

export default config;
