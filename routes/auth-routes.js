const config = require('../config');
const express  = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Requester = require('../models/Requester');
const mail = require('../mail');


// Login Form
router.get('/login', (req, res) => {
    res.render('reqlogin.ejs', { err: req.flash('error'), email: null });
});

// Requester local login
router.post("/login", passport.authenticate('local', {
        successRedirect: '/reqtask',
        failureRedirect: '/auth/login',
        failureFlash: true
    }), function(req, res){
        // Check the "Save password" flag and save session to Mongo
        if ( req.body.savePassword ) {
            // Set cookie to expire in 1 day
            req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000 
        } 
        else {
            req.session.cookie.expires = false
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
        createdAt: Date.now()
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

// Password reset form
router.get('/forgot', (req, res) => {
    res.render('forgot-password', { sent: false });
});

// Password Reset POST request
router.post('/forgot', async function (req, res) {
    // Get the email and check if user exists
    const email = req.body.email.trim();
    let requester;
    try {
        requester = await Requester.findOne({ email }).exec()
    } 
    catch (err) {
        res.status(404).json('This email is not registered.')
    }

    // Create a JWT token using the constant secret
    const userId = requester._id;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || config.keys.jwtSecret, {
        expiresIn: 1800 // 30 minutes
    });

    // Save the token to user's DB record
    requester.updateOne({ resetToken: token }, (err, successs) => {
        if (err) {
            res.status(404).json('Error saving token.')
        }
    });

    // Password reset URL using user ID and token
    const url = `http://localhost:8080/auth/reset/${token}`;

    // Send the email
    mail.sendPasswordReset(requester.email, requester.firstName, url);

    // Render the page with a confirmation message
    res.render('forgot-password', { sent: true });
});

// Change Password form
router.get('/reset/:token', (req, res) => {
    res.render('change-password', 
        { err: null, confirm: false, token: req.params.token });
});

// Change Password POST request
router.post('/reset/:token', async function (req, res) {
    if (!req.body.password || req.body.password !== req.body.passwordConfirm) {
        res.render('change-password', 
            { err: {message: 'Passwords do not match.'}, 
            confirm: false, token: req.params.token });
    }
    // Decode the token
    let decoded;
    try {
        decoded = jwt.verify(req.params.token, process.env.JWT_SECRET || config.keys.jwtSecret);
    } 
    catch (err) {
        console.log(err);
        res.status(403).json('Token verification failed.');
    }
    // Find the user by ID stored in token
    let requester;
    try {
        requester = await Requester.findOne({ _id: decoded.userId }).exec();
    } 
    catch (err) {
        res.status(404).json('Invalid user.');
    }
    // Compare tokens
    if (requester && requester.resetToken === req.params.token) {
        // Set new password 
        await requester.setPassword(req.body.password);
        await requester.save();

        // Remove the token from user's DB record
        requester.updateOne({ resetToken: '' }, (err, successs) => {
            if (err) {
                res.status(404).json('Error resetting token.')
            }
        });

        // Confirm password change
        res.render('change-password', { err: null, confirm: true, token: '' });
    }
    else {
        res.status(404).json('User not found, or the token is invalid.')
    }
});

module.exports = router;