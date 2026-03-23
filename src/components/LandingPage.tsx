import { CreditCard, Shield, Zap, TrendingUp } from "lucide-react";

interface LandingPageProps {
  onStartChat: () => void;
}

export default function LandingPage({ onStartChat }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-900">Tata Capital</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">
                Personal Loans
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">
                Business Loans
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">
                About Us
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Get Your Personal Loan in
                <span className="text-blue-600"> Minutes</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Experience the future of lending with our AI-powered loan assistant.
                Quick approvals, transparent pricing, and instant disbursement.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Instant approval in 5 minutes",
                  "Loan amounts up to ₹10 Lakhs",
                  "Interest rates starting from 10.5% p.a.",
                ].map((text, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onStartChat}
                aria-label="Start your loan application by chatting with our AI assistant"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Apply Now — Chat with AI Assistant
              </button>
            </div>

            {/* Image + Stats */}
            <div className="relative overflow-visible">
              <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
                <img
                  src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Happy customer"
                  className="rounded-xl w-full h-96 object-cover"
                />

                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6">
                  <div className="text-3xl font-bold text-blue-600">₹5L+</div>
                  <div className="text-gray-600">Loans Disbursed</div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-6">
                  <div className="text-3xl font-bold text-green-600">98%</div>
                  <div className="text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Tata Capital?
            </h2>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-blue-600" />,
                  title: "Instant Approval",
                  desc: "AI-powered decision in minutes, not days",
                  bg: "bg-blue-100",
                },
                {
                  icon: <Shield className="w-8 h-8 text-green-600" />,
                  title: "100% Secure",
                  desc: "Bank-grade encryption for your data",
                  bg: "bg-green-100",
                },
                {
                  icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
                  title: "Flexible Terms",
                  desc: "Choose tenure from 6 to 60 months",
                  bg: "bg-purple-100",
                },
                {
                  icon: <CreditCard className="w-8 h-8 text-orange-600" />,
                  title: "No Hidden Fees",
                  desc: "Transparent pricing, no surprises",
                  bg: "bg-orange-100",
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Chat with our AI assistant now and get your loan approved in minutes
            </p>
            <button
              onClick={onStartChat}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition shadow-lg transform hover:scale-105"
            >
              Start Your Application
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tata Capital</h3>
              <p className="text-gray-400">
                India's leading financial services company.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Personal Loans</li>
                <li>Business Loans</li>
                <li>Home Loans</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>1800-209-8800</li>
                <li>support@tatacapital.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Tata Capital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
