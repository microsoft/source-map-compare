import type { ExploreBundleResult } from 'source-map-explorer/lib/types';

export interface BundleStats {
  results: ExploreBundleResult[];
}

export interface SingleBundleAppArgs {
  mode: 'single';
  bundle: ExploreBundleResult;
}

export interface BundleComparisonAppArgs {
  mode: 'comparison';
  baseline: ExploreBundleResult;
  compare: ExploreBundleResult;
}

/**
 * Defines the boundary between the node.js-based CLI and the browser-based web page
 */
export type AppArguments = SingleBundleAppArgs | BundleComparisonAppArgs;
