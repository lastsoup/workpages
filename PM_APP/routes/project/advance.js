var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/advance', function(req, res, next) {
    res.render('project_advance', { title: '项目进度',header: '项目进度',menu:{id:req.query.id,show:true,index:2}});
});

module.exports = router;
