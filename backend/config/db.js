module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
  jwtExpire: process.env.JWT_EXPIRE || '30d'
};