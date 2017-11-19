var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var images = require('../models/images');

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
router.get('/:id', function(req, res) {

  //calling the function from index.js class using routes object..
  images.getImageById(req.params.id, function(err, images) {
    if (err) {
      throw err;
    }
    // res.download(images.path);
    // res.download(images.path);
    // console.log(__dirname + "/../" + images.path);
    res.sendFile(path.resolve(__dirname +"/../" + images.path));

  });
});

router.get('/user/:id', function(req, res) {

  //calling the function from index.js class using routes object..
  images.getImageByE(req.params.id, function(err, images) {
    if (err) {
      throw err;
    }
    // res.download(images.path);
    // res.download(images.path);
    console.log(__dirname + "/../" + images.path);
    res.sendFile(path.resolve(__dirname +"/../" + images.path));

  });
});

router.post('/', upload.any(), function(req, res, next) {
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
