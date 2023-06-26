function isAuthenticated(req, res, next) {
  if (req.user) return next();
  res.status(401).json({
    message: "You must login to have access to this page.",
  });
}

module.exports = isAuthenticated;
