var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var mongoose = require('mongoose');
var request = require('request');

var images = require('../models/images');
var Users = require('../models/users');

//multer
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({
  storage: storage
});

//-----------------------------------------------
router.get('/', function(req, res) {
  //calling the function from index.js class using routes object..
  images.getImages(function(err, images) {
    if (err) {
      throw err;

    }
    res.json(images);

  });
});

// URL : http://localhost:3000/images/(give you collectionID)
// To get the single image/File using id from the MongoDB
router.get('/_:id', function(req, res) {

  //calling the function from index.js class using routes object..
  images.getImageById(req.params._id, function(err, images) {
    if (err) {
      throw err;
    }
    // res.download(images.path);
    // res.download(images.path);
    // console.log(__dirname + "/../" + images.path);
    res.sendFile(path.resolve(__dirname +"/../" + images.path));

  });
});

router.get('/user/:_id', function(req, res) {
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
      var imgid = user.img;
      console.log(user);
      images.getImageById(imgid, function(err, images) {
        if (err) {
          throw err;
        }
        // res.download(images.path);
        // res.download(images.path);
        console.log(__dirname + "/../" + images.path);
        res.sendFile(path.resolve(__dirname +"/../" + images.path));
      });
    }
	});
});

router.post('/user/:_id', upload.any(), function(req, res, next) {
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
    else{ //found user
      console.log(req.files);
      console.log(user._id);
      var path = req.files[0].path;
      var imageName = req.files[0].originalname;
      var imagepath = {};

      imagepath['path'] = path;
      imagepath['originalname'] = imageName;

      images.addImage(imagepath, function(err, pic) { //add picture
        var imgid = pic._id;
        user = {
          img : imgid
        };
        Users.updateUser(id, user, null, (err, user) => {
          console.log("update img");
          if(err){
            console.log(err);
          }
          Users.getUserById(req.params._id, (err, user) => {
            if(err){
              console.log(err);
            }
            res.send(user);
          });
        });
      });
    }
	});
});

router.post('/', upload.any(), function(req, res, next) {
  console.log(req.files)

  /*req.files has the information regarding the file you are uploading...
  from the total information, i am just using the path and the imageName to store in the mongo collection(table)
  */

  var path = req.files[0].path;
  var imageName = req.files[0].originalname;

  var imagepath = {};
  imagepath['path'] = path;
  imagepath['originalname'] = imageName;

  //imagepath contains two objects, path and the imageName

  //we are passing two objects in the addImage method.. which is defined above..
  images.addImage(imagepath, function(err, pic) {
    res.send(pic);

  });

});

module.exports = router;
