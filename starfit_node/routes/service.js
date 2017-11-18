var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:_id', function(req, res, next) {
  var service_id = req.params._id;
});

module.exports = router;
