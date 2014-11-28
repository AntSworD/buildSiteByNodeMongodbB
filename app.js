var express = require('express');
var path = require('path');
var port = process.env.PORT || 3400;
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mongoStore = require('connect-mongo')(session);

var dbUrl = 'mongodb://localhost/imooc';

var mongoose = require('mongoose');
mongoose.connect(dbUrl);

app.set('views', './views/pages');
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
  secret: 'imooc',
  resave: false,
  saveUninitialized: false,
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions'
  })
}));
app.use(multer());

app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');

require('./config/routes')(app);

app.listen(port);

console.log('imooc started on port ' + port);

