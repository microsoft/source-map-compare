export type TupleToUnion<T> = T extends { [indx: number]: infer U } ? U : never;

export const isTruthy = (Boolean as unknown) as <T>(value: T) => value is Exclude<T, undefined | null | false | 0 | ''>;
