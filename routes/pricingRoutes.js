const express = require("express");
const router = express.Router();
const pricingController = require("../controllers/pricingController");

router.post("/", pricingController.create);
router.get("/", pricingController.findAll);
router.get("/:id", pricingController.findOne);
router.put("/:id", pricingController.update);
router.delete("/:id", pricingController.delete);

module.exports = router;
