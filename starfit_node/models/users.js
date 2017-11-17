var mongoose = require('mongoose');
//email is ID
var userchema = mongoose.Schema ({
  email : String,
  password : String,
  fname : String,
  lname : String,
  phone : String,
  img: { data: Buffer, contentType: String },
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

// // Get User
// module.exports.getUserByUid = (uid, callback) => {
// 	User.findOne({ 'uid': uid }, callback);
// }

module.exports.getUserByE = (email, callback) => {
	User.findOne({ 'email': email }, callback);
}

// Add User
module.exports.addUser = (user, callback) => {
	User.create(user, callback);
}

// Update User
module.exports.updateUser = (email, user, options, callback) => {
	var query = { 'email': email };
	var update = {
    address : user.address,
    fname : user.fname,
    lname : user.lname,
    password : user.password
	}
	User.findOneAndUpdate(query, update, options, callback);
}

// Delete User
module.exports.removeUser = (email, callback) => {
	var query = { 'email': email };
	User.remove(query, callback);
}
