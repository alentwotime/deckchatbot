jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'mocked' } }] })
      }
    }
  }));
});

const { rectangleArea, circleArea, triangleArea, polygonArea, shapeFromMessage } = require('../utils/geometry');

describe('geometry utilities', () => {
  test('rectangle area', () => {
    expect(rectangleArea(5, 10)).toBe(50);
  });

  test('circle area', () => {
    expect(circleArea(3)).toBeCloseTo(Math.PI * 9);
  });

  test('triangle area', () => {
    expect(triangleArea(10, 5)).toBe(25);
  });

  test('polygon area square', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 }
    ];
    expect(polygonArea(pts)).toBe(1);
  });

  test('shapeFromMessage parses rectangle', () => {
    const msg = 'Please calc rectangle 5x10';
    expect(shapeFromMessage(msg)).toEqual({ type: 'rectangle', dimensions: { length: 5, width: 10 } });
  });

  test('shapeFromMessage parses quoted dimensions', () => {
    const msg = 'rectangle 6\' 6\" by 8\'';
    const result = shapeFromMessage(msg);
    expect(result).toEqual({
      type: 'rectangle',
      dimensions: { length: 6.5, width: 8 }
    });
  });

  test('shapeFromMessage parses circle', () => {
    const msg = 'circle radius 4';
    expect(shapeFromMessage(msg)).toEqual({ type: 'circle', dimensions: { radius: 4 } });
  });

  test('shapeFromMessage parses circle with inches', () => {
    const msg = 'circle radius 18\"';
    expect(shapeFromMessage(msg)).toEqual({ type: 'circle', dimensions: { radius: 1.5 } });
  });

  test('shapeFromMessage handles invalid input', () => {
    expect(shapeFromMessage('gibberish')).toBeNull();
  });

});


