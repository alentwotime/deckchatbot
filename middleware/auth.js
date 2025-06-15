module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2) {
      token = parts[1];
    }
  }

  if (!token || token !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
