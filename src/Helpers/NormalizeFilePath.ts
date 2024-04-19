/**
 * Normalize a path
 */
export function normalizeFilePath(filepath: string) {
  return filepath.replace(/.+[/\\]node_modules[/\\]/, '//node_modules/');
}
