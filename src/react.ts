/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { AnyBrowserFn, AnyFn, BrowserFn, MergeReturnTypes, Shift, VoidOrUnionUndefined } from './types';

import React from 'react';
import { EnvironmentError } from './EnvironmentError';

export { EnvironmentError } from './EnvironmentError';

/** Does nothing and returns `undefined` (return type `void`). */
function voidFn() {}

/**
 * `useBrowserCallback` will return a memoized version of the callback that only changes if one of the `deps` has changed.
 *
 * This callback will be only executed on a browser (more accurately when `window` is defined).
 *
 * @param fn A callback to execute with `window` as its first parameter.
 * @param deps List of dependencies which will trigger a new memoization on change.
 * @returns A memoized version of the callback.
 * @example
 * ```
 *   const getScrollY = useBrowserCallback((window) => window.scrollY + y, [y]);
 *   const scrollYPlusOne = getScrollY(); // Number on browser, undefined otherwise.
 *
 *   // Here then callback will be executed upon promise resolution, but only on a browser.
 *   myPromise.then(useBrowserCallback(myCallback));
 * ```
 *
 * @see {@link https://react.dev/reference/react/useCallback}
 */
export function useBrowserCallback<Fn extends AnyBrowserFn>(
  fn: Fn,
  deps: React.DependencyList,
): (...args: Shift<Parameters<Fn>>) => VoidOrUnionUndefined<ReturnType<Fn>>;

/**
 * `useBrowserCallback` will return a memoized version of the callback that only changes if one of the `deps` has changed.
 *
 * This callback will be only executed on a browser (more accurately when `window` is defined).
 *
 * @param fn A callback to execute with `window` as its first parameter.
 * @param fallbackFn Callback to use when not on browser.
 * @param deps List of dependencies which will trigger a new memoization on change.
 * @returns A memoized version of the callback.
 * @example
 * ```
 *   const getScrollY = useBrowserCallback((window) => window.scrollY + y, () => null, [y]);
 *   const scrollYPlusOne = getScrollY(); // Number on browser, `null` otherwise.
 *
 *   // Here then callback will be executed upon promise resolution, but only on a browser.
 *   myPromise.then(useBrowserCallback(myCallback));
 * ```
 *
 * @see {@link https://react.dev/reference/react/useCallback}
 */
export function useBrowserCallback<Fn extends AnyBrowserFn, FallbackReturnType>(
  fn: Fn,
  fallbackFn: (...args: Shift<Parameters<Fn>>) => FallbackReturnType,
  deps: React.DependencyList,
): (...args: Shift<Parameters<Fn>>) => MergeReturnTypes<ReturnType<Fn>, FallbackReturnType>;

export function useBrowserCallback(
  fn: BrowserFn<unknown>,
  arg1: AnyFn | React.DependencyList,
  arg2?: React.DependencyList,
) {
  const deps = arg1 instanceof Function ? (arg2 as React.DependencyList) : arg1;
  return React.useMemo(() => (window ? fn.bind(null, window) : arg1 instanceof Function ? arg1 : voidFn), deps);
}

/**
 * `useBrowserCallbackOrThrow` will return a memoized version of the callback that only changes if one of the `deps` has changed.
 *
 * This callback will be only executed on a browser (more accurately when `window` is defined).
 *
 * Throws an `EnvironmentError` when the resulting callback is called outside of a browser.
 *
 * @param fn A callback to execute with `window` as its first parameter.
 * @param deps List of dependencies which will trigger a new memoization on change.
 * @returns A memoized version of the callback.
 * @example
 * ```
 *   const getScrollY = useBrowserCallbackOrThrow((window) => window.scrollY + y, [y]);
 *   const scrollYPlusOne = getScrollY(); // Number on browser, throws otherwise.
 *
 *   // Here then callback will be executed upon promise resolution on a browser,
 *   // but otherwise will throw and thus cause a rejection.
 *   myPromise.then(useBrowserCallbackOrThrow(myCallback));
 * ```
 *
 * @see {@link https://react.dev/reference/react/useCallback}
 */
export function useBrowserCallbackOrThrow<Fn extends AnyBrowserFn>(
  fn: Fn,
  deps: React.DependencyList,
): (...args: Shift<Parameters<Fn>>) => ReturnType<Fn>;
export function useBrowserCallbackOrThrow(fn: BrowserFn<unknown>, deps: React.DependencyList) {
  return React.useMemo(() => (window ? fn.bind(null, window) : EnvironmentError.throwingFn(fn)), deps);
}

/**
 * `useBrowserCallbackOrWarn` will return a memoized version of the callback that only changes if one of the `deps` has changed.
 *
 * This callback will be only executed on a browser (more accurately when `window` is defined).
 *
 * Sends a warning to the console when the resulting callback is called outside of a browser.
 *
 * @param fn A callback to execute with `window` as its first parameter.
 * @param deps List of dependencies which will trigger a new memoization on change.
 * @returns A memoized version of the callback.
 * @example
 * ```
 *   const getScrollY = useBrowserCallbackOrWarn((window) => window.scrollY + y, [y]);
 *   const scrollYPlusOne = getScrollY(); // Number on browser, undefined otherwise.
 *
 *   // Here then callback will be executed upon promise resolution but only on a browser,
 *   // otherwise will send a warning to the console and resolve to `undefined`.
 *   myPromise.then(useBrowserCallbackOrWarn(myCallback));
 * ```
 *
 * @see {@link https://react.dev/reference/react/useCallback}
 */
export function useBrowserCallbackOrWarn<Fn extends AnyBrowserFn>(
  fn: Fn,
  deps: React.DependencyList,
): (...args: Shift<Parameters<Fn>>) => VoidOrUnionUndefined<ReturnType<Fn>>;

/**
 * `useBrowserCallbackOrWarn` will return a memoized version of the callback that only changes if one of the `deps` has changed.
 *
 * This callback will be only executed on a browser (more accurately when `window` is defined).
 *
 * Sends a warning to the console when the resulting callback is called outside of a browser.
 *
 * @param fn A callback to execute with `window` as its first parameter.
 * @param fallbackFn Callback to use when not on browser.
 * @param deps List of dependencies which will trigger a new memoization on change.
 * @returns A memoized version of the callback.
 * @example
 * ```
 *   const getScrollY = useBrowserCallbackOrWarn((window) => window.scrollY + y, () => null, [y]);
 *   const scrollYPlusOne = getScrollY(); // Number on browser, `null` otherwise.
 *
 *   // Here then callback will be executed upon promise resolution but only on a browser,
 *   // otherwise will send a warning to the console and resolve to `undefined`.
 *   myPromise.then(useBrowserCallbackOrWarn(myCallback));
 * ```
 *
 * @see {@link https://react.dev/reference/react/useCallback}
 */
export function useBrowserCallbackOrWarn<Fn extends AnyBrowserFn, FallbackReturnType>(
  fn: Fn,
  fallbackFn: (...args: Shift<Parameters<Fn>>) => FallbackReturnType,
  deps: React.DependencyList,
): (...args: Shift<Parameters<Fn>>) => MergeReturnTypes<ReturnType<Fn>, FallbackReturnType>;

export function useBrowserCallbackOrWarn(
  fn: BrowserFn<unknown>,
  arg1: AnyFn | React.DependencyList,
  arg2?: React.DependencyList,
) {
  return React.useMemo(
    () => (window ? fn.bind(null, window) : EnvironmentError.warningFn(fn, arg1 instanceof Function ? arg1 : voidFn)),
    arg1 instanceof Function ? (arg2 as React.DependencyList) : arg1,
  );
}

/**
 * Accepts a function that contains imperative, possibly effectful code.
 *
 * Lets you synchronize a component with an external system.
 *
 * @param effect Imperative function that can return a cleanup function.
 * @param deps If present, effect will only activate if the values in the list change.
 *
 * @see {@link https://react.dev/reference/react/useEffect}
 *
 * This is a modified hook where the effect and destructor callbacks are provided a defined `window` object.
 *
 * It helps using the browser global variables without TypeScript complaining they could be undefined.
 *
 */
export function useEffect(effect: EffectCallback, deps?: React.DependencyList) {
  React.useEffect(() => effect(window as Window)?.bind(window, window as Window), deps);
}

/**
 * Accepts a function that contains imperative, possibly effectful code.
 *
 * Allows inserting elements into the DOM before any layout Effects fire.
 *
 * @param effect Imperative function that can return a cleanup function.
 * @param deps If present, effect will only activate if the values in the list change.
 *
 * @see {@link https://react.dev/reference/react/useInsertionEffect}
 *
 * This is a modified hook where the effect and destructor callbacks are provided a defined `window` object.
 *
 * It helps using the browser global variables without TypeScript complaining they could be undefined.
 *
 */
export function useInsertionEffect(effect: EffectCallback, deps?: React.DependencyList) {
  React.useInsertionEffect(() => effect(window as Window)?.bind(window, window as Window), deps);
}

/**
 * Accepts a function that contains imperative, possibly effectful code.
 *
 * Fires before the browser repaints the screen.
 *
 * @param effect Imperative function that can return a cleanup function.
 * @param deps If present, effect will only activate if the values in the list change.
 *
 * @see {@link https://react.dev/reference/react/useLayoutEffect}
 *
 * This is a modified hook where the effect and destructor callbacks are provided a defined `window` object.
 *
 * It helps using the browser global variables without TypeScript complaining they could be undefined.
 *
 */
export function useLayoutEffect(effect: EffectCallback, deps?: React.DependencyList) {
  React.useLayoutEffect(() => effect(window as Window)?.bind(window, window as Window), deps);
}

export type Destructor = EffectCallback.Destructor;

export type EffectCallback = (window: Window) => void | Destructor;

export namespace EffectCallback {
  export type Destructor = (window: Window) => void | Destructor.VoidObject;

  export namespace Destructor {
    export type VoidObject = Extract<ReturnType<Extract<ReturnType<React.EffectCallback>, object>>, object>;
  }
}
