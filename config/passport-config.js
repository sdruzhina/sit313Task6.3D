const config = require("../config");
const passport = require('passport');
const Requester = require("../models/Requester");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((requester, done) => {
    done(null, requester._id);
});

passport.deserializeUser((id, done) => {
    Requester.findById(id).then((requester) => {
        done(null, requester);
    })
});

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || config.google.clientID,
        clientSecret: process.env.GOOGLE_SECRET || config.google.clientSecret,
        callbackURL: 'https://ancient-chamber-36974.herokuapp.com/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // Check if user exists in DB
        Requester.findOne({googleId: profile.id})
        .then((requester) => {
            if(requester) {
                done(null, requester);
            }
            else {
                // Create new requester from Google profile
                new Requester({
                    googleId: profile.id,
                    firstName: profile._json.given_name,
                    lastName: profile._json.family_name,
                    email: profile.emails[0].value,
                    createdAt: Date.now()
                }).save()
                .then((newRequester) => {
                    console.log('User added: ' + newRequester);
                    done(null, newRequester);
                });
            }
        })
    })
);