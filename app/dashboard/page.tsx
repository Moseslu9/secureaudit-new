"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-cyan-500">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
            Sign Out
          </Button>
        </div>
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">
            Welcome back, <span className="text-cyan-400">{user?.email}</span>!
          </h2>
          <p className="text-gray-300 text-lg">
            Your SecureAudit dashboard is ready.
          </p>
          <p className="text-gray-400 mt-4">
            Next: Upload your policies and let AI find compliance gaps.
          </p>
        </div>
      </div>
    </div>
  );
}