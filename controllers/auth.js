const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

require("dotenv").config();
const transporter = nodeMailer.createTransport(
  sendgridTransport({
    auth: {
      api_user: process.env.SENDGRID_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
            return res.redirect("/");
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          "error",
          "E-mail exists already. Please choose a different one."
        );
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          //shop@bookstore.com
          res.redirect("/login");
          return transporter.sendMail({
            to: email,
            from: "anftpwsdmlvqwgdriy@tsyefn.com",
            subject: "Sign on succeeded!",
            html: "<h1>You successfully signed up!</h1>",
          });
        })
        .catch((err) => {
          console.log("Signup", err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("postReset", err);
      res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'E-mail not found. Try a different one.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenexpiration = Date.now() + 3600000; // 1 hour)
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: "anftpwsdmlvqwgdriy@tsyefn.com",
          subject: "Password rest",
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}"link/a> to set a new password.</p>
          `,
        });
      })
      .catch(err => {
        console.log('postReset', err);
      });
  });
};


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenexpiration: {$gt: Date.now()}})
    .then(user => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/reset-password", {
        path: "/reset-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log('getNewPassword', err);
    });
};

exports.postResetPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({ resetToken: passwordToken, resetTokenexpiration: {$gt: Date.now() }, _id: userId })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenexpiration = undefined;
      resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log('postResetPassword', err)
    });
};
