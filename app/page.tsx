import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Zap, CheckCircle, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-cyan-500" />
              <span className="text-xl font-bold">SecureAudit</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
              <Link href="#features" className="text-gray-300 hover:text-white transition">Features</Link>
              <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold">
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Get Compliance-Ready<br />
            <span className="text-cyan-500">Without the Headache</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            SecureAudit uses AI to scan your policies, tools, and setups — then shows you exactly what’s missing for SOC 2, ISO 27001, and more. Built for startups and small teams who can’t afford $20K+ audits.
          </p>
          <Button size="lg" asChild className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold">
  <Link href="/auth?trial=true">Start Free Trial</Link>
</Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-gray-900 border-gray-700">
              <Zap className="h-12 w-12 text-cyan-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Instant Gap Analysis</h3>
              <p className="text-gray-400">Upload your policies and connect your tools. AI finds missing controls in minutes.</p>
            </Card>
            <Card className="p-8 bg-gray-900 border-gray-700">
              <CheckCircle className="h-12 w-12 text-cyan-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Step-by-Step Fixes</h3>
              <p className="text-gray-400">Get clear templates, recommendations, and evidence collection guidance.</p>
            </Card>
            <Card className="p-8 bg-gray-900 border-gray-700">
              <Lock className="h-12 w-12 text-cyan-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Audit-Ready Reports</h3>
              <p className="text-gray-400">Export everything your auditor needs — organized and professional.</p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}