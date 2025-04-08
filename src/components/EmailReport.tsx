import { useState } from 'react';
import { FaEnvelope, FaRegCheckCircle, FaExclamationCircle, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function EmailReport() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);

      // Using the App Router API endpoint
      await axios.post('/api/email', { email });

      setStatus('success');
      setMessage('System report sent successfully! Please check your email.');
      setEmail('');
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
      setMessage('Failed to send email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#161628]/70 backdrop-blur-md rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden"
    >
      <div className="p-5">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300 mb-5">
          Email System Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-b from-indigo-900/40 to-purple-900/40 rounded-xl p-4 md:col-span-2 border border-indigo-500/20"
          >
            <div className="flex justify-center mb-3">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center"
              >
                <FaEnvelope className="h-8 w-8 text-indigo-400" />
              </motion.div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center text-white">
              Get Your System Report
            </h3>
            <p className="text-indigo-200/80 text-sm text-center">
              Receive a detailed report of your system&apos;s performance and specifications
              directly in your inbox.
            </p>
          </motion.div>

          <div className="md:col-span-3 bg-[#1e1e3a]/50 rounded-xl p-5 border border-white/5 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="block w-full rounded-lg border-gray-700 bg-gray-800/50 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500 py-2 px-3"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {status !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg mt-3 backdrop-blur-sm ${
                    status === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  <div className="flex items-center">
                    {status === 'success' ? (
                      <FaRegCheckCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <FaExclamationCircle className="h-5 w-5 mr-2" />
                    )}
                    <p className="text-sm">{message}</p>
                  </div>
                </motion.div>
              )}

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-all ${
                    isLoading
                      ? 'bg-indigo-600/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaPaperPlane className="mr-2 h-4 w-4" />
                      Send System Report
                    </span>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
