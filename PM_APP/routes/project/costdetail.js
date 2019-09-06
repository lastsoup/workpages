var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/cost/detail', function(req, res, next) {
    res.render('project_cost_detail', { title: '详细费用',header: '详细费用',menu:true,index:3});
});

module.exports = router;
