var express = require('express');
var router = express.Router();
var db = require("../config/DB");

router.get('/login', function (req, res) {
    let fmsg = req.flash()
    let msg = ''

    if (fmsg.login) {
        msg = fmsg.login
    }

    res.render('auth', { feedback: msg });
});

router.get('/register', function (req, res) {
    let fmsg = req.flash()
    let msg = ''

    if (fmsg.register) {
        msg = fmsg.register
    }

    res.render('register', { feedback: msg });
});

var addUser = function(userId, email, username, age, password, cb)
{
    var sql = "INSERT INTO users (user_id, user_pw, user_email, user_name, user_age, user_auth, reg_date) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);";
    db.query(sql, [userId, password, email, username, age, 1], function (err, result) {
        if (err) throw err;
        console.log("회원가입 성공");
        cb(err);
    })
}

router.post('/register_process', function (req, res, next) {
    var post = req.body;
    var userId = post.userId;
    var email = post.email;
    var username = post.uname;
    var age = post.age;
    var pwd = post.psw;
    var pwdr = post.pswr;
    if (pwd != pwdr)
    {
        req.flash('register', 'Password must be same!');
        req.session.save(function () {
            res.redirect('/auth/register');
        });
    }
    else
    {
        var user = { user_id: userId, user_email: email, user_pw: pwd};
        addUser(userId, email, username, age, pwd, function() {
            req.login(user, function (err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        });
    }
});

router.get('/logout', function (req, res) {
    // session이 삭제 된다. cb : session에 대한 삭제가 끝난 다음 호출
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;