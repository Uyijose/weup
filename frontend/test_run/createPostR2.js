import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Use the pre-generated test user token
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN;

// Path to your test video
const VIDEO_PATH = path.resolve(process.cwd(), "frontend/test_run/test-video.mp4");

// Test post metadata
const TEST_CAPTION = "Test upload via backend endpoints";
const TEST_TOPIC = "TestTopic";

async function createPostTest() {
  try {
    console.log("Using test token for authentication...");

    if (!TEST_USER_TOKEN) throw new Error("TEST_USER_TOKEN not found in .env.local");

    console.log("Token acquired:", TEST_USER_TOKEN.slice(0, 20) + "...");

    console.log("Requesting signed URL from backend...");

    // Request signed URL from backend
    const uploadRes = await fetch(`${BACKEND_URL}/api/upload/signed-url`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TEST_USER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Failed to get signed URL: ${errText}`);
    }

    const { uploadUrl, fileKey } = await uploadRes.json();
    console.log("Signed URL received:", fileKey);

    // Upload video to R2
    const fileBuffer = fs.readFileSync(VIDEO_PATH);
    const uploadFileRes = await fetch(uploadUrl, {
      method: "PUT",
      body: fileBuffer,
      headers: {
        "Content-Type": "video/mp4",
      },
    });

    if (!uploadFileRes.ok) {
      throw new Error("Failed to upload video to R2");
    }
    console.log("Video uploaded successfully to R2");

    // Process video on backend
    console.log("Requesting backend to process video...");

    const processRes = await fetch(`${BACKEND_URL}/api/videos/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TEST_USER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileKey,
        caption: TEST_CAPTION,
        topic: TEST_TOPIC,
      }),
    });

    if (!processRes.ok) {
      const errText = await processRes.text();
      throw new Error(`Video processing failed: ${errText}`);
    }

    const result = await processRes.json();
    console.log("Processing finished:", result);

    // Save result to JSON file
    const resultPath = path.resolve(process.cwd(), "frontend/test_run/createPostResult.json");
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log("Result saved to:", resultPath);

  } catch (err) {
    console.error("Test failed:", err);
  }
}

// Run the test
createPostTest();