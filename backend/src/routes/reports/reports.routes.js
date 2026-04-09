import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

const AUTO_HIDE_THRESHOLD = 5;  //auto hid video after reports

router.post("/create", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { target_id, type, reason, reason_code } = req.body;
    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        target_id,
        type,
        reason,
        reason_code,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { count } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("target_id", target_id);
    if (count >= AUTO_HIDE_THRESHOLD && type === "post") {
      const { error: hideError } = await supabase
        .from("posts")
        .update({ is_hidden: true })
        .eq("id", target_id);
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;


router.get("/user", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { data, error } = await supabase
      .from("reports")
      .select("target_id")
      .eq("user_id", user.id);

    if (error) {
      return res.status(400).json({ error: "Failed to fetch reports" });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});
