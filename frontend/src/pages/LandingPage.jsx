import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  QrCode,
  Sliders,
  Calendar,
  ArrowRight,
  ChevronRight,
  Pizza,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-orange-100 selection:text-orange-800">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 flex items-center justify-center text-white font-bold rounded">
              <Pizza size={18} />
            </div>
            {/* Flat geometric brand token */}
            <span className="font-mono font-bold tracking-tight text-xl">
              SLOTBITE
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 uppercase tracking-wider font-medium">
              Campus
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a
              href="#features"
              className="hover:text-gray-900 transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-gray-900 transition-colors">
              How It Works
            </a>
            <a href="#impact" className="hover:text-gray-900 transition-colors">
              Impact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & Actions */}
          <div className="lg:col-span-7 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1] mb-6">
              Never Queue Again.
              <br />
              Eat Between Classes.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mb-10 mx-auto md:mx-0">
              Pre-order from campus cafeterias and book smart time slots that
              fit your lecture timetable perfectly.
            </p>

            {/* Action Row - Completely Flat Elements */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate("/login")}
                className="bg-[#10B981] text-white px-8 py-4 font-semibold text-base transition-colors hover:bg-emerald-600 active:bg-emerald-700 flex items-center justify-center gap-2 text-center">
                Order as Student
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-gray-100 text-gray-900 border border-gray-200 px-8 py-4 font-semibold text-base transition-colors hover:bg-gray-200 active:bg-gray-300 text-center">
                Vendor Dashboard
              </button>
            </div>
          </div>
          {/* Right Column: Flat Illustration App Wrapper */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="border-4 border-gray-900 bg-white p-2">
              <div className="border border-gray-200 bg-gray-50 p-4 relative">
                {/* Top Window UI Bar */}
                <div className="flex gap-1.5 mb-4 border-b border-gray-200 pb-3">
                  <div className="w-2.5 h-2.5 bg-gray-300" />
                  <div className="w-2.5 h-2.5 bg-gray-300" />
                  <div className="w-2.5 h-2.5 bg-gray-300" />
                </div>

                {/* Main Visual Asset Integration */}
                <div className="border border-gray-900 bg-white overflow-hidden">
                  <img
                    src="https://www.searchenginejournal.com/facebook-brings-food-ordering-mobile-app/220035/"
                    alt="SlotBite campus mobile food reservation layout mockup"
                    className="w-full h-auto object-cover block"
                    loading="eager"
                  />
                </div>

                {/* Fixed Structural Accent Token */}
                <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white font-mono text-xs px-3 py-1.5 font-bold tracking-wider">
                  RESERVATION HUB
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section
        id="features"
        className="border-t border-b border-gray-200 bg-gray-50/50 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-xs font-bold tracking-widest text-orange-600 uppercase block mb-2">
              Engineered for Efficiency
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Designed for rushed students and high-volume kitchens.
            </h2>
          </div>

          {/* Grid Layout with Sharp Edges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
            {/* Feature 1 */}
            <div className="bg-white p-8 space-y-4">
              <div className="p-3 bg-orange-50 text-orange-600 inline-block">
                <Calendar size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                Clash Detection
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Smart slot bookings cross-reference your uploaded timetable to
                prevent reservation overlaps during lecture hours.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 space-y-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 inline-block">
                <Clock size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                Real-Time Monitor
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Vendors view structured order incoming flows dynamically to
                synchronize active cooking batch pipelines.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 space-y-4">
              <div className="p-3 bg-gray-100 text-gray-900 inline-block">
                <Sliders size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                Pause & Resume
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Kitchen handles unexpected rushes by instantly toggling ordering
                windows off to maintain kitchen capacity flow.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 space-y-4">
              <div className="p-3 bg-orange-50 text-orange-600 inline-block">
                <QrCode size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                Instant Verification
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Counter pickup confirms instantly via clean zero-tamper client
                side QR tokens. No printed receipts required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 md:py-28 max-w-6xl mx-auto px-6">
        <div className="mb-16 text-center md:text-left">
          <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase block mb-2">
            The Workflow
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            From classroom to collection in three steps.
          </h2>
        </div>

        {/* Horizontal Pipeline Process Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Step 1 */}
          <div className="space-y-4 relative">
            <div className="text-5xl font-black text-gray-100 font-mono">
              01
            </div>
            <h4 className="font-bold text-lg">Select Window & Menu</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Browse localized cafeteria item directories and pick an open
              collection time slot that coordinates safely around your class
              gaps.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 relative">
            <div className="text-5xl font-black text-gray-100 font-mono">
              02
            </div>
            <h4 className="font-bold text-lg">Confirm & Hold Slot</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Lock down your platform order allocation window instantly. Kitchen
              crews assemble meal baskets exactly on target schedules.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 relative">
            <div className="text-5xl font-black text-gray-100 font-mono">
              03
            </div>
            <h4 className="font-bold text-lg">Scan & Go</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Arrive at the counter strictly within your reserved bracket time
              window, scan your custom dynamic barcode, and grab your tray
              instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Block */}
      <section
        id="impact"
        className="border-t border-gray-200 bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-6">
            Campus Validation
          </span>
          <blockquote className="text-xl md:text-2xl font-medium tracking-tight text-gray-900 leading-relaxed mb-6">
            "Before SlotBite, getting lunch at the central cafeteria meant
            risking missing my afternoon lab session. Now I grab my food package
            in under 45 seconds flat."
          </blockquote>
          <cite className="text-sm font-mono text-gray-500 not-italic">
            — Engineering Student, Elizade Campus Edition
          </cite>
        </div>
      </section>
      {/* <img
        src="https://www.searchenginejournal.com/facebook-brings-food-ordering-mobile-app/220035/"
        alt="SlotBite campus mobile food reservation layout mockup"
        className="w-full h-auto object-cover block"
        loading="eager"
      /> */}

      {/* Footer Element */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div>
            <span>Built for </span>
            <span className="font-bold text-gray-900 font-mono">
              Campus Hackathon Deployment
            </span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-gray-900 transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              API Specifications
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Privacy Charter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
