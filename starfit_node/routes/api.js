var express = require('express');
var router = express.Router();

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

router.get('/user/:_id', (req, res) => {
	Users.getUserByUid(req.params._id, (err, user) => {
		if(err){
			throw err;
		}
    if(user === null){
      res.send("user not found")
    }
    else{
		    res.json(user);
    }
	});
});

router.post('/user', (req, res) => {
	var user = req.body;
	console.log(req);
	Users.addUser(user, (err, user) => {
		if(err){
			throw err;
		}
		res.json(user);
	});
});

router.put('/user/:_id', (req, res) => {
	var id = req.params._id;
	var user = req.body;
	console.log(id);
	console.log(user);
	Users.updateUser(id,user, {}, (err, user) => {
		if(err){
			throw err;
		}
		//this return before update
		res.json(user);
	});
});

router.delete('/user/:_id', (req, res) => {
	var id = req.params._id;
	Users.removeUser(id, (err, user) => {
		if(err){
			throw err;
		}
		res.json(user);
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
