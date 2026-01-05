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
  const maxFreeUploads = 3;

  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      await loadEverything(user.id);
    };
    getUserAndData();
  }, [router]);

  const loadEverything = async (userId: string) => {
    await Promise.all([
      fetchFiles(userId),
      fetchUploadCount(userId)
    ]);
  };

  const fetchFiles = async (userId: string) => {
    const { data, error } = await supabase.storage
      .from("policies")
      .list(userId);

    if (error) {
      console.error("Error fetching files:", error);
    } else {
      setFiles(data || []);
    }
  };

  const fetchUploadCount = async (userId: string) => {
    const { count, error } = await supabase
      .from("user_upload_count")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error counting uploads:", error);
      return;
    }

    const currentCount = count || 0;
    if (currentCount === 0) {
      // Create row if not exists
      await supabase.from("user_upload_count").insert({ user_id: userId });
    }
    setUploadCount(currentCount);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const currentCount = files.length;
    if (currentCount >= maxFreeUploads) {
      alert(`Free plan limit reached: ${maxFreeUploads} uploads. Upgrade to Pro for unlimited!`);
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("policies")
      .upload(`${user.id}/${fileName}`, file);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      // Optimistically update
      setFiles(prev => [ { name: fileName, created_at: new Date().toISOString() }, ...prev ]);
      setUploadCount(prev => prev + 1);
      analyzeFile(file);
    }
    setUploading(false);
  };

  const analyzeFile = async (file: File) => {
    const text = await file.text();
    const lowerText = text.toLowerCase();

    const checks = [
      { term: "access control", found: lowerText.includes("access control") },
      { term: "encryption", found: lowerText.includes("encryption") },
      { term: "incident response", found: lowerText.includes("incident response") },
      { term: "risk assessment", found: lowerText.includes("risk assessment") },
      { term: "employee training", found: lowerText.includes("training") || lowerText.includes("awareness") },
    ];

    const missing = checks.filter(c => !c.found).map(c => c.term);
    const found = checks.filter(c => c.found).map(c => c.term);

    setAnalysis(`
      Found controls: ${found.length > 0 ? found.join(", ") : "None"}
      Missing key controls: ${missing.length > 0 ? missing.join(", ") : "None found!"}
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
      setFiles(prev => prev.filter(f => f.name !== fileName));
      setUploadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return null;

  const remainingUploads = maxFreeUploads - files.length;

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-cyan-500">SecureAudit Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
            Sign Out
          </Button>
        </div>

        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Welcome back, <span className="text-cyan-400">{user.email}</span>
          </h2>

          <div className="mt-6">
            <p className="text-lg text-gray-300 mb-4">
              Free plan: <span className="font-bold text-cyan-400">{remainingUploads}</span> uploads remaining (max 3)
            </p>

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
                <div key={file.name} className="flex items-center justify-between bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-500 text-sm">Uploaded {new Date(file.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => downloadFile(file.name)} variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-gray-900">
                      Download
                    </Button>
                    <Button onClick={() => deleteFile(file.name)} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
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