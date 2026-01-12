export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-12 text-center">
          Privacy Policy
        </h1>

        <p className="text-lg mb-8">
          Last updated: January 12, 2026
        </p>

        <p className="mb-6">
          SecureAudit ("we", "us", or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
        </p>

        <h2 className="text-2xl font-bold text-cyan-300 mt-10 mb-4">1. Information We Collect</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Personal information: name, email, phone number (provided during sign-up)</li>
          <li>Uploaded documents: policy files you upload for analysis (stored securely in your private folder)</li>
          <li>Usage data: IP address, browser type, pages visited, timestamps</li>
          <li>Payment information: handled securely by our payment processor (Paddle) — we do not store card details</li>
        </ul>

        <h2 className="text-2xl font-bold text-cyan-300 mt-10 mb-4">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>To provide and improve the Service (AI analysis, PDF reports)</li>
          <li>To communicate with you (account updates, support)</li>
          <li>To process payments and subscriptions</li>
          <li>For security, fraud prevention, and legal compliance</li>
        </ul>

        <h2 className="text-2xl font-bold text-cyan-300 mt-10 mb-4">3. Information Sharing</h2>
        <p className="mb-6">
          We do not sell your personal data. We may share information with:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Payment processors (Paddle) for transaction processing</li>
          <li>Cloud providers (Supabase) for secure storage</li>
          <li>Legal authorities if required by law</li>
        </ul>

        <h2 className="text-2xl font-bold text-cyan-300 mt-10 mb-4">4. Data Security</h2>
        <p className="mb-6">
          We use industry-standard security measures to protect your data. Uploaded documents are stored in private user folders and encrypted.
        </p>

        <h2 className="text-2xl font-bold text-cyan-300 mt-10 mb-4">5. Your Rights</h2>
        <p className="mb-6">
          You can request access to, correction of, or deletion of your personal data by contacting us. We will respond in accordance with applicable data protection laws (including Uganda's Data Protection and Privacy Act).
        </p>

        <h2 className="text-2xl font-bold text-cyan-300 mt-10 mb-4">6. Changes to This Policy</h2>
        <p className="mb-6">
          We may update this policy from time to time. We will notify you of material changes via email or on the website.
        </p>

        <h2 className="text-2xl font-bold text-cyan-300 mt-10 mb-4">7. Contact Us</h2>
        <p className="mb-6">
          For questions about this Privacy Policy, contact us at: [your-email@example.com]
        </p>
      </div>
    </div>
  );
}