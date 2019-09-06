var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/list', function(req, res, next) {
    res.render('project_list', { title: '项目列表',header: '项目列表',query:req.query,filter:true,search:true});
});

module.exports = router;
