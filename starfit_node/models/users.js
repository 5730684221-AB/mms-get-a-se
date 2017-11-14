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
module.exports.addUser = (User, callback) => {
	User.create(User, callback);
}

// Update User
module.exports.updateUser = (id, User, options, callback) => {
	var query = {_id: id};
	var update = {
    uid : User.uid,
    email : User.email,
    address : User.address,
    fname : User.fname,
    lname : User.lname,
    password : User.password
	}
	User.findOneAndUpdate(query, update, options, callback);
}

// Delete User
module.exports.removeUser = (id, callback) => {
	var query = {_id: id};
	User.remove(query, callback);
}
