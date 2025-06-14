jest.mock('openai', () => {
  const createMock = jest.fn();
  const MockOpenAI = jest.fn().mockImplementation(() => ({
    chat: { completions: { create: createMock } }
  }));
  MockOpenAI.__createMock = createMock;
  return MockOpenAI;
});

const OpenAI = require('openai');
const createMock = OpenAI.__createMock;
const { askChat } = require('../services/openai.service');

describe('askChat', () => {
  test('returns message content on success', async () => {
    createMock.mockResolvedValueOnce({ choices: [{ message: { content: 'ok' } }] });
    await expect(askChat([{ role: 'user', content: 'hi' }])).resolves.toBe('ok');
  });

  test('propagates API errors', async () => {
    createMock.mockRejectedValueOnce(new Error('fail'));
    await expect(askChat([{ role: 'user', content: 'hi' }])).rejects.toThrow('fail');
  });
});
