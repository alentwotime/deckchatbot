function calculateDeckMaterials(req, res) {
  try {
    const {
      length,
      width,
      boardWidth = 5.5,
      boardLength = 16,
      waste = 10
    } = req.body;

    if (!length || !width || length <= 0 || width <= 0) {
      return res.status(400).json({
        errors: [{ msg: 'Valid length and width are required' }]
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
  } catch (err) {
    console.error('Error in calculateDeckMaterials:', err);
    res.status(500).json({
      errors: [{ msg: 'Internal server error' }]
    });
  }
}

module.exports = { calculateDeckMaterials };
