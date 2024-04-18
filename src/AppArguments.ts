import type * as SMETypes from 'source-map-explorer/lib/types';

export type BundleStats = { results: SMETypes.ExploreBundleResult[] };

/**
 * Defines the boundary between the node.js-based CLI and the browser-based web page
 */
export type AppArguments =
  | {
      mode: 'comparison';
      leftBundle: SMETypes.ExploreBundleResult;
      rightBundle: SMETypes.ExploreBundleResult;
    }
  | {
      mode: 'single';
      bundle: SMETypes.ExploreBundleResult;
    };
