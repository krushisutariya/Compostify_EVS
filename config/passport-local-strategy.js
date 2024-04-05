const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.use('local', new LocalStrategy({
    usernameField: 'email_username',
    passReqToCallback: true
}, async function (req, email_username, password, done) {
    try {
        let user = await User.findOne({ $or: [{ email: email_username }, { username: email_username }] });
        if (!user || user.password !== password) {
            console.log('Invalid Email/Username or Password');
            req.flash('error', 'Invalid Email/Username or Password');
            return done(null, false);
        }

        // User authenticated, set req.user and return it
        req.user = user;
        return done(null, user);

    } catch (error) {
        console.log('Error encountered while finding the user:', err);
        return done(error);
    }
}));

// using authentication as middleware 
passport.setAuthenticatedUser = function (req, res, next) {
    if (req.isAuthenticated()) {
        // If the user is authenticated, set res.locals.user
        res.locals.user = req.user;
    }
    next();
};

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// deserializing the user from the key in the cookies
passport.deserializeUser(async function (id, done) {
    try {
        let user = await User.findById(id);
        return done(null, user);
    } catch (error) {
        console.log('Error in finding the user through id obtained by deserializing');
        return done(error);
    }
});

// verifying if the user is authentic
passport.checkAuthentication = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/sign-in');
}

// check if the user is a donor
passport.checkDonor = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.role == 'donor'){

            return next();
        }
        return res.redirect('back');
    }
    return res.redirect('/sign-in');
}

// check if the user is a Agency
passport.checkAgency = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role == 'compostAgency') {
            return next();
        }
        return res.redirect('back');
    }
    return res.redirect('/sign-in');
}

// check if the user is a NGO
passport.checkNgo = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role == 'ngo') {
            return next();
        }
        return res.redirect('back');
    }
    return res.redirect('/sign-in');
}

module.exports = passport;