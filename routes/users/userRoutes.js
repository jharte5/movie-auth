const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('./models/Users');

/* find all users */
router.get('/', function(req, res, next) {
  // empty object allows us to fill with users
  User.find({}).then(users => {
    return res.status(200).json({message: 'Success', users})
  })
  .catch(err=> res.status(500).json({message:'Server Error', err}))
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

module.exports = router;
