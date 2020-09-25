const express = require('express');
const bodyParser = require('body-parser');
const Requester = require('./models/Requester');
const Worker = require('./models/Worker');
const mongoose = require('mongoose');
const workerApi = require('./api/worker-api');
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const passportGoogle = require('passport-google-oauth');
const session = require('express-session')
const mail = require('./mail');

// Bcrypt
const bcrypt = require('bcrypt');

const app = express()
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(workerApi);
app.use(session({
    secret : 'Deakin2020',
    resave: false,
    saveUninitialized: false, 
    cookie: { maxAge: 120000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect('mongodb+srv://sergei:Deakin2020@cluster0.t3ayv.mongodb.net/iCrowdTaskDB?retryWrites=true&w=majority', 
    {useNewUrlParser: true, useUnifiedTopology: true})

// Initialise Passport strategies for requesters and workers
passport.use(Requester.createStrategy())
passport.serializeUser(Requester.serializeUser())
passport.deserializeUser(Requester.deserializeUser())


/**
 * Routes
 */

// Entry point - login page
app.get('/', (req, res) => {
    res.render('reqlogin.ejs', { err: [], email: null });
})

// Requester login form
app.post('/', async function (req, res) {
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
                // Compare password hash from DB
                const match = await bcrypt.compare(req.body.password, requester.password);
                if (match) {
                    res.redirect('/reqtask');
                    res.end();
                }
                else {
                    errors.user = 'Invalid email or password';
                }
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
app.get('/reqsignup', (req, res) => {
    res.render('reqsignup.ejs', { err: [], data: null });
})

// Signup form
app.post('/reqsignup', (req, res) => {
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
            console.log(err)
            res.render('reqsignup.ejs', { err: err, data: req.body })
        }
        else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/reqtask');
            });
        }
    })
});

// Logout
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// Tasks page
app.get('/reqtask', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/reqtask.html');
    }
    else {
        res.redirect('/');
    }
})

let port = process.env.PORT;
if (port == null || port == '') {
  port = 8080;
}

app.listen(port, (req, res)=>{
    console.log('Server is running successfully!');
})