import type { HtmlTagObject } from 'html-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type * as webpack from 'webpack';

/*
 * Largely adapted from InlineChunkHtmlPlugin in the react-dev-utils package (which contains a lot of other code and dependencies)
 * https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/InlineChunkHtmlPlugin.js
 *
 * Original license:
 *
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface InlineChunkHtmlPluginOptions {
  tests?: RegExp[];
  externals?: string[];
}

export class InlineChunkHtmlPlugin {
  private readonly tests: RegExp[];
  private readonly externals: string[];

  constructor(options?: InlineChunkHtmlPluginOptions) {
    this.tests = options?.tests ?? [];
    this.externals = options?.externals ?? [];
  }

  getInlinedTag(
    publicPath: string,
    assets: webpack.Compilation['assets'],
    tag: HtmlTagObject
  ): HtmlTagObject & { closeTag?: boolean } {
    if (tag.tagName !== 'script' || !(tag.attributes && tag.attributes.src)) {
      return tag;
    }
    const source = tag.attributes.src as string;
    const scriptName: string = publicPath ? source.replace(publicPath, '') : source;
    if (!this.tests.some(test => scriptName.match(test))) {
      return tag;
    }
    const asset = assets[scriptName];
    if (!asset) {
      return tag;
    }
    return {
      tagName: 'script',
      innerHTML: asset.source().toString('utf8'),
      attributes: {},
      voidTag: false,
      closeTag: true,
      meta: { plugin: 'InlineChunkHtmlPlugin' }
    };
  }

  apply(compiler: webpack.Compiler): void {
    const publicPath = (() => {
      let publicPath = compiler.options.output?.publicPath ?? '';
      if (typeof publicPath === 'function') {
        publicPath = publicPath({});
      }
      if (publicPath && !publicPath.endsWith('/')) {
        publicPath += '/';
      }
      return publicPath;
    })();

    compiler.hooks.compilation.tap('InlineChunkHtmlPlugin', compilation => {
      const tagFunction = (tag: HtmlTagObject) => this.getInlinedTag(publicPath, compilation.assets, tag);

      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap('InlineChunkHtmlPlugin', assets => {
        // Inline compiled chunks
        assets.assetTags.scripts = assets.assetTags.scripts.map(tagFunction);
        // Add external library script tags
        assets.assetTags.scripts.unshift(
          ...this.externals.map<HtmlTagObject>(externalUrl => ({
            tagName: 'script',
            voidTag: false,
            attributes: { crossorigin: true, src: externalUrl },
            meta: { plugin: 'InlineChunkHtmlPlugin' }
          }))
        );
        return assets;
      });
    });
  }
}
