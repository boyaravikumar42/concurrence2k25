const express = require("express");
const { getRankedUsers } = require("../controllers/rankingController");

const router = express.Router();

router.get("/rankings", getRankedUsers);

module.exports = router;
