var userModel = require('../models/userModel');
var express = require("express");
var auth = require('../lib/auth');

exports.findAll=(req, res) => {
    userModel.findAll((users) => {
        console.log("find all users...");
        res.render('users', {users : users});
    });
}

exports.findById=(req, res) => {
    userModel.findById(req.params.user_id, (user) => {
        console.log("user : ", user);
        if (auth.isOwner(req, res)) {
            res.render('user_info', { userId: req.user.user_id, user: user[0] });
        }
        else {
            res.render('user_info', { user: user[0] });
        }
    });
}