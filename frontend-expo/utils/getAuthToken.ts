import { supabase } from "../lib/supabase";

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.log("[AUTH TOKEN]", error.message);
      return null;
    }

    return session?.access_token ?? null;
  } catch (error) {
    console.log("[AUTH TOKEN ERROR]", error);
    return null;
  }
};

export default getAuthToken;