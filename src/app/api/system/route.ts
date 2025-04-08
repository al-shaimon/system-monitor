import { NextResponse } from 'next/server';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Function to get current CPU usage percentage for all platforms
async function getCPUUsage() {
  try {
    const platform = os.platform();
    let usage = 0;

    if (platform === 'win32') {
      // Windows - use wmic
      const { stdout } = await execPromise('wmic cpu get LoadPercentage');
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        usage = parseInt(lines[1], 10) || 0;
      }
    } else if (platform === 'darwin') {
      // macOS - use top
      const { stdout } = await execPromise('top -l 1 | grep "CPU usage"');
      const match = stdout.match(/(\d+\.\d+)%\s+user/);
      if (match && match[1]) {
        usage = parseFloat(match[1]) || 0;
      }
    } else {
      // Linux and others - try to calculate from /proc/stat if available
      try {
        // Calculate CPU usage from /proc/stat
        const { stdout: stat1 } = await execPromise('cat /proc/stat | grep "^cpu "');
        // Wait briefly for comparison sample
        await new Promise((resolve) => setTimeout(resolve, 100));
        const { stdout: stat2 } = await execPromise('cat /proc/stat | grep "^cpu "');

        const info1 = stat1
          .split(/\s+/)
          .slice(1, 5)
          .map((n) => parseInt(n, 10));
        const info2 = stat2
          .split(/\s+/)
          .slice(1, 5)
          .map((n) => parseInt(n, 10));

        const total1 = info1.reduce((acc, val) => acc + val, 0);
        const total2 = info2.reduce((acc, val) => acc + val, 0);

        const idle1 = info1[3];
        const idle2 = info2[3];

        const totalDiff = total2 - total1;
        const idleDiff = idle2 - idle1;

        usage = 100 - (100 * idleDiff) / totalDiff;
      } catch {
        // Fallback to loadavg if /proc/stat is not available
        const loadAvg = os.loadavg();
        const cpuCount = os.cpus().length;
        usage = (loadAvg[0] / cpuCount) * 100; // Convert load average to percentage
      }
    }

    return Math.min(Math.max(0, usage), 100); // Ensure value is between 0 and 100
  } catch (error) {
    console.error('Error getting CPU usage:', error);
    return 0; // Default to 0 if there's an error
  }
}

// Get load average across all platforms
async function getLoadAverage() {
  const platform = os.platform();
  let loadAvg = [0, 0, 0];

  try {
    if (platform === 'win32') {
      // Windows doesn't have native load average, so we'll calculate a similar metric
      // We'll use the CPU usage and process count to approximate
      const cpuUsage = await getCPUUsage();
      const { stdout: procCount } = await execPromise('wmic process get processid | find /c /v ""');

      // Number of processes
      const processCount = parseInt(procCount.trim(), 10) || 0;

      // Get the number of CPU cores
      const cpuCount = os.cpus().length;

      // Calculate a synthetic load average based on CPU usage and process count
      // normalized by CPU cores - this is an approximation
      const syntheticLoad = (cpuUsage / 100) * (processCount / (cpuCount * 10));

      // Simulate the three load average values with decreasing intensity
      loadAvg = [
        Math.min(syntheticLoad, 100),
        Math.min(syntheticLoad * 0.8, 100),
        Math.min(syntheticLoad * 0.6, 100),
      ];
    } else if (platform === 'darwin' || platform === 'linux' || platform.includes('bsd')) {
      // macOS, Linux, and BSD have native support for load average
      loadAvg = os.loadavg();
    } else {
      // For other platforms, fall back to whatever os.loadavg() returns
      loadAvg = os.loadavg();
    }

    // Ensure all values are valid numbers
    return loadAvg.map((load) => (Number.isFinite(load) ? load : 0));
  } catch (error) {
    console.error('Error getting load average:', error);
    return [0, 0, 0]; // Default to 0 if there's an error
  }
}

export async function GET() {
  try {
    // Get CPU usage percentage
    const cpuUsagePercentage = await getCPUUsage();

    // Ensure CPU data is valid by checking for presence of cpus
    const cpuInfo = os.cpus();
    const hasCpuInfo = Array.isArray(cpuInfo) && cpuInfo.length > 0;

    // Calculate memory usage percentage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercentage = (usedMem / totalMem) * 100;

    // Get load averages - using our improved cross-platform implementation
    const loadAvg = await getLoadAverage();

    const systemInfo = {
      cpu: {
        model: hasCpuInfo ? cpuInfo[0].model : 'CPU information unavailable',
        cores: hasCpuInfo ? cpuInfo.length : 1,
        architecture: os.arch(),
        loadAvg: loadAvg,
        speed: hasCpuInfo ? cpuInfo[0].speed : 0,
        usage: cpuUsagePercentage, // Add real-time CPU percentage
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usagePercentage: memoryPercentage,
      },
      os: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime(),
      },
      network: {
        interfaces: Object.entries(os.networkInterfaces() || {}).map(([name, details]) => ({
          name,
          details:
            details?.map((d) => ({
              address: d.address,
              netmask: d.netmask,
              family: d.family,
              mac: d.mac,
              internal: d.internal,
            })) || [],
        })),
      },
      time: Date.now(),
    };

    return NextResponse.json(systemInfo);
  } catch (error) {
    console.error('Error fetching system info:', error);

    // Return fallback data structure in case of error
    return NextResponse.json(
      {
        cpu: {
          model: 'Error retrieving CPU info',
          cores: 1,
          architecture: 'unknown',
          loadAvg: [0, 0, 0],
          speed: 0,
          usage: 0,
        },
        memory: {
          total: 0,
          free: 0,
          used: 0,
          usagePercentage: 0,
        },
        os: {
          platform: 'unknown',
          type: 'unknown',
          release: 'unknown',
          hostname: 'unknown',
          uptime: 0,
        },
        network: {
          interfaces: [],
        },
        time: Date.now(),
        error: 'Failed to fetch system information',
      },
      { status: 200 }
    );
  }
}
