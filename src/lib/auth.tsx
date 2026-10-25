"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseClient } from "./supabase";

type AuthState = {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Context = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = supabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!client);

  useEffect(() => {
    if (!client) return;
    let active = true;
    client.auth.getUser().then(({ data }) => {
      if (active) { setUser(data.user); setReady(true); }
    }).catch(() => { if (active) setReady(true); });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (active) { setUser(session?.user ?? null); setReady(true); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [client]);

  const signIn = async () => {
    if (!client) throw new Error("Supabase is not configured");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/konto` },
    });
    if (error) throw error;
  };
  const signOut = async () => {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  return <Context.Provider value={{ user, ready, configured: !!client, signIn, signOut }}>{children}</Context.Provider>;
}

export function useAuth(): AuthState {
  const state = useContext(Context);
  if (!state) throw new Error("useAuth must be inside AuthProvider");
  return state;
}
