import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { FaMemory } from 'react-icons/fa';

interface MemoryProps {
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  };
}

interface TooltipData {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { name: string };
  }>;
}

export default function MemoryStats({ memory }: MemoryProps) {
  // Convert bytes to GB for readability
  const totalGB = (memory.total / (1024 * 1024 * 1024)).toFixed(2);
  const freeGB = (memory.free / (1024 * 1024 * 1024)).toFixed(2);
  const usedGB = (memory.used / (1024 * 1024 * 1024)).toFixed(2);

  // Format the usage percentage to include up to 1 decimal place
  const formattedPercentage = memory.usagePercentage.toFixed(1);

  // Determine memory level for UI styling
  const getMemoryLevel = (percentage: number) => {
    if (percentage < 50) return 'low';
    if (percentage < 80) return 'medium';
    return 'high';
  };

  const memoryLevel = getMemoryLevel(memory.usagePercentage);

  // Color mapping based on memory usage level
  const colorMap = {
    low: {
      gradient: 'from-emerald-500 to-cyan-500',
      text: 'text-emerald-500',
      accent: '#10b981',
      bg: 'bg-emerald-500/20',
    },
    medium: {
      gradient: 'from-amber-400 to-orange-500',
      text: 'text-amber-500',
      accent: '#f59e0b',
      bg: 'bg-amber-500/20',
    },
    high: {
      gradient: 'from-rose-500 to-pink-600',
      text: 'text-rose-500',
      accent: '#f43f5e',
      bg: 'bg-rose-500/20',
    },
  };

  // Generate historical-like data for the area chart
  const generateChartData = () => {
    const data = [];
    const baseValue = memory.usagePercentage;

    for (let i = 0; i < 24; i++) {
      // Add small variations to create a realistic chart
      const randomVariation = Math.random() * 5 - 2.5;
      const value = Math.max(0, Math.min(100, baseValue + randomVariation));

      data.push({
        name: `${i}`,
        value: value,
      });
    }

    return data;
  };

  const chartData = generateChartData();

  // Custom tooltip for the area chart
  const CustomTooltip = ({ active, payload }: TooltipData) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161628]/90 backdrop-blur-sm border border-indigo-500/20 p-2 rounded-lg shadow-lg">
          <p className={`font-semibold ${colorMap[memoryLevel].text}`}>
            {payload[0].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#161628]/70 backdrop-blur-md rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full overflow-hidden flex flex-col"
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaMemory className={`${colorMap[memoryLevel].text} text-xl`} />
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              Memory Usage
            </h2>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${colorMap[memoryLevel].bg} ${colorMap[memoryLevel].text}`}
          >
            {formattedPercentage}%
          </div>
        </div>

        {/* Memory Usage Gauge */}
        <div className="relative h-5 bg-[#1e1e3a]/50 rounded-full mb-4 overflow-hidden backdrop-blur-sm border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${memory.usagePercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${colorMap[memoryLevel].gradient}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white drop-shadow-md">
                {formattedPercentage}% Used
              </span>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-white/80"
              />
            </div>
          </div>
        </div>

        {/* Memory Chart */}
        <div className="h-32 mb-3 flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`memoryGradient${memoryLevel}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorMap[memoryLevel].accent} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={colorMap[memoryLevel].accent} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colorMap[memoryLevel].accent}
                fill={`url(#memoryGradient${memoryLevel})`}
                strokeWidth={2}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Stats */}
        <div className="grid grid-cols-3 gap-2 mt-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#1e1e3a]/50 rounded-xl p-2 backdrop-blur-sm border border-white/5"
          >
            <div className="text-xs text-white/60 mb-1">Total</div>
            <div className="flex justify-between items-end">
              <span className="text-base font-medium text-white">{totalGB}</span>
              <span className="text-xs text-white/40">GB</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#1e1e3a]/50 rounded-xl p-2 backdrop-blur-sm border border-white/5"
          >
            <div className="text-xs text-white/60 mb-1">Used</div>
            <div className="flex justify-between items-end">
              <span className={`text-base font-medium ${colorMap[memoryLevel].text}`}>
                {usedGB}
              </span>
              <span className="text-xs text-white/40">GB</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#1e1e3a]/50 rounded-xl p-2 backdrop-blur-sm border border-white/5"
          >
            <div className="text-xs text-white/60 mb-1">Free</div>
            <div className="flex justify-between items-end">
              <span className="text-base font-medium text-emerald-400">{freeGB}</span>
              <span className="text-xs text-white/40">GB</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
