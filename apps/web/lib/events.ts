import { prisma } from './db';

export async function trackEvent(userId: string, event: string, metadata: Record<string, string | number | boolean> = {}) {
  await prisma.userEvent.create({ data: { userId, event, metadata } }).catch(() => {
    // Never throw — event tracking must never break core flows
    console.error(`Failed to track event: ${event}`);
  });
}
