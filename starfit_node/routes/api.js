var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Users = require('../models/users');
var Services = require('../models/services');

//-------------------- User -----------------------//

/* GET users listing. */
router.get('/users', (req, res) => {
	Users.getUser((err, users) => {
		if(err){
			throw err;
		}
		res.json(users);
	});
});

router.get('/userid/:_id', (req, res) => {
	var id;
	//solve ObjectId casting problem
	if(mongoose.Types.ObjectId.isValid(req.params._id)) {
		var id = req.params._id;
	}
	else{
		var id = null;
	}
	Users.getUserById(id, (err, user) => {
		if(err){
			throw err;
		}
    if(user === null){
      res.send("user not found")
    }
    else{
			var userdata = {
				email : user.email,
				fname : user.fname,
				lname : user.lname,
				phone : user.phone,
				reservations : user.reservations
			}
			res.json(userdata);
    }
	});
});

//get user by email
router.get('/usere/:_id', (req, res) => {
	Users.getUserByE(req.params._id, (err, user) => {
		if(err){
			throw err;
		}
    if(user === null){
      res.status(200).send("user not found")
    }
    else{
			var userdata = {
				email : user.email,
				fname : user.fname,
				lname : user.lname,
				phone : user.phone,
				reservations : user.reservations
			}
			res.json(userdata);
    }
	});
});

//chk email
router.get('/chk/:_id', (req, res) => {
	Users.getUserByE(req.params._id, (err, user) => {
		if(err){
			throw err;
		}
    if(user === null){
      res.status(200).send("user not found");
    }
    else{
			res.status(200).send("found user with email " + req.params._id);
    }
	});
});

//-------------------- Service -----------------------//

router.get('/services', (req, res) => {
	Services.getService((err, services) => {
		if(err){
			throw err;
		}
		res.json(services);
	});
});

module.exports = router;
