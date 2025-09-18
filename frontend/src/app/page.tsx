"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SkillPass
          </h1>
          <nav className="flex gap-6 items-center">
            <Link href="/login" className="text-gray-700 hover:text-blue-600 transition">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">
            Your Career, Verified.
          </h2>
          <p className="text-lg text-blue-100 mb-10">
            The ultimate passbook for your skills, projects, and achievements.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full shadow hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-20 px-6">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition">
          <div className="text-blue-600 text-4xl mb-4">📋</div>
          <h3 className="font-semibold text-xl">Track Projects</h3>
          <p className="text-gray-600 mt-3">
            Easily document every project, internship, and certification in one place.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition">
          <div className="text-blue-600 text-4xl mb-4">✔️</div>
          <h3 className="font-semibold text-xl">Get Verified</h3>
          <p className="text-gray-600 mt-3">
            Gain credibility with verifications from professors, mentors, and managers.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition">
          <div className="text-blue-600 text-4xl mb-4">🚀</div>
          <h3 className="font-semibold text-xl">Showcase Skills</h3>
          <p className="text-gray-600 mt-3">
            Build a verified portfolio to impress recruiters and employers.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2533] text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Side - Brand */}
          <div className="text-center md:text-left">
            <h2 className="text-white font-bold text-lg">SkillPass</h2>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} SkillPass. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <nav className="flex gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </nav>
        </div>

        {/* Bottom strip */}
        <div className="bg-[#111] text-center text-xs text-gray-400 py-3">
          Built with ❤️ using Next.js + TailwindCSS
        </div>
      </footer>
    </div>


  );
}
