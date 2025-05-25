const express = require('express');
const router = express.Router();
const { identifyContact } = require('../controllers/identifyController');
// we use post api to upload the user in the db
router.post('/identify', identifyContact);

module.exports = router;
