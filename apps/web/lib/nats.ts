import { connect, NatsConnection, JetStreamClient, StringCodec } from 'nats';

const sc = StringCodec();

const globalForNats = globalThis as unknown as { natsConnection: NatsConnection | null };

async function getNatsConnection(): Promise<NatsConnection> {
  if (globalForNats.natsConnection) return globalForNats.natsConnection;

  const nc = await connect({
    servers: process.env.NATS_URL || 'nats://localhost:4222',
    name: 'oncovax-web',
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForNats.natsConnection = nc;
  }

  return nc;
}

export async function getJetStream(): Promise<JetStreamClient> {
  const nc = await getNatsConnection();
  return nc.jetstream();
}

export async function publishEvent(subject: string, data: Record<string, unknown>): Promise<void> {
  const js = await getJetStream();
  await js.publish(subject, sc.encode(JSON.stringify(data)));
}
