import { EnvironmentError } from './EnvironmentError';

const anonFn = ((fn) => fn)(() => 0);
const namedFn = () => 0;

describe('Check EnvironmentError', () => {
  it('instanciates with anonymous function', () => {
    const envError = new EnvironmentError(anonFn);
    expect(envError).toBeInstanceOf(EnvironmentError);
    expect(envError.fn).toBe(anonFn);
    expect(envError.message).toBe('Anonymous function executed on wrong environment, expected browser');
    expect(envError.name).toBe('EnvironmentError');
  });

  it('instanciates with named function', () => {
    const envError = new EnvironmentError(namedFn);
    expect(envError).toBeInstanceOf(EnvironmentError);
    expect(envError.fn).toBe(namedFn);
    expect(envError.message).toBe('Function namedFn executed on wrong environment, expected browser');
    expect(envError.name).toBe('EnvironmentError');
  });
});
