var db = require("../config/DB");

exports.findAll = (cb) => {
    db.query("Select * from users", (err, users, fields) => {
        if(err) throw err;
        cb(users);
    });
}

exports.findById = (id, cb) => {
    db.query("Select user_name, user_age, user_email, date_format(reg_date, '%Y.%m.%d') reg_date from users where user_id = ?", id, (err, user) => {
        if(err) throw err;
        cb(user);
    });
}