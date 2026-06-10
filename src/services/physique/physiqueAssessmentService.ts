import {
  deletePhysiqueAssessment,
  getLatestPhysiqueAssessment,
  insertPhysiqueAssessment,
} from '@/db/repositories/physiqueAssessmentRepository';
import { applyPhysiqueAssessmentToPlans } from '@/services/physique/applyPhysiqueToPlan';
import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { buildStoredPhysiqueAssessment } from '@/engines/physique/physiqueAssessmentFlow';
import { aiFacade } from '@/services/ai';
import type { AiPhysiqueAssessment, PhysiqueAssessmentRequest } from '@/types/ai';
import type { StoredPhysiqueAssessment } from '@/types/physiqueAssessment';

export async function loadLatestPhysiqueAssessment(): Promise<StoredPhysiqueAssessment | null> {
  return getLatestPhysiqueAssessment();
}

export async function runPhysiqueAssessment(
  request: PhysiqueAssessmentRequest,
): Promise<AiPhysiqueAssessment> {
  const premium = await getPremiumStatus();
  if (!premium.isPremium) {
    throw new Error('Visual physique assessment requires Tune Premium.');
  }

  const profile = await getProfile();
  const ageYears =
    profile?.birthYear !== undefined
      ? Math.max(13, new Date().getFullYear() - profile.birthYear)
      : undefined;

  return aiFacade.assessPhysique({
    ...request,
    genderIdentity: profile?.genderIdentity,
    ageYears,
  });
}

export async function savePhysiqueAssessment(input: {
  assessment: AiPhysiqueAssessment;
  disclaimerAcceptedAt: string;
  notes?: string;
}): Promise<StoredPhysiqueAssessment> {
  const stored = buildStoredPhysiqueAssessment(
    input.assessment,
    input.disclaimerAcceptedAt,
    input.notes,
  );
  const saved = await insertPhysiqueAssessment(stored);
  await applyPhysiqueAssessmentToPlans();
  return saved;
}

export async function removePhysiqueAssessment(id: string): Promise<void> {
  await deletePhysiqueAssessment(id);
  await applyPhysiqueAssessmentToPlans();
}
