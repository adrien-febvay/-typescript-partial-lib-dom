import type { AnyBrowserFn, AnyFn } from './types';

/** Thrown by `strictlyOnBrowser` when called outside of a browser. */
export class EnvironmentError extends Error {
  /** Browser function passed to `strictlyOnBrowser`. */
  public readonly fn: AnyBrowserFn;

  public constructor(fn: AnyBrowserFn) {
    const name = fn.name ? `Function ${fn.name}` : 'Anonymous function';
    super(`${name} executed on wrong environment, expected browser`);
    this.fn = fn;
  }

  public static throwingFn(fn: AnyBrowserFn) {
    return () => {
      throw new EnvironmentError(fn);
    };
  }

  public static warningFn(fn: AnyBrowserFn, fallbackFn: AnyFn) {
    return (...args: unknown[]) => {
      // eslint-disable-next-line no-console
      console.error(new EnvironmentError(fn));
      fallbackFn(...args);
    };
  }
}

// Sets `EnvironmentError` name in its prototype, as non-enumerable.
Object.defineProperty(EnvironmentError.prototype, 'name', { enumerable: false, value: 'EnvironmentError' });
