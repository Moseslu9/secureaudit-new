import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-900 py-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Start free. Upgrade when you're ready to scale.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Free</h3>
            <p className="text-4xl font-bold text-cyan-500 mb-6">$0<span className="text-lg text-gray-400">/month</span></p>
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-500 mr-3" />
                3 policy uploads
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-500 mr-3" />
                Basic gap analysis
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-500 mr-3" />
                Email support
              </li>
            </ul>
            <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold">
              <Link href="/auth">Start Free</Link>
            </Button>
          </Card>

          <Card className="p-8 bg-gradient-to-b from-cyan-900 to-gray-800 border-cyan-500 border-2 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
            <p className="text-4xl font-bold text-cyan-400 mb-6">$49<span className="text-lg text-gray-400">/month</span></p>
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-400 mr-3" />
                Unlimited uploads
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-400 mr-3" />
                Advanced AI analysis
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-400 mr-3" />
                Export reports (PDF)
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-400 mr-3" />
                Priority support
              </li>
            </ul>
            <Button asChild className="w-full bg-cyan-400 hover:bg-cyan-300 text-gray-900 font-bold">
              <Link href="/auth">Start Free Trial</Link>
            </Button>
          </Card>

          <Card className="p-8 bg-gray-800 border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
            <p className="text-4xl font-bold text-cyan-500 mb-6">Custom</p>
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-500 mr-3" />
                Everything in Pro
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-500 mr-3" />
                SSO & team management
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-500 mr-3" />
                Dedicated support
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-cyan-500 mr-3" />
                Custom integrations
              </li>
            </ul>
            <Button asChild variant="outline" className="w-full border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-gray-900">
              <Link href="/auth">Contact Sales</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}