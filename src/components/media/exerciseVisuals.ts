import type { VisualAssetIconName } from './VisualAsset';

export function muscleGroupIcon(muscleGroup: string): VisualAssetIconName {
  const group = muscleGroup.toLowerCase();

  if (group.includes('upper back') || group.includes('mid back')) {
    return 'human-handsup';
  }
  if (group.includes('core') || group.includes('lower back')) {
    return 'yoga';
  }
  if (group.includes('hamstring')) {
    return 'run-fast';
  }
  if (group.includes('hip flexor')) {
    return 'human-handsup';
  }
  if (group.includes('inner thigh') || group.includes('outer thigh')) {
    return 'human-female';
  }
  if (
    group.includes('glute') ||
    group.includes('quad') ||
    group.includes('thigh') ||
    group.includes('hip')
  ) {
    return 'walk';
  }
  if (group.includes('shoulder') || group.includes('arm')) {
    return 'arm-flex-outline';
  }
  if (group.includes('full')) {
    return 'human';
  }

  return 'dumbbell';
}
