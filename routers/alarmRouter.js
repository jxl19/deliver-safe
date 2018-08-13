const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const userController = require('../controllers/userController');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');
const rp = require('request-promise');
// routes to use safetrek api
// https://api-sandbox.safetrek.io/v1



router.get('/create', (req, res) => {
    User.find(({_id: req.user._id}))
    .exec()
    .then(user => {
        var requestOpts = {
            uri: 'https://login-sandbox.safetrek.io/oauth/token',
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization' : {token}
            },
            body: {
                'grant_type': 'authorization_code',
                'code': req.query.code,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'redirect_uri': REDIRECT_URL
            },
            json: true
        };
    });

    var requestOpts = {
        uri: 'https://login-sandbox.safetrek.io/oauth/token',
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization' : {token}
        },
        body: {
            'grant_type': 'authorization_code',
            'code': req.query.code,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'redirect_uri': REDIRECT_URL
        },
        json: true
    };
});