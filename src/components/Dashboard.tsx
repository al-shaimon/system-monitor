import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import CPUStats from './CPUStats';
import MemoryStats from './MemoryStats';
import OSInfo from './OSInfo';
import NetworkInfo from './NetworkInfo';
import EmailReport from './EmailReport';

// Get environment variables with fallbacks
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api/system';
const REFRESH_INTERVAL = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) || 2000;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'System Monitor';

interface SystemInfo {
  cpu: {
    model: string;
    cores: number;
    architecture: string;
    loadAvg: number[];
    speed: number;
    usage: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  };
  os: {
    platform: string;
    type: string;
    release: string;
    hostname: string;
    uptime: number;
  };
  network: {
    interfaces: {
      name: string;
      details: {
        address: string;
        netmask: string;
        family: string;
        mac: string;
        internal: boolean;
      }[];
    }[];
  };
  time: number;
  error?: string;
}

export default function Dashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINT);
      const data = response.data;

      // Check if the API returned an error
      if (data.error) {
        console.warn('API returned an error:', data.error);
        setError(data.error);
        // Still set the system info if available
        if (data.cpu) {
          setSystemInfo(data);
        }
      } else {
        setSystemInfo(data);
        setError(null);
      }

      setFetchCount((prev) => prev + 1);
    } catch (err) {
      console.error('Error fetching system info:', err);
      setError('Failed to fetch system information. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchSystemInfo();

    // Set up the interval for automatic refreshing
    intervalRef.current = setInterval(() => {
      fetchSystemInfo();
    }, REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchSystemInfo]);

  useEffect(() => {
    // Hide the loading animation after 3 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchSystemInfo();
  };

  if (loading && !systemInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d19]">
        <div className="flex flex-col items-center">
          <AnimatePresence>
            {showAnimation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-24 h-24"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ['20%', '50%', '20%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl"
                />
                <motion.div
                  animate={{
                    scale: [1.1, 0.9, 1.1],
                    rotate: [0, -180, -360],
                    borderRadius: ['30%', '50%', '30%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: 0.1,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-70"
                />
                <motion.div
                  animate={{
                    scale: [0.9, 1.1, 0.9],
                    rotate: [0, 90, 0],
                    borderRadius: ['40%', '20%', '40%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: 0.2,
                  }}
                  className="absolute inset-2 bg-[#0d0d19] rounded-xl flex items-center justify-center"
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-white font-medium text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400"
          >
            Initializing System Diagnostics
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex space-x-2"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-indigo-500 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  if (error && !systemInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d19]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#161628]/60 p-8 rounded-xl max-w-md text-center backdrop-blur-md border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-500/10 flex items-center justify-center"
          >
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold mb-3 text-white">Connection Error</h2>
          <p className="mb-8 text-white/70">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualRefresh}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d19] bg-gradient-to-b from-[#0d0d19] to-[#131336] pb-12">
      {/* Background decorative elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/10 rounded-full filter blur-[100px] transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-700/10 rounded-full filter blur-[100px] transform -translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-700/10 rounded-full filter blur-[100px] transform -translate-x-1/2 -translate-y-1/2"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxNTE1MzAiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMHYwaDMwdjMwSDBWMGgzMHYzMHoiIHN0cm9rZT0iIzI1MjU0MCIgc3Ryb2tlLW9wYWNpdHk9Ii4zIi8+PC9nPjwvc3ZnPg==')] opacity-[0.05]"></div>
      </div>

      <div className="relative container mx-auto px-4 pt-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#161628]/70 rounded-2xl mb-8 p-6 backdrop-blur-md border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <div className="flex items-center">
                <motion.div
                  whileHover={{
                    rotate: [0, 10, -10, 0],
                    transition: { duration: 0.5 },
                  }}
                  className="mr-3 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </motion.div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  {APP_NAME}
                </h1>
              </div>
              <div className="ml-14 mt-2">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-red-400 flex items-center mb-1"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Warning: {error}
                  </motion.p>
                )}
                <div className="flex items-center text-sm text-white/60">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                  <p>Live Data • Refreshed {fetchCount} times</p>
                </div>
              </div>
            </div>

            <div className="flex items-center mt-6 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleManualRefresh}
                disabled={loading}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 font-medium"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Refreshing</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Refresh Now</span>
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {systemInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="col-span-1 md:col-span-2 lg:col-span-3"
            >
              <CPUStats cpu={systemInfo.cpu} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="col-span-1 lg:col-span-1"
            >
              <MemoryStats memory={systemInfo.memory} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="col-span-1 lg:col-span-1"
            >
              <OSInfo os={systemInfo.os} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="col-span-1 lg:col-span-1"
            >
              <NetworkInfo network={systemInfo.network} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="col-span-1 md:col-span-2 lg:col-span-3"
            >
              <EmailReport />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
