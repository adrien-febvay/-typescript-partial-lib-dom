import { browserGlobals } from './globals';

describe('Check browser globals', () => {
  it('is an array of strings', () => {
    expect(browserGlobals).toBeInstanceOf(Array);
    for (const browserGlobal of browserGlobals) {
      expect(typeof browserGlobal).toBe('string');
    }
  });

  it('defaults window, document and all other browser globals', () => {
    expect(window).toBe(void 0);
    expect(document).toBe(void 0);
    for (const name of browserGlobals) {
      expect(name in global).toBe(true);
      expect(global[name]).toBe(void 0);
    }
  });
});
