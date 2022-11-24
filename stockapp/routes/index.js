var express = require('express');
var router = express.Router();
var auth = require('../lib/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
    if (auth.isOwner(req, res)) {
        res.render('index', { userId: req.user.user_id });
    } else {
        res.render('index');
    }
});

module.exports = router;