import { Router } from "express";
import { GenerateMeal, Productinfo } from "../controllers/meal.controller.js";
const router = Router();

router.get("/meals", (req, res) => {
  res.send("Get all meals");
});

router.post("/generate-meal", GenerateMeal);
router.post("/scan-product", Productinfo);

export default router;
