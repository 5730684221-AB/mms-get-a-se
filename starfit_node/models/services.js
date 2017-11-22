var mongoose = require('mongoose');

var servicechema = mongoose.Schema ({
  name: String,
  images: [String],
  ttype : Number,
  rating : Number,
  about : String,
  price : Number,
  tname : String,
  place : [Number],
  status : String,
  timeSlots : [{
    id : String,
    day : String,
    time : [Number],
    available : Boolean
  }],
  imgs : [String],
  addServ : [{
    name : String,
    price : Number
  }],
  reviews : [{
    uid : String,
    uname : String,
    sid : String,
    rev_id : String,
    rating : Number,
    time: Date,
    review : String,
    rating : Number,
    isReport : Boolean
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
  switch(tag) {
    case 1:
        location = 'เขตพระนคร'
        break;
    case 18:
        location = 'เขตคลองสาน'
        break;
    case 30:
        location = 'เขตจตุจักร'
        break;
    case 35:
        location = 'เขตจอมทอง'
        break;
    case 36:
        location = 'เขตดอนเมือง'
        break;
    case 26:
        location = 'เขตดินแดง'
        break;
    case 46:
        location = 'เขตคลองสามวา'
        break;
    case 33:
        location = 'เขตคลองเตย'
        break;
    case 43:
        location = 'เขตคันนายาว'
        break;
    case 2:
        location = 'เขตดุสิต'
        break;
    case 19:
        location = 'เขตตลิ่งชัน'
        break;
    case 48:
        location = 'เขตทวีวัฒนา'
        break;
    case 49:
        location = 'เขตทุ่งครุ'
        break;
    case 15:
        location = 'เขตธนบุรี'
        break;
    case 20:
        location = 'เขตบางกอกน้อย'
        break;
    case 16:
        location = 'เขตบางกอกใหญ่'
        break;
    case 6:
        location = 'เขตบางกะปิ'
        break;
    case 21:
        location = 'เขตบางขุนเทียน'
        break;
    case 31:
        location = 'เขตบางคอแหลม'
        break;
    case 29:
        location = 'เขตบางซื่อ'
        break;
    case 47:
        location = 'เขตบางนา'
        break;
    case 50:
        location = 'เขตบางบอน'
        break;
    case 25:
        location = 'เขตบางพลัด'
        break;
    case 4:
        location = 'เขตบางรัก'
        break;
    case 5:
        location = 'เขตบางเขน'
        break;
    case 40:
        location = 'เขตบางแค'
        break;
    case 27:
        location = 'เขตบึงกุ่ม'
        break;
    case 7:
        location = 'เขตปทุมวัน'
        break;
    case 32:
        location = 'เขตประเวศ'
        break;
    case 8:
        location = 'เขตป้อมปราบศัตรูพ่าย'
        break;
    case 14:
        location = 'เขตพญาไท'
        break;
    case 22:
        location = 'เขตภาษีเจริญ'
        break;
    case 9:
        location = 'เขตพระโขนง'
        break;
    case 10:
        location = 'เขตมีนบุรี'
        break;
    case 12:
        location = 'เขตยานนาวา'
        break;
    case 37:
        location = 'เขตราชเทวี'
        break;
    case 24:
        location = 'เขตราษฎร์บูรณะ'
        break;
    case 11:
        location = 'เขตลาดกระบัง'
        break;
    case 38:
        location = 'เขตลาดพร้าว'
        break;
    case 45:
        location = 'เขตวังทองหลาง'
        break;
    case 39:
        location = 'เขตวัฒนา'
        break;
    case 34:
        location = 'เขตสวนหลวง'
        break;
    case 44:
        location = 'เขตสะพานสูง'
        break;
    case 13:
        location = 'เขตสัมพันธวงศ์'
        break;
    case 28:
        location = 'เขตสาทร'
        break;
    case 42:
        location = 'เขตสายไหม'
        break;
    case 3:
        location = 'เขตหนองจอก'
        break;
    case 23:
        location = 'เขตหนองแขม'
        break;
    case 41:
        location = 'เขตหลักสี่'
        break;
    case 17:
        location = 'เขตห้วยขวาง'
        break;
    default:
        location = 'ไม่ปรากฎ'
        break;
  }
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
