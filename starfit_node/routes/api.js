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

// router.get('/user/:_id', (req, res) => {
// 	Users.getUserByUid(req.params._id, (err, user) => {
// 		if(err){
// 			throw err;
// 		}
//     if(user === null){
//       res.send("user not found")
//     }
//     else{
// 			var userdata = {
// 				email : user.email,
// 				address : user.address,
// 				fname : user.fname,
// 				lname : user.lname,
// 				reservations : user.reservations
// 			}
// 			res.json(userdata);
//     }
// 	});
// });

//get user by email
router.get('/user/:_id', (req, res) => {
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
				address : user.address,
				fname : user.fname,
				lname : user.lname,
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

/*create new user by email using this field
		address : user.address,
		fname : user.fname,
		lname : user.lname,
		password : user.password
*/
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

/* update user information using this field
		uri : /user/email      ---email is ID
		address : user.address,
		fname : user.fname,
		lname : user.lname,
		password : user.password
*/
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

/* delete user
		uri : /user/email      ---email is ID
*/
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
