var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('trainer', {
    title: 'Starfit : Trainer',
    style: 'style'
  });
});

router.get('/addservice', function(req, res, next) {
  res.render('add_service', {
    title: 'Starfit : Add Service',
    style: 'style'
  });
});

router.get('/myservice', function(req, res, next) {
  res.render('my_services', {
    title: 'Starfit : My Services',
    style: 'style'
  });
});

module.exports = router;
