const express  = require('express');
const router = express.Router();
const passport = require('passport');
const Requester = require('../models/Requester');


// Login Form
router.get('/login', (req, res) => {
    res.render('reqlogin.ejs', { err: [], email: null });
});

// Requester local login
router.post('/login', async function (req, res) {
    const errors = {};
    if (!req.body.email) {
        errors.email = 'Please enter your email address';
    }
    else if (!req.body.password) {
        errors.password = 'Please enter your password';
    }
    else {
        // Get the user from DB
        const requester = await Requester.findOne({ email: req.body.email.trim() }, 'email password').exec();
            if (requester) {
                req.login(requester, function(err) {
                    if (err) { return next(err); }
                    return res.redirect('/reqtask');
                });
            }
            else {
                // No record found
                errors.user = 'User not found';
            }
    }
    if (Object.keys(errors).length != 0) {
        res.render('reqlogin.ejs', { err: errors, email: req.body.email });
    }
});

// Signup page
router.get('/reqsignup', (req, res) => {
    res.render('reqsignup.ejs', { err: [], data: null });
})

// Signup form
router.post('/reqsignup', (req, res) => {
    if (req.body.password !== req.body.passwordConfirm) {
        res.render('reqsignup.ejs', { err: { errors: {passwordConfirm: 'Passwords must match.'}}, data: req.body })
    }
    Requester.register(new Requester({
        country: req.body.country,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        postcode: req.body.postcode,
        mobile: req.body.mobile,
    }), req.body.password, (err, requester) => {
        if (err) {
            console.log(err);
            res.render('reqsignup.ejs', { err: err, data: req.body });
        }
        else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/reqtask');
            });
        }
    })
});

// Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Callback for Google auth redirect
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/reqtask');
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;