const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const router = express.Router();
const flash=require("connect-flash");
router.use(flash());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const userController = require('../controllers/userController');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

router.post('/signup', userController.register);
router.get('/logout', userController.logout);
//using to check if data is acually there.. del later
router.get('/testuser', userController.checkUser);
const {
  // Assigns the Strategy export to the name JwtStrategy using object
  // destructuring
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Assigning_to_new_variable_names
  Strategy: JwtStrategy,
  ExtractJwt
} = require('passport-jwt');

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
},
  function (req, username, password, done) {
    process.nextTick(function () {
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, req.flash('error', 'Invalid username or password'));
        }
        if (user.validatePassword(password)) {
          return done(null, user);
        }
        else if (!user.validatePassword(password)) {
          return done(null, false, req.flash('error', 'Invalid username or password'));
        }
      });
    })
  }
))

const createAuthToken = user => {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    algorithm: 'HS256'
  });
};

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/failed'
  }), (req, res, info) => {
    const authToken = createAuthToken(req.user.apiRepr());
    res.json({ authToken: authToken, user: req.user._id });
    console.log('logging in');
  });

//save access and refresh token
router.put('/:userId/:aToken/:rToken', (req, res) => {
  const updateToken = {
    "accessToken": req.params.aToken,
    "refreshToken": req.params.rToken
  }

  User
    .findByIdAndUpdate(req.params.userId, { $set: updateToken }, { new: true })
    .exec()
    .then(user => res.status(200).json(user.checkData()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});
//update access token after refresh
router.put('/:userId/token/:aToken', (req, res) => {
  const updateToken = {
    "accessToken": req.params.aToken
  }
  User
    .findByIdAndUpdate(req.params.userId, { $set: { "accessToken": req.params.aToken } }, { new: true })
    .exec()
    .then(user => res.status(200).json(user.checkData()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});
//save alarm id
router.put('/:userId/:alarmId', (req, res) => {
  User
    .findByIdAndUpdate(req.params.userId, { $set: { "alarmId": req.params.alarmId } }, { new: true })
    .exec()
    .then(user => res.status(200).json(user.checkData()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
})
module.exports = router;