if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const UserMyApp = require('./models/users');
const MongoDBStore = require('connect-mongo')(session);


const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');



mongoose.set('strictQuery', true);

const dbUrl = 'mongodb://127.0.0.1:27017/MyApp'

mongoose.connect(dbUrl);


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const app = express();


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thismustbeabettersecret!',
    touchAfter: 24 * 60 * 60
})

store.on('error', function(e) {
    console.log('Session store error', e)
});

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thismustbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(UserMyApp.authenticate()));


passport.serializeUser(UserMyApp.serializeUser());
passport.deserializeUser(UserMyApp.deserializeUser());



app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});




app.use('/', userRoutes);
app.use('/posts', postRoutes);
app.use('/posts/:id/comments', commentRoutes);



app.get('/', (req, res) => {
    res.render('home')
});





app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
});


app.listen(8080, () => {
    console.log('Servering on port 8080')
});