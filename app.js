const path = require('path');

const MONGODB_URI = 'mongodb+srv://nodecomplete:nodecomplete@renatospaka-m001.oiyd7.mongodb.net/books-shop?retryWrites=true&w=majority';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const mongoSessionStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: mongoSessionStore
  })
);

app.use((req, res, next) => {  
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(userMongo => {
      req.user = userMongo;
      next();
    })
    .catch(err => console.log('app.js => User.findById', err));  
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
  .then(result => {
    //inicia o servidor
    app.listen(3000);
  })
  .catch(err => {
    console.log('mongoose: ', err);
  });
