var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/profile', function(req, res, next) {
  res.render('profile', { title: '个人信息',header: '个人信息'});
});

module.exports = router;
