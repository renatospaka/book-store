const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', 
  [
    body('email')
      .isEmail()
      .withMessage('Please, enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Please enter a valid password.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post('/signup', 
  [
    check('email')
      .isEmail()
      .withMessage('Please, enter a valid email address.')
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then((userExists) => {
            if (userExists) {
              return Promise.reject('E-mail exists already. Please choose a different one.');
            }
        });
      })
      .normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password.');
        }
        return true;
      })
      .trim()
  ], 
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/reset-password', authController.postResetPassword)

module.exports = router;