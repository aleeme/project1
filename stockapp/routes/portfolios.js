var express = require('express')
var router = express.Router();
var auth = require('../lib/auth');
var watchListController = require('../controllers/watchListController');

router.get('/', function(req, res) {
    if (auth.isOwner(req, res)) {
        watchListController.FindAllWatchList(req.user.id, 1, function(watchlist) {
            res.render('portfolios', { userId: req.user.user_id, watchlist: watchlist });
        });
    } else {
        res.redirect('/auth/loginRequired');
    }
});

router.get('/:item_code/delete_from_watchlist', function(req, res) {
    if (auth.isOwner(req, res)) {
        watchListController.DeleteFromWatchList(req.user.id, req.params.item_code, 1, function() {
            res.redirect('/portfolios');
        });
    }
});

module.exports = router;