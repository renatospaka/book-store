const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5f5a54185ebfc65c0df6d445')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log('app.js => User.findById', err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://nodecomplete:nodecomplete@renatospaka-m001-oiyd7.mongodb.net/books-shop?retryWrites=true&w=majority')
  .then(result => {
    //adicinoa um usuário
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Renato',
          email: 'renato@email.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
  
    //inicia o servidor
    app.listen(3000);
  })
  .catch(err => {
    console.log('mongoose: ', err);
  });
