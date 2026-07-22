import { Command } from 'commander';
import { CLI_VERSION, DEFAULT_BASE_URL } from './config/env.js';
import { ApiClient } from './client/api.js';
import { registerExplainCommands } from './commands/explain.js';

const program = new Command();

program
  .name('stellar-explain')
  .description('Query the Stellar Explain backend from your terminal')
  .version(CLI_VERSION)
  .option('--url <url>', 'Backend URL', DEFAULT_BASE_URL);

registerExplainCommands(program);

program
  .command('health')
  .description('Check backend health')
  .action(async (opts: { parent: { opts: { url: string } } }) => {
    const client = new ApiClient(opts.parent.opts.url);
    const data = await client.health();
    console.log(JSON.stringify(data, null, 2));
  });

program
  .command('batch <file>')
  .description('Process a batch of lookups from a JSON file')
  .action(async (file: string, opts: { parent: { opts: { url: string } } }) => {
    const fs = await import('node:fs');
    const content = fs.readFileSync(file, 'utf-8');
    const items = JSON.parse(content) as Array<{ type: string; identifier: string }>;
    const client = new ApiClient(opts.parent.opts.url);

    for (const item of items) {
      try {
        let data: unknown;
        if (item.type === 'tx') {
          data = await client.explainTx(item.identifier);
        } else if (item.type === 'account') {
          data = await client.explainAccount(item.identifier);
        } else {
          console.error(`Unknown type: ${item.type}`);
          continue;
        }
        console.log(JSON.stringify({ type: item.type, identifier: item.identifier, result: data }, null, 2));
      } catch (err) {
        console.error(`Failed: ${item.type} ${item.identifier}: ${err}`);
      }
    }
  });

program.parse();
