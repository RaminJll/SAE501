var express = require('express');
const middleware = require('./middleWare');
var router = express.Router();

/* GET users listing. */
router.get('/', middleware, function(req, res, next) {
  res.json({
    message: 'Vous êtes connecté',
    user: req.user
  })
});

module.exports = router;
