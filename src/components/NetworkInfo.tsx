import { useState } from 'react';
import { FaNetworkWired, FaWifi, FaEthernet } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface NetworkProps {
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
}

export default function NetworkInfo({ network }: NetworkProps) {
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    network.interfaces.length > 0 ? network.interfaces[0].name : null
  );

  // Filter for non-internal interfaces with valid addresses
  const activeInterfaces = network.interfaces.filter((iface) =>
    iface.details.some((detail) => !detail.internal && detail.address)
  );

  // Function to get external IP addresses
  const getExternalAddresses = (interfaceName: string) => {
    const networkInterface = network.interfaces.find((iface) => iface.name === interfaceName);
    if (!networkInterface) return [];

    return networkInterface.details.filter((detail) => !detail.internal && detail.address);
  };

  // Get the icon based on interface type
  const getInterfaceIcon = (interfaceName: string) => {
    const isWifi =
      interfaceName.toLowerCase().includes('wi') || interfaceName.toLowerCase().includes('wl');

    return isWifi ? <FaWifi className="text-cyan-400" /> : <FaEthernet className="text-blue-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#161628]/70 backdrop-blur-md rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full overflow-hidden flex flex-col"
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Network Information
          </h2>
          <FaNetworkWired className="text-cyan-400 text-xl" />
        </div>

        {activeInterfaces.length === 0 ? (
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            className="bg-yellow-900/20 border border-yellow-800/50 p-4 rounded-lg text-center flex-grow flex items-center justify-center"
          >
            <div>
              <FaNetworkWired className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-yellow-400">No active network interfaces detected</p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/70">Interface:</span>
                <div className="relative flex-1">
                  <select
                    id="network-interface"
                    className="w-full rounded-lg border-gray-700 bg-gray-800/50 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2 text-sm appearance-none"
                    value={selectedInterface || ''}
                    onChange={(e) => setSelectedInterface(e.target.value)}
                  >
                    {activeInterfaces.map((iface) => (
                      <option key={iface.name} value={iface.name}>
                        {iface.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {selectedInterface && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center"
                    >
                      {getInterfaceIcon(selectedInterface)}
                    </motion.div>
                    <span className="font-medium text-white">{selectedInterface}</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-cyan-500"
                  />
                </div>

                <div className="overflow-auto flex-1 flex flex-col gap-2 pr-0.5">
                  {getExternalAddresses(selectedInterface).map((detail, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[#1e1e3a]/50 rounded-xl p-3 backdrop-blur-sm border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                          IPv{detail.family}
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800/50 text-white/70 flex items-center gap-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Connected
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                        <div>
                          <div className="text-[10px] text-white/60">IP Address</div>
                          <div className="text-sm font-medium text-cyan-400 truncate">
                            {detail.address}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-white/60">Netmask</div>
                          <div className="text-sm font-medium text-white/80 truncate">
                            {detail.netmask}
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="text-[10px] text-white/60">MAC Address</div>
                          <div className="text-sm font-medium text-white/90">{detail.mac}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
