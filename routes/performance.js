const express = require("express");

const { PostPerformance, GetPerformance, UpdatePerformance, DeletePerformance, GetPerformanceById } = require("../controllers/performance-controller");
const router = express.Router();

router.post("/topperformance",  PostPerformance)
router.get("/topperformance" , GetPerformance)
router.patch("/topperformance/:id" , UpdatePerformance)
router.delete("/topperformance/:id" , DeletePerformance)
router.get("/topperformance/:id" , GetPerformanceById)


module.exports = router;