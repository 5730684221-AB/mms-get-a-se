var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var images = require('../models/images');

// storage img
var storageimg = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads/img')
  },
  filename: function(req, file, cb) {
    cb(null, 'im'+Date.now()+'_'+file.originalname);
  }
});
// storage profiles
var storagepro = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads/profiles')
  },
  filename: function(req, file, cb) {
    cb(null, 'pr'+Date.now()+'_'+file.originalname);
  }
});
// storage services
var storageser = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads/services')
  },
  filename: function(req, file, cb) {
    cb(null, 'sv'+Date.now()+'_'+file.originalname);
  }
});

//get img listing
router.get('/', function(req, res) {
  images.getImages(function(err, images) {
    if (err) {
      throw err;
    }
    res.json(images);
  });
});

//get img by image id
router.get('/:_id', function(req, res) {
  var id;
	//solve ObjectId casting problem
	if(mongoose.Types.ObjectId.isValid(req.params._id)) {
		var id = req.params._id;
	}
	else{
		var id = null;
	}
  //calling the function from index.js class using routes object..
  images.getImageById(id, function(err, images) {
    if (err) {
      throw err;
    }
    if(images === null){
      res.send("your image don't exist")
    } else{
      // res.download(images.path);
      // res.download(images.path);
      console.log(__dirname + "/../" + images.path);
      res.sendFile(path.resolve(__dirname +"/../" + images.path));
    }
  });
});


//get profile by user _id
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

//upload profile by user _id
router.post('/user/:_id', multer({storage : storagepro}).any(), function(req, res, next) {
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

//upload img
router.post('/', multer({storage : storageimg}).any(), function(req, res, next) {
  console.log(req.files)


  /*req.files has the information regarding the file you are uploading...
  from the total information, i am just using the path and the imageName to store in the mongo collection(table)
  */

  var id = req.body;
  var path = req.files[0].path;
  var imageName = req.files[0].originalname;

  var imagepath = {};
  imagepath['path'] = path;
  imagepath['originalname'] = imageName;

  //imagepath contains two objects, path and the imageName

  //we are passing two objects in the addImage method.. which is defined above..
  images.addImage(imagepath, function(err, pic) {
    res.send(pic.id);

  });

});

module.exports = router;
