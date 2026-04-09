import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("No auth header");
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    console.log("Invalid token");
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = data.user.id;

  console.log("Authenticated user:", userId);

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

  req.user = data.user;
  req.dbUser = dbUser;

  next();
}