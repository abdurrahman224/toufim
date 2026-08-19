const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || '5173';
const projectRoot = path.join(__dirname, '..');

const child = spawn(
  'npx',
  ['serve', '-s', 'dist', '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit', shell: true, cwd: projectRoot }
);

child.on('exit', (code) => process.exit(code ?? 0));
