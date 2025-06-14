const request = require('supertest');

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'mocked' } }] }) } }
  }));
});

const { app } = require('../server.cjs');

describe('skirting endpoint', () => {
  test('/calculate-skirting basic', async () => {
    const res = await request(app)
      .post('/calculate-skirting')
      .send({
        lengthFt: 10,
        widthFt: 8,
        heightFt: 2,
        sides: 4,
        material: 'Composite'
      });
    expect(res.status).toBe(200);
    expect(res.body.perimeter).toBe("36' 0\"");
    expect(res.body.skirtingArea).toBe('72.00');
    expect(res.body.panelsNeeded).toBe(3);
    expect(res.body.material).toBe('Composite');
    expect(res.body.note).toMatch(/durable/);
  });
});
