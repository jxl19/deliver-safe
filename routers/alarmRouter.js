const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const userController = require('../controllers/userController');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, BASE_URL } = require('../config.js');
const rp = require('request-promise');

router.get('/create/testcreate', (req, res) => {
    console.log('hello there');
    res.send("inside testcreate");
})
//creates alarm request
router.get('/create/:id/:lat/:lng/:acc', (req, res) => {
    console.log('inside create');
    User.find(({_id: req.params.id}))
    .exec()
    .then(user => {
        console.log(user);
        console.log(user[0].accessToken);
        var requestOpts = {
            uri: 'https://api-sandbox.safetrek.io/v1/alarms',
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization' : 'Bearer ' + user[0].accessToken
            },
            body: {
                "services": {
                    "police": true,
                    "fire": false,
                    "medical": false
                  },
                  "location.coordinates": {
                    "lat": parseInt(req.params.lat),
                    "lng": parseInt(req.params.lng),
                    "accuracy": parseInt(req.params.acc)
                  }
            },
            json: true
        };
        rp(requestOpts)
        .then(function (body) {
            console.log("user: " + user[0].id);
            return rp.put(`${BASE_URL}/api/users/${user[0].id}/${body.id}`);
        })
        .then(() => {
            res.send('recieved alarm id');
        })
        .catch(function (reason) {
            res.send("failed");
            console.log(reason);
        })
    });
});
//cancel alarm request
router.get('/:id/cancel', (req, res) => {
    console.log('inside cancel');
    User.find(({_id: req.params.id}))
    .exec()
    .then(user => {
        console.log(user);
        console.log(user[0].alarmId);
        var requestOpts = {
            uri: `https://api-sandbox.safetrek.io/v1/alarms/${user[0].alarmId}/status`,
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'Authorization' : 'Bearer ' + user[0].accessToken
            },
            body: {
                "status" : "CANCELED"
            },
            json: true
        };
        rp(requestOpts)
        .then(function (body) {
            //send the tokens to server and store
            console.log(body);
            return rp.put(`${BASE_URL}/api/users/removeAlarm`);
        })
        .then(() => {
            res.send("alarm cancelled");
        })
        .catch(function (reason) {
            res.send("failed");
            console.log(reason);
        })
    });
})
//refresh to get new access token
router.get('/refresh', (req, res) => {
    User.find(({_id: req.user._id}))
    .exec()
    .then(user => {
        var requestOpts = {
            uri: 'https://login-sandbox.safetrek.io/oauth/token',
            method: 'POST',
            headers: {
                'content-type': "application/json"
            },
            body: {
                'grant_type': 'refresh_token',
                'client_id': CLIENT_ID,
                'client_secret' : CLIENT_SECRET,
                'refresh_token' : user[0].refreshToken
            },
            json: true
        };
        rp(requestOpts)
        .then(function (body) {
            //send the tokens to server and store
            console.log(body);
            return rp.put(`${BASE_URL}/api/users/${user[0].id}/token/${body.access_token}`);
        })
        .then(() => {
            res.send('refreshed token');
        })
        .catch(function (reason) {
            res.send("failed");
            console.log(reason);
        })
    });
})
// TODO: create the cancel EP, update EP, refresh EP

module.exports = router;