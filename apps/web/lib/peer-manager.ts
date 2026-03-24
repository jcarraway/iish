import { prisma } from './db';

// ============================================================================
// Types
// ============================================================================

export interface PeerMatchResult {
  mentorProfileId: string;
  matchScore: number;
  matchReasons: string[];
  summary: {
    displayName: string;
    ageRange: string;
    diagnosisType: string;
    treatmentPhase: string;
    bio: string | null;
    comfortableDiscussing: string[];
    totalMenteesSupported: number;
    averageRating: number | null;
  };
}

export interface MentorTrainingModule {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt: string | null;
}

export interface SendMessageResult {
  message: {
    id: string;
    connectionId: string;
    senderPatientId: string;
    content: string;
    sentAt: string;
    readAt: string | null;
    isOwnMessage: boolean;
  };
  crisisAlert: CrisisAlert | null;
}

export interface CrisisAlert {
  detected: boolean;
  message: string;
  resources: CrisisResource[];
}

export interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  available: string;
}

export interface MentorStats {
  totalMenteesSupported: number;
  activeConnections: number;
  averageRating: number | null;
  totalMessages: number;
  modulesCompleted: number;
}

// ============================================================================
// Constants — Training Modules
// ============================================================================

const MENTOR_TRAINING_MODULES: Omit<MentorTrainingModule, 'completed' | 'completedAt'>[] = [
  {
    id: 'boundaries',
    title: 'Setting Healthy Boundaries',
    description: 'Learn how to maintain boundaries that protect both you and your mentee. Covers when to say no, managing emotional energy, and recognizing compassion fatigue.',
    estimatedMinutes: 15,
  },
  {
    id: 'listening',
    title: 'Active Listening Skills',
    description: 'Practice reflective listening, validating emotions, and asking open-ended questions. Focus on being present without trying to fix everything.',
    estimatedMinutes: 20,
  },
  {
    id: 'medical_advice',
    title: 'Avoiding Medical Advice',
    description: 'Understand the critical difference between sharing your experience and giving medical advice. Learn phrases that keep conversations supportive without crossing into clinical territory.',
    estimatedMinutes: 10,
  },
  {
    id: 'escalation',
    title: 'When to Escalate',
    description: 'Recognize signs of crisis, suicidal ideation, or medical emergencies. Learn the escalation protocol and how to connect your mentee with professional resources.',
    estimatedMinutes: 15,
  },
  {
    id: 'self_care',
    title: 'Mentor Self-Care',
    description: 'Strategies for protecting your own wellbeing while supporting others. Recognize secondary trauma and know when to take a break.',
    estimatedMinutes: 10,
  },
  {
    id: 'diversity',
    title: 'Cultural Sensitivity & Inclusion',
    description: 'Supporting mentees from different backgrounds, cultures, and life situations. Avoiding assumptions and creating a welcoming space for everyone.',
    estimatedMinutes: 15,
  },
];

// ============================================================================
// Constants — Matching
// ============================================================================

const SUBTYPE_GROUPS: Record<string, string[]> = {
  tnbc: ['tnbc', 'triple_negative'],
  her2_positive: ['her2_positive', 'her2_enriched'],
  hr_positive: ['hr_positive', 'luminal_a', 'luminal_b', 'hr_positive_her2_negative'],
  hr_positive_her2_positive: ['hr_positive_her2_positive', 'hr_negative_her2_positive'],
};

const TREATMENT_FAMILIES: Record<string, string> = {
  'ac-t': 'anthracycline',
  'ac': 'anthracycline',
  'tc': 'taxane',
  'tch': 'taxane_her2',
  'tchp': 'taxane_her2',
  'fec-d': 'anthracycline',
  'dose-dense ac-t': 'anthracycline',
  'cmt': 'methotrexate',
  'cmf': 'methotrexate',
  'trastuzumab': 'her2_targeted',
  'pertuzumab': 'her2_targeted',
  'tdm1': 'her2_targeted',
  't-dxd': 'her2_targeted',
  'tamoxifen': 'endocrine',
  'letrozole': 'endocrine',
  'anastrozole': 'endocrine',
  'exemestane': 'endocrine',
  'palbociclib': 'cdk_inhibitor',
  'ribociclib': 'cdk_inhibitor',
  'abemaciclib': 'cdk_inhibitor',
  'olaparib': 'parp_inhibitor',
  'talazoparib': 'parp_inhibitor',
  'pembrolizumab': 'immunotherapy',
  'atezolizumab': 'immunotherapy',
};

const STAGE_NUMBERS: Record<string, number> = {
  '0': 0, 'I': 1, 'IA': 1, 'IB': 1,
  'II': 2, 'IIA': 2, 'IIB': 2,
  'III': 3, 'IIIA': 3, 'IIIB': 3, 'IIIC': 3,
  'IV': 4, 'IVA': 4, 'IVB': 4,
};

const COMFORT_TOPIC_OPTIONS = [
  'diagnosis_shock', 'treatment_decisions', 'side_effects', 'body_image',
  'relationships', 'fertility', 'financial_stress', 'work_career',
  'fear_of_recurrence', 'survivorship', 'end_of_life', 'clinical_trials',
  'alternative_therapies', 'mental_health', 'family_impact', 'sexuality',
];

// ============================================================================
// Constants — Crisis Safety
// ============================================================================

const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'no reason to live', 'better off dead', 'ending it', 'self-harm',
  'hurt myself', 'overdose', 'can\'t go on',
];

const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    description: 'Free, confidential support for people in distress. Available 24/7.',
    available: '24/7',
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free crisis counseling via text message.',
    available: '24/7',
  },
  {
    name: 'Cancer Support Helpline',
    phone: '1-888-793-9355',
    description: 'CancerCare professional oncology social workers.',
    available: 'Mon-Fri 9am-7pm ET',
  },
];

// ============================================================================
// PM1 — Functions 1-10: Enrollment, Matching, Connections
// ============================================================================

// 1. enrollAsMentor
export async function enrollAsMentor(
  patientId: string,
  input: { bio?: string; maxMentees?: number; availableHours?: string; communicationPreference?: string; comfortableDiscussing?: string[]; notComfortableWith?: string[] },
) {
  // Verify patient exists and has completed treatment (has survivorship plan)
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { survivorshipPlan: true, peerMentorProfile: true },
  });
  if (!patient) throw new Error('Patient not found');
  if (patient.peerMentorProfile) throw new Error('Already enrolled as mentor');

  const profile = await prisma.peerMentorProfile.create({
    data: {
      patientId,
      bio: input.bio ?? null,
      maxMentees: input.maxMentees ?? 3,
      availableHours: input.availableHours ?? null,
      communicationPreference: input.communicationPreference ?? null,
      comfortableDiscussing: input.comfortableDiscussing ?? [],
      notComfortableWith: input.notComfortableWith ?? [],
      // Auto-verify if patient has survivorship plan (completed treatment)
      verifiedAt: patient.survivorshipPlan ? new Date() : null,
    },
  });

  return profile;
}

// 2. getMentorProfile
export async function getMentorProfile(patientId: string) {
  return prisma.peerMentorProfile.findUnique({
    where: { patientId },
    include: { trainingProgress: true },
  });
}

// 3. updateMentorProfile
export async function updateMentorProfile(
  patientId: string,
  updates: { bio?: string; maxMentees?: number; availableHours?: string; communicationPreference?: string; comfortableDiscussing?: string[]; notComfortableWith?: string[] },
) {
  return prisma.peerMentorProfile.update({
    where: { patientId },
    data: updates,
  });
}

// 4. findMatches
export async function findMatches(patientId: string): Promise<PeerMatchResult[]> {
  const seeker = await prisma.patient.findUnique({
    where: { id: patientId },
  });
  if (!seeker) throw new Error('Patient not found');
  const seekerProfile = seeker.profile as any;
  if (!seekerProfile?.cancerType) throw new Error('Patient profile missing cancer type');

  // Find eligible mentors: trained, verified, active status, not the seeker themselves
  const mentorProfiles = await prisma.peerMentorProfile.findMany({
    where: {
      isTrained: true,
      verifiedAt: { not: null },
      status: 'enrolled',
      patientId: { not: patientId },
    },
    include: {
      patient: true,
      connections: {
        where: { status: 'active' },
      },
    },
  });

  // Filter out mentors at max capacity
  const available = mentorProfiles.filter(
    mp => mp.connections.length < mp.maxMentees,
  );

  // Score each mentor
  const scored = available.map(mp => {
    const mentorProfile = mp.patient.profile as any;
    const { score, reasons } = calculatePeerMatchScore(seekerProfile, mentorProfile, mp);
    return {
      mentorProfileId: mp.id,
      matchScore: score,
      matchReasons: reasons,
      mentorProfile: mp,
      patientProfile: mentorProfile,
    };
  });

  // Sort by score descending, take top 5
  scored.sort((a, b) => b.matchScore - a.matchScore);
  const top = scored.slice(0, 5).filter(s => s.matchScore > 0);

  return top.map(s => ({
    mentorProfileId: s.mentorProfileId,
    matchScore: s.matchScore,
    matchReasons: s.matchReasons,
    summary: generateMatchSummary(s.mentorProfile, s.patientProfile, s.matchReasons),
  }));
}

// 5. calculatePeerMatchScore (private)
function calculatePeerMatchScore(
  seekerProfile: any,
  mentorPatientProfile: any,
  mentorProfile: any,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Cancer type match (required — return 0 if no match)
  const seekerCancer = (seekerProfile.cancerType || '').toLowerCase();
  const mentorCancer = (mentorPatientProfile?.cancerType || '').toLowerCase();
  if (seekerCancer !== mentorCancer) {
    return { score: 0, reasons: [] };
  }
  reasons.push('Same cancer type');

  // Subtype match (+30)
  const seekerSubtype = (seekerProfile.subtype || '').toLowerCase();
  const mentorSubtype = (mentorPatientProfile?.subtype || '').toLowerCase();
  if (seekerSubtype && mentorSubtype) {
    if (seekerSubtype === mentorSubtype) {
      score += 30;
      reasons.push('Same subtype');
    } else {
      // Check fuzzy group match
      const seekerGroup = Object.entries(SUBTYPE_GROUPS).find(([, v]) => v.includes(seekerSubtype))?.[0];
      const mentorGroup = Object.entries(SUBTYPE_GROUPS).find(([, v]) => v.includes(mentorSubtype))?.[0];
      if (seekerGroup && seekerGroup === mentorGroup) {
        score += 20;
        reasons.push('Similar subtype');
      }
    }
  }

  // Stage proximity (+20)
  const seekerStage = STAGE_NUMBERS[seekerProfile.stage] ?? -1;
  const mentorStage = STAGE_NUMBERS[mentorPatientProfile?.stage] ?? -1;
  if (seekerStage >= 0 && mentorStage >= 0) {
    const diff = Math.abs(seekerStage - mentorStage);
    if (diff === 0) {
      score += 20;
      reasons.push('Same stage');
    } else if (diff === 1) {
      score += 10;
      reasons.push('Similar stage');
    }
  }

  // Treatment regimen family (+25)
  const seekerRegimens = extractRegimens(seekerProfile);
  const mentorRegimens = extractRegimens(mentorPatientProfile);
  const seekerFamilies = new Set(seekerRegimens.map(r => TREATMENT_FAMILIES[r.toLowerCase()]).filter(Boolean));
  const mentorFamilies = new Set(mentorRegimens.map(r => TREATMENT_FAMILIES[r.toLowerCase()]).filter(Boolean));
  const familyOverlap = [...seekerFamilies].filter(f => mentorFamilies.has(f));
  if (familyOverlap.length > 0) {
    score += 25;
    reasons.push('Similar treatment experience');
  }

  // Age proximity (+15)
  const seekerAge = seekerProfile.age || seekerProfile.dateOfBirth ? calculateAge(seekerProfile.dateOfBirth) : null;
  const mentorAge = mentorPatientProfile?.age || mentorPatientProfile?.dateOfBirth ? calculateAge(mentorPatientProfile.dateOfBirth) : null;
  if (seekerAge && mentorAge) {
    const ageDiff = Math.abs(seekerAge - mentorAge);
    if (ageDiff <= 5) {
      score += 15;
      reasons.push('Close in age');
    } else if (ageDiff <= 10) {
      score += 8;
      reasons.push('Similar age range');
    }
  }

  // Phase offset bonus (+20): mentor should be ahead
  // If mentor has survivorship plan, they're further along
  if (mentorProfile.verifiedAt) {
    score += 20;
    reasons.push('Mentor has completed treatment');
  }

  // Comfort topic affinity (bonus up to +10)
  if (mentorProfile.comfortableDiscussing?.length > 0) {
    score += Math.min(mentorProfile.comfortableDiscussing.length * 2, 10);
  }

  return { score, reasons };
}

// 6. generateMatchSummary (private)
function generateMatchSummary(
  mentorProfile: any,
  patientProfile: any,
  reasons: string[],
): PeerMatchResult['summary'] {
  const age = patientProfile?.age || (patientProfile?.dateOfBirth ? calculateAge(patientProfile.dateOfBirth) : null);
  let ageRange = 'Age not shared';
  if (age) {
    const decade = Math.floor(age / 10) * 10;
    ageRange = age < 30 ? 'Late 20s' : `${decade === age ? 'Early' : age % 10 >= 5 ? 'Late' : 'Mid'} ${decade}s`;
  }

  // Privacy-preserving name: first name + last initial
  const fullName = patientProfile?.name || 'Anonymous';
  const parts = fullName.split(' ');
  const displayName = parts.length > 1
    ? `${parts[0]} ${parts[parts.length - 1][0]}.`
    : parts[0];

  return {
    displayName,
    ageRange,
    diagnosisType: patientProfile?.cancerType || 'Breast cancer',
    treatmentPhase: mentorProfile.verifiedAt ? 'Completed treatment' : 'In treatment',
    bio: mentorProfile.bio,
    comfortableDiscussing: mentorProfile.comfortableDiscussing || [],
    totalMenteesSupported: mentorProfile.totalMenteesSupported || 0,
    averageRating: mentorProfile.averageRating,
  };
}

// 7. proposeConnection
export async function proposeConnection(menteeId: string, mentorProfileId: string) {
  // Verify mentor profile exists and is available
  const mentorProfile = await prisma.peerMentorProfile.findUnique({
    where: { id: mentorProfileId },
    include: { connections: { where: { status: 'active' } } },
  });
  if (!mentorProfile) throw new Error('Mentor profile not found');
  if (mentorProfile.connections.length >= mentorProfile.maxMentees) {
    throw new Error('Mentor is at capacity');
  }

  // Check no existing active/proposed connection between these two
  const existing = await prisma.peerConnection.findFirst({
    where: {
      mentorProfileId,
      menteePatientId: menteeId,
      status: { in: ['proposed', 'mentor_accepted', 'active'] },
    },
  });
  if (existing) throw new Error('Connection already exists');

  // Calculate match score
  const mentee = await prisma.patient.findUnique({ where: { id: menteeId } });
  const mentor = await prisma.patient.findUnique({ where: { id: mentorProfile.patientId } });
  const seekerProfile = mentee?.profile as any;
  const mentorPatientProfile = mentor?.profile as any;

  let matchScore = 50;
  let matchReasons = ['Manually selected'];
  if (seekerProfile && mentorPatientProfile) {
    const result = calculatePeerMatchScore(seekerProfile, mentorPatientProfile, mentorProfile);
    if (result.score > 0) {
      matchScore = result.score;
      matchReasons = result.reasons;
    }
  }

  return prisma.peerConnection.create({
    data: {
      mentorProfileId,
      menteePatientId: menteeId,
      matchScore,
      matchReasons,
      status: 'proposed',
    },
    include: {
      mentorProfile: { include: { patient: true } },
      menteePatient: true,
    },
  });
}

// 8. respondToConnection
export async function respondToConnection(
  connectionId: string,
  patientId: string,
  accept: boolean,
) {
  const connection = await prisma.peerConnection.findUnique({
    where: { id: connectionId },
    include: { mentorProfile: true },
  });
  if (!connection) throw new Error('Connection not found');

  // Verify the responder is the mentor
  if (connection.mentorProfile.patientId !== patientId) {
    throw new Error('Only the mentor can respond to connection requests');
  }
  if (connection.status !== 'proposed') {
    throw new Error('Connection is not in proposed state');
  }

  if (!accept) {
    return prisma.peerConnection.update({
      where: { id: connectionId },
      data: { status: 'ended', endedAt: new Date() },
      include: { mentorProfile: { include: { patient: true } }, menteePatient: true },
    });
  }

  // Accept — activate the connection
  return prisma.peerConnection.update({
    where: { id: connectionId },
    data: { status: 'active' },
    include: { mentorProfile: { include: { patient: true } }, menteePatient: true },
  });
}

// 9. getConnections
export async function getConnections(patientId: string) {
  // Get connections where patient is either the mentor or the mentee
  const mentorProfile = await prisma.peerMentorProfile.findUnique({
    where: { patientId },
  });

  const [asMentee, asMentor] = await Promise.all([
    prisma.peerConnection.findMany({
      where: { menteePatientId: patientId },
      include: { mentorProfile: { include: { patient: true } }, menteePatient: true },
      orderBy: { createdAt: 'desc' },
    }),
    mentorProfile
      ? prisma.peerConnection.findMany({
          where: { mentorProfileId: mentorProfile.id },
          include: { mentorProfile: { include: { patient: true } }, menteePatient: true },
          orderBy: { createdAt: 'desc' },
        })
      : [],
  ]);

  return [...asMentee, ...asMentor].map(c => ({
    ...c,
    role: c.menteePatientId === patientId ? 'mentee' : 'mentor',
  }));
}

// 10. getConnection
export async function getConnection(connectionId: string, patientId: string) {
  const connection = await prisma.peerConnection.findUnique({
    where: { id: connectionId },
    include: {
      mentorProfile: { include: { patient: true } },
      menteePatient: true,
    },
  });
  if (!connection) return null;

  // Auth check: must be mentor or mentee
  const isMentee = connection.menteePatientId === patientId;
  const isMentor = connection.mentorProfile.patientId === patientId;
  if (!isMentee && !isMentor) return null;

  return {
    ...connection,
    role: isMentee ? 'mentee' : 'mentor',
  };
}

// ============================================================================
// PM2 — Functions 11-20: Training, Messaging, Safety
// ============================================================================

// 11. getTrainingModules
export async function getTrainingModules(patientId: string): Promise<MentorTrainingModule[]> {
  const profile = await prisma.peerMentorProfile.findUnique({
    where: { patientId },
    include: { trainingProgress: true },
  });
  if (!profile) throw new Error('Not enrolled as mentor');

  const completed = new Map(
    profile.trainingProgress.map(tp => [tp.moduleId, tp.completedAt]),
  );

  return MENTOR_TRAINING_MODULES.map(m => ({
    ...m,
    completed: completed.has(m.id),
    completedAt: completed.get(m.id)?.toISOString() ?? null,
  }));
}

// 12. completeTrainingModule
export async function completeTrainingModule(patientId: string, moduleId: string) {
  const profile = await prisma.peerMentorProfile.findUnique({
    where: { patientId },
    include: { trainingProgress: true },
  });
  if (!profile) throw new Error('Not enrolled as mentor');

  const validModule = MENTOR_TRAINING_MODULES.find(m => m.id === moduleId);
  if (!validModule) throw new Error('Invalid module ID');

  // Upsert to handle duplicate completions gracefully
  await prisma.mentorTrainingProgress.upsert({
    where: {
      mentorProfileId_moduleId: { mentorProfileId: profile.id, moduleId },
    },
    create: { mentorProfileId: profile.id, moduleId },
    update: {},
  });

  // Check if all modules are now complete
  const progress = await prisma.mentorTrainingProgress.findMany({
    where: { mentorProfileId: profile.id },
  });

  const allComplete = MENTOR_TRAINING_MODULES.every(
    m => progress.some(p => p.moduleId === m.id),
  );

  if (allComplete && !profile.isTrained) {
    await prisma.peerMentorProfile.update({
      where: { id: profile.id },
      data: { isTrained: true },
    });
  }

  return { moduleId, completed: true, allComplete };
}

// 13. sendMessage
export async function sendMessage(
  connectionId: string,
  senderPatientId: string,
  content: string,
): Promise<SendMessageResult> {
  const connection = await prisma.peerConnection.findUnique({
    where: { id: connectionId },
    include: { mentorProfile: true },
  });
  if (!connection) throw new Error('Connection not found');
  if (connection.status !== 'active') throw new Error('Connection is not active');

  // Auth check: sender must be mentor or mentee
  const isMentee = connection.menteePatientId === senderPatientId;
  const isMentor = connection.mentorProfile.patientId === senderPatientId;
  if (!isMentee && !isMentor) throw new Error('Not authorized to send messages in this connection');

  // Check for crisis keywords
  const crisis = checkCrisisKeywords(content);

  const message = await prisma.peerMessage.create({
    data: {
      connectionId,
      senderPatientId,
      content,
      flagged: crisis.detected,
      flagReason: crisis.detected ? 'crisis_keywords' : null,
    },
  });

  // If crisis detected, also flag the connection
  if (crisis.detected) {
    await prisma.peerConnection.update({
      where: { id: connectionId },
      data: { safetyFlag: true, safetyNotes: 'Crisis keywords detected in message' },
    });
  }

  return {
    message: {
      id: message.id,
      connectionId: message.connectionId,
      senderPatientId: message.senderPatientId,
      content: message.content,
      sentAt: message.sentAt.toISOString(),
      readAt: null,
      isOwnMessage: true,
    },
    crisisAlert: crisis.detected ? crisis : null,
  };
}

// 14. getMessages
export async function getMessages(
  connectionId: string,
  patientId: string,
  limit = 50,
  before?: string,
) {
  const connection = await prisma.peerConnection.findUnique({
    where: { id: connectionId },
    include: { mentorProfile: true },
  });
  if (!connection) throw new Error('Connection not found');

  // Auth check
  const isMentee = connection.menteePatientId === patientId;
  const isMentor = connection.mentorProfile.patientId === patientId;
  if (!isMentee && !isMentor) throw new Error('Not authorized');

  const messages = await prisma.peerMessage.findMany({
    where: {
      connectionId,
      ...(before ? { sentAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });

  return messages.reverse().map(m => ({
    id: m.id,
    connectionId: m.connectionId,
    senderPatientId: m.senderPatientId,
    content: m.content,
    sentAt: m.sentAt.toISOString(),
    readAt: m.readAt?.toISOString() ?? null,
    isOwnMessage: m.senderPatientId === patientId,
    flagged: m.flagged,
  }));
}

// 15. markMessagesRead
export async function markMessagesRead(connectionId: string, patientId: string) {
  const connection = await prisma.peerConnection.findUnique({
    where: { id: connectionId },
    include: { mentorProfile: true },
  });
  if (!connection) throw new Error('Connection not found');

  // Auth check
  const isMentee = connection.menteePatientId === patientId;
  const isMentor = connection.mentorProfile.patientId === patientId;
  if (!isMentee && !isMentor) throw new Error('Not authorized');

  // Mark all messages NOT sent by this user as read
  await prisma.peerMessage.updateMany({
    where: {
      connectionId,
      senderPatientId: { not: patientId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return true;
}

// 16. updateConnectionStatus
export async function updateConnectionStatus(
  connectionId: string,
  patientId: string,
  action: 'pause' | 'resume' | 'complete' | 'end',
  reason?: string,
) {
  const connection = await prisma.peerConnection.findUnique({
    where: { id: connectionId },
    include: { mentorProfile: true },
  });
  if (!connection) throw new Error('Connection not found');

  // Auth check
  const isMentee = connection.menteePatientId === patientId;
  const isMentor = connection.mentorProfile.patientId === patientId;
  if (!isMentee && !isMentor) throw new Error('Not authorized');

  // State machine validation
  const transitions: Record<string, string[]> = {
    active: ['paused', 'completed', 'ended'],
    paused: ['active', 'ended'],
  };

  const targetStatus = {
    pause: 'paused',
    resume: 'active',
    complete: 'completed',
    end: 'ended',
  }[action];

  const allowed = transitions[connection.status];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new Error(`Cannot ${action} a connection in ${connection.status} state`);
  }

  const updateData: any = { status: targetStatus };
  if (action === 'pause') updateData.pausedAt = new Date();
  if (action === 'complete') {
    updateData.completedAt = new Date();
    // Increment mentor's totalMenteesSupported
    await prisma.peerMentorProfile.update({
      where: { id: connection.mentorProfileId },
      data: { totalMenteesSupported: { increment: 1 } },
    });
  }
  if (action === 'end') updateData.endedAt = new Date();

  return prisma.peerConnection.update({
    where: { id: connectionId },
    data: updateData,
    include: { mentorProfile: { include: { patient: true } }, menteePatient: true },
  });
}

// 17. reportConcern
export async function reportConcern(
  connectionId: string,
  reporterId: string,
  input: { concernType: string; description: string },
) {
  const connection = await prisma.peerConnection.findUnique({
    where: { id: connectionId },
    include: { mentorProfile: true },
  });
  if (!connection) throw new Error('Connection not found');

  // Auth check
  const isMentee = connection.menteePatientId === reporterId;
  const isMentor = connection.mentorProfile.patientId === reporterId;
  if (!isMentee && !isMentor) throw new Error('Not authorized');

  return prisma.peerConnection.update({
    where: { id: connectionId },
    data: {
      safetyFlag: true,
      concernType: input.concernType,
      concernDescription: input.description,
      safetyNotes: `Reported by ${isMentor ? 'mentor' : 'mentee'}: ${input.concernType}`,
    },
    include: { mentorProfile: { include: { patient: true } }, menteePatient: true },
  });
}

// 18. checkCrisisKeywords (private)
function checkCrisisKeywords(content: string): CrisisAlert {
  const lower = content.toLowerCase();
  const detected = CRISIS_KEYWORDS.some(kw => lower.includes(kw));
  return {
    detected,
    message: detected
      ? 'We noticed some language that suggests you may be going through a very difficult time. You are not alone. Please consider reaching out to one of these resources.'
      : '',
    resources: detected ? CRISIS_RESOURCES : [],
  };
}

// 19. submitConnectionFeedback
export async function submitConnectionFeedback(
  connectionId: string,
  patientId: string,
  input: { rating: number; comment?: string },
) {
  const connection = await prisma.peerConnection.findUnique({
    where: { id: connectionId },
    include: { mentorProfile: true },
  });
  if (!connection) throw new Error('Connection not found');

  const isMentee = connection.menteePatientId === patientId;
  const isMentor = connection.mentorProfile.patientId === patientId;
  if (!isMentee && !isMentor) throw new Error('Not authorized');

  const updateData: any = {
    feedbackComment: input.comment ?? null,
  };

  if (isMentee) {
    // Mentee rates the mentor
    updateData.mentorRating = input.rating;
  } else {
    // Mentor rates the mentee
    updateData.menteeRating = input.rating;
  }

  const updated = await prisma.peerConnection.update({
    where: { id: connectionId },
    data: updateData,
    include: { mentorProfile: { include: { patient: true } }, menteePatient: true },
  });

  // Recompute mentor's average rating if mentee submitted feedback
  if (isMentee) {
    const allConnections = await prisma.peerConnection.findMany({
      where: {
        mentorProfileId: connection.mentorProfileId,
        mentorRating: { not: null },
      },
      select: { mentorRating: true },
    });
    const ratings = allConnections.map(c => c.mentorRating!);
    const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    await prisma.peerMentorProfile.update({
      where: { id: connection.mentorProfileId },
      data: { averageRating: avg },
    });
  }

  return updated;
}

// 20. getMentorStats
export async function getMentorStats(patientId: string): Promise<MentorStats> {
  const profile = await prisma.peerMentorProfile.findUnique({
    where: { patientId },
    include: {
      connections: true,
      trainingProgress: true,
    },
  });
  if (!profile) throw new Error('Not enrolled as mentor');

  const activeConnections = profile.connections.filter(c => c.status === 'active').length;

  // Count total messages sent as mentor
  const totalMessages = await prisma.peerMessage.count({
    where: {
      senderPatientId: patientId,
      connection: { mentorProfileId: profile.id },
    },
  });

  return {
    totalMenteesSupported: profile.totalMenteesSupported,
    activeConnections,
    averageRating: profile.averageRating,
    totalMessages,
    modulesCompleted: profile.trainingProgress.length,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function extractRegimens(profile: any): string[] {
  if (!profile) return [];
  const regimens: string[] = [];
  if (profile.currentTreatment) regimens.push(profile.currentTreatment);
  if (profile.priorTreatments) {
    for (const t of profile.priorTreatments) {
      if (t.drugName) regimens.push(t.drugName);
      if (t.regimen) regimens.push(t.regimen);
    }
  }
  return regimens;
}

function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
}

export { COMFORT_TOPIC_OPTIONS, CRISIS_RESOURCES };
