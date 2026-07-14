/**
 * Demote stretch/yoga accessories to warmup and add classical + contemporary
 * Pilates mains across mat + props. Idempotent — safe to re-run.
 *
 * Usage: npx tsx scripts/reinforce-pilates-mains.ts
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Exercise, ExerciseEquipment } from '../src/types/exercise';
import { writeExerciseAssetManifest } from './lib/exerciseManifest';

const projectRoot = resolve(__dirname, '..');
const seedPath = resolve(projectRoot, 'assets/seed/exercises.json');
const youtubeMapPath = resolve(projectRoot, 'assets/seed/exerciseYoutubeMap.json');
const thumbnailDir = resolve(projectRoot, 'assets/exercises/thumbnails');
const gifDir = resolve(projectRoot, 'assets/exercises/gifs');

const PILATES_ANYTIME = 'Pilates Anytime';

/** Stretch / mobility accessories — keep in library but never as main work. */
const DEMOTE_TO_WARMUP = [
  'Childs_Pose',
  'Thread_the_Needle',
  'Mermaid_Stretch',
  'Ball_Spine_Stretch',
  'Reformer_Mermaid',
  'Magic_Circle_Chest_Opener',
  'Seated_Spine_Twist',
  'Mat_Spine_Twist',
  'Spine_Stretch_Forward',
  'Superman',
  'Cat_Cow',
] as const;

interface CuratedDraft {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  commonMistakes: string[];
  difficulty: Exercise['difficulty'];
  muscleGroup: Exercise['muscleGroup'];
  secondaryMuscles: Exercise['muscleGroup'][];
  equipment: ExerciseEquipment;
  sessionRole: Exercise['sessionRole'];
  repsBaseline: number | null;
  holdSeconds: number | null;
  caloriesFactor: number;
  donorId: string;
  youtubeVideoId: string;
  youtubeTitle: string;
  tags?: Exercise['tags'];
  categories?: Exercise['categories'];
}

const NEW_MAINS: CuratedDraft[] = [
  {
    id: 'Mat_Roll_Over',
    name: 'Roll Over',
    description: 'Classical mat Roll Over for spinal articulation and lower-abdominal control.',
    instructions: [
      'Lie supine with legs long and arms by your sides.',
      'Exhale and peel the hips up, rolling over until toes reach toward the floor behind you.',
      'Keep the neck soft and weight across the shoulders — not the head.',
      'Inhale to prepare, exhale to roll down vertebra by vertebra.',
    ],
    commonMistakes: ['Dumping into the neck', 'Using momentum to throw the legs', 'Collapsing the ribs'],
    difficulty: 'advanced',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors', 'lower back'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.5,
    donorId: 'Reverse_Crunch',
    youtubeVideoId: 'Y5YdoRMCCKM',
    youtubeTitle: 'The Roll Over',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core', 'bodyweight'],
  },
  {
    id: 'Mat_Single_Leg_Kick',
    name: 'Single Leg Kick',
    description: 'Prone Single Leg Kick for hamstrings, glutes, and upper-back extension.',
    instructions: [
      'Lie prone on your forearms with chest lifted and pubic bone heavy.',
      'Kick one heel twice toward the seat, then lengthen the leg long.',
      'Alternate legs with control; keep hips quiet on the mat.',
      'Maintain length through the crown and soft shoulders.',
    ],
    commonMistakes: ['Sagging in the low back', 'Rocking the pelvis', 'Shrugging the shoulders'],
    difficulty: 'intermediate',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'lower back'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Glute_Kickback',
    youtubeVideoId: 'X79gMUknrVs',
    youtubeTitle: 'One Leg Kick',
    tags: ['mat_pilates'],
    categories: ['pilates', 'glutes', 'bodyweight'],
  },
  {
    id: 'Mat_Double_Leg_Kick',
    name: 'Double Leg Kick',
    description: 'Classical Double Leg Kick combining hamstring work with thoracic extension.',
    instructions: [
      'Lie prone with hands stacked behind the back and one cheek on the mat.',
      'Kick both heels to the seat three times, then stretch arms long and lift the chest.',
      'Turn the other cheek to the mat as you lower.',
      'Keep the pubic bone anchored and neck long.',
    ],
    commonMistakes: ['Over-arching the lumbar spine', 'Lifting with the neck', 'Rushing the kicks'],
    difficulty: 'intermediate',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'upper back'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Pilates_Swan',
    youtubeVideoId: 'KAotX1bDGps',
    youtubeTitle: 'Swan Prep',
    tags: ['mat_pilates'],
    categories: ['pilates', 'posture', 'bodyweight'],
  },
  {
    id: 'Mat_Hip_Circles',
    name: 'Hip Circles',
    description: 'Seated Hip Circles for hip mobility with deep center support.',
    instructions: [
      'Balance on the sit bones with legs lifted in a V and hands lightly behind you.',
      'Circle both legs together without collapsing the low back.',
      'Reverse direction after equal reps.',
      'Keep the chest open and jaw soft.',
    ],
    commonMistakes: ['Rounding hard into the lumbar spine', 'Holding the breath', 'Using the hands to shove'],
    difficulty: 'advanced',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors', 'inner thighs'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.5,
    donorId: 'Open_Leg_Rocker',
    youtubeVideoId: 'E4FSgzPlUcs',
    youtubeTitle: 'Open Leg Rocker',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core', 'mobility'],
  },
  {
    id: 'Mat_Seal',
    name: 'Seal',
    description: 'Classical Seal for balance, spinal massage, and playful control.',
    instructions: [
      'Sit in a tucked ball, hold the ankles, and clap the feet three times.',
      'Roll back to the shoulders and clap again, then return to balance.',
      'Keep the chin slightly tucked and the roll smooth.',
      'Land quietly on the sit bones without collapsing.',
    ],
    commonMistakes: ['Rolling onto the neck', 'Losing the tuck', 'Using momentum only'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Mat_Rolling_Like_a_Ball',
    youtubeVideoId: 'elkcXFPyaW8',
    youtubeTitle: 'Rolling Like A Ball',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core', 'bodyweight'],
  },
  {
    id: 'Mat_Boomerang',
    name: 'Boomerang',
    description: 'Advanced classical Boomerang combining roll over, teaser, and arm circles.',
    instructions: [
      'Sit tall with ankles crossed and arms reaching long.',
      'Roll back over the shoulders, switch the cross of the ankles, then roll up to Teaser.',
      'Circle the arms and fold forward with control before repeating.',
      'Move as one continuous phrase — no dumping into the neck.',
    ],
    commonMistakes: ['Breaking the sequence into jerks', 'Collapsing the chest in Teaser', 'Neck strain on the roll'],
    difficulty: 'advanced',
    muscleGroup: 'full body',
    secondaryMuscles: ['core', 'hip flexors'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.55,
    donorId: 'Pilates_Teaser',
    youtubeVideoId: '9WFOlfrqWo8',
    youtubeTitle: 'The Teaser',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core', 'bodyweight'],
  },
  {
    id: 'Mat_Bicycle',
    name: 'Bicycle',
    description: 'Classical Bicycle for oblique control with long, precise leg reach.',
    instructions: [
      'Curl head and shoulders up with hands lightly supporting the skull.',
      'Reach one leg long while the other knee draws in; rotate opposite elbow toward the knee.',
      'Switch with control — no bouncing.',
      'Keep the low back supported and elbows wide.',
    ],
    commonMistakes: ['Pulling on the neck', 'Short chopping switches', 'Losing the curl'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 12,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Criss_Cross',
    youtubeVideoId: 'a2L7tfx8XbU',
    youtubeTitle: 'Criss Cross',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core', 'posture'],
  },
  {
    id: 'Mat_Kneeling_Side_Kick',
    name: 'Kneeling Side Kick',
    description: 'Kneeling Side Kick series for lateral hip strength and balance.',
    instructions: [
      'Kneel and lean onto one hand with the top leg long at hip height.',
      'Kick the top leg forward and back with a pointed or flexed foot as cued.',
      'Keep the waist long and hips stacked over the kneeling knee.',
      'Switch sides after equal work.',
    ],
    commonMistakes: ['Collapsing into the supporting shoulder', 'Swinging from the low back', 'Hiking the hip'],
    difficulty: 'intermediate',
    muscleGroup: 'glutes',
    secondaryMuscles: ['outer thighs', 'core'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Side_Kick',
    youtubeVideoId: 'hgLDMHCcw4k',
    youtubeTitle: 'Side Kick Kneeling',
    tags: ['mat_pilates'],
    categories: ['pilates', 'glutes', 'bodyweight'],
  },
  {
    id: 'Mat_Leg_Pull_Back',
    name: 'Leg Pull Back',
    description: 'Reverse plank Leg Pull for posterior chain and shoulder stability.',
    instructions: [
      'Sit with hands behind you and lift into a reverse plank.',
      'Kick one leg toward the ceiling without dropping the hips.',
      'Lower with control and alternate.',
      'Keep the chest open and neck long.',
    ],
    commonMistakes: ['Sagging hips', 'Shrugging shoulders', 'Locking the elbows harshly'],
    difficulty: 'advanced',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings', 'shoulders', 'core'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.5,
    donorId: 'Mat_Leg_Pull_Front',
    youtubeVideoId: 'fLYsUbi_f-A',
    youtubeTitle: 'Leg Pull Front',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'glutes', 'bodyweight'],
  },
  {
    id: 'Mat_Teaser_Prep',
    name: 'Teaser Prep',
    description: 'Beginner-friendly Teaser progression with bent knees and supported roll.',
    instructions: [
      'Lie supine with knees bent and arms reaching to the ceiling.',
      'Exhale and roll up to a balanced V with shins parallel to the floor.',
      'Hold briefly, then roll down with control.',
      'Keep the gaze between the knees and the low back supported.',
    ],
    commonMistakes: ['Yanking with the hip flexors', 'Rounding the upper back hard', 'Holding the breath'],
    difficulty: 'beginner',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Pilates_Teaser',
    youtubeVideoId: '9WFOlfrqWo8',
    youtubeTitle: 'The Teaser',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core', 'bodyweight'],
  },
  {
    id: 'Mat_Swan_Dive',
    name: 'Swan Dive',
    description: 'Dynamic Swan Dive for spinal extension strength and control.',
    instructions: [
      'Start in Swan with hands under shoulders and legs long.',
      'Rock forward onto the chest as the legs lift, then rock back lifting the chest.',
      'Keep the glutes lightly engaged and neck in line with the spine.',
      'Reduce range if the low back pinches.',
    ],
    commonMistakes: ['Compressing the lumbar spine', 'Leading with the chin', 'Floppy legs'],
    difficulty: 'advanced',
    muscleGroup: 'lower back',
    secondaryMuscles: ['glutes', 'upper back'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.5,
    donorId: 'Pilates_Swan',
    youtubeVideoId: 'mjZZ22GLcDc',
    youtubeTitle: 'Swan Dive',
    tags: ['mat_pilates'],
    categories: ['pilates', 'posture', 'bodyweight'],
  },
  {
    id: 'Magic_Circle_Bridge_Squeeze',
    name: 'Magic Circle Bridge Squeeze',
    description: 'Shoulder bridge with magic-circle adduction for glutes and inner thighs.',
    instructions: [
      'Lie supine with the circle between the knees and feet grounded.',
      'Exhale to bridge up while lightly squeezing the circle.',
      'Hold at the top, then articulate down.',
      'Keep ribs soft and knees tracking over the mid-foot.',
    ],
    commonMistakes: ['Over-squeezing the jaw', 'Flaring the ribs', 'Pushing from the low back'],
    difficulty: 'beginner',
    muscleGroup: 'glutes',
    secondaryMuscles: ['inner thighs', 'core'],
    equipment: 'magic circle',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Pilates_Shoulder_Bridge',
    youtubeVideoId: 'QFv_Fex3Mko',
    youtubeTitle: 'Shoulder Bridge',
    tags: ['mat_pilates'],
    categories: ['pilates', 'glutes'],
  },
  {
    id: 'Magic_Circle_Standing_Press',
    name: 'Magic Circle Standing Press',
    description: 'Standing press-out with the magic circle for posture and shoulder stability.',
    instructions: [
      'Stand tall holding the circle at chest height.',
      'Exhale and press the pads outward or inward as cued without shrugging.',
      'Keep ribs stacked over the pelvis.',
      'Release halfway on the inhale.',
    ],
    commonMistakes: ['Hiking the shoulders', 'Locking the elbows', 'Arching the low back'],
    difficulty: 'beginner',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['upper back', 'arms'],
    equipment: 'magic circle',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.3,
    donorId: 'Magic_Circle_Arm_Press',
    youtubeVideoId: '1hQVdnxnfLk',
    youtubeTitle: 'Magic Circle',
    tags: ['mat_pilates'],
    categories: ['pilates', 'posture'],
  },
  {
    id: 'Band_Roll_Down',
    name: 'Band Roll-Down',
    description: 'Standing or seated roll-down assisted by a resistance band for spinal articulation.',
    instructions: [
      'Hold the band with light tension and begin standing or seated tall.',
      'Exhale and articulate the spine forward vertebra by vertebra.',
      'Inhale at the bottom, exhale to stack back up.',
      'Keep the band tension honest — not a yank.',
    ],
    commonMistakes: ['Rounding only at the waist', 'Pulling the band with the neck', 'Locking the knees'],
    difficulty: 'beginner',
    muscleGroup: 'core',
    secondaryMuscles: ['upper back', 'hamstrings'],
    equipment: 'resistance band',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.3,
    donorId: 'Mat_Half_Roll_Down',
    youtubeVideoId: 'H_-JE2yN1W0',
    youtubeTitle: 'The Roll Up',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core', 'resistance_band'],
  },
  {
    id: 'Band_Side_Lying_Kick',
    name: 'Band Side-Lying Kick',
    description: 'Side-lying kick series with light band resistance for outer hip control.',
    instructions: [
      'Loop the band around the thighs or ankles and lie on your side.',
      'Kick the top leg forward and back within the band’s tension.',
      'Keep hips stacked and waist long.',
      'Switch sides after equal reps.',
    ],
    commonMistakes: ['Rolling the top hip back', 'Using momentum', 'Hiking the shoulder'],
    difficulty: 'intermediate',
    muscleGroup: 'outer thighs',
    secondaryMuscles: ['glutes', 'core'],
    equipment: 'resistance band',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Band_Clamshell',
    youtubeVideoId: 'nG9JfDHJJlY',
    youtubeTitle: 'Side Kick',
    tags: ['mat_pilates'],
    categories: ['pilates', 'glutes', 'resistance_band'],
  },
  {
    id: 'Band_Hundred',
    name: 'Band Hundred',
    description: 'Hundred variation with light band resistance for deeper center work.',
    instructions: [
      'Hold the band lightly above the thighs in Hundred position.',
      'Pump the arms against the band’s tension for a five-count breath cycle.',
      'Keep the low back supported and neck soft.',
      'Lower with control when finished.',
    ],
    commonMistakes: ['Straining the neck', 'Over-pulling the band', 'Breath-holding'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['arms', 'hip flexors'],
    equipment: 'resistance band',
    sessionRole: 'main',
    repsBaseline: null,
    holdSeconds: 50,
    caloriesFactor: 0.5,
    donorId: 'Pilates_Hundred',
    youtubeVideoId: '9mlone4NObI',
    youtubeTitle: 'The Hundred',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core', 'resistance_band'],
  },
  {
    id: 'Ball_Pike',
    name: 'Ball Pike',
    description: 'Plank-to-pike on the pilates ball for deep core and shoulder stability.',
    instructions: [
      'Start in plank with shins or feet on the ball.',
      'Exhale and lift the hips into a pike without collapsing the shoulders.',
      'Return to plank with control.',
      'Keep the neck long and ribs knitted.',
    ],
    commonMistakes: ['Sagging through the low back', 'Shrugging', 'Rushing the pike'],
    difficulty: 'advanced',
    muscleGroup: 'core',
    secondaryMuscles: ['shoulders', 'hip flexors'],
    equipment: 'pilates ball',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.55,
    donorId: 'Ball_Roll_Out',
    youtubeVideoId: 'elkcXFPyaW8',
    youtubeTitle: 'Rolling Like A Ball',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core'],
  },
  {
    id: 'Ball_Hamstring_Curl',
    name: 'Ball Hamstring Curl',
    description: 'Supine hamstring curl with heels on the pilates ball.',
    instructions: [
      'Lie supine with heels on the ball and hips bridged.',
      'Exhale and draw the ball toward you by bending the knees.',
      'Extend the legs to return without dropping the hips.',
      'Keep ribs soft and glutes engaged.',
    ],
    commonMistakes: ['Collapsing the bridge', 'Using only the calves', 'Flaring the ribs'],
    difficulty: 'intermediate',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'core'],
    equipment: 'pilates ball',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Ball_Bridge',
    youtubeVideoId: 'QFv_Fex3Mko',
    youtubeTitle: 'Shoulder Bridge',
    tags: ['mat_pilates'],
    categories: ['pilates', 'glutes'],
  },
  {
    id: 'Ball_Plank',
    name: 'Ball Plank',
    description: 'Forearm or hand plank with forearms or hands on the pilates ball.',
    instructions: [
      'Place forearms or hands on the ball and step back to plank.',
      'Hold a long line from head to heels without sagging.',
      'Breathe steadily; reset if the low back dips.',
      'Keep shoulders broad and neck long.',
    ],
    commonMistakes: ['Dumping into the lumbar spine', 'Hiking the shoulders', 'Holding the breath'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['shoulders'],
    equipment: 'pilates ball',
    sessionRole: 'main',
    repsBaseline: null,
    holdSeconds: 30,
    caloriesFactor: 0.4,
    donorId: 'Plank',
    youtubeVideoId: 'fLYsUbi_f-A',
    youtubeTitle: 'Leg Pull Front',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core'],
  },
  {
    id: 'Light_Weight_Coordination',
    name: 'Light Weight Coordination',
    description: 'Supine coordination with light weights for arms and center connection.',
    instructions: [
      'Lie supine holding light weights, knees tabletop.',
      'Extend opposite arm and leg, then switch with control.',
      'Keep the low back supported and ribs soft.',
      'Move with the breath — no swinging the weights.',
    ],
    commonMistakes: ['Arching the low back', 'Rushing the switches', 'Shrugging the weights'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['arms', 'shoulders'],
    equipment: 'light weights',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Dead_Bug',
    youtubeVideoId: '3dYwRDMassE',
    youtubeTitle: 'Coordination',
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core'],
  },
  {
    id: 'Light_Weight_Standing_Side_Bend',
    name: 'Light Weight Standing Side Bend',
    description: 'Standing side bend with a light weight for lateral strength and length.',
    instructions: [
      'Stand tall holding one light weight in the bottom hand.',
      'Exhale and side-bend over the weighted side without collapsing forward.',
      'Reach the top arm overhead, then return to vertical.',
      'Keep both sit bones heavy and ribs stacked.',
    ],
    commonMistakes: ['Twisting forward', 'Hiking the opposite hip', 'Yank with the neck'],
    difficulty: 'beginner',
    muscleGroup: 'core',
    secondaryMuscles: ['shoulders', 'outer thighs'],
    equipment: 'light weights',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.3,
    donorId: 'Mat_Side_Bend',
    youtubeVideoId: 'zprsJDjeONM',
    youtubeTitle: 'Side Bend',
    tags: ['mat_pilates'],
    categories: ['pilates', 'core', 'posture'],
  },
  {
    id: 'Reformer_Knee_Stretches',
    name: 'Reformer Knee Stretches',
    description: 'Reformer Knee Stretches for deep abdominal connection and hip flexion control.',
    instructions: [
      'Kneel on the carriage with hands on the footbar and rounded spine.',
      'Exhale and draw the knees under while keeping the carriage control.',
      'Inhale to lengthen without dumping into the shoulders.',
      'Maintain a scooped center throughout.',
    ],
    commonMistakes: ['Losing the round back', 'Pushing from the arms only', 'Collapsing the wrists'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors', 'shoulders'],
    equipment: 'reformer',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.5,
    donorId: 'Reformer_Elephant',
    youtubeVideoId: 'q4aSiZC1yjo',
    youtubeTitle: 'Up Stretch Series',
    tags: ['reformer_pilates', 'core_focus'],
    categories: ['pilates', 'core'],
  },
  {
    id: 'Reformer_Short_Box_Round',
    name: 'Reformer Short Box Round Back',
    description: 'Short Box series Round Back for spinal articulation and center strength.',
    instructions: [
      'Sit on the short box with feet under the strap and arms folded or reaching.',
      'Exhale and roll back through a C-curve with control.',
      'Inhale to prepare, exhale to stack tall without thrusting the ribs.',
      'Keep the strap tension honest and the neck soft.',
    ],
    commonMistakes: ['Dumping into the low back', 'Pulling with the feet only', 'Chin jutting'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors'],
    equipment: 'reformer',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Mat_Half_Roll_Down',
    youtubeVideoId: 'H_-JE2yN1W0',
    youtubeTitle: 'The Roll Up',
    tags: ['reformer_pilates', 'core_focus'],
    categories: ['pilates', 'core'],
  },
  {
    id: 'Reformer_Coordination',
    name: 'Reformer Coordination',
    description: 'Supine Coordination on the reformer linking breath, arms, and legs.',
    instructions: [
      'Lie supine holding the straps with knees tabletop.',
      'Exhale: extend arms and legs, open/close the legs, then return.',
      'Keep the head curled or down per level, and the low back supported.',
      'Move as one phrase with the breath.',
    ],
    commonMistakes: ['Arching the lumbar spine', 'Yank the straps', 'Rushing the open-close'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['arms', 'hip flexors'],
    equipment: 'reformer',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Reformer_Arms_Supine',
    youtubeVideoId: '3dYwRDMassE',
    youtubeTitle: 'Coordination',
    tags: ['reformer_pilates', 'core_focus'],
    categories: ['pilates', 'core'],
  },
  {
    id: 'Reformer_Stomach_Massage',
    name: 'Reformer Stomach Massage',
    description: 'Stomach Massage Round Back for deep flexion strength and carriage control.',
    instructions: [
      'Sit on the carriage with heels on the footbar and hands holding the frame or reaching.',
      'Exhale and extend the legs while maintaining a scooped C-curve.',
      'Bend to return without losing the round shape.',
      'Keep shoulders soft and gaze slightly down.',
    ],
    commonMistakes: ['Sitting up tall mid-rep', 'Pushing only with quads', 'Tensing the neck'],
    difficulty: 'advanced',
    muscleGroup: 'core',
    secondaryMuscles: ['quadriceps', 'hip flexors'],
    equipment: 'reformer',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.5,
    donorId: 'Reformer_Footwork',
    youtubeVideoId: 'QDBzjlhKsco',
    youtubeTitle: 'Footwork',
    tags: ['reformer_pilates', 'core_focus'],
    categories: ['pilates', 'core'],
  },
];

function mediaExtFor(dir: string, id: string): string {
  for (const ext of ['.gif', '.webp', '.jpg', '.jpeg', '.png']) {
    if (existsSync(resolve(dir, `${id}${ext}`))) {
      return ext;
    }
  }
  return '.jpg';
}

function copyDonorMedia(donorId: string, newId: string): { thumb: string; gif: string } {
  const donorThumbExt = mediaExtFor(thumbnailDir, donorId);
  const donorGifExt = mediaExtFor(gifDir, donorId);
  const thumbDest = resolve(thumbnailDir, `${newId}.jpg`);
  const gifDest = resolve(gifDir, `${newId}.jpg`);
  const donorThumb = resolve(thumbnailDir, `${donorId}${donorThumbExt}`);
  const donorGif = resolve(gifDir, `${donorId}${donorGifExt}`);
  if (!existsSync(donorThumb) || !existsSync(donorGif)) {
    throw new Error(`Missing donor media for ${donorId}`);
  }
  copyFileSync(donorThumb, thumbDest);
  copyFileSync(donorGif, gifDest);
  return {
    thumb: `assets/exercises/thumbnails/${newId}.jpg`,
    gif: `assets/exercises/gifs/${newId}.jpg`,
  };
}

function toExercise(draft: CuratedDraft): Exercise {
  const media = copyDonorMedia(draft.donorId, draft.id);
  return {
    id: draft.id,
    name: draft.name,
    description: draft.description,
    instructions: draft.instructions,
    commonMistakes: draft.commonMistakes,
    difficulty: draft.difficulty,
    muscleGroup: draft.muscleGroup,
    secondaryMuscles: draft.secondaryMuscles,
    equipment: draft.equipment,
    thumbnailUri: media.thumb,
    gifUri: media.gif,
    tags: draft.tags ?? ['mat_pilates'],
    categories: draft.categories ?? ['pilates', 'core'],
    sessionRole: draft.sessionRole,
    source: 'curated_betterme',
    repsBaseline: draft.repsBaseline,
    holdSeconds: draft.holdSeconds,
    caloriesFactor: draft.caloriesFactor,
    youtubeVideoId: draft.youtubeVideoId,
    youtubeAttribution: PILATES_ANYTIME,
  };
}

function main(): void {
  const existing = JSON.parse(readFileSync(seedPath, 'utf8')) as Exercise[];
  const demote = new Set<string>(DEMOTE_TO_WARMUP);

  let demotedCount = 0;
  const normalized = existing.map((exercise) => {
    if (!demote.has(exercise.id)) {
      return exercise;
    }
    if (exercise.sessionRole === 'warmup') {
      return exercise;
    }
    demotedCount += 1;
    return { ...exercise, sessionRole: 'warmup' as const };
  });

  const existingIds = new Set(normalized.map((exercise) => exercise.id));
  const additions = NEW_MAINS.filter((draft) => !existingIds.has(draft.id)).map(toExercise);
  const merged = [...normalized, ...additions];

  writeFileSync(seedPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

  const youtubeTitleById = new Map(NEW_MAINS.map((draft) => [draft.id, draft.youtubeTitle]));
  const previousMap = JSON.parse(readFileSync(youtubeMapPath, 'utf8')) as Array<{
    exerciseId: string;
    youtubeVideoId: string;
    title: string;
    attribution?: string;
  }>;
  const previousTitle = new Map(previousMap.map((row) => [row.exerciseId, row.title]));

  const youtubeMap = merged
    .filter((exercise) => exercise.youtubeVideoId)
    .map((exercise) => ({
      exerciseId: exercise.id,
      youtubeVideoId: exercise.youtubeVideoId,
      title: youtubeTitleById.get(exercise.id) ?? previousTitle.get(exercise.id) ?? exercise.name,
      attribution: exercise.youtubeAttribution ?? PILATES_ANYTIME,
    }));
  writeFileSync(youtubeMapPath, `${JSON.stringify(youtubeMap, null, 2)}\n`, 'utf8');
  writeExerciseAssetManifest(merged, 'scripts/reinforce-pilates-mains.ts');

  const byRole: Record<string, number> = {};
  const byEquipment: Record<string, number> = {};
  for (const exercise of merged) {
    byRole[exercise.sessionRole] = (byRole[exercise.sessionRole] ?? 0) + 1;
    byEquipment[exercise.equipment] = (byEquipment[exercise.equipment] ?? 0) + 1;
  }

  console.log(
    JSON.stringify(
      {
        total: merged.length,
        demotedToWarmup: demotedCount,
        addedMains: additions.length,
        byRole,
        byEquipment,
      },
      null,
      2,
    ),
  );
}

main();
