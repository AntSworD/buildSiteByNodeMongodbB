var Movie = require('../models/movie');
var Category = require('../models/category');

// index page
exports.index = function(req, res) {
  Category
    .find({})
    .populate({path: 'movies', option: {limit: 5}})
    .exec(function(err, categories) {
      if (err) {
        console.log(err);
      }

      res.render('index', {
        title: 'imooc 首页',
        categories: categories
      });
    });
};

// search page
exports.search = function(req, res) {
  var catId = req.query.cat;
  var page = parseInt(req.query.p, 10) || 0;
  var count = 2;
  var index = page * count;
  var q = req.query.q;
  if (catId) {
    Category
      .find({_id: catId})
      .populate({
        path: 'movies',
        select: 'title poster',
        // options: {
        //   limit: 2,
        //   skip: index
        // }
      })
      .exec(function(err, categories) {
        if (err) {
          console.log(err);
        }
        var category = categories[0] || {};
        var movies = category.movies || [];
        var results = movies.slice(index, index + count);
        res.render('results', {
          title: 'imooc 结果列表页面',
          keyword: category.name,
          query: 'cat=' + catId,
          currentPage: page + 1,
          totalPage: Math.ceil(movies.length / count),
          movies: results
        });
      });
  } else {
    Movie
      .find({title: new RegExp(q + '.*', 'i')})
      .exec(function(err, movies) {
        if (err) {
          console.log(err);
        }

        var results = movies.slice(index, index + count);

        res.render('results', {
          title: 'imooc 结果列表页面',
          keyword: q,
          currentPage: (page + 1),
          query: 'q=' + q,
          totalPage: Math.ceil(movies.length / count),
          movies: results
        });
      });
  }

};
