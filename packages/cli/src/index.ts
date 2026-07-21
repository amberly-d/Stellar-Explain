import { Command } from 'commander';
import { CLI_VERSION, DEFAULT_BASE_URL } from './config/env.js';
import { ApiClient } from './client/api.js';
import { cacheGet, cacheSet } from './utils/cache.js';
import { registerBatchCommand } from './commands/batch.js';

const program = new Command();

program
  .name('stellar-explain')
  .description('Query the Stellar Explain backend from your terminal')
  .version(CLI_VERSION)
  .option('--url <url>', 'Backend URL', DEFAULT_BASE_URL);

program
  .command('tx <hash>')
  .description('Explain a transaction by hash')
  .action(async (hash: string, opts: { parent: { opts: { url: string } } }) => {
    const client = new ApiClient(opts.parent.opts.url);
    const cacheKey = `tx:${hash}`;
    const cached = cacheGet<unknown>(cacheKey);
    if (cached) {
      console.log(JSON.stringify(cached, null, 2));
      return;
    }
    const data = await client.explainTx(hash);
    cacheSet(cacheKey, data, 5 * 60 * 1000);
    console.log(JSON.stringify(data, null, 2));
  });

program
  .command('account <address>')
  .description('Explain an account by address')
  .action(async (address: string, opts: { parent: { opts: { url: string } } }) => {
    const client = new ApiClient(opts.parent.opts.url);
    const cacheKey = `account:${address}`;
    const cached = cacheGet<unknown>(cacheKey);
    if (cached) {
      console.log(JSON.stringify(cached, null, 2));
      return;
    }
    const data = await client.explainAccount(address);
    cacheSet(cacheKey, data, 5 * 60 * 1000);
    console.log(JSON.stringify(data, null, 2));
  });

program
  .command('health')
  .description('Check backend health')
  .action(async (opts: { parent: { opts: { url: string } } }) => {
    const client = new ApiClient(opts.parent.opts.url);
    const data = await client.health();
    console.log(JSON.stringify(data, null, 2));
  });

registerBatchCommand(program);

program.parse();
