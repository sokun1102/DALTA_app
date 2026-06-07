const { execFileSync } = require('child_process');

const defaultPorts = ['3000', '3001', '3002', '3003', '3004', '3005', '3006', '3007'];
const ports = (process.env.BACKEND_PORTS || defaultPorts.join(','))
  .split(',')
  .map((port) => port.trim())
  .filter(Boolean);

function unique(values) {
  return [...new Set(values)];
}

function findWindowsPids() {
  const output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  const pids = [];
  for (const line of output.split(/\r?\n/)) {
    const columns = line.trim().split(/\s+/);
    if (columns.length < 5 || columns[0] !== 'TCP') continue;

    const localAddress = columns[1];
    const state = columns[3];
    const pid = columns[4];
    const port = localAddress.split(':').pop();

    if (state === 'LISTENING' && ports.includes(port) && pid !== String(process.pid)) {
      pids.push(pid);
    }
  }

  return unique(pids);
}

function findUnixPids() {
  const pids = [];

  for (const port of ports) {
    try {
      const output = execFileSync('lsof', ['-ti', `tcp:${port}`], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      pids.push(...output.split(/\s+/).filter(Boolean));
    } catch {
      // lsof returns a non-zero exit code when no process uses the port.
    }
  }

  return unique(pids).filter((pid) => pid !== String(process.pid));
}

function stopBackendPorts() {
  const pids = process.platform === 'win32' ? findWindowsPids() : findUnixPids();

  if (pids.length === 0) {
    console.log(`No backend dev ports are in use (${ports.join(', ')}).`);
    return;
  }

  console.log(`Stopping backend process(es) on ports ${ports.join(', ')}: ${pids.join(', ')}`);

  for (const pid of pids) {
    try {
      if (process.platform === 'win32') {
        execFileSync('taskkill.exe', ['/PID', pid, '/T', '/F'], { stdio: 'inherit' });
      } else {
        execFileSync('kill', ['-TERM', pid], { stdio: 'inherit' });
      }
    } catch (error) {
      console.warn(`Could not stop PID ${pid}: ${error.message}`);
    }
  }
}

if (require.main === module) {
  stopBackendPorts();
}

module.exports = { stopBackendPorts };
