import type { Config } from '@scaratech/mittens';
import { Mittens, generateConfig } from '@scaratech/mittens';
import { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createServer } from "node:http";

const program = new Command();

program
    .name('@scaratech/mittens-cli')
    .description('CLI for Mittens')
    .option('-c, --config <path>', 'path to config file', 'config.json')
    .allowUnknownOption(true);
program.parse(process.argv);

const options = program.opts();
const configArg = options.config as string;
const configPath = path.isAbsolute(configArg) ? configArg : path.resolve(process.cwd(), configArg);

if (!existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    process.exit(1);
}

const config: Config = generateConfig(
    JSON.parse(readFileSync(configPath, 'utf-8'))
);

const mittens = new Mittens(config);
const server = createServer();

server.on('upgrade', (req, socket, head) => {
    mittens.routeRequest(req, socket, head);
});

server.on('listening', () => {
    console.log(`Listening on ${config.bind.host}:${config.bind.port}`);
});

server.listen(config.bind.port, config.bind.host);
