const { spawn } = require('child_process');
const path = require('path');
const { stopBackendPorts } = require('./stop-backend-ports');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const shouldKillExistingPorts = process.argv.includes('--kill-existing');
const backendRoot = path.resolve(__dirname, '..');

if (shouldKillExistingPorts) {
  stopBackendPorts();
}

const services = [
  {
    name: 'auth-users',
    script: 'start:auth-users:dev',
    env: { AUTH_USERS_PORT: '3000', PORT: '3000' },
  },
  {
    name: 'products',
    script: 'start:products:dev',
    env: { PRODUCTS_PORT: '3001' },
  },
  {
    name: 'categories',
    script: 'start:categories:dev',
    env: { CATEGORIES_PORT: '3002' },
  },
  {
    name: 'orders',
    script: 'start:orders:dev',
    env: { ORDERS_PORT: '3003' },
  },
  {
    name: 'cart',
    script: 'start:cart:dev',
    env: { CART_PORT: '3004' },
  },
  {
    name: 'gateway',
    script: 'start:gateway:dev',
    env: { GATEWAY_PORT: '3005' },
  },
  {
    name: 'payments',
    script: 'start:payments:dev',
    env: { PAYMENTS_PORT: '3006' },
  },
  {
    name: 'notifications',
    script: 'start:notifications:dev',
    env: { NOTIFICATIONS_PORT: '3007' },
  },
];

const colors = [36, 32, 35, 33, 34, 96, 92, 95];
const children = [];

function prefixStream(stream, name, color) {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim().length > 0) {
        process.stdout.write(`\x1b[${color}m[${name}]\x1b[0m ${line}\n`);
      }
    }
  });
}

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

for (const [index, service] of services.entries()) {
  const child = spawn(npmCommand, ['run', service.script], {
    cwd: backendRoot,
    shell: process.platform === 'win32',
    windowsHide: true,
    env: {
      ...process.env,
      ...service.env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  children.push(child);
  prefixStream(child.stdout, service.name, colors[index]);
  prefixStream(child.stderr, service.name, colors[index]);

  child.on('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM') {
      console.error(`[${service.name}] exited with code ${code || signal}`);
    }
  });
}

console.log('Started backend services:');
for (const service of services) {
  const port =
    service.env.AUTH_USERS_PORT ||
    service.env.PRODUCTS_PORT ||
    service.env.CATEGORIES_PORT ||
    service.env.ORDERS_PORT ||
    service.env.CART_PORT ||
    service.env.GATEWAY_PORT ||
    service.env.PAYMENTS_PORT ||
    service.env.NOTIFICATIONS_PORT;

  console.log(`- ${service.name}: http://localhost:${port}`);
}
