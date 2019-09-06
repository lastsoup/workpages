var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/cost', function(req, res, next) {
    res.render('project_cost', { title: '项目费用',header: '项目费用',query:req.query,search:true,menu:{id:req.query.id,show:true,index:3}});
});

module.exports = router;
