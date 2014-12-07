var express = require('express');
var path = require('path');
var port = process.env.PORT || 3400;
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mongoStore = require('connect-mongo')(session);
var logger = require('morgan');

var dbUrl = 'mongodb://localhost/imooc';

var mongoose = require('mongoose');
mongoose.connect(dbUrl);

// models loading
var models_path = __dirname + '/app/models';
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file;
      var stat = fs.statSync(newPath);

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      } else if (stat.isDirectory()){
        walk(newPath);
      }
    });
}

app.set('views', './app/views/pages');
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

if ('development' === app.get('env')) {
  app.set('showStackError', true);
  app.use(logger(':method :url :status :remote-addr'));
  app.locals.pretty = true;
  // mongoose.set('debug', true);
}

require('./config/routes')(app);

app.listen(port);

console.log('imooc started on port ' + port);

