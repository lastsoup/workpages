var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var login = require('./routes/login');
var profile = require('./routes/profile');
var project_list = require('./routes/project/list');
var project_detail = require('./routes/project/detail');
var project_advance = require('./routes/project/advance');
var project_cost = require('./routes/project/cost');
var project_cost_detail = require('./routes/project/costdetail');
var project_census = require('./routes/project/census');
var project_gantt = require('./routes/project/gantt');
var app = express(),swig = require('swig');

app.set('view engine', 'html');
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//传递用户信息
/*app.post('/userInfo',function(req, res) {
    index.userinfo=req.body;
});*/
app.use('/', login);
app.get('/index', index);
app.get('/profile', profile);
app.use('/project',project_list);
app.use('/project',project_detail);
app.use('/project',project_advance);
app.use('/project',project_cost);
app.use('/project',project_cost_detail);
app.use('/project',project_census);
app.use('/project',project_gantt);

/*app.post('/whatever', function(req, res, next){
    //数据处理
    res.json(req.body.test);
});*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
