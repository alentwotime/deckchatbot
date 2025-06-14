function calculateDeckMaterials(req, res) {
  const {
    length,
    width,
    boardWidth = 5.5,
    boardLength = 16,
    waste = 10
  } = req.body;

  if (!length || !width) {
    return res.status(400).json({
      errors: [{ msg: 'length and width are required' }]
    });
  }

  const deckArea = length * width;
  const boardArea = (boardWidth / 12) * boardLength;
  const boards = Math.ceil((deckArea / boardArea) * (1 + waste / 100));

  res.json({
    deckArea: deckArea.toFixed(2),
    boardArea: boardArea.toFixed(2),
    boards
  });
}

module.exports = { calculateDeckMaterials };
