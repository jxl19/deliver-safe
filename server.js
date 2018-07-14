const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();
var cors = require('cors');
var rp = require('request-promise');
var querystring = require('querystring');
const { PORT, DATABASE_URL, CLIENT_ID, CLIENT_SECRET } = require('./config.js');
mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});


app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    url: DATABASE_URL,
    collection: 'sessions'
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    console.log('no way jose');
    res.redirect('/');
  }
}

app.get('/', (req, res) => {
    res.send("hi");
})

app.get('/redir', (req, res) => {
    res.redirect(`https://account-sandbox.safetrek.io/authorize?client_id=${CLIENT_ID}&scope=openid phone offline_access&response_type=code&redirect_uri=http://localhost:8000/callback`)
})
app.get('/callback', (req,res) => {
    // console.log(req.headers);
    // console.log(req.query.code);
    // res.send(req.query.code); 
    var requestOpts = {
        uri: 'https://login-sandbox.safetrek.io/oauth/token',
        method: 'POST',
        body: querystring.stringify({
              "grant_type": "authorization_code",
              "code": req.query.code,
              "client_id": CLIENT_ID,
              "client_secret": CLIENT_SECRET,
              "redirect_uri": "http://localhost:8000/callbackredir"
        })
    };
    //we then post the code and the headers to the noonlight servers at which point noonlight servers will return us accesstoken
    return rp(requestOpts)
        .then(function(req, res){
            res.send("test");
            console.log("req");
        })
        .catch(function(reason) {
            res.send("failed");
            console.dir("reason");
        })
})

app.get('/callbackredir', (req, res) => {
    res.send(req.body);
})

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Request not found' });
});

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Server started on port: ${port}`);
        console.log(databaseUrl);
        resolve();
      })
        .on('error', err => {
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
