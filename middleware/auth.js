module.exports = (req, res, next) => {
  const required = process.env.API_KEY;
  if (!required) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  let token;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2) {
      token = parts[1];
    }
  }

  if (!token || token !== required) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
