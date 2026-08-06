import { User } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  username?: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_creator?: boolean;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;

  [key: string]: any;
}

export interface AuthState {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  hydrating: boolean;

  hydrateAuth: () => Promise<void>;
  clearAuth: () => void;
  logout: () => Promise<void>;
  listenToAuthChanges: () => ReturnType<
    typeof import("@supabase/supabase-js").createClient
  > extends infer T
    ? any
    : any;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface SignUpData {
  userId: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AppUser | null;
  token?: string | null;
}

export interface SessionUser {
  sessionUser: User | null;
  profile: AppUser | null;
}