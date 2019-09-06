var express = require('express');
var router = express.Router();
var sql=require('../lib/dbhelper');

/* GET home page. */
router.get('/index', function(req, res, next) {
    sql.query('select * from Ananas_User where ID=3939731393',function(data){
        console.log(data);
    })

  res.render('main/index', { title: '主页',hidden:{heading:true}});
});

module.exports = router;
