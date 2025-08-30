import express from "express";
import "dotenv";
import { getWeather } from "./qweather-api.js";
import { adaptWeather } from "./adapter.js";

const app = express();
const port = 3456;

app.get("/", async (req, res) => {
  try {
    // 1. 调用上层 API
    const src = await getWeather();

    // 2. 适配为下层结构
    const adapted = await adaptWeather(src);

    // 3. 返回 JSON
    res.json(adapted);
  } catch (err) {
    console.error("Weather API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Weather API Server Running at http://localhost:${port}`);
});
