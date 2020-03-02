var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.render('index', {title:'Main'})
});

router.get('/api/users/login', (req, res) => {
  return res.render('login')
});

router.get('/api/users/register', (req, res) => {
  res.render('register')
});

router.get('/auth/options', (req, res) => {
  if (req.isAuthenticated()){
    return res.render('success')
  }
  else {
    return res.render('fail')
  }
});

router.get('/auth/movies', (req, res) => {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.API_KEY}`;
  const img = 'https://image.tmdb.org/t/p/w185';
  if (req.isAuthenticated()) {
    
  fetch(url).then((res) => res.json()).then((movies) => {
      const theMovies = movies.results
      // console.log(theMovies)
      res.render('movies', {theMovies, img})
  })
  .catch((err) => console.log(err))
  }
  else {
    return res.render('fail')
  }
});

module.exports = router;
