export const notReached = (message?: string): never => {
  throw new Error(message);
};
