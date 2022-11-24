const express = require('express');
const router = express.Router();

var UserController = require("../controllers/userController");

router.get('/', UserController.findAll);
router.get('/user_info/:user_id', UserController.findById);

module.exports = router;