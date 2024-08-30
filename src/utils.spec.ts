import './globals';
import * as _ from './utils';

const fn0 = () => 0;
const windowMock = {} as typeof window;
const windowMockFn = () => windowMock;
const throwingFn = _.EnvironmentError.throwingFn.bind(null);
const warningFn = _.EnvironmentError.warningFn.bind(null);
let consoleWarnSpy: jest.SpyInstance<void, Parameters<Console['warn']>, unknown>;

beforeAll(() => {
  consoleWarnSpy = jest.spyOn(console, 'warn');
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Check utils', () => {
  it('onBrowser alikes provide window and return function result', () => {
    jest.replaceProperty(global, 'window', windowMock);
    expect(_.onBrowser((window) => window)).toBe(windowMock);
    expect(_.onBrowserOrWarn((window) => window)).toBe(windowMock);
    expect(_.onBrowserOrThrow((window) => window)).toBe(windowMock);
  });

  it('onBrowser alikes return fallback value', () => {
    jest.replaceProperty(global, 'window', void 0);
    consoleWarnSpy.mockImplementation();
    expect(_.onBrowser(fn0)).toBe(void 0);
    expect(_.onBrowser(fn0, windowMock)).toBe(windowMock);
    expect(_.onBrowserOrWarn(fn0)).toBe(void 0);
    expect(_.onBrowserOrWarn(fn0, windowMock)).toBe(windowMock);
  });

  it('onBrowserOrWarn sends warning to console', () => {
    jest.replaceProperty(global, 'window', void 0);
    consoleWarnSpy.mockImplementation();
    expect(_.onBrowserOrWarn(fn0)).toBe(void 0);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenLastCalledWith(expect.any(_.EnvironmentError));
  });

  it('onBrowserOrThrow throws', () => {
    jest.replaceProperty(global, 'window', void 0);
    expect(() => _.onBrowserOrThrow(fn0)).toThrow(_.EnvironmentError);
  });

  it('browserFn alikes return provide window and return provided function', () => {
    jest.replaceProperty(global, 'window', windowMock);
    const fn = (window: Window) => window;
    expect(typeof _.browserFn(fn)).toBe('function');
    expect(_.browserFn(fn)()).toBe(windowMock);
    expect(typeof _.browserFnOrWarn(fn)).toBe('function');
    expect(_.browserFnOrWarn(fn)()).toBe(windowMock);
    expect(typeof _.browserFnOrThrow(fn)).toBe('function');
    expect(_.browserFnOrThrow(fn)()).toBe(windowMock);
  });

  it('browserFn alikes return fallback function', () => {
    jest.replaceProperty(global, 'window', void 0);
    consoleWarnSpy.mockImplementation();
    const throwingFnSpy = jest.spyOn(_.EnvironmentError, 'throwingFn').mockImplementation(throwingFn);
    const warningFnSpy = jest.spyOn(_.EnvironmentError, 'warningFn').mockImplementation(warningFn);
    expect(_.browserFn(fn0).name).toBe('voidFn');
    expect(_.browserFn(fn0, windowMockFn)).toBe(windowMockFn);
    expect(typeof _.browserFnOrWarn(fn0)).toBe('function');
    expect(warningFnSpy).toHaveBeenLastCalledWith(fn0, expect.any(Function));
    expect(typeof _.browserFnOrWarn(fn0, windowMockFn)).toBe('function');
    expect(warningFnSpy).toHaveBeenLastCalledWith(fn0, windowMockFn);
    expect(warningFnSpy).toHaveBeenCalledTimes(2);
    expect(typeof _.browserFnOrThrow(fn0)).toBe('function');
    expect(throwingFnSpy).toHaveBeenLastCalledWith(fn0);
    expect(throwingFnSpy).toHaveBeenCalledTimes(1);
    throwingFnSpy.mockRestore();
    warningFnSpy.mockRestore();
  });

  it('browserFnOrWarn warning function sends warning', () => {
    jest.replaceProperty(global, 'window', void 0);
    consoleWarnSpy.mockImplementation();
    expect(_.browserFnOrWarn(fn0)()).toBe(void 0);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenLastCalledWith(expect.any(_.EnvironmentError));
  });

  it('browserFnOrThrow throwing function throws', () => {
    jest.replaceProperty(global, 'window', void 0);
    expect(_.browserFnOrThrow(fn0)).toThrow(_.EnvironmentError);
  });
});
