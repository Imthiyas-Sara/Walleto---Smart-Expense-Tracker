import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="max-w-5xl w-full">
        <div className="text-center">
          {/* Logo - Reduced gap */}
          <div className="flex justify-center mb-0"> {/* No margin */}
            <img
              src="/images/etlogo.png"
              alt="Walleto Logo"
              className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] xl:w-[36rem] xl:h-[36rem] object-contain"
            />
          </div>

          {/* Title - Pulled up closer to logo */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold -mt-4"> {/* More negative margin */}
            <span className="text-[#0a6b7a]">Expense</span>
            <span className="text-[#00d4ff]"> Tracker</span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto mt-3 mb-8">
            Track your expenses, manage your budget, and achieve your financial goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto px-10 py-4 bg-[#00d4ff] text-black font-semibold rounded-lg hover:bg-[#00b8d4] transition-all transform hover:scale-105 shadow-lg shadow-[#00d4ff]/30 text-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-[#0a6b7a] text-[#00d4ff] font-semibold rounded-lg hover:bg-[#0a6b7a]/10 transition-all transform hover:scale-105 text-lg"
            >
              Get Started
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-[#0a6b7a]/20 border border-[#0a6b7a]/30 rounded-full text-sm text-[#00d4ff]">
              📊 Smart Analytics
            </span>
            <span className="px-4 py-2 bg-[#0a6b7a]/20 border border-[#0a6b7a]/30 rounded-full text-sm text-[#00d4ff]">
              💰 Budget Tracking
            </span>
            <span className="px-4 py-2 bg-[#0a6b7a]/20 border border-[#0a6b7a]/30 rounded-full text-sm text-[#00d4ff]">
              📱 Easy to Use
            </span>
          </div>

          <div className="mt-12 text-xs text-gray-600">
            <p>© 2024 Walleto. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}