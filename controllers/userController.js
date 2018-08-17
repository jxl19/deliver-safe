const mongoose = require('mongoose');
const { User } = require('../models')
const passport = require('passport');

exports.register = (req, res) => {
    console.log("registering a user");
    User
        .find({ username: req.body.username })
        .count()
        .exec()
        .then(count => {
            if (count > 0) {
                console.log('reject');
                return Promise.reject({
                    name: 'AuthenicationError',
                    message: 'username already registered'
                });
            }
            return User.hashPassword(req.body.password);
        })

        .then(hash => {
            return User
                .create({
                    username: req.body.username,
                    password: hash,
                    pin: req.body.pin
                })
        })
        .then(user => {
            //login after creating new user
            req.login(user, function (err) {
                console.log('register success');
                if (err) { return next(err); }
                req.session.username = req.user.username;
                return res.send('ok');
            });
        })
        .catch(err => {
            if (err.name === 'AuthenicationError') {
                return res.status(422).json({ message: err.message })
            }
            console.log(err);
            console.log(err.message);
            console.log(err.name);
            res.status(500).json({ message: err.error })
        })
}
//save token into db
exports.saveTokens = (req, res) => {
    if (req.session && req.user && req.user._id) {
        currentUser = req.user._id;
        console.log("userID: " + req.session.passport.user._id);
        console.log("requserid: " + req.user._id);
    }
}

exports.checkUser = (req, res) => {
    if (req.session && req.user && req.user._id) {
        currentUser = req.user._id;
    }
    console.log("userID: " + req.session.passport.user._id);
    console.log("requserid: " + req.user._id);
    User
    .find({_id: req.params.id})
    .exec()
    .then(user => {
        console.log("username: " + user[0].username);
        const userData = {
            id : user[0]._id,
            username : user[0].username,
            pin : user[0].pin,
            accessToken : user[0].accessToken || '',
            refreshToken : user[0].refreshToken || ''
        }
        res.status(200).json(userData);   
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    });
}
exports.logout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('signed off');
}
