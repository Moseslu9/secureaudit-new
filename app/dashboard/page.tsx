"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [uploadCount, setUploadCount] = useState<number>(0); // Permanent count
  const [region, setRegion] = useState("global");
  const maxFreeUploads = 3;

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      await Promise.all([
        fetchFiles(user.id),
        fetchPermanentCount(user.id)
      ]);
    };
    loadData();
  }, [router]);

  const fetchFiles = async (userId: string) => {
    const { data, error } = await supabase.storage
      .from("policies")
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } else {
      setFiles(data || []);
    }
  };

  const fetchPermanentCount = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_upload_count")
      .select("count")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching count:", error);
      setUploadCount(0);
      return;
    }

    if (data) {
      setUploadCount(data.count);
    } else {
      // Create row for new user
      await supabase.from("user_upload_count").insert({ user_id: userId, count: 0 });
      setUploadCount(0);
    }
  };

  const incrementPermanentCount = async () => {
    const newCount = uploadCount + 1;
    const { error } = await supabase
      .from("user_upload_count")
      .upsert({ user_id: user!.id, count: newCount }, { onConflict: "user_id" });

    if (!error) {
      setUploadCount(newCount);
    }
  };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check current count before attempting upload
    if (files.length >= maxFreeUploads) {
      alert(`Free plan limit reached: ${maxFreeUploads} uploads. Upgrade to Pro for unlimited!`);
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `${Date.now()}.${fileExt}`;

    // Optimistic update: add placeholder file immediately
    const optimisticFile = {
      name: fileName,
      created_at: new Date().toISOString(),
      isOptimistic: true, // just for identification if needed
    };
    setFiles(prev => [optimisticFile, ...prev]);

    try {
      const { error } = await supabase.storage
        .from("policies")
        .upload(`${user.id}/${fileName}`, file);

      if (error) {
        alert("Upload failed: " + error.message);
        // Rollback optimistic update
        setFiles(prev => prev.filter(f => f.name !== fileName));
      } else {
        // Upload succeeded → keep optimistic file and refetch real list
        analyzeFile(file);
        // Refetch to get accurate server state (including size, etc.)
        await fetchFiles(user.id);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error occurred");
      // Rollback on any unexpected error
      setFiles(prev => prev.filter(f => f.name !== fileName));
    } finally {
      setUploading(false);
    }
  };

  const analyzeFile = async (file: File) => {
    const text = await file.text();
    const lowerText = text.toLowerCase();

    const generalChecks = [
      { term: "access control", found: lowerText.includes("access control") },
      { term: "encryption", found: lowerText.includes("encryption") },
      { term: "incident response", found: lowerText.includes("incident response") },
      { term: "risk assessment", found: lowerText.includes("risk assessment") },
      { term: "employee training", found: lowerText.includes("training") || lowerText.includes("awareness") },
    ];

    let specificChecks = [];
    if (region === "uganda") {
      specificChecks = [
        { term: "data minimization", found: lowerText.includes("data minimization") },
        { term: "breach notification", found: lowerText.includes("breach notification") },
        { term: "consent", found: lowerText.includes("consent") },
      ];
    } else if (region === "kenya") {
      specificChecks = [
        { term: "data impact assessment", found: lowerText.includes("data impact assessment") },
        { term: "lawful processing", found: lowerText.includes("lawful processing") },
      ];
    } else if (region === "nigeria") {
      specificChecks = [
        { term: "consent management", found: lowerText.includes("consent management") },
        { term: "data localization", found: lowerText.includes("data localization") },
      ];
    } else if (region === "south-africa") {
      specificChecks = [
        { term: "cross-border transfers", found: lowerText.includes("cross-border transfers") },
        { term: "information officer", found: lowerText.includes("information officer") },
      ];
    } else if (region === "africa-general") {
      specificChecks = [
        { term: "cybersecurity framework", found: lowerText.includes("cybersecurity") },
        { term: "personal data protection", found: lowerText.includes("personal data protection") },
      ];
    } else {
      specificChecks = generalChecks;
    }

    const generalMissing = generalChecks.filter(c => !c.found).map(c => c.term);
    const generalFound = generalChecks.filter(c => c.found).map(c => c.term);

    const specificMissing = specificChecks.filter(c => !c.found).map(c => c.term);
    const specificFound = specificChecks.filter(c => c.found).map(c => c.term);

    setAnalysis(`
      General Controls (SOC 2/ISO):
      Found: ${generalFound.length > 0 ? generalFound.join(", ") : "None"}
      Missing: ${generalMissing.length > 0 ? generalMissing.join(", ") : "None found!"}

      ${region === "global" ? "Global" : region.charAt(0).toUpperCase() + region.slice(1)} Specific Controls:
      Found: ${specificFound.length > 0 ? specificFound.join(", ") : "None"}
      Missing: ${specificMissing.length > 0 ? specificMissing.join(", ") : "None found!"}
    `);
  };

  const downloadFile = async (fileName: string) => {
    const { data, error } = await supabase.storage
      .from("policies")
      .download(`${user?.id}/${fileName}`);

    if (error) {
      alert("Download failed: " + error.message);
    } else if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!confirm("Delete this file?")) return;

    const { error } = await supabase.storage
      .from("policies")
      .remove([`${user?.id}/${fileName}`]);

    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      await fetchFiles(user!.id);
      // Count does NOT decrease — lifetime limit stays
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return null;

  const remainingUploads = maxFreeUploads - uploadCount;

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-cyan-500">SecureAudit Dashboard</h1>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Sign Out
          </Button>
        </div>

        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Welcome back, <span className="text-cyan-400">{user.email}</span>
          </h2>

          <div className="mt-6">
            <p className="text-lg text-gray-300 mb-4">
              Free plan: <span className="font-bold text-cyan-400">{remainingUploads}</span> uploads remaining (lifetime max 3)
            </p>

            <label className="block mb-4">
              <span className="text-white mb-2 block text-lg">Select Region for Analysis</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="block w-full bg-gray-700 border-gray-600 p-3 rounded-lg text-white"
              >
                <option value="global">Global (SOC 2/ISO)</option>
                <option value="uganda">Uganda (DPPA)</option>
                <option value="kenya">Kenya (DPA)</option>
                <option value="nigeria">Nigeria (NDPR)</option>
                <option value="south-africa">South Africa (POPIA)</option>
                <option value="africa-general">Africa General (Malabo Convention)</option>
              </select>
            </label>

            <label className="block">
              <span className="text-white mb-2 block text-lg">Upload Policy Document</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleUpload}
                disabled={uploading || remainingUploads <= 0}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-gray-900 hover:file:bg-cyan-600 disabled:opacity-50"
              />
            </label>
            {uploading && <p className="text-cyan-400 mt-4 text-lg">Uploading and analyzing...</p>}
          </div>
        </Card>

        {remainingUploads <= 0 && (
  <Card className="p-8 bg-gradient-to-r from-cyan-900 to-blue-900 border-cyan-500 border-2 mb-8">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-4">
        You've reached your free plan limit (3 uploads)
      </h3>
      <p className="text-cyan-200 mb-6">
        Upgrade to Pro for unlimited uploads, advanced AI analysis, and exportable reports.
      </p>
      <Button asChild size="lg" className="bg-white text-cyan-900 hover:bg-gray-100 font-bold">
        <Link href="/pricing">Upgrade to Pro — $49/month</Link>
      </Button>
    </div>
  </Card>
)}

        {analysis && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">Compliance Gap Analysis</h3>
            <p className="text-gray-300 text-lg whitespace-pre-wrap leading-relaxed">{analysis}</p>
          </Card>
        )}

        {files.length > 0 && (
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">Upload History</h3>
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between bg-gray-900 p-4 rounded-lg border border-gray-700"
                >
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-500 text-sm">
                      Uploaded {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => downloadFile(file.name)}
                      variant="outline"
                      className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-gray-900"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() => deleteFile(file.name)}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}