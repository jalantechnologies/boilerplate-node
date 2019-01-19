const express = require('express');

const controller = require('../controllers/profile');
const {AccessControl} = require('../interceptors');

const router = express.Router({});

router.get('/', AccessControl(), controller.get);

router.put('/profile', AccessControl(), controller.updateUser);

module.exports = router;
