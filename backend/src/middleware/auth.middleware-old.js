import jwt from "jsonwebtoken";
import { supabase } from "../services/supabase.service.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("No auth header");
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  let userPayload;

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      console.log("Supabase token invalid");
      return res.status(401).json({ error: "Invalid token" });
    }
    userPayload = { id: data.user.id, email: data.user.email };
    console.log("Supabase JWT verified", userPayload);
  } catch (supErr) {
    console.log("Supabase verification failed", supErr);
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = userPayload.userId || userPayload.id;

  try {
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("is_adult")
      .eq("id", userId)
      .single();

    if (dbError || !dbUser) {
      console.log("User not found in DB");
      return res.status(401).json({ error: "User not found" });
    }

    if (!dbUser.is_adult) {
      console.log("User not verified as adult → blocking request");
      return res.status(403).json({ error: "AGE_VERIFICATION_REQUIRED" });
    }

    req.user = userPayload;
    req.dbUser = dbUser;
    console.log("Authenticated user passed middleware", userId);

    next();
  } catch (err) {
    console.log("DB error in requireAuth", err);
    res.status(500).json({ error: "Server error" });
  }
}
