const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');
let opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
}

passport.use(new JWTStrategy(opts, function(jwt_payload, done){
    console.log('JWT Payload:', jwt_payload);
    User.findById(jwt_payload._id, function(err, user){
        if(err) {
            console.log('Error in finding the user from JWT');
            return;
        }

        if(user){
            return done(null, user);
        } else {
            return done(null, false);
        }
    })
}));

module.exports = passport;