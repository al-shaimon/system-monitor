import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import ClientOnlyGauge from './ClientOnlyGauge';

interface CPUProps {
  cpu: {
    model: string;
    cores: number;
    architecture: string;
    loadAvg: number[];
    speed: number;
    usage: number;
  };
}

interface CPUDataPoint {
  time: string;
  usage: number;
}

export default function CPUStats({ cpu }: CPUProps) {
  const [cpuHistory, setCpuHistory] = useState<CPUDataPoint[]>([]);
  const lastUsage = useRef<number | null>(null);
  const maxHistoryLength = 20;

  // Track current and previous CPU usage values for smooth transitions
  const [currentPercent, setCurrentPercent] = useState(cpu.usage / 100);
  const prevPercentRef = useRef(cpu.usage / 100);

  // Get gauge colors for the chart
  const getGaugeChartColors = () => {
    // Use the actual CPU usage value for color determination
    const usageValue = cpu.usage;

    if (usageValue < 30) {
      return ['#10b981', '#34d399', '#6ee7b7']; // Emerald shades (green)
    } else if (usageValue < 60) {
      return ['#f59e0b', '#fbbf24', '#fcd34d']; // Amber shades (yellow)
    } else if (usageValue < 80) {
      return ['#f97316', '#fb923c', '#fdba74']; // Orange shades
    } else {
      return ['#ef4444', '#f87171', '#fca5a5']; // Red shades
    }
  };

  // Create a memoized version of the gauge colors to prevent unnecessary renders
  const gaugeColors = useMemo(() => getGaugeChartColors(), [cpu.usage]);

  // Initialize the gauge on component mount
  useEffect(() => {
    // Set initial percent value
    setCurrentPercent(cpu.usage / 100);
    prevPercentRef.current = cpu.usage / 100;
  }, []);

  useEffect(() => {
    // Smooth transition: when CPU usage changes, update the currentPercent state
    const newPercent = cpu.usage / 100;

    // Only update if the new value is significantly different (prevents micro-updates)
    if (Math.abs(newPercent - prevPercentRef.current) > 0.005) {
      setCurrentPercent(newPercent);
      prevPercentRef.current = newPercent;
    }

    // Only update history if we have new data
    if (cpu.usage !== lastUsage.current) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Add new data point
      setCpuHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            time: timeString,
            usage: cpu.usage,
          },
        ];

        // Keep only the last N data points
        if (newHistory.length > maxHistoryLength) {
          return newHistory.slice(newHistory.length - maxHistoryLength);
        }
        return newHistory;
      });

      lastUsage.current = cpu.usage;
    }
  }, [cpu.usage]);

  // Format load average values
  const formatLoad = (loadValue: number): string => {
    if (loadValue === undefined || loadValue === null || isNaN(loadValue)) {
      return '0.00';
    }

    // Make sure value is between 0 and a reasonable maximum (100)
    const normalizedValue = Math.max(0, Math.min(loadValue, 100));

    // Display with 2 decimal places
    return normalizedValue.toFixed(2);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: { time: string };
    }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161628]/90 backdrop-blur-sm border border-indigo-500/20 p-3 rounded-lg shadow-lg">
          <p className="text-white/90 font-medium">{payload[0].payload.time}</p>
          <p className="text-cyan-400 font-semibold">CPU Usage: {payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Function to determine CPU status color based on usage level
  const getCPUStatusColor = () => {
    if (cpu.usage >= 80) return 'from-red-500 to-orange-500';
    if (cpu.usage >= 60) return 'from-orange-500 to-yellow-500';
    if (cpu.usage >= 40) return 'from-yellow-500 to-green-500';
    return 'from-emerald-500 to-cyan-500';
  };

  // CPU Usage percentage formatter
  const formatCPUUsage = (): string => {
    return `${cpu.usage.toFixed(1)}%`;
  };

  // Get gauge color based on CPU usage
  const getGaugeColor = () => {
    if (cpu.usage < 30) return 'text-emerald-500';
    if (cpu.usage < 60) return 'text-yellow-500';
    if (cpu.usage < 80) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#161628]/70 backdrop-blur-md rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden"
    >
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                    CPU Performance
                  </h2>
                  <p className="text-white/60 text-sm">{cpu.model}</p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`rounded-xl px-3 py-1.5 text-sm font-semibold bg-gradient-to-r ${getCPUStatusColor()} shadow-lg`}
                >
                  {cpu.usage < 40 && 'Optimal'}
                  {cpu.usage >= 40 && cpu.usage < 60 && 'Normal'}
                  {cpu.usage >= 60 && cpu.usage < 80 && 'High'}
                  {cpu.usage >= 80 && 'Critical'}
                </motion.div>
              </div>

              <div className="flex-1 min-h-[260px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuHistory} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <defs>
                      <linearGradient id="cpuColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255, 255, 255, 0.05)"
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }}
                      stroke="rgba(255, 255, 255, 0.1)"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={15}
                      padding={{ left: 0, right: 0 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }}
                      stroke="rgba(255, 255, 255, 0.1)"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#cpuColor)"
                      dot={false}
                      activeDot={{ r: 6, fill: '#818cf8', stroke: '#6366f1', strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="h-full flex flex-col justify-between">
              {/* CPU Usage Gauge */}
              <div className="relative mx-auto pt-4">
                <ClientOnlyGauge
                  percent={currentPercent}
                  colors={gaugeColors}
                  textValue={formatCPUUsage()}
                  textColor={getGaugeColor()}
                />
              </div>

              {/* CPU Detail Information */}
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* CPU Specs */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl bg-[#1e1e3a]/50 p-3 backdrop-blur-sm border border-white/5"
                  >
                    <div className="flex items-center">
                      <div className="rounded-lg p-2 bg-indigo-500/10 mr-3">
                        <svg
                          className="w-4 h-4 text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Speed</p>
                        <p className="text-white font-medium">{cpu.speed / 1000} GHz</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl bg-[#1e1e3a]/50 p-3 backdrop-blur-sm border border-white/5"
                  >
                    <div className="flex items-center">
                      <div className="rounded-lg p-2 bg-purple-500/10 mr-3">
                        <svg
                          className="w-4 h-4 text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Cores</p>
                        <p className="text-white font-medium">{cpu.cores}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl bg-[#1e1e3a]/50 p-3 backdrop-blur-sm border border-white/5"
                  >
                    <div className="flex items-center">
                      <div className="rounded-lg p-2 bg-blue-500/10 mr-3">
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Architecture</p>
                        <p className="text-white font-medium">{cpu.architecture}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl bg-[#1e1e3a]/50 p-3 backdrop-blur-sm border border-white/5"
                  >
                    <div className="flex items-center">
                      <div className="rounded-lg p-2 bg-cyan-500/10 mr-3">
                        <svg
                          className="w-4 h-4 text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Load Avg (1m)</p>
                        <p className="text-white font-medium">{formatLoad(cpu.loadAvg[0] || 0)}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="rounded-xl bg-indigo-600/10 backdrop-blur-sm p-3 border border-indigo-500/20"
                >
                  <h3 className="text-sm font-medium text-white/80 mb-1">
                    Load Average (1m, 5m, 15m)
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {cpu.loadAvg.map((load, index) => (
                      <div
                        key={index}
                        className={`py-1 px-2 rounded-lg ${
                          load > 0 ? 'bg-indigo-500/10' : 'bg-gray-700/20'
                        } text-center group transition-all duration-200`}
                      >
                        <p
                          className={`${
                            load > 0 ? 'text-indigo-300' : 'text-gray-400'
                          } font-medium text-sm group-hover:text-indigo-200 transition-colors`}
                        >
                          {formatLoad(load)}
                        </p>
                        <p className="text-[10px] text-white/40">
                          {index === 0 ? '1m' : index === 1 ? '5m' : '15m'}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
