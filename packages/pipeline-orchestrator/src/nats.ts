import { connect, NatsConnection, JetStreamManager, JetStreamClient } from 'nats';

let nc: NatsConnection | null = null;
let js: JetStreamClient | null = null;

export async function connectNats(): Promise<NatsConnection> {
  if (nc) return nc;

  nc = await connect({
    servers: process.env.NATS_URL || 'nats://localhost:4222',
    name: 'pipeline-orchestrator',
  });

  console.log(`Connected to NATS at ${nc.getServer()}`);

  // Set up JetStream stream
  const jsm: JetStreamManager = await nc.jetstreamManager();

  try {
    await jsm.streams.info('PIPELINE');
    console.log('PIPELINE stream already exists');
  } catch {
    await jsm.streams.add({
      name: 'PIPELINE',
      subjects: ['PIPELINE.>'],
      retention: 'workqueue' as unknown as import('nats').RetentionPolicy,
      max_age: 7 * 24 * 60 * 60 * 1_000_000_000, // 7 days in nanoseconds
      storage: 'file' as unknown as import('nats').StorageType,
    });
    console.log('Created PIPELINE stream');
  }

  return nc;
}

export async function getJetStream(): Promise<JetStreamClient> {
  if (js) return js;
  const conn = await connectNats();
  js = conn.jetstream();
  return js;
}

export async function closeNats(): Promise<void> {
  if (nc) {
    await nc.drain();
    nc = null;
    js = null;
  }
}
