var mongoose = require('mongoose');
//paswoord onleesbaar
var crypto = require('crypto');
//regeneratie JWT token voor de gebruiker
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
//opslag plaats voor paswoord
  hash: String,
  salt: String
});
//aanmaken van setPassword method: hier wordt het paswoord aanvaardt
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  //pbkdf2(): wordt gebruikt om het paswoord onleesbaar te maken op het scherm
  //de functie bevat: password, salt, iteratie en key length
  //we moeten er voor opletten dat de iteratie en key length overeenkomt met
  // de methode validPassword
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};
//paswoord validatie
UserSchema.methods.validPassword = function(password){
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};
//
UserSchema.methods.generateJWT = function(){
  //set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
//jwt.sign method: payload dat wordt getekend.
//zowel de server en de client hebben toegang tot de payload.
  return jwt.sign({
    _id: this.id,
    username : this.username,
    //exp: Unix tijdseenheid in seconde
    exp: parseInt(exp.getTime() / 1000),
  },
  //wordt gebruikt om de token te tekenen
  'SECRET');
};
mongoose.model('User', UserSchema);
