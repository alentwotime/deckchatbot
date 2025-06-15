module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log format: "<METHOD> <URL> [<STATUS_CODE>] - <DURATION>ms"
    console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
    console.log(`IN ${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });

  next();
};
