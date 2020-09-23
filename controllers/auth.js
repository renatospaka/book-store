const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false  //isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {  
  User.findById('5f5a54185ebfc65c0df6d445')
    .then(user => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save(err => {
        console.log('postLogin: ', err);
        res.redirect('/');
      })
    })
    .catch(err => console.log('postLogin: ', err));  
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log('postLogout: ', err)
    res.redirect('/');
  });
};
