const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const validator = require('validator');
mongoose.Promise = global.Promise;
//add name+lastname
const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'Please supply an username'
  },
  password: {
    type: String,
    required: true
  },
  pin: {
    type: Number,
    required: true,
    min: 0000,
    max: 9999
  },
  refreshToken: {
    type: String
  },
  accessToken: {
    type: String
  },
  alarmId: {
    type: String
  }
});

userSchema.statics.hashPassword = function (password) {
  return bcrypt
    .hash(password, 10)
    .then(hash => hash);
}
userSchema.methods.validatePassword = function (password) {
  return bcrypt
    .compareSync(password, this.password)
}
//do we need
userSchema.methods.validatePin = function(pin) {
  return pin === this.pin;
}

userSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    username: this.username,
    password: this.password,
  }
}

userSchema.methods.checkData = function () {
  return {
    id: this._id,
    username: this.username,
    password: this.password,
    pin: this.pin,
    refreshToken: this.refreshToken,
    accessToken: this.accessToken,
    alarmId: this.alarmId
  }
}
userSchema.plugin(mongodbErrorHandler);
const User = mongoose.model('User', userSchema);

module.exports = { User };