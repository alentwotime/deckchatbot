const request = require('supertest');

jest.mock('openai', () => {
  const createMock = jest.fn().mockResolvedValue({ choices: [{ message: { content: 'mocked' } }] });
  const MockOpenAI = jest.fn().mockImplementation(() => ({
    chat: { completions: { create: createMock } }
  }));
  MockOpenAI.__createMock = createMock;
  return MockOpenAI;
});

jest.mock('tesseract.js', () => {
  const recognizeMock = jest.fn();
  return { recognize: recognizeMock, __recognizeMock: recognizeMock };
});

jest.mock('sharp', () => {
  const mockImage = {
    greyscale: jest.fn().mockReturnThis(),
    normalise: jest.fn().mockReturnThis(),
    threshold: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from('img')))
  };
  const sharpMock = jest.fn(() => mockImage);
  sharpMock.__mockImage = mockImage;
  return sharpMock;
});

jest.mock('potrace', () => ({
  trace: jest.fn()
}));

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const createMock = OpenAI.__createMock;
const Tesseract = require('tesseract.js');
const recognizeMock = Tesseract.__recognizeMock;
const sharp = require('sharp');
const sharpMock = sharp;
const mockImage = sharp.__mockImage;
const potrace = require('potrace');
const memoryDb = path.join(__dirname, 'memory_edge.sqlite');
process.env.MEM_DB = memoryDb;

const { app } = require('../server.cjs');
const memory = require('../memory');

beforeEach(() => {
  memory.clearMemory();
  recognizeMock.mockReset();
  sharpMock.mockClear();
  mockImage.toBuffer.mockClear();
  potrace.trace.mockReset();
});

// ✅ Fix EBUSY error with async unlink
afterAll(async () => {
  try {
    await fs.promises.unlink(memoryDb);
  } catch (err) {
    console.warn('Could not delete SQLite file:', err.message);
  }
});

describe('server edge cases', () => {
  test('/calculate-multi-shape validation', async () => {
    const res = await request(app).post('/calculate-multi-shape').send({ shapes: [] });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toMatch(/non-empty array/);
  });

  test('/calculate-multi-shape unsupported type', async () => {
    const res = await request(app).post('/calculate-multi-shape').send({
      shapes: [{ type: 'hexagon', dimensions: {} }]
    });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toMatch(/Unsupported shape type/);
  });

  test('/upload-measurements not enough numbers', async () => {
    recognizeMock.mockResolvedValue({ data: { text: '1 2 3 4' } });
    const res = await request(app)
      .post('/upload-measurements')
      .attach('image', Buffer.from('img'), 'test.png');
    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toMatch(/Not enough/);
  });

  test('/upload-measurements success', async () => {
    recognizeMock.mockResolvedValue({ data: { text: '0 0 0 10 10 10 10 0' } });
    const res = await request(app)
      .post('/upload-measurements')
      .attach('image', Buffer.from('img'), 'test.png');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      outerDeckArea: '100.00',
      poolArea: '0.00',
      usableDeckArea: '100.00',
      railingFootage: '40.00',
      fasciaBoardLength: '40.00',
      warning: null,
      explanation: expect.stringContaining('simple deck with no cutouts')
    });
  });

  test('/upload-measurements skirting detection', async () => {
    recognizeMock.mockResolvedValue({ data: { text: "skirting 12' 10' 30\" PVC" } });
    const res = await request(app)
      .post('/upload-measurements')
      .attach('image', Buffer.from('img'), 'skirt.png');
    expect(res.status).toBe(200);
    expect(res.body.material).toBe('PVC');
    expect(res.body.perimeter).toBe("44' 0\"");
    expect(res.body.panelsNeeded).toBe(4);
  });

  test('/digitalize-drawing success', async () => {
    potrace.trace.mockImplementation((p, o, cb) => cb(null, '<svg/>'));
    recognizeMock.mockResolvedValue({ data: { text: '0 0 10 0 10 10' } });
    const res = await request(app)
      .post('/digitalize-drawing')
      .attach('image', Buffer.from('img'), 'draw.png');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    const text = res.text || res.body.toString();
    expect(text).toBe('<svg/>');
  });

  test('/digitalize-drawing handles error', async () => {
    potrace.trace.mockImplementation((p, o, cb) => cb(new Error('fail')));
    const res = await request(app)
      .post('/digitalize-drawing')
      .attach('image', Buffer.from('img'), 'draw.png');
    expect(res.status).toBe(500);
    expect(res.body.errors[0].msg).toMatch(/Error digitalizing drawing/);
  });

  test('/chatbot requires message', async () => {
    const res = await request(app).post('/chatbot').send({});
    expect(res.status).toBe(400);
    const msgs = res.body.errors.map(e => e.msg);
    expect(msgs.some(m => /message is required/.test(m))).toBe(true);
  });
});