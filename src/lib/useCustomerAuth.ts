"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { saveCustomerName } from "./customerStorage";
import type { User } from "@supabase/supabase-js";

export type CustomerProfile = {
    id: string;
    user_id: string;
    name: string;
    email: string | null;
};

export function useCustomerAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user);
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user);
            else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(authUser: User) {
        const { data } = await supabase
            .from("customer_profiles")
            .select("*")
            .eq("user_id", authUser.id)
            .single();

        if (!data) {
            // Erstes Login — Profil anlegen
            const pendingName = localStorage.getItem("cutnow_pending_name") || "";
            const name = pendingName || authUser.email?.split("@")[0] || "Gast";
            const { data: created } = await supabase
                .from("customer_profiles")
                .insert({ user_id: authUser.id, name, email: authUser.email ?? null })
                .select()
                .single();
            if (created) {
                setProfile(created as CustomerProfile);
                saveCustomerName(name);
                localStorage.removeItem("cutnow_pending_name");
            }
        } else {
            setProfile(data as CustomerProfile);
            saveCustomerName(data.name);
        }
        setLoading(false);
    }

    async function updateName(name: string) {
        if (!user) return;
        const { data } = await supabase
            .from("customer_profiles")
            .update({ name })
            .eq("user_id", user.id)
            .select()
            .single();
        if (data) setProfile(data as CustomerProfile);
    }

    async function signOut() {
        await supabase.auth.signOut();
    }

    return { user, profile, loading, updateName, signOut };
}
