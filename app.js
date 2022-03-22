//Due to this line we have access to the data in .env file. 
if (process.env.Node_ENV != "production") {   // when not in production mode
    require('dotenv').config();     // requiring the files stored in .env.
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');   //session (similar to cookies).
const flash = require('connect-flash');    // for flashing messages.
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const usersRoute = require('./routes/users');
const campgroundsRoute = require('./routes/campground');    // acquiring our campground router.
const reviewsRoute = require('./routes/review');   // all the review routes are here.
const { env } = require('process');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet'); // Helmet helps you secure your Express apps by setting various HTTP headers.
const MongoDBStore = require('connect-mongo');


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database Connected");
})

const app = express();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));   // setting up our static file (public directory).
app.use(mongoSanitize());

const secret = process.env.SECRET || "Thisshouldbeagoodsecret";

//mongo store is for our sessions.
const store = MongoDBStore.create({      
    mongoUrl: dbUrl,     
    secret,
    touchAfter: 24 * 60 * 60 // in seconds  // updates the session once every 24 hours if there are no changes made.

})
store.on('error', function(e){
    console.log('Session Store Error', e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,     // i.e. Our cookie is accessible only through http & not javascript.
        // secure: true,    // i.e. Our cookie should be accessible only through https.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,       // after 7 days. // in milli seconds.
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());     // this middleware is required to initialize passport.
app.use(passport.session());        // for persistent logging sessions.
passport.use(new LocalStrategy(User.authenticate()));  // here we're telling passport to use
                                   // the LocalStrategy and for this localstrategy the 
                // authentication method is going to be located on our User model and it's 
                // called authenticate. 

passport.serializeUser(User.serializeUser());    // how to store the user in the session.
passport.deserializeUser(User.deserializeUser()); // -- remove the user --

app.use((req, res, next) => {                    // middleware for flash.
    // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');       
    res.locals.error = req.flash('error');
    next();
})

app.use('/', usersRoute);
app.use('/campgrounds', campgroundsRoute);         // using our campground router.
app.use('/campgrounds/:id/reviews', reviewsRoute);        // using our review router.
app.use(helmet({ contentSecurityPolicy: false, }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ashu361/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found.', 400));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', { err });
})


app.listen(3000, () => {
    console.log('Server is listening on port 3000');
})
