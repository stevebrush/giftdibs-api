module.exports = [
  require('./auth').router,
  require('./auth-facebook').router,
  require('./comments').router,
  require('./dibs').router,
  require('./friendships').router,
  require('./gifts').router,
  require('./notifications').router,
  require('./users').router,
  require('./wish-lists').router,
  require('./assets').router
];
