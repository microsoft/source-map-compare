import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMemo<TDeps extends any[], TFun extends (...params: TDeps) => any>(
  fun: TFun,
  ...params: TDeps
): ReturnType<TFun> {
  return React.useMemo(() => fun(...params), params);
}
