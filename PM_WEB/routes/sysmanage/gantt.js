var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/gantt', function(req, res, next) {
    res.render('sysmanage/gantt', { title: '项目管理'});
});

module.exports = router;
