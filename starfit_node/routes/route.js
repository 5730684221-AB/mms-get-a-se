var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    res.locals.message = {
        error: req.flash('error'),
        success: req.flash('success')
    }
    if (req.session.user) {
        var fullname = req.session.user.fname + " " + req.session.user.lname;
        req.session.user.name = fullname;
    }
    res.locals.account = req.session.user;
    next();
});

module.exports = router
