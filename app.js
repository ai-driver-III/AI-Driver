var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./db')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({limit: '10mb'})); /// add limit to prevent PayloadTooLargeError: request entity too large
app.use(express.urlencoded({limit: '10mb',extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
app.use(bodyParser.xml({
  limit: '10MB', // Reject payload bigger than 10 MB 
  xmlParseOptions: {
      normalize: true, // Trim whitespace inside text nodes 
      normalizeTags: false, // Transform tags to lowercase 
      explicitArray: false // Only put nodes in array if >1 
  }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.set("userList", {}); // store user object

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
