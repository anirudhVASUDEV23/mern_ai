import express from "express";
import * as dotenv from "dotenv";
import { Client } from "@gradio/client";

dotenv.config();

const router = express.Router();
let gradioClient;

// Connect to Stability AI Gradio interface once
(async () => {
  try {
    gradioClient = await Client.connect("stabilityai/stable-diffusion");
    console.log("✅ Gradio client connected");
  } catch (error) {
    console.error("❌ Gradio client connection failed:", error.message);
  }
})();

// Test route
router.route("/").get((req, res) => {
  res.status(200).json({ message: "Hello from Stability AI!" });
});

// Generate images
router.route("/").post(async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("👉 Received prompt:", prompt);

    if (!gradioClient) {
      return res.status(503).json({ error: "Gradio client not ready" });
    }

    const result = await gradioClient.predict("/infer", {
      prompt,
      negative: "", // Optional: provide negative prompt
      scale: 7.5, // Guidance scale
    });

    console.log("✅ Gradio raw result:", result);

    // Unwrap nested data (result.data is [[images]])
    const flatImages = result.data[0];

    const imageUrls = flatImages
      .map((item, index) => {
        if (!item?.image?.url) {
          console.warn(`⚠️ Missing URL in item ${index}:`, item);
          return null;
        }
        return item.image.url;
      })
      .filter(Boolean);

    if (imageUrls.length === 0) {
      throw new Error("No valid image URLs returned");
    }

    res.status(200).json({ photos: imageUrls });
  } catch (err) {
    console.error("❌ Generation error:", err.message);
    res.status(500).json({ error: "Image generation failed" });
  }
});

export default router;
