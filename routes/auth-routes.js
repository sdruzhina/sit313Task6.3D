const express  = require('express');
const router = express.Router();
const passport = require('passport');

// Login
router.get('/login', (req, res) => {
    res.render('reqlogin.ejs', { err: [], email: null });
});

// Logout
router.get('/logout', (req, res) => {
    // TODO - handle
    res.send('Logging iout');
});

// Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));


module.exports = router;