// SEM-4 EVS COURSE PROJECT

// IMPORTING REQUIRED LIBRARIES
const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 8080;
const httpsRedirect = require('express-https-redirect');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const db = require('./config/mongoose');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJWT = require('./config/passport-jwt-strategy');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const customMware = require('./config/flash_middleware');
const bodyParser = require('body-parser');
const cors = require('cors');

// MIDDLEWARES
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', httpsRedirect());
corsOptions = {
    origin: 'https://http://compostifyevs-production.up.railway.app',
}
app.use(cors());
app.use(express.static('./assets'));
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);
app.set('view engine', 'ejs');
app.set('views', './views');

// CREATING SESSION FOR USER
const secret = crypto.randomBytes(32).toString('hex');
app.use(session({
    name: 'Compostify',
    secret: secret,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000*60*20)
    },
    // storing the cookie-data in mongo db
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/d-compost',
        autoRemove: 'disabled'
    }, function(err){
        console.log(err || 'connect-mongo setup ok!!');
    })
}));

// handling passport middlewares
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.set_flash);

// SETTING UP THE ROUTES
app.use('/', require('./routes/index'));

// SETTING UP THE SERVER
app.listen(port, function(err){
    if(err){
        console.log(err);
        return;
    }
    console.log('Server is up and running on port: ', port);
});