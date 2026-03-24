import type { ResolverContext } from '../context';

export const peersResolvers = {
  Query: {
    peerMentorProfile: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getMentorProfile(patient.id);
    },
    peerMatches: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.findMatches(patient.id);
    },
    peerConnections: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getConnections(patient.id);
    },
    peerConnection: async (_: any, args: { connectionId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getConnection(args.connectionId, patient.id);
    },
    mentorTrainingModules: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getTrainingModules(patient.id);
    },
    peerMessages: async (_: any, args: { connectionId: string; limit?: number; before?: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getMessages(args.connectionId, patient.id, args.limit ?? 50, args.before);
    },
    mentorStats: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getMentorStats(patient.id);
    },
  },
  Mutation: {
    enrollAsMentor: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.enrollAsMentor(patient.id, args.input);
    },
    updateMentorProfile: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.updateMentorProfile(patient.id, args.input);
    },
    proposeConnection: async (_: any, args: { mentorProfileId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.proposeConnection(patient.id, args.mentorProfileId);
    },
    respondToConnection: async (_: any, args: { connectionId: string; accept: boolean }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.respondToConnection(args.connectionId, patient.id, args.accept);
    },
    completeTrainingModule: async (_: any, args: { moduleId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.completeTrainingModule(patient.id, args.moduleId);
    },
    sendPeerMessage: async (_: any, args: { input: { connectionId: string; content: string } }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.sendMessage(args.input.connectionId, patient.id, args.input.content);
    },
    markPeerMessagesRead: async (_: any, args: { connectionId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.markMessagesRead(args.connectionId, patient.id);
    },
    pauseConnection: async (_: any, args: { connectionId: string; reason?: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.updateConnectionStatus(args.connectionId, patient.id, 'pause', args.reason);
    },
    resumeConnection: async (_: any, args: { connectionId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.updateConnectionStatus(args.connectionId, patient.id, 'resume');
    },
    completeConnection: async (_: any, args: { connectionId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.updateConnectionStatus(args.connectionId, patient.id, 'complete');
    },
    endConnection: async (_: any, args: { connectionId: string; reason?: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.updateConnectionStatus(args.connectionId, patient.id, 'end', args.reason);
    },
    submitConnectionFeedback: async (_: any, args: { connectionId: string; rating: number; comment?: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.submitConnectionFeedback(args.connectionId, patient.id, { rating: args.rating, comment: args.comment });
    },
    reportPeerConcern: async (_: any, args: { connectionId: string; concernType: string; description: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.reportConcern(args.connectionId, patient.id, { concernType: args.concernType, description: args.description });
    },
  },
  PeerConnection: {
    createdAt: (parent: any) => parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt,
    pausedAt: (parent: any) => parent.pausedAt instanceof Date ? parent.pausedAt.toISOString() : parent.pausedAt ?? null,
    completedAt: (parent: any) => parent.completedAt instanceof Date ? parent.completedAt.toISOString() : parent.completedAt ?? null,
    endedAt: (parent: any) => parent.endedAt instanceof Date ? parent.endedAt.toISOString() : parent.endedAt ?? null,
  },
  PeerMentorProfile: {
    createdAt: (parent: any) => parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt,
    verifiedAt: (parent: any) => parent.verifiedAt instanceof Date ? parent.verifiedAt.toISOString() : parent.verifiedAt ?? null,
  },
};
