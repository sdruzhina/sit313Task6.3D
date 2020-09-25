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

// Callback for Boogle uth redirect
router.get('/google/redirect', (req, res) => {
    res.send('Response received');
})


module.exports = router;