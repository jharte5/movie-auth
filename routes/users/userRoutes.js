const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('./models/Users');
const { check, validationResult } = require('express-validator');

/* find all users */
router.get('/', function(req, res, next) {
  // // empty object allows us to fill with users
  // User.find({}).then(users => {
  //   return res.status(200).json({message: 'Success', users})
  // })
  // .catch(err=> res.status(500).json({message:'Server Error', err}))
  return res.render('index')
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

router.get('/success', (req, res) => {
  if (req.isAuthenticated()){
    return res.render('success');
  } else {
    return res.render('Unauthorized')
  }
});

router.get('/fail', (req, res) => {
  return res.render('fail')
});

const myValidation = (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(403).json({ message: 'All Inputs Must Be Filled' });
  }
  next();
};

router.post('/register', myValidation, (req, res) => {
  // validate the inputs
  
  // check if user exists
  User.findOne({ email: req.body.email })
    .then(user => {
      //check to see if there is a user value
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      // create a new user from the User model
      const newUser = new User();

      // salt password...place extra characters in password to make harder to guess
      const salt = bcrypt.genSaltSync(10);
      // hash password
      const hash = bcrypt.hashSync(req.body.password, salt);
      // set values for the user to model keys
      newUser.name = req.body.name;
      newUser.email = req.body.email;
      newUser.password = hash;
      // save the user
      newUser
        .save()
        .then(user => {
          return req.login(user, (err) => {
            if(err){
              return res.status(500).json({message: 'Server Error', err});
            } else {
              console.log(req.session)
              res.redirect('/users/success');
            }
          })
        })
        .catch(err => res.status(400).json({ message: 'User not saved', err }));
    })
    .catch(err => res.status(418).json({ message: 'We messed up', err }));
});

router.post('/login', 
  // authenticate using local login from passport file
  passport.authenticate('local-login', {
    successRedirect:'/users/success',
    failureRedirect: '/users/fail',
    failureFlash: true
  })
);

router.post('/api/users/register', 
  [check('name', 'Name is required').not().isEmpty(), 
  check('email', 'Please include a valid email').isEmail(), 
  check('password', 'Please include valid password').isLength({min: 3})], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors);
        return res.render('register', { errors: 'All inputs must be filled'});
    };
    
    User.findOne({ email:req.body.email})
    .then((user) => {
        if(user) {
            return console.log('User Exists')
        } else  {
            const user = new User();
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            user.name = req.body.name;
            user.email = req.body.email;
            user.password = hash;

            user.save().then(user => {
                // return res.status(200).json({ message: 'User Created', user });
                return req.login(user, err => {
                    if (err) {
                        return res.status(500).json({message: 'Server error'});
                    } else {
                        res.redirect('/auth/options');
                        // next();
                    }
                })
            })
            .catch(err => console.log(err));
        }; 
    });
});
// Logout user
router.get('/logout', (req,res) => {
  req.session.destroy();
  console.log('logout...', req.session)
  req.logout();
  return res.redirect('/');
}
)


module.exports = router;
