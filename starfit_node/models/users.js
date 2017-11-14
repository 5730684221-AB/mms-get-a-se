var mongoose = require('mongoose');

var userchema = mongoose.Schema ({
  uid : String ,
  email : String,
  address : String,
  fname : String,
  lname : String,
  password : String,
  reservations :[{
      rid : String ,
      sid : String ,
      timestamp :  String,
      tname : String,
      uname : String,
      price : Number,
      paymethod : String
  }]
},
 { collection : 'user' });

const User = module.exports = mongoose.model('user',userchema);

// Get user
module.exports.getUser = (callback, limit) => {
	User.find(callback).limit(limit);
}

// Get User
module.exports.getUserByUid = (uid, callback) => {
	User.findOne({ 'uid': uid }, callback);
}

// Add User
module.exports.addUser = (user, callback) => {
	User.create(user, callback);
}

// Update User
module.exports.updateUser = (uid, user, options, callback) => {
	var query = { 'uid': uid };
	var update = {
    email : user.email,
    address : user.address,
    fname : user.fname,
    lname : user.lname,
    password : user.password
	}
	User.findOneAndUpdate(query, update, options, callback);
}

// Delete User
module.exports.removeUser = (uid, callback) => {
	var query = { 'uid': uid };
	User.remove(query, callback);
}
