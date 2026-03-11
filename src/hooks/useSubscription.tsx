import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  activated_at: string;
  expires_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const [subResult, roleResult] = await Promise.all([
        supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle(),
      ]);

      if (subResult.data) {
        setSubscription(subResult.data as Subscription);
      }
      setIsAdmin(!!roleResult.data);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const isPro = !!subscription && subscription.status === "active" && new Date(subscription.expires_at) > new Date();

  return { subscription, isPro, isAdmin, loading };
}
