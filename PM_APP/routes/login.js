var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',function(req, res) {
  res.render('login', { title: '登录' });
});

/*$.post('/buttonClicked', function(data) {
 alert(data);
 window.location.href="http://127.0.0.1:8088/index";
 });*/
/*router.post('/buttonClicked', function(req, res) {
    res.send("4324");
});*/

module.exports = router;
