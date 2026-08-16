import express from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  registerDevice,
} from "../../services/devices/devices.service.js";

const router = express.Router();

router.post(
  "/register",
  requireAuth,
  async (req, res) => {
    try {
      const {
        pushToken,
        platform,
        deviceName,
      } = req.body;

      console.log(
        "[DEVICES ROUTE] REGISTER REQUEST",
        {
          userId: req.user.id,
          pushToken,
          platform,
          deviceName,
        }
      );

      const device =
        await registerDevice({
          userId: req.user.id,
          pushToken,
          platform,
          deviceName,
        });

      return res.status(201).json({
        device,
      });
    } catch (error) {
      console.error(
        "[DEVICES ROUTE] REGISTER ERROR",
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          "Failed to register device",
      });
    }
  }
);

export default router;