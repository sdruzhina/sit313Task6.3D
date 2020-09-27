const express = require('express');
const bodyParser = require('body-parser');
const Requester = require('./models/Requester');
const Worker = require('./models/Worker');
const mongoose = require('mongoose');
const passportSetup = require('./config/passport-config');
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const passportGoogle = require('passport-google-oauth');
const session = require('express-session')
const mail = require('./mail');

// Routes and API
const workerApi = require('./api/worker-api');
const authRoutes = require('./routes/auth-routes');
const config = require('./config');

const app = express()
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

// Session and Passport
app.use(session({
    secret : 'Deakin2020',
    resave: false,
    saveUninitialized: false, 
    cookie: { maxAge: 480000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Set up routes and API
app.use(workerApi);
app.use('/auth', authRoutes);

// MongoDB connection
mongoose.connect(config.mongoDB.uri, 
    {useNewUrlParser: true, useUnifiedTopology: true})

// Initialise Passport strategies for requesters
passport.use(Requester.createStrategy())
passport.serializeUser(Requester.serializeUser())
passport.deserializeUser(Requester.deserializeUser())


/**
 * Routes
 */

// Entry point 
app.get('/', (req, res) => {
    res.redirect('/auth/login');
})

// Tasks page
app.get('/reqtask', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('reqtask.ejs', { user: req.user })
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