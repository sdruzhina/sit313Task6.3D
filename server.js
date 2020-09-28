const express = require('express');
const bodyParser = require('body-parser');
const Requester = require('./models/Requester');
const Worker = require('./models/Worker');
const mongoose = require('mongoose');
const passportSetup = require('./config/passport-config');
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const passportGoogle = require('passport-google-oauth');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);

// Routes and API
const workerApi = require('./api/worker-api');
const authRoutes = require('./routes/auth-routes');
const config = require('./config');

const app = express()
// set the view engine to ejs
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || config.mongoDB.uri, 
    {useNewUrlParser: true, useUnifiedTopology: true})

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

// Session and Passport
app.use(session({
    secret : 'Deakin2020',
    resave: false,
    saveUninitialized: false, 
    cookie: { maxAge: 480000 },
    store: new MongoStore({ 
        mongooseConnection: mongoose.connection, 
        ttl: 2 * 60 * 60 // 2 hours
    })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Set up routes and API
app.use(workerApi);
app.use('/auth', authRoutes);

// Initialise Passport strategies for requesters
passport.use(Requester.createStrategy())
passport.serializeUser(Requester.serializeUser())
passport.deserializeUser(Requester.deserializeUser())


/**
 * Routes
 */

// Entry point 
app.get('/', (req, res) => {
    // Check if the user is set in the session
    if (!req.isAuthenticated()) {
        // redirect it to login page
        res.redirect('/auth/login');
    } 
    else {
        res.redirect('/reqtask');
    }
})

// Tasks page
app.get('/reqtask', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('reqtask.ejs', { user: req.user })
    }
    else {
        res.redirect('/auth/login');
    }
})

let port = process.env.PORT;
if (port == null || port == '') {
  port = 8080;
}

app.listen(port, (req, res)=>{
    console.log('Server is running successfully!');
})