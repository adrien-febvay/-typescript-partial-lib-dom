# TypeScript Partial Web (DOM Library)

![CI Tests status](https://github.com/adrien-febvay/typescript-partial-lib-dom/actions/workflows/ci-tests.yml/badge.svg)

TypeScript doesn't complain when Browser Global Variables (BGVs) like `window` or `document` are used without type-proofing in projects that run on both Node and browsers, like websites with Server-Side Rendering (SSR). It can lead to unexpected crashes.

This package solves this issue by :
* Overriding TypeScript's `lib.dom.d.ts` library to declare BGVs as eventually `undefined`.
* Defaulting BGVs to `undefined` to avoid reference errors when trying to access them.
* Providing utilities to simplify access to BGVs, including utilities for React.

As a bonus, it allows to write a simpler code when accessing browser global variables, since their existence doesn't have to be checked with the `typeof` operator.

## Setup

### Install

```sh
npm install @typescript/lib-dom@npm:typescript-partial-lib-dom
```

### Import

```ts
import '@typescript/lib-dom/globals';
```

This must be imported at the top of the entry point(s) of the project's back-end(s), or any other entry point that will/may not run on a browser.

While it wouldn't hurt on the browser side, it would be unecessary and it's best to avoid it.

### Extra step for TypeScript versions prior to 4.5

TypeScript's `lib.dom.d.ts` library has to be overriden manually in `tsconfig.json`:
```json
{
  "compilerOptions": {
    // Features your project uses, minus the DOM library.
    "lib": ["es5"],
    // Path to the alternate DOM library.
    "typeRoots": [
      "./node_modules/@types",
      "./node_modules/@typescript/lib-dom/lib",
    ],
  },
}
```

More information on built-in TypeScript libraries:<br>
https://www.typescriptlang.org/tsconfig/#lib

More information on type declarations inclusion:<br>
https://www.typescriptlang.org/tsconfig/#typeRoots

## Usage: accessing browser global variables

If the setup was done correctly, now TypeScript should not allow to use browser global variables like `window` or `document` without type checking.

For instance, if you want to add an event to the document, you will have to use optional chaining:
```ts
document?.addEventListener('click', () => console.log('click'));
```

You will have to use coalescing operators to use some variables like `scrollY` to default them to a proper type:
```ts
console.log('Vertical scroll + 1:', scrollY ?? 0 + 1);
```

And you will have to check the availability of a class before using the `instanceof` operator:
```ts
const isImage = HTMLImageElement && el instanceof HTMLImageElement;
```

Of course, you can cast types if you are 100% sure the code will only be executed on a browser:
```ts
document?.addEventListener('click', () => {
  console.log('Vertical scroll + 1:', (scrollY as number) + 1);
});
```

However, type casting is dirty and unsafe. It is better to rely on type checking and on the utilities of this package.

## Pitfalls

The browser global variables will be set as eventually undefined everywhere, inluding in modules and functions that are supposed to run only on browser.

As a result you may have to check them where it's technically unecessary, just to make TypeScript be sure they are defined. Alternatively you may also cast their original type on them (ie: `window as Window`).

The package utilities documented below can help you by providing a `window` that is always defined.

## Basic utilities

The functions provided with the package don't do much, but they are very light-weighted and can be very convenient at times.

### The `onBrowser` function

To execute some code only on a browser, you may use:
```ts
import { onBrowser } from '@typescript/lib-dom/utils';

onBrowser((window) => {
  // Here window and its usual properties are always defined.
  // You can use then directly and TypeScript won't complain.
  console.log('Vertical scroll + 1', scrollY ?? 0 + 1);
});

const initialScrollY = onBrowser(({ document, scrollY, window }) => {
  // You may use object destructuring at your convenience.
  document.addEventListener('scroll', () => {
    // Be careful though, with object destructuring you don't get up-to-date values.
    console.log('INITIAL vertical scroll + 1:', scrollY + 1);
    console.log('UPDATED vertical scroll + 1:', window.scrollY + 1);
  });
});
```

Syntax: `onBrowser(your_function, fallback_value?);`<br>
@param `your_function` Function to execute, with `window` as parameter.<br>
@param `fallback_value` Value to return when not on a browser, undefined by default.<br>
@returns the function result on a browser, otherwise the fallback value.

Alternatively, you may use:
* The `onBrowserOrWarn` function to send a warning to the standard output when not running on a browser.
* The `onBrowserOrThrow` function to throw an error when not running on a browser.

### The `browserFn` function

Very similar to the `onBrowser` function, but meant to wrap callback functions.

```ts
import { strictlyBrowserFn, EnvironmentError } from '@typescript/lib-dom/utils';

// This will resolve as a number on a browser, or to `undefined` otherwise.
const myNumber = myPromise.then(browserFn((window, resolvedNumber) => {
  return window.scrollY + resolvedNumber;
}));

document?.addEventListener('scroll', browserFn((window, e) => {
  // As a listener, this function will only be executed on browser anyway,
  // but wrapping it offers access to globals without having to check their type.
  console.log(`Event ${e.type}, scrollY + 1:`, window.scrollY + 1);
}));
```

Syntax: `browserFn(your_function, fallback_function?);`<br>
* @param `your_function` A function to execute with `window` as its first parameter.<br>
* @param `fallback_function` Function to use when not on browser, void function by default.<br>
* @returns a function accordingly (without the `window` parameter).

Alternatively, you may use:
* The `browserFnOrWarn` function to send a warning to the standard output when not running on a browser.
* The `browserFnOrThrow` function to throw an error when not running on a browser.

## React utilities

### The `useBrowserCallback` function

`useBrowserCallback` is an improved version of React's `useCallback`.

It will return a memoized version of the callback that only changes if one of the `deps` has changed.

The resulting function will be only executed on a browser (more accurately when `window` is defined).

```ts
const getScrollY = useBrowserCallback((window) => window.scrollY + y, [y]);
const scrollYPlusOne = getScrollY(); // Number on browser, undefined otherwise.
```

Syntax: `useBrowserCallback(fn[, fallbackFn], deps)`<br>
@param `fn` A function to execute with `window` as its first parameter.<br>
@param `fallbackFn` Function to use when not on browser.<br>
@param `deps` List of dependencies which will trigger a new memoization on change.<br>
@returns A memoized version of the function.

For more information on React's `useCallback` function, see https://react.dev/reference/react/useCallback.

Alternatively, you may use:
* The `useBrowserCallbackOrWarn` function to send a warning to the standard output when not running on a browser.
* The `useBrowserCallbackOrThrow` function to throw an error when not running on a browser.

### The `useEffect` function

This package's `useEffect` is an improved version of React's one.

The only difference is that the effect and destruction callbacks will be provided with the `window` object,
which is always defined in this situation because it will only be called on a browser, as their argument.

```ts
// Here `document` is always defined.
useEffect(({ document }) => {
  document.addEventListener('click', myCallback);
  return () => {
    document.removeEventListener('click', myCallback);
  };
});
```

Syntax: `useEffect(effect[, deps])`<br>
@param `effect` Imperative function that can return a cleanup function.<br>
@param `deps`If present, effect will only activate if the values in the list change.<br>

For more information on React's `useEffect` function, see https://react.dev/reference/react/useEffect.

Alternatively, you may use:
* The `useInsertionEffect` to insert elements into the DOM before any layout Effects fire.
* The `useLayoutEffect` to have the effect callback fire before the browser repaints the screen.

## More information

### Cause of the issues

In strict mode, JavaScript forbids the usage of global variables that haven't been set by raising a reference error.
```
ReferenceError: document is not defined
```

The only safe way to check a variable without rasing this error is to check its existence with the `typeof` operator beforehand.
```ts
typeof document !== 'undefined'
```

Moreover, for TypeScript, the browser global variables are either declared through the `lib.dom.d.ts` DOM library, or they are not. If they aren't, you cannot use them in your project at all. If they are, TypeScript considers they are always defined.

Therefore you would normally have to check the existence of all browser global variables before usage, and TypeScript wouldn't help you catch occurences of improper usage.

### How the package works

```sh
npm install @typescript/lib-dom@npm:@typescript/lib-dom
```
Installing this package with the alias `@typescript/lib-dom` tells TypeScript that this package overrides its `lib.dom.d.ts` library.

More information on how TypeScript library override works:<br>
https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta/#supporting-lib-from-node_modules


```ts
import '@typescript/lib-dom/globals';
```
Importing this script defaults all browser global variables to `undefined`, allowing to access them without checking for their existence and not get reference errors.

Without the `@typescript/lib-dom/globals` import:
```ts
if (typeof document !== 'undefined') {
  document.addEventListener('click', () => console.log('click'));
}
```

With the `@typescript/lib-dom/globals` import:
```ts
document?.addEventListener('click', () => console.log('click'));
```

## Credits

### Author

Adrien Febvay https://github.com/adrien-febvay

### Special thanks

Kagami Sascha Rosylight "saschanaz" https://github.com/saschanaz <br>
For building out and experimenting with [TypeScript's built-in declaration files override feature](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta/#supporting-lib-from-node_modules).