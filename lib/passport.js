const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../routes/users/models/Users');
const bcrypt = require('bcryptjs');

//  this places the mongo user id into passport sessions
passport.serializeUser((user, done) => {
    done(null,user._id)
});
//  this gives us our req.user to use throughout the app
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
    done(err, user);
    });
});

// create login middleware
// local-login names the middleware
passport.use('local-login', 
    // usernameField defaults to name, but we call it email. these fields are expected in Local Strategy
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        // search for user
        User.findOne({email:req.body.email}, (err, user) => {
            if(err){
                // return the error and no user.
                console.log('Login Error: ', err)
                return done(err, null)
            }
            if(!user) {
                console.log('No User Found')
                return done(null, false)
            }
            // unencrypt and compare password
            bcrypt.compare(password, user.password)
            .then(result=> {
                if(!result) {
                    return done(
                        null, false
                    )
                }else{
                    // get our res.user
                    return done(null, user)
                }
            }).catch(error => {
                throw error;
            });
        })
    }
));

exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated) {
    return next();
    }
    return res.redirect('/login');
};` `