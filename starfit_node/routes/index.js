var express = require('express');
var router = express.Router();

/* GET home page. */

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        //if login go home
        res.send(req.session.user);
    } else {
        next();
    }
};

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Index/login', style: 'login' });
  // res.render('view', { title: 'Index/Login', layout: 'login' });
});

//signup
// router.post('/signup', function (req, res) => {
//     //add new user to db
//     // User.create({
//     //     username: req.body.username,
//     //     email: req.body.email,
//     //     password: req.body.password
//     // })
//     .then(user => {
//         req.session.user = user.dataValues;
//         res.redirect('/');
//     })
//     .catch(error => {
//         res.status(500).send({ error: 'something blew up during signup' });
//         console.log("signup error");
//     });
// });

//login
router.post('/login', function (req, res){
    var username = req.body.username,
        password = req.body.password;
    //find one in db
    User.findOne({ where: { username: username } }).then(function (user) {
        if (!user) {
            console.log("user not found");
            //user not found
            res.send("user not found");
        } else if (!user.validPassword(password)) {
            console.log("wrong pw");
            //wrong pw
            res.send("wrong pw");
        } else {
            //login sucssessful
            req.session.user = user.dataValues;
            res.redirect('/');
        }
    });
});

router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
