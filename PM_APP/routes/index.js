var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/index', function(req, res, next) {
  res.render('index', { title: '主页',header: '项目管理系统'});
});

module.exports = router;
