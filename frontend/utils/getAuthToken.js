import { supabase } from "./supabaseClient.js";

export const getAuthToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    return null;
  }
  return session.access_token;
};
