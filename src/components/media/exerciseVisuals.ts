import type { VisualAssetIconName } from './VisualAsset';

export function muscleGroupIcon(muscleGroup: string): VisualAssetIconName {
  const group = muscleGroup.toLowerCase();

  if (group.includes('core') || group.includes('back')) {
    return 'yoga';
  }
  if (
    group.includes('glute') ||
    group.includes('quad') ||
    group.includes('hamstring') ||
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
