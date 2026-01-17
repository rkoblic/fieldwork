const express = require('express');
const router = express.Router();

// Main SPA shell
router.get('/', (req, res) => {
  res.render('index');
});

module.exports = router;
