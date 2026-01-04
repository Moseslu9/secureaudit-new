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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        fetchFiles();
      }
    });
  }, [router]);

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from("policies").list(user?.id);
    setFiles(data || []);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("policies")
      .upload(`${user.id}/${fileName}`, file);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      fetchFiles();
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-cyan-500">SecureAudit Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline" className="border-red-500 text-red-500">
            Sign Out
          </Button>
        </div>

        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Welcome back, <span className="text-cyan-400">{user.email}</span>
          </h2>
          <div className="mt-6">
            <label className="block">
              <span className="text-white mb-2 block">Upload Policy Document</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-gray-900 hover:file:bg-cyan-600"
              />
            </label>
            {uploading && <p className="text-cyan-400 mt-4">Uploading...</p>}
          </div>
        </Card>

        {analysis && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h3 className="text-xl font-bold mb-4">Compliance Gap Analysis</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
          </Card>
        )}

        {files.length > 0 && (
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h3 className="text-xl font-bold mb-4">Uploaded Files</h3>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.name} className="text-gray-300">
                  {file.name}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}