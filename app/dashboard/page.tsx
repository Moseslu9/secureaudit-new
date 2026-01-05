// ... same imports ...

export default function Dashboard() {
  // ... same state ...

  const checkUploadLimit = async () => {
    const { count, error } = await supabase
      .from("user_uploads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) return false;
    return (count || 0) < 3; // Free tier: max 3 uploads
  };

  const recordUpload = async () => {
    await supabase.from("user_uploads").insert({
      user_id: user.id,
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const canUpload = await checkUploadLimit();
    if (!canUpload) {
      alert("Free plan limit reached: Maximum 3 uploads. Upgrade to Pro for unlimited!");
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
      await recordUpload();
      fetchFiles();
      analyzeFile(file);
    }
    setUploading(false);
  };

  // ... rest of the component stays the same ...
}