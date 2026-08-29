"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function verifier() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/connexion");
        return;
      }
      const { data: profil } = await supabase
        .from("profils")
        .select("id")
        .eq("id", user.id)
        .single();

      router.push(profil ? "/dashboard" : "/onboarding");
    }
    verifier();
  }, [router]);

  return <p style={{ textAlign: "center", marginTop: "2rem" }}>Chargement...</p>;
}
