import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  console.log("ADMIN reports fetch");

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("ADMIN reports error", error);
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

router.post("/resolve", requireAuth, async (req, res) => {
  const { report_id, resolution } = req.body;

  console.log("ADMIN resolve report", report_id, resolution);

  const { data, error } = await supabase
    .from("reports")
    .update({
      status: "resolved",
      resolution,
      reviewed_at: new Date(),
    })
    .eq("id", report_id)
    .select()
    .single();

  if (error) {
    console.log("ADMIN resolve error", error);
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

router.get("/user", requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const { data, error } = await supabase
      .from("reports")
      .select("target_id")
      .eq("user_id", user.id);

    if (error) {
      console.log("Error fetching user reports", error);
      return res.status(400).json({ error: "Failed to fetch reports" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.log("User reports route crash", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
