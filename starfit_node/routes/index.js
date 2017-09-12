var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Index/login', style: 'login' });
  // res.render('view', { title: 'Index/Login', layout: 'login' });
});

module.exports = router;
