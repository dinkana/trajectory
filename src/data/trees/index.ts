import type { SkillTree } from '@/types';
import { languageTrees } from './languages';
import { programmingTrees } from './programming';
import { mathTrees } from './math';
import { itCoreTrees } from './itCore';
import { aiDataTrees } from './aiData';
import { advancedTrees } from './advanced';

export const presetTrees: SkillTree[] = [
  ...programmingTrees,
  ...languageTrees,
  ...mathTrees,
  ...itCoreTrees,
  ...aiDataTrees,
  ...advancedTrees
];