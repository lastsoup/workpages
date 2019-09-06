var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/census', function(req, res, next) {
    res.render('project_census', { title: '项目统计',header: '项目统计',menu:{id:req.query.id,show:true,index:4}});
});

module.exports = router;
