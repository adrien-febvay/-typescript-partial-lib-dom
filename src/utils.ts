import type { AnyBrowserFn, BrowserFn, IfVoid, MergeReturnTypes, Shift, VoidOrUnionUndefined } from './types';

import { EnvironmentError } from './EnvironmentError';

export { EnvironmentError } from './EnvironmentError';
export { AnyBrowserFn, BrowserFn } from './types';

/** Does nothing and returns `undefined` (return type `void`). */
function voidFn() {}

/**
 * Executes a function when on a browser (more accurately when `window` is defined).
 *
 * Useful when code has many expressions using DOM global variables, to avoid coalescing operators and optional chainings everywhere.
 *
 * Also allows for shorter code when using object destructuring in the parameters.
 *
 * @param fn Function to execute, with `window` as parameter.
 * @param fallbackValue Value to return when not on a browser, undefined by default.
 * @returns On a browser, the function result, otherwise the fallback value.
 * @example
 * ```
 *   // Number on browser, NaN otherwise.
 *   const scrollY = onBrowser(({ scrollY }) => scrollY, NaN);
 * ```
 */
export function onBrowser<ReturnType>(fn: BrowserFn<ReturnType>): VoidOrUnionUndefined<ReturnType>;
export function onBrowser<ReturnType, FallbackValue>(
  fn: BrowserFn<ReturnType>,
  fallbackValue: FallbackValue,
): IfVoid<ReturnType, FallbackValue, ReturnType | FallbackValue>;
export function onBrowser(fn: BrowserFn<unknown>, fallbackValue?: unknown) {
  return window ? fn(window) : fallbackValue;
}

/**
 * Executes a function when on a browser, but otherwise throws an `EnvironmentError`.
 *
 * Good way to wrap code and get a clean return type, but may cause crashes if not used properly.
 *
 * @param fn Function to execute, with `window` as parameter.
 * @returns On a browser, the function result, otherwise throws.
 * @example
 * ```
 *   // Number on browser, otherwise throws.
 *   const scrollY = onBrowserOrThrow(({ scrollY }) => scrollY);
 *
 *   // Can only return a number.
 *   const getScrollY = onBrowserOrThrow(({ scrollY }) => () => scrollY);
 * ```
 */
export function onBrowserOrThrow<ReturnType>(fn: BrowserFn<ReturnType>): ReturnType {
  if (window) {
    return fn(window);
  } else {
    throw new EnvironmentError(fn);
  }
}

/**
 * Executes a function when on a browser (more accurately when `window` is defined).
 *
 * Useful when code has many expressions using DOM global variables, to avoid coalescing operators and optional chainings everywhere.
 *
 * Also allows for shorter code when using object destructuring in the parameters.
 *
 * @param fn Function to execute, with `window` as parameter.
 * @param fallbackValue Value to return when not on a browser, undefined by default.
 * @returns On a browser, the function result, otherwise the fallback value.
 * @example
 * ```
 *   // Number on browser, NaN otherwise and issues a warning in the console.
 *   const scrollY = onBrowserOrWarn(({ scrollY }) => scrollY, NaN);
 * ```
 */
export function onBrowserOrWarn<ReturnType>(fn: BrowserFn<ReturnType>): VoidOrUnionUndefined<ReturnType>;
export function onBrowserOrWarn<ReturnType, FallbackValue>(
  fn: BrowserFn<ReturnType>,
  fallbackValue: FallbackValue,
): IfVoid<ReturnType, FallbackValue, ReturnType | FallbackValue>;
export function onBrowserOrWarn(fn: BrowserFn<unknown>, fallbackValue?: unknown) {
  if (!window) {
    // eslint-disable-next-line no-console
    console.error(new EnvironmentError(fn));
  }
  return window ? fn(window) : fallbackValue;
}

/**
 * Allows a function to be executed only on a browser (more accurately when `window` is defined).
 *
 * Ideal to make callbacks.
 *
 * @param fn A function to execute with `window` as its first parameter.
 * @param fallbackFn Function to use when not on browser, void function by default.
 * @returns A function accordingly.
 * @example
 * ```
 *   const getScrollY = browserFn((window, y = 0) => window.scrollY + y);
 *   const scrollYPlusOne = getScrollY(1); // Number on browser, undefined otherwise.
 *
 *   // Here then callback will be executed upon promise resolution but only on a browser.
 *   myPromise.then(browserFn(myCallback));
 * ```
 */
export function browserFn<Fn extends AnyBrowserFn>(
  fn: Fn,
): (...args: Shift<Parameters<Fn>>) => VoidOrUnionUndefined<ReturnType<Fn>>;

export function browserFn<Fn extends AnyBrowserFn, FallbackReturnType>(
  fn: Fn,
  fallbackFn: (...args: Shift<Parameters<Fn>>) => FallbackReturnType,
): (...args: Shift<Parameters<Fn>>) => MergeReturnTypes<ReturnType<Fn>, FallbackReturnType>;

export function browserFn(fn: BrowserFn<unknown>, fallbackFn = voidFn) {
  return window ? fn.bind(null, window) : fallbackFn;
}

/**
 * Allows a function to be executed on a browser (more accurately when `window` is defined).
 *
 * Throws an `EnvironmentError` when the resulting function is called outside of a browser.
 *
 * @param fn A function to execute with `window` as its first parameter.
 * @returns A function accordingly.
 * @example
 * ```
 *   const getScrollY = browserFnOrThrow((window, y = 0) => window.scrollY + y);
 *   const scrollYPlusOne = getScrollY(1); // Number on browser, throws otherwise.
 *
 *   // Here then callback will be executed upon promise resolution on a browser,
 *   // but otherwise will throw and thus cause a rejection.
 *   myPromise.then(browserFnOrThrow(myCallback));
 * ```
 */
export function browserFnOrThrow<Fn extends AnyBrowserFn>(fn: Fn): (...args: Shift<Parameters<Fn>>) => ReturnType<Fn>;
export function browserFnOrThrow(fn: BrowserFn<unknown>) {
  return window ? fn.bind(null, window) : EnvironmentError.throwingFn(fn);
}

/**
 * Allows a function to be executed only on a browser (more accurately when `window` is defined).
 *
 * Sends a warning to the console when the resulting function is called outside of a browser.
 *
 * @param fn A function to execute with `window` as its first parameter.
 * @param fallbackFn Function to use when not on browser, void function by default.
 * @returns A function accordingly.
 * @example
 * ```
 *   const getScrollY = browserFnOrWarn((window, y = 0) => window.scrollY + y);
 *   const scrollYPlusOne = getScrollY(1); // Number on browser, undefined otherwise.
 *
 *   // Here then callback will be executed upon promise resolution but only on a browser,
 *   // otherwise will send a warning to the console and resolve to `undefined`.
 *   myPromise.then(browserFnOrWarn(myCallback));
 * ```
 */
export function browserFnOrWarn<Fn extends AnyBrowserFn>(
  fn: Fn,
): (...args: Shift<Parameters<Fn>>) => VoidOrUnionUndefined<ReturnType<Fn>>;

export function browserFnOrWarn<Fn extends AnyBrowserFn, FallbackReturnType>(
  fn: Fn,
  fallbackFn: (...args: Shift<Parameters<Fn>>) => FallbackReturnType,
): (...args: Shift<Parameters<Fn>>) => MergeReturnTypes<ReturnType<Fn>, FallbackReturnType>;

export function browserFnOrWarn(fn: BrowserFn<unknown>, fallbackFn = voidFn) {
  return window ? fn.bind(null, window) : EnvironmentError.warningFn(fn, fallbackFn);
}
