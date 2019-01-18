const express = require('express');

const controller = require('../controllers/accounts');

const router = express.Router({});

router.post('/register', controller.accountsReg);

router.post('/login', controller.accountsLogin);

router.post('/reset', controller.reset);

router.get('/reset', controller.validateResetRequest);

module.exports = router;
