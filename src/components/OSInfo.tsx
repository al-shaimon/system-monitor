import { FaWindows, FaApple, FaLinux, FaServer } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface OSProps {
  os: {
    platform: string;
    type: string;
    release: string;
    hostname: string;
    uptime: number;
  };
}

export default function OSInfo({ os }: OSProps) {
  // Format uptime to a readable format
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

    return parts.join(', ');
  };

  // Get the proper OS name based on platform and release
  const getOSName = () => {
    if (os.platform === 'win32') {
      // Check Windows version
      if (os.release.startsWith('10.0.2')) {
        return 'Windows 11';
      } else if (os.release.startsWith('10.0')) {
        return 'Windows 10';
      } else if (os.release.startsWith('6.3')) {
        return 'Windows 8.1';
      } else if (os.release.startsWith('6.2')) {
        return 'Windows 8';
      } else if (os.release.startsWith('6.1')) {
        return 'Windows 7';
      }
      return 'Windows';
    }

    if (os.platform === 'darwin') {
      const version = parseFloat(os.release);
      if (version >= 22) return 'macOS Ventura';
      if (version >= 21) return 'macOS Monterey';
      if (version >= 20) return 'macOS Big Sur';
      if (version >= 19) return 'macOS Catalina';
      return 'macOS';
    }

    if (os.platform === 'linux') {
      return 'Linux';
    }

    return os.type;
  };

  // Select an appropriate icon based on the platform
  const getPlatformIcon = () => {
    switch (os.platform) {
      case 'win32':
        return <FaWindows className="text-sky-400" />;
      case 'darwin':
        return <FaApple className="text-gray-300" />;
      case 'linux':
        return <FaLinux className="text-yellow-500" />;
      default:
        return <FaServer className="text-purple-400" />;
    }
  };

  const osName = getOSName();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#161628]/70 backdrop-blur-md rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full overflow-hidden flex flex-col"
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            Operating System
          </h2>
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-2xl"
          >
            {getPlatformIcon()}
          </motion.div>
        </div>

        <div className="flex items-center justify-center mb-3">
          {os.platform === 'win32' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-600/80 shadow-lg"
            >
              <span className="text-2xl text-white font-bold">
                <FaWindows />
              </span>
            </motion.div>
          )}
          {os.platform === 'darwin' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center bg-gray-800 shadow-lg"
            >
              <span className="text-2xl text-white font-bold">
                <FaApple />
              </span>
            </motion.div>
          )}
          {os.platform === 'linux' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center bg-yellow-600/80 shadow-lg"
            >
              <span className="text-2xl text-white font-bold">
                <FaLinux />
              </span>
            </motion.div>
          )}
        </div>

        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xl font-bold text-white mb-4"
        >
          {osName}
        </motion.h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#1e1e3a]/50 rounded-xl p-3 backdrop-blur-sm border border-white/5">
            <span className="text-xs text-white/60 block mb-1">Platform</span>
            <span className="text-sm font-medium text-white capitalize">
              {os.platform === 'win32' ? 'Windows' : os.platform}
            </span>
          </div>

          <div className="bg-[#1e1e3a]/50 rounded-xl p-3 backdrop-blur-sm border border-white/5">
            <span className="text-xs text-white/60 block mb-1">Release</span>
            <span className="text-sm font-medium text-white">{os.release}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#1e1e3a]/50 rounded-xl p-3 backdrop-blur-sm border border-white/5">
            <span className="text-xs text-white/60 block mb-1">Hostname</span>
            <span className="text-sm font-medium text-white">{os.hostname}</span>
          </div>

          <div className="bg-[#1e1e3a]/50 rounded-xl p-3 backdrop-blur-sm border border-white/5">
            <span className="text-xs text-white/60 block mb-1">Status</span>
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-emerald-500"
              />
              <span className="text-xs font-medium text-emerald-400">Running</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e3a]/50 rounded-xl p-3 backdrop-blur-sm border border-white/5 mt-auto">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/60">System Uptime</span>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            />
          </div>
          <div className="flex justify-center">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
              {formatUptime(os.uptime)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
