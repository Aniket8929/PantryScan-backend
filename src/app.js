import express from "express";
import authRoutes from "./routes/auth.router.js";
import mealRouter from "./routes/meal.router.js";
import cookieParser from "cookie-parser";
import authMiddleware from "./middleware/authmiddleware.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/meal", authMiddleware, mealRouter);

app.get("/", (req, res) => {
  res.json({
    status: "Server is healthy",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
