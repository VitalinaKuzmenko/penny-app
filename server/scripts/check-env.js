import { readFileSync } from 'fs';

const example = readFileSync('.env.example', 'utf-8')
  .split('\n')
  .filter(Boolean)
  .map((line) => line.split('=')[0]);

const env = readFileSync('.env', 'utf-8')
  .split('\n')
  .filter(Boolean)
  .map((line) => line.split('=')[0]);

const missing = example.filter((key) => !env.includes(key));

if (missing.length > 0) {
  console.warn('Missing env variables in .env:', missing);
  process.exit(1);
} else {
  console.log('All .env variables are present!');
}
