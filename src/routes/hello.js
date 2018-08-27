const express = require('express');
const controller = require('../controllers/hello');

const router = express.Router({});

router.get('/', controller.sayHello);

module.exports = router;
