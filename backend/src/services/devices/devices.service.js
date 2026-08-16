import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

export async function registerDevice({
  userId,
  pushToken,
  platform,
  deviceName = null,
}) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!pushToken) {
    throw new Error("Push token is required");
  }

  if (!platform) {
    throw new Error("Platform is required");
  }

  console.log(
    "[DEVICES] Registering device",
    {
      userId,
      pushToken,
      platform,
      deviceName,
    }
  );

  const { data, error } =
    await supabaseAdmin
      .from("user_devices")
      .upsert(
        {
          user_id: userId,
          push_token: pushToken,
          platform,
          device_name: deviceName,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "push_token",
        }
      )
      .select()
      .single();

  if (error) {
    console.error(
      "[DEVICES] REGISTER ERROR",
      error
    );

    throw error;
  }

  console.log(
    "[DEVICES] DEVICE REGISTERED",
    data
  );

  return data;
}