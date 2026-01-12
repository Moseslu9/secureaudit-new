export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-12 text-center">
          Refund Policy
        </h1>

        <p className="text-lg mb-8">
          Last updated: January 12, 2026
        </p>

        <p className="mb-6">
          SecureAudit offers subscriptions on a monthly basis. Due to the digital and instant nature of our service (AI analysis, PDF reports, unlimited uploads on Pro), all payments are non-refundable except in the following cases:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Within 7 days of initial purchase if you have not used the service (no analysis performed)</li>
          <li>If there is a technical failure preventing access to the service (subject to investigation)</li>
        </ul>

        <p className="mb-6">
          To request a refund, contact us at [your-email@example.com] with your order details. Refunds are processed within 14 business days.
        </p>

        <p className="mb-6">
          We reserve the right to refuse refunds in cases of abuse or violation of our Terms of Service.
        </p>
      </div>
    </div>
  );
}