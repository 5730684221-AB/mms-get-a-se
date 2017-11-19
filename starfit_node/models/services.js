var mongoose = require('mongoose');

var servicechema = mongoose.Schema ({
  name: String,
  ttype : Number,
  rating : Number,
  about : String,
  price : Number,
  tname : String,
  img : [String],
  place : [Number],
  status : String,
  reviews : [{
    uid : String,
    sid : String,
    rev_id : String,
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

module.exports.servicetagToLocation = (tag) => {
  var location = '';
  return location;
}

//Update Service
module.exports.updateService = (id, service, options, callback) => {
	var query = {_id: id};
	Service.findOneAndUpdate(query, service, options, callback);
}

// Delete Service
module.exports.removeService = (id, callback) => {
	var query = {_id: id};
	Service.remove(query, callback);
}
