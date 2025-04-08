'use client';

import { useState, useEffect } from 'react';
import GaugeChart from 'react-gauge-chart';

interface ClientOnlyGaugeProps {
  percent: number;
  colors: string[];
  textValue: string;
  textColor: string;
}

export default function ClientOnlyGauge({
  percent,
  colors,
  textValue,
  textColor,
}: ClientOnlyGaugeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return a placeholder during server-side rendering
  if (!isMounted) {
    return (
      <div className="w-48 h-48 mx-auto relative">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <span className={textColor}>{textValue}</span>
          <span className="text-white/60 text-sm mt-1">Usage</span>
        </div>
        <div className="w-full h-full rounded-full border-4 border-gray-800/50"></div>
      </div>
    );
  }

  // Only render the actual gauge on the client
  return (
    <div className="w-48 h-48 mx-auto relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${textColor}`}>{textValue}</span>
        <span className="text-white/60 text-sm mt-1">Usage</span>
      </div>

      <GaugeChart
        id="cpu-gauge-chart"
        nrOfLevels={3}
        colors={colors}
        arcWidth={0.3}
        percent={percent}
        arcPadding={0.02}
        cornerRadius={6}
        textColor={'transparent'}
        needleColor={'#fff'}
        needleBaseColor={'#6366f1'}
        animate={true}
        animDelay={0}
        animateDuration={1000}
      />
    </div>
  );
}
