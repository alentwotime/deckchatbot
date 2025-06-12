const request = require('supertest');

jest.mock('openai', () => {
  const createMock = jest.fn().mockResolvedValue({ choices: [{ message: { content: 'mocked' } }] });
  const MockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: { create: createMock }
    }
  }));
  MockOpenAI.__createMock = createMock;
  return MockOpenAI;
});
const OpenAI = require('openai');
const createMock = OpenAI.__createMock;
const fs = require('fs');
const path = require('path');
const memoryDb = path.join(__dirname, 'memory_test.sqlite');
process.env.MEM_DB = memoryDb;

const { app } = require('../server.cjs');
const memory = require('../memory');

beforeEach(() => {
  memory.clearMemory();
});

afterAll(() => {
  if (fs.existsSync(memoryDb)) fs.unlinkSync(memoryDb);
});

describe('server endpoints', () => {
  test('/calculate-multi-shape', async () => {
    const res = await request(app)
      .post('/calculate-multi-shape')
      .send({
        shapes: [
          { type: 'rectangle', dimensions: { length: 10, width: 20 } },
          { type: 'circle', dimensions: { radius: 5 }, isPool: true }
        ],
        wastagePercent: 10
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalShapeArea: '200.00',
      poolArea: '78.54',
      usableDeckArea: '121.46',
      adjustedDeckArea: '133.61',
      note: 'Adjusted for 10% wastage.',
      explanation: expect.stringContaining('usable surface')
    });
  });

  test('/upload-measurements requires file', async () => {
    const res = await request(app).post('/upload-measurements');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Please upload an image/);
  });

  test('/digitalize-drawing requires file', async () => {
    const res = await request(app).post('/digitalize-drawing');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Please upload an image/);
  });

  test('/chatbot', async () => {
    const res = await request(app).post('/chatbot').send({ message: 'hello' });
    expect(res.status).toBe(200);
    expect(res.body.response).toBe('mocked');
    const history = memory.getRecentMessages();
    expect(history.slice(-2)).toEqual([
      expect.objectContaining({ role: 'user', content: 'hello' }),
      expect.objectContaining({ role: 'assistant', content: 'mocked' })
    ]);
  });

  test('/chatbot handles rectangle', async () => {
    createMock.mockClear();
    const res = await request(app).post('/chatbot').send({ message: 'rectangle 5x10' });
    expect(res.status).toBe(200);
    expect(res.body.response).toBe('The rectangle area is 50.00.');
    expect(createMock).not.toHaveBeenCalled();
  });
});
