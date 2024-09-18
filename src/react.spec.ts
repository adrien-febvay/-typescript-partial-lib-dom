import type { AnyFn } from './types';

import './globals';
import * as _ from './react';

const fn0 = () => 0;
const windowMock = {} as typeof window;
const windowMockFn = () => windowMock;
const throwingFn = _.EnvironmentError.throwingFn.bind(null);
const warningFn = _.EnvironmentError.warningFn.bind(null);
let consoleWarnSpy: jest.SpyInstance<void, Parameters<Console['warn']>, unknown>;

jest.mock('react', () => {
  function useEffect(effect: React.EffectCallback) {
    effect()?.();
  }

  function useMemo(fn: AnyFn) {
    return fn();
  }

  return { useEffect, useInsertionEffect: useEffect, useLayoutEffect: useEffect, useMemo };
});

beforeAll(() => {
  consoleWarnSpy = jest.spyOn(console, 'warn');
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Check React utils', () => {
  it('useBrowserCallback alikes return provide window and return provided function', () => {
    jest.replaceProperty(global, 'window', windowMock);
    const fn = (window: Window) => window;
    expect(typeof _.useBrowserCallback(fn, [])).toBe('function');
    expect(_.useBrowserCallback(fn, [])()).toBe(windowMock);
    expect(typeof _.useBrowserCallbackOrWarn(fn, [])).toBe('function');
    expect(_.useBrowserCallbackOrWarn(fn, [])()).toBe(windowMock);
    expect(typeof _.useBrowserCallbackOrThrow(fn, [])).toBe('function');
    expect(_.useBrowserCallbackOrThrow(fn, [])()).toBe(windowMock);
  });

  it('useBrowserCallback alikes return fallback function', () => {
    jest.replaceProperty(global, 'window', void 0);
    consoleWarnSpy.mockImplementation();
    const throwingFnSpy = jest.spyOn(_.EnvironmentError, 'throwingFn').mockImplementation(throwingFn);
    const warningFnSpy = jest.spyOn(_.EnvironmentError, 'warningFn').mockImplementation(warningFn);
    expect(_.useBrowserCallback(fn0, []).name).toBe('voidFn');
    expect(_.useBrowserCallback(fn0, windowMockFn, [])).toBe(windowMockFn);
    expect(typeof _.useBrowserCallbackOrWarn(fn0, [])).toBe('function');
    expect(warningFnSpy).toHaveBeenLastCalledWith(fn0, expect.any(Function));
    expect(typeof _.useBrowserCallbackOrWarn(fn0, windowMockFn, [])).toBe('function');
    expect(warningFnSpy).toHaveBeenLastCalledWith(fn0, windowMockFn);
    expect(warningFnSpy).toHaveBeenCalledTimes(2);
    expect(typeof _.useBrowserCallbackOrThrow(fn0, [])).toBe('function');
    expect(throwingFnSpy).toHaveBeenLastCalledWith(fn0);
    expect(throwingFnSpy).toHaveBeenCalledTimes(1);
    throwingFnSpy.mockRestore();
    warningFnSpy.mockRestore();
  });

  it('useBrowserCallbackOrWarn warning function sends warning', () => {
    jest.replaceProperty(global, 'window', void 0);
    consoleWarnSpy.mockImplementation();
    expect(_.useBrowserCallbackOrWarn(fn0, [])()).toBe(void 0);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenLastCalledWith(expect.any(_.EnvironmentError));
  });

  it('useBrowserCallbackOrThrow throwing function throws', () => {
    jest.replaceProperty(global, 'window', void 0);
    expect(_.useBrowserCallbackOrThrow(fn0, [])).toThrow(_.EnvironmentError);
  });

  it('useEffect alikes call effects properly', () => {
    const mockEffect = jest.fn();
    const mockInsertionEffect = jest.fn();
    const mockLayoutEffect = jest.fn();
    jest.replaceProperty(global, 'window', windowMock);
    _.useEffect(mockEffect);
    expect(mockEffect).toHaveBeenCalledTimes(1);
    expect(mockEffect).toHaveBeenLastCalledWith(windowMock);
    _.useInsertionEffect(mockInsertionEffect);
    expect(mockInsertionEffect).toHaveBeenCalledTimes(1);
    expect(mockInsertionEffect).toHaveBeenLastCalledWith(windowMock);
    _.useLayoutEffect(mockLayoutEffect);
    expect(mockLayoutEffect).toHaveBeenCalledTimes(1);
    expect(mockLayoutEffect).toHaveBeenLastCalledWith(windowMock);
  });

  it('useEffect alikes call destructors properly', () => {
    const mockDestructor = jest.fn();
    const mockInsertionDestructor = jest.fn();
    const mockLayoutDestructor = jest.fn();
    jest.replaceProperty(global, 'window', windowMock);
    _.useEffect(() => mockDestructor);
    expect(mockDestructor).toHaveBeenCalledTimes(1);
    expect(mockDestructor).toHaveBeenLastCalledWith(windowMock);
    _.useInsertionEffect(() => mockInsertionDestructor);
    expect(mockInsertionDestructor).toHaveBeenCalledTimes(1);
    expect(mockInsertionDestructor).toHaveBeenLastCalledWith(windowMock);
    _.useLayoutEffect(() => mockLayoutDestructor);
    expect(mockLayoutDestructor).toHaveBeenCalledTimes(1);
    expect(mockLayoutDestructor).toHaveBeenLastCalledWith(windowMock);
  });
});
