// backend/src/services/r2.service.js
import dotenv from "dotenv";
dotenv.config(); // Ensure env variables are loaded

import { S3Client } from "@aws-sdk/client-s3";

// Create R2 S3 client
export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false // optional, usually works with R2
});
