var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/project', function(req, res, next) {
    res.render('sysmanage/project', { title: '项目管理'});
});

module.exports = router;
