var express = require('express');
var path = require('path');
var _ = require('underscore');
var port = process.env.PORT || 3400;
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/imooc');

var Movie = require('./models/movie');

app.set('views', './views/pages');
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');
app.listen(port);

console.log('imooc started on port ' + port);

// index page
app.get('/', function(req, res) {
  Movie.fetch(function(err, movies) {
    if (err) {
      console.log(err);
    }

    res.render('index', {
      title: 'imooc 首页',
      movies: movies
    });
  });
});

// detail page
app.get('/movie/:id', function(req, res) {
  var id = req.params.id;

  Movie.findById(id, function(err, movie) {
    if (err) {
      console.log(err);
    }

    res.render('detail', {
      title: 'imooc ' + movie.title,
      movie: movie
    });
  });
});

// admin page
app.get('/admin/movie', function(req, res) {
  res.render('admin', {
    title: 'imooc 后台录入页',
    movie: {
      doctor: '',
      country: '',
      title: '',
      year: '',
      poster: '',
      language: '',
      flash: '',
      summary: ''
    }
  });
});

// admin update
app.get('/admin/update/:id', function(req, res) {
  var id = req.params.id;

  if (id) {
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err);
      }

      res.render('admin', {
        title: 'imooc 后台更新页',
        movie: movie
      });
    });
  }
});

// admin post movie
app.post('/admin/movie/new', function(req, res) {
  var id = req.body.movie._id;
  var movieObj = req.body.movie;
  var _movie;

  if (id != 'undefined') {
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err);
      }

      _movie = _.extend(movie, movieObj);
      _movie.save(function(err, movie) {
        if (err) {
          console.log(err);
        }

        res.redirect('/movie/' + movie._id);
      });
    });
  } else {
    _movie = new Movie( {
      doctor: movieObj.doctor,
      title: movieObj.title,
      language: movieObj.language,
      country: movieObj.country,
      summary: movieObj.summary,
      flash: movieObj.flash,
      poster: movieObj.poster,
      year: movieObj.year
    });

     _movie.save(function(err, movie) {
      if (err) {
        console.log(err);
      }

      res.redirect('/movie/' + movie._id);
    });
  }
});

// list page
app.get('/admin/list', function(req, res) {
  //'http://player.youku.com/player.php/sid/XNjA1Njc0NTUy/v.swf';

  Movie.fetch(function(err, movies) {
    if (err) {
      console.log(err);
    }

    res.render('list', {
      title: 'imooc 列表页',
      movies: movies
    });
  });
});

// list delete movie
app.delete('/admin/list', function(req, res) {
  var id = req.query.id;

  if (id) {
    Movie.remove({_id:id}, function(err, movie) {
      if (err) {
        console.log(err);
      }
      else {
        res.json({success: 1});
      }
    });
  }
});
