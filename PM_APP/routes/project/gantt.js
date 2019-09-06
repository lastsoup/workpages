var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/gantt', function(req, res, next) {
    res.render('project_gantt', { title: ''});
});

module.exports = router;
