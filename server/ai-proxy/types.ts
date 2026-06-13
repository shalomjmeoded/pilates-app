export type AiFeature =
  | 'meal_text_estimate'
  | 'meal_photo_estimate'
  | 'weekly_coach'
  | 'exercise_substitution'
  | 'workout_change_suggestion'
  | 'physique_assessment';

export interface AiRouteRequest {
  deviceInstallId: string;
  isPremium: boolean;
  payload: Record<string, unknown>;
}

export interface AiProxySuccessResponse {
  ok: true;
  feature: AiFeature;
  data: unknown;
  quotaRemaining?: number;
}

export interface AiProxyErrorResponse {
  ok: false;
  error: string;
  code:
    | 'UNAUTHORIZED'
    | 'RATE_LIMITED'
    | 'COOLDOWN'
    | 'SPAM_BLOCKED'
    | 'PAYLOAD_TOO_LARGE'
    | 'IMAGE_TOO_LARGE'
    | 'INVALID_REQUEST'
    | 'UPSTREAM_ERROR'
    | 'NOT_CONFIGURED';
}

export type AiProxyResponse = AiProxySuccessResponse | AiProxyErrorResponse;

/** @deprecated Use AiRouteRequest — feature is derived from the route path. */
export interface AiProxyRequest extends AiRouteRequest {
  feature: AiFeature;
}
