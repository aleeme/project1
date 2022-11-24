var express = require('express')
var router = express.Router();
var auth = require('../lib/auth');

router.get('/', function (req, res) {
    if (auth.isOwner(req, res)) {
        res.render('forums', { userId: req.user.user_id });
    }
    else {
        res.render('forums');
    }
});

module.exports = router;