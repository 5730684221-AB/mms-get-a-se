var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin', {
    title: 'Starfit : Admin',
    style: 'style',
    layout: false
  });
});

router.get('/ban', function(req, res, next) {
    res.render('ban', {
      title: 'Starfit : Admin',
      style: 'style',
      layout: false
    });
  });

module.exports = router;
