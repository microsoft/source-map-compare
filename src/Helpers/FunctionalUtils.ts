export function notReached(message?: string): never {
  throw new Error(message);
}

export const isTruthy = Boolean as unknown as <T>(value: T) => value is Exclude<T, undefined | null | false | 0 | ''>;
