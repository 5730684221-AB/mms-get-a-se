var mongoose = require('mongoose');
//email is ID
var userchema = mongoose.Schema ({
  email : String,
  password : String,
  fname : String,
  lname : String,
  phone : String,
  image : String,
  secret : String,
  reservations :[{
      rid : String ,
      sid : String ,
      sname : String,
      timestamp :  String,
      tname : String,
      price : Number,
      paymethod : String,
      isPaid: Boolean,
      isReview : Boolean,
      items : [{
        name : String,
        sku : String,
        price : Number,
        currency: String,
        quantity: Number
      }],
      
  }]
},
 { collection : 'user' });

const User = module.exports = mongoose.model('user',userchema);

// Get users
module.exports.getUser = (callback, limit) => {
	User.find(callback).limit(limit);
}

// Get user by email
module.exports.getUserByE = (email, callback) => {
	User.findOne({ 'email': email }, callback);
}

// Get user by objid
module.exports.getUserById = (_id, callback) => {
	User.findOne({ '_id': _id }, callback);
}

// Add User
module.exports.addUser = (user, callback) => {
	User.create(user, callback);
}

// Update User
module.exports.updateUser = (_id, user, options, callback) => {
	var query = { '_id': _id };
	User.findOneAndUpdate(query, user, options, callback);
}

// Delete User
module.exports.removeUser = (_id, callback) => {
	var query = { '_id': _id };
	User.remove(query, callback);
}
