import { saveOnboardingAnswers } from '@/db/repositories/onboardingRepository';
import { upsertNutritionTargets } from '@/db/repositories/nutritionRepository';
import { saveProfile } from '@/db/repositories/profileRepository';
import type { OnboardingDraft } from '@/stores/onboardingStore';
import type { Profile } from '@/types/profile';

interface CompleteOnboardingInput {
  profile: Profile;
  draft: OnboardingDraft;
}

export async function completeOnboarding({
  profile,
  draft,
}: CompleteOnboardingInput): Promise<void> {
  await saveProfile(profile);

  if (draft.baselinePlan) {
    await upsertNutritionTargets({
      ...draft.baselinePlan.macros,
      effectiveDate: draft.baselinePlan.macros.effectiveDate,
      isManualOverride: false,
    });
  }

  await saveOnboardingAnswers(
    JSON.stringify({
      ...draft,
      completedAt: new Date().toISOString(),
    }),
  );

}
