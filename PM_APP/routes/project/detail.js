var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/detail', function(req, res, next) {
    console.log(req.query.id);
    res.render('project_detail', { title: '项目信息',header: '项目信息',menu:{id:req.query.id,show:true,index:1}});
});

router.get('/detail/do', function (req, res) {
    res.send(213);
});
module.exports = router;
