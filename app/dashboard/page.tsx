"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ComplianceReport } from "@/components/ComplianceReport";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [region, setRegion] = useState("global");
  const maxFreeUploads = 3;

  useEffect(() => {
    const getUserAndFiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      await fetchFiles(user.id);
    };
    getUserAndFiles();
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (files.length >= maxFreeUploads) {
      alert(`Free plan limit reached: ${maxFreeUploads} uploads. Upgrade to Pro for unlimited!`);
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("policies")
      .upload(`${user.id}/${fileName}`, file);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      const optimisticFile = { name: fileName, created_at: new Date().toISOString() };
      setFiles([optimisticFile, ...files]);
      analyzeFile(file);
    }
    setUploading(false);
  };

    const analyzeFile = async (file: File) => {
   let text = await file.text();

  // Clean the text for accurate character count
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  if (cleanedText.length > 20000) {
    setAnalysis(
      "Your document is too long for analysis (over 20,000 characters after cleaning).\n\n" +
      "Please upload a shorter policy or split it into sections.\n\n" +
      "Pro users can analyze longer documents — upgrade for unlimited access."
    );
    return;
  }

    setAnalysis("Analyzing your policy with AI...");

    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            {
              role: "system",
              content: `You are a compliance expert specializing in data protection and cybersecurity for African businesses.
Analyze the uploaded policy document and provide:
1. Overall compliance score (0-100)
2. Key strengths
3. Critical gaps (especially for Uganda DPPA, Kenya DPA, Nigeria NDPR, South Africa POPIA, or global standards)
4. Recommendations
Keep response concise and professional.`
            },
            {
              role: "user",
              content: `Region: ${region === "global" ? "Global (SOC 2/ISO)" : region.toUpperCase()}\n\nDocument text:\n${text.substring(0, 18000)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error("AI analysis failed");
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setAnalysis(aiResponse);
    } catch (err) {
      setAnalysis("AI analysis temporarily unavailable. Please try again later.");
      console.error(err);
    }
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
      setFiles(files.filter(f => f.name !== fileName));
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
              Free plan: <span className="font-bold text-cyan-400">{remainingUploads}</span> uploads remaining (max 3)
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
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-cyan-400">Compliance Gap Analysis</h3>
              <PDFDownloadLink
                document={<ComplianceReport analysis={analysis} email={user.email} region={region} />}
                fileName="SecureAudit-Compliance-Report.pdf"
              >
                {({ loading }) => (
                  <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-gray-900">
                    {loading ? "Generating..." : "Export PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
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