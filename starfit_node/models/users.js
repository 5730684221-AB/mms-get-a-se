var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema [{
  uname : String,
  secret : String
}];

mongoose.model('users',usersSchema);
