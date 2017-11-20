var mongoose = require('mongoose');

var servicechema = mongoose.Schema ({
  name: String,
  ttype : Number,
  rating : Number,
  about : String,
  price : Number,
  tname : String,
  place : [String],
  timeSlots : [{
    day : String,
    time : [Number],
    avialable : Boolean
  }],
  imgs : [String],
  addServ : [{
    name : String,
    price : Number
  }],
  reviews : [{
    uid : String,
    sid : String,
    rev_id : String,
    rating : Number,
    time: Date,
    review : String,
    reports :[{
      rpid : String,
      uid : String,
      type : String,
      comment : String,
    }]
  }],
},
 { collection : 'service' });

const Service = module.exports = mongoose.model('service',servicechema);

// Get service
module.exports.getService = (callback, limit) => {
	Service.find(callback).limit(limit);
}

// Get Service
module.exports.getServiceById = (id, callback) => {
	Service.findById(id, callback);
}

// Add Service
module.exports.addService = (Service, callback) => {
	Service.create(Service, callback);
}

// Update Service
// module.exports.updateService = (id, Service, options, callback) => {
// 	var query = {_id: id};
// 	var update = {
// 		title: Service.title,
// 		genre: Service.genre,
// 		description: Service.description,
// 		author: Service.author,
// 		publisher: Service.publisher,
// 		pages: Service.pages,
// 		image_url: Service.image_url,
// 		buy_url: Service.buy_url
// 	}
// 	Service.findOneAndUpdate(query, update, options, callback);
// }

// Delete Service
module.exports.removeService = (id, callback) => {
	var query = {_id: id};
	Service.remove(query, callback);
}
