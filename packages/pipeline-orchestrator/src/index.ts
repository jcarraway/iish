import { connectNats, closeNats } from './nats';
import { startConsumers } from './consumers';

async function main() {
  console.log('Starting pipeline orchestrator...');

  await connectNats();
  const stopConsumers = await startConsumers();

  console.log('Pipeline orchestrator running');

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    await stopConsumers();
    await closeNats();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Orchestrator failed to start:', err);
  process.exit(1);
});
