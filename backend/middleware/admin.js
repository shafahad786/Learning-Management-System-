// middleware/admin.js
module.exports = function(req, res, next) {
  // Assuming your user object has an isAdmin property
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ msg: 'Admin access required' });
  }
};