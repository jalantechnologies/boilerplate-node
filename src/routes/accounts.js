const express = require('express');

const controller = require('../controllers/accounts');

const router = express.Router({});

router.post('/register', controller.accountsReg);

router.post('/login', controller.accountsLogin);

module.exports = router;
