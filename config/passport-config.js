const config = require("../config");
const passport = require('passport');
const Requester = require("../models/Requester");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
    new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // Check if user exists in DB
        Requester.findOne({googleId: profile.id})
        .then((requester) => {
            if(requester) {
                
            }
            else {
                // Create new requester from Google profile
                new Requester({
                    googleId: profile.id,
                    firstName: profile._json.given_name,
                    lastName: profile._json.family_name,
                    email: profile.emails[0].value,
                }).save()
                .then((newRequester) => {
                    console.log('User added: ' + newRequester);
                });
            }
        })
    })
);