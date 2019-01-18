const express = require('express');

const controller = require('../controllers/account');

const {AccessControl} = require('../interceptors');

const router = express.Router({});

router.use(AccessControl());

router.post('/reset', controller.updatePassword);

router.get('/', controller.get);

module.exports = router;
