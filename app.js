const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');

const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');
const app = express();

require('dotenv').config()
const mongoUri = process.env.MONGODB_URI;
const mongoSessionStore = new MongoDBStore({
  uri: mongoUri,
  collection: 'sessions'
});

// csurf can store key secret to encrypt files, etc. Here it will be used with default values
const csrfProtect = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: mongoSessionStore
  })
);
app.use(csrfProtect);
app.use(flash());

//add protection to all routes
// locals is a set of variables that only exists in views that are rendered
// must be set after session and before routes are set
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {  
  //throw new Error('Sync Dummy Error'); //cexecutes for every coming request, causes infini loop here
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(userMongo => {
      req.user = userMongo;
      next();
    })
    .catch(err => {
      // use this approach inside promises, callbacks, asynchronous code
      next(new Error(err));
    });  
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  //res.status(error.httpStatusCode).render('...')
  //res.redirect('/500')
  res.status(404).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

mongoose.connect(mongoUri)
  .then(result => {
    //inicia o servidor
    app.listen(3000);
  })
  .catch(err => {
    console.log('mongoose: ', err);
  });
