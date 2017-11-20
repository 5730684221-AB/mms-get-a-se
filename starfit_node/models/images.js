var mongoose = require('mongoose');

//path and originalname are the fields stored in mongoDB
var imageSchema = mongoose.Schema({
  path: {
    type: String,
    required: true,
    trim: true
  },
  originalname: {
    type: String,
    required: true
  }
},
 { collection : 'image' });


var Image = module.exports = mongoose.model('files', imageSchema);


module.exports.getImages = function(callback, limit) {
  Image.find(callback).limit(limit);
}


module.exports.getImageById = function(id, callback) {
  Image.findOne({ '_id': id }, callback);
}

module.exports.getDefPro = (callback) => {
	Image.findOne({ 'default': "defprofile"}, callback);
}

module.exports.getDefSer = (callback) => {
	Image.findOne({ 'default': "defservice" }, callback);
}

module.exports.addImage = function(image, callback) {
  Image.create(image, callback);
}
