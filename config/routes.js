var _ = require('underscore');

var Movie = require('../models/movie');
var User = require('../models/user');

module.exports = function(app) {
  // pre handle user
  app.use(function(req, res, next) {
    var _user = req.session.user;

    if (_user) {
      app.locals.user = _user;
    }
    return next();
  });

  // index page
  app.get('/', function(req, res) {
    console.log('user in session: ');
    console.log(req.session.user);

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

  // signup
  app.post('/user/signup', function(req, res) {
    var _user = req.body.user;

    User.find({name: _user.name}, function(err, user) {
      if (err) {
        console.log(err);
      }

      if (user) {
        res.redirect('/');
      } else {
        var user = new User(_user);

        user.save(function(err, user) {
          if (err) {
            console.log(err);
          }

          res.redirect('/admin/userlist');
        });
      }
    });
  });

  // signin
  app.post('/user/signin', function(req, res) {
    var _user = req.body.user;
    var name = _user.name;
    var password = _user.password;

    User.findOne({name: name}, function(err, user) {
      if (err) {
        console.log(err);
      }

      if (!user) {
        return res.redirect('/');
      } else {
        user.comparePassword(password, function(err, isMatch) {
          if (err) {
            console.log(err);
          }

          if (isMatch) {
            req.session.user = user;

            return res.redirect('/');
          } else {
            console.log('Password is not matched');
          }
        });
      }
    });
  });

  // logout
  app.get('/logout', function(req, res) {
    delete req.session.user;
    delete app.locals.user;

    res.redirect('/');
  });

  // userlist page
  app.get('/admin/userlist', function(req, res) {
    //'http://player.youku.com/player.php/sid/XNjA1Njc0NTUy/v.swf';

    User.fetch(function(err, users) {
      if (err) {
        console.log(err);
      }

      res.render('userlist', {
        title: 'imooc 用户列表页',
        users: users
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
};