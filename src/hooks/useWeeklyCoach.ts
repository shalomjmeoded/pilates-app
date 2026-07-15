import { useCallback, useState } from 'react';

import {
  generateWeeklyCoachInsight,
  getCachedWeeklyCoachInsight,
} from '@/services/coaching/weeklyCoachService';
import type { WeeklyCoachInsightContent } from '@/types/coaching';

export function useWeeklyCoach() {
  const [insight, setInsight] = useState<WeeklyCoachInsightContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cached = await getCachedWeeklyCoachInsight();
      // #region agent log
      fetch('http://127.0.0.1:7686/ingest/ee46ee9f-47bb-4280-943b-99e933d45b4f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1efa2d'},body:JSON.stringify({sessionId:'1efa2d',runId:'partner-audit',hypothesisId:'C1',location:'useWeeklyCoach.ts:load',message:'coach cache load',data:{hasCached:Boolean(cached),source:cached?.source??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setInsight(cached);
      return cached;
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Could not load weekly coach.';
      // #region agent log
      fetch('http://127.0.0.1:7686/ingest/ee46ee9f-47bb-4280-943b-99e933d45b4f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1efa2d'},body:JSON.stringify({sessionId:'1efa2d',runId:'partner-audit',hypothesisId:'C2',location:'useWeeklyCoach.ts:loadCatch',message:'coach load failed',data:{errorMessage:message},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const generated = await generateWeeklyCoachInsight({ notify: true });
      // #region agent log
      fetch('http://127.0.0.1:7686/ingest/ee46ee9f-47bb-4280-943b-99e933d45b4f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1efa2d'},body:JSON.stringify({sessionId:'1efa2d',runId:'partner-audit',hypothesisId:'C3',location:'useWeeklyCoach.ts:generateOk',message:'coach generate ok',data:{source:generated?.source??null,summaryLen:generated?.summary?.length??0},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setInsight(generated);
      return generated;
    } catch (generateError) {
      const message =
        generateError instanceof Error ? generateError.message : 'Could not generate weekly coach.';
      // #region agent log
      fetch('http://127.0.0.1:7686/ingest/ee46ee9f-47bb-4280-943b-99e933d45b4f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1efa2d'},body:JSON.stringify({sessionId:'1efa2d',runId:'partner-audit',hypothesisId:'C4',location:'useWeeklyCoach.ts:generateCatch',message:'coach generate failed',data:{errorMessage:message},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    insight,
    isLoading,
    error,
    load,
    generate,
  };
}
