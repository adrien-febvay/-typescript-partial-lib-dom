/** Any browser function. */
export type AnyBrowserFn = (window: Window, ...args: any[]) => unknown;

/** Any function. */
export type AnyFn = (...args: unknown[]) => unknown;

/** Broswer function, takes `window` as parameter. */
export type BrowserFn<ReturnType> = (window: Window) => ReturnType;

/** If `Type` is `void`, returns `Then`, otherwise returns `Else`. */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type IfVoid<Type, Then, Else> = Type extends void ? (Type extends undefined ? Else : Then) : Else;

/** Merges return types. */
export type MergeReturnTypes<Value1, Value2> = IfVoid<
  Value1,
  VoidOrUnionUndefined<Value2>,
  Value1 | IfVoid<Value2, undefined, Value2>
>;

/** Returns `Input` array type without it first element. */
export type Shift<Input extends [Window, ...unknown[]]> = Input extends [Window, ...infer Rest] ? Rest : [];

/** If `Type` is `void`, returns `void`, otherwise returns `Type | undefined` union. */
export type VoidOrUnionUndefined<Type> = IfVoid<Type, void, Type | undefined>;
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
