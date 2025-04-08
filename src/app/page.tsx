'use client';

import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#701a75] text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-[#6366f1]/20 blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-[#8b5cf6]/20 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[20vw] h-[20vw] rounded-full bg-[#ec4899]/20 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <Dashboard />
    </div>
  );
}
