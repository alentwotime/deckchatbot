jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'mocked' } }] })
      }
    }
  }));
});

const { extractNumbers } = require('../utils/extract');

describe('extractNumbers', () => {
  test('extracts numbers with units', () => {
    const text = 'Deck sides: 10ft by 12ft';
    expect(extractNumbers(text)).toEqual([10, 12]);
  });

  test('filters out huge misreads', () => {
    const text = 'Size 611ft';
    expect(extractNumbers(text)).toEqual([]);
  });
});
