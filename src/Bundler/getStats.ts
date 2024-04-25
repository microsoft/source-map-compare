import { type Logger } from '@caporal/core';
import realFs from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { explore } from 'source-map-explorer';
import type { ExploreResult, Bundle } from 'source-map-explorer/lib/types';
import type { BundleStats } from '../AppArguments';
import { truncate } from '../Helpers';
import { type FSOption, glob } from 'glob';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

export function isSMEExploreResultError(value: unknown): value is ExploreResult {
  const exploreResult = value as ExploreResult;
  return exploreResult.errors !== undefined && Array.isArray(exploreResult.errors);
}

export async function* scanBundles(mainPath: string, options: { fs?: FSOption } = {}): AsyncGenerator<Bundle> {
  const fs = options.fs ?? realFs;
  for (const code of glob.globSync(mainPath, { absolute: true, fs: options.fs })) {
    let map: string | undefined;
    const fileContents = await fs.promises!.readFile(code, 'utf8');
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
      if (fs.existsSync(sourcemapFile)) {
        map = sourcemapFile;
      }
    }
    yield { code, map };
  }
}

export async function getStats(
  log: Logger | undefined,
  mainPath: string,
  sourcemapPath?: string,
  options: { fs?: FSOption } = {}
): Promise<ExploreResult> {
  const fs = options.fs ?? realFs;
  if (path.extname(mainPath) === '.json') {
    // Already processed stats file
    log?.info(truncate`Reading stats file from ${truncate.tail(mainPath)}`);
    const stats = JSON.parse((await readFile(mainPath)).toString()) as BundleStats;
    return { bundles: stats.results, errors: [] };
  }

  log?.info(truncate`Parsing bundle at ${truncate.tail(mainPath)}`);

  let result: ExploreResult;

  const bundles: Bundle[] = [];
  // if file exists, it isn't a glob pattern
  if (fs.existsSync(mainPath) || sourcemapPath) {
    bundles.push({ code: mainPath, map: sourcemapPath });
    log?.verbose(truncate`Loaded:  ${truncate.tail(mainPath)}`);
  } else {
    for await (const bundle of scanBundles(mainPath, options)) {
      if (bundle.map === undefined) {
        log?.verbose(truncate`Skipped: ${truncate.tail(bundle.code.toString())} (no sourcemap)`);
        continue;
      }
      log?.verbose(truncate`Loaded:  ${truncate.tail(bundle.code.toString())}`);
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
