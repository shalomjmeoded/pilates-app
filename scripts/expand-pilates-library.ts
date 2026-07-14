/**
 * Expands the Pilates seed with prop-aware curated exercises, copies donor
 * stills as offline placeholders, regenerates the asset manifest, and writes
 * a curated Pilates Anytime YouTube map.
 *
 * Usage: npx tsx scripts/expand-pilates-library.ts
 */
import { copyFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Exercise, ExerciseEquipment } from '../src/types/exercise';
import { writeExerciseAssetManifest } from './lib/exerciseManifest';

const projectRoot = resolve(__dirname, '..');
const seedPath = resolve(projectRoot, 'assets/seed/exercises.json');
const youtubeMapPath = resolve(projectRoot, 'assets/seed/exerciseYoutubeMap.json');
const thumbnailDir = resolve(projectRoot, 'assets/exercises/thumbnails');
const gifDir = resolve(projectRoot, 'assets/exercises/gifs');

const PILATES_ANYTIME = 'Pilates Anytime';

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
  /** Existing exercise id whose stills we copy as placeholders. */
  donorId: string;
  youtubeVideoId?: string;
  tags?: Exercise['tags'];
  categories?: Exercise['categories'];
}

const NEW_EXERCISES: CuratedDraft[] = [
  // Magic circle
  {
    id: 'Magic_Circle_Inner_Thigh_Squeeze',
    name: 'Magic Circle Inner Thigh Squeeze',
    description: 'Seated or supine inner-thigh work with the magic circle for controlled adduction.',
    instructions: [
      'Place the magic circle between your knees or ankles.',
      'Exhale and gently squeeze the pads together without collapsing the spine.',
      'Inhale to release halfway — keep tension in the circle.',
      'Keep ribs soft and pelvis steady.',
    ],
    commonMistakes: ['Clenching the jaw', 'Tucking the pelvis hard', 'Rushing the squeeze'],
    difficulty: 'beginner',
    muscleGroup: 'inner thighs',
    secondaryMuscles: ['core', 'glutes'],
    equipment: 'magic circle',
    sessionRole: 'main',
    repsBaseline: 12,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Clamshell',
    tags: ['mat_pilates', 'core_focus'],
  },
  {
    id: 'Magic_Circle_Arm_Press',
    name: 'Magic Circle Arm Press',
    description: 'Standing or seated arm press into the magic circle for shoulder stability and posture.',
    instructions: [
      'Hold the magic circle at chest height with both palms on the pads.',
      'Exhale and press inward evenly.',
      'Keep shoulders away from ears and ribs stacked over hips.',
      'Release halfway on the inhale.',
    ],
    commonMistakes: ['Shrugging shoulders', 'Flaring ribs', 'Locking elbows'],
    difficulty: 'beginner',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['arms', 'upper back'],
    equipment: 'magic circle',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.3,
    donorId: 'Pilates_Swan',
  },
  {
    id: 'Magic_Circle_Chest_Opener',
    name: 'Magic Circle Chest Opener',
    description: 'Gentle chest expansion using the magic circle behind the back or overhead.',
    instructions: [
      'Hold the circle in front or behind with soft elbows.',
      'Inhale to open the chest without dumping into the low back.',
      'Exhale to return with control.',
      'Keep the neck long.',
    ],
    commonMistakes: ['Arching the lumbar spine', 'Tensing the neck'],
    difficulty: 'beginner',
    muscleGroup: 'upper back',
    secondaryMuscles: ['shoulders', 'core'],
    equipment: 'magic circle',
    sessionRole: 'cooldown',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.25,
    donorId: 'Mermaid_Stretch',
    tags: ['mat_pilates', 'flexibility_length'],
    categories: ['pilates', 'flexibility', 'posture'],
  },
  {
    id: 'Magic_Circle_Hundred_Prep',
    name: 'Magic Circle Hundred Prep',
    description: 'Hundred-style core prep with light magic-circle resistance in the hands.',
    instructions: [
      'Curl head and shoulders up as for the Hundred.',
      'Hold the circle above the thighs and pulse the arms.',
      'Breathe in for five pumps, out for five.',
      'Keep the low back supported.',
    ],
    commonMistakes: ['Straining the neck', 'Dropping the circle into the hips'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['arms', 'hip flexors'],
    equipment: 'magic circle',
    sessionRole: 'warmup',
    repsBaseline: null,
    holdSeconds: 40,
    caloriesFactor: 0.45,
    donorId: 'Pilates_Hundred',
    youtubeVideoId: '9mlone4NObI',
    tags: ['mat_pilates', 'core_focus'],
  },
  {
    id: 'Magic_Circle_Side_Lying_Press',
    name: 'Magic Circle Side-Lying Press',
    description: 'Side-lying outer-hip work pressing into the magic circle.',
    instructions: [
      'Lie on your side with the circle between ankles or knees.',
      'Exhale and press the top pad away with control.',
      'Keep the waist long and hips stacked.',
      'Return halfway without collapsing.',
    ],
    commonMistakes: ['Rolling the top hip back', 'Using momentum'],
    difficulty: 'intermediate',
    muscleGroup: 'outer thighs',
    secondaryMuscles: ['glutes', 'core'],
    equipment: 'magic circle',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Side_Kick',
  },

  // Light weights
  {
    id: 'Light_Weight_Arm_Circles',
    name: 'Light Weight Arm Circles',
    description: 'Controlled standing or seated arm circles with light dumbbells for shoulder endurance.',
    instructions: [
      'Hold light weights at shoulder height with soft elbows.',
      'Draw small circles forward, then reverse.',
      'Keep the ribs quiet and neck long.',
      'Stop if shoulders creep toward the ears.',
    ],
    commonMistakes: ['Circles too large', 'Arching the back'],
    difficulty: 'beginner',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['arms', 'upper back'],
    equipment: 'light weights',
    sessionRole: 'warmup',
    repsBaseline: 12,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Pilates_Swimming',
  },
  {
    id: 'Light_Weight_Tricep_Reach',
    name: 'Light Weight Tricep Reach',
    description: 'Supine or seated tricep reach with light weights for arm tone without bulk focus.',
    instructions: [
      'Hold weights above the chest or behind the head with elbows soft.',
      'Exhale and extend with control.',
      'Inhale to bend without flaring elbows wide.',
      'Keep ribs knitted.',
    ],
    commonMistakes: ['Elbows winging out', 'Holding breath'],
    difficulty: 'beginner',
    muscleGroup: 'arms',
    secondaryMuscles: ['shoulders', 'core'],
    equipment: 'light weights',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.3,
    donorId: 'Pilates_Teaser',
  },
  {
    id: 'Light_Weight_Bridge_Press',
    name: 'Light Weight Bridge Press',
    description: 'Shoulder bridge with light weights held over the chest for added upper-body awareness.',
    instructions: [
      'Set up for a shoulder bridge with weights above the sternum.',
      'Exhale and peel the spine up vertebra by vertebra.',
      'Hold briefly, then articulate down.',
      'Keep wrists stacked over elbows.',
    ],
    commonMistakes: ['Dumping into the neck', 'Weights drifting over the face'],
    difficulty: 'intermediate',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings', 'core', 'arms'],
    equipment: 'light weights',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Pilates_Shoulder_Bridge',
  },
  {
    id: 'Light_Weight_Seated_Row',
    name: 'Light Weight Seated Row',
    description: 'Seated posture row with light weights to open the chest and strengthen the upper back.',
    instructions: [
      'Sit tall with weights in hand, elbows soft.',
      'Exhale and draw elbows back as if rowing.',
      'Squeeze the shoulder blades gently.',
      'Return with control.',
    ],
    commonMistakes: ['Rounding the upper back', 'Shrugging'],
    difficulty: 'beginner',
    muscleGroup: 'upper back',
    secondaryMuscles: ['shoulders', 'arms'],
    equipment: 'light weights',
    sessionRole: 'main',
    repsBaseline: 12,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Seated_Spine_Twist',
    tags: ['mat_pilates', 'flexibility_length'],
    categories: ['pilates', 'posture'],
  },
  {
    id: 'Light_Weight_Hundred_Arms',
    name: 'Light Weight Hundred Arms',
    description: 'Hundred arm pumps with very light weights for added endurance.',
    instructions: [
      'Curl into Hundred position with light weights in hand.',
      'Pump the arms while breathing five in, five out.',
      'Keep the weights hovering above the thighs.',
      'Lower if the neck fatigues.',
    ],
    commonMistakes: ['Weights slamming into thighs', 'Neck strain'],
    difficulty: 'advanced',
    muscleGroup: 'core',
    secondaryMuscles: ['arms', 'shoulders'],
    equipment: 'light weights',
    sessionRole: 'main',
    repsBaseline: null,
    holdSeconds: 50,
    caloriesFactor: 0.5,
    donorId: 'Pilates_Hundred',
    youtubeVideoId: '9mlone4NObI',
    tags: ['mat_pilates', 'core_focus'],
  },

  // Resistance band
  {
    id: 'Band_Glute_Bridge',
    name: 'Band Glute Bridge',
    description: 'Shoulder bridge with a mini-band above the knees for outer-hip activation.',
    instructions: [
      'Place a band above the knees and set up for bridge.',
      'Press knees gently outward against the band.',
      'Exhale and peel the hips up.',
      'Lower with control while keeping band tension.',
    ],
    commonMistakes: ['Knees collapsing inward', 'Overarching the ribs'],
    difficulty: 'beginner',
    muscleGroup: 'glutes',
    secondaryMuscles: ['outer thighs', 'hamstrings'],
    equipment: 'resistance band',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Butt_Lift_Bridge',
    categories: ['pilates', 'glutes', 'resistance_band'],
  },
  {
    id: 'Band_Clamshell',
    name: 'Band Clamshell',
    description: 'Side-lying clamshell with a resistance band for controlled outer-hip work.',
    instructions: [
      'Lie on your side with band around thighs, knees bent.',
      'Exhale and open the top knee without rolling the pelvis.',
      'Inhale to close with control.',
      'Keep feet stacked.',
    ],
    commonMistakes: ['Rocking the pelvis back', 'Using momentum'],
    difficulty: 'beginner',
    muscleGroup: 'outer thighs',
    secondaryMuscles: ['glutes', 'core'],
    equipment: 'resistance band',
    sessionRole: 'main',
    repsBaseline: 12,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Clamshell',
    categories: ['pilates', 'glutes', 'resistance_band'],
  },
  {
    id: 'Band_Row',
    name: 'Band Row',
    description: 'Seated or standing band row for posture and upper-back strength.',
    instructions: [
      'Anchor the band and sit or stand tall.',
      'Exhale and draw elbows back.',
      'Keep wrists neutral and shoulders down.',
      'Return slowly.',
    ],
    commonMistakes: ['Rounding forward', 'Yanking the band'],
    difficulty: 'beginner',
    muscleGroup: 'upper back',
    secondaryMuscles: ['shoulders', 'arms'],
    equipment: 'resistance band',
    sessionRole: 'main',
    repsBaseline: 12,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Seated_Spine_Twist',
    categories: ['pilates', 'posture', 'resistance_band'],
  },
  {
    id: 'Band_Side_Step',
    name: 'Band Side Step',
    description: 'Lateral band walk for hip stability and glute activation.',
    instructions: [
      'Place band around ankles or above knees.',
      'Soft knees, tall spine.',
      'Step sideways maintaining band tension.',
      'Keep toes pointing forward.',
    ],
    commonMistakes: ['Waddling with torso lean', 'Losing band tension'],
    difficulty: 'intermediate',
    muscleGroup: 'glutes',
    secondaryMuscles: ['outer thighs', 'core'],
    equipment: 'resistance band',
    sessionRole: 'warmup',
    repsBaseline: 16,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Fire_Hydrant',
    categories: ['pilates', 'glutes', 'resistance_band'],
  },
  {
    id: 'Band_Pull_Apart',
    name: 'Band Pull-Apart',
    description: 'Standing band pull-apart to open the chest and strengthen the rear shoulders.',
    instructions: [
      'Hold the band at chest height with soft elbows.',
      'Exhale and open the arms wide.',
      'Squeeze the shoulder blades gently.',
      'Return without collapsing the chest.',
    ],
    commonMistakes: ['Shrugging', 'Locking elbows'],
    difficulty: 'beginner',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['upper back'],
    equipment: 'resistance band',
    sessionRole: 'warmup',
    repsBaseline: 12,
    holdSeconds: null,
    caloriesFactor: 0.3,
    donorId: 'Pilates_Swan',
    categories: ['pilates', 'posture', 'resistance_band'],
  },

  // Pilates ball
  {
    id: 'Ball_Seated_March',
    name: 'Ball Seated March',
    description: 'Seated on a pilates ball with gentle marches for core and balance.',
    instructions: [
      'Sit tall on the ball with feet grounded.',
      'Alternate lifting one foot a few inches.',
      'Keep the pelvis quiet and ribs soft.',
      'Use arms for balance if needed.',
    ],
    commonMistakes: ['Slumping', 'Holding the breath'],
    difficulty: 'beginner',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors', 'full body'],
    equipment: 'pilates ball',
    sessionRole: 'warmup',
    repsBaseline: 16,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Toe_Taps',
  },
  {
    id: 'Ball_Bridge',
    name: 'Ball Bridge',
    description: 'Feet on the pilates ball for an unstable shoulder bridge.',
    instructions: [
      'Lie on your back with heels on the ball.',
      'Exhale and lift the hips into a bridge.',
      'Keep the ball steady under the feet.',
      'Lower vertebra by vertebra.',
    ],
    commonMistakes: ['Letting the ball roll away', 'Overarching the neck'],
    difficulty: 'intermediate',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: 'pilates ball',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Pilates_Shoulder_Bridge',
  },
  {
    id: 'Ball_Roll_Out',
    name: 'Ball Roll-Out',
    description: 'Kneeling roll-out on the pilates ball for deep core control.',
    instructions: [
      'Kneel with forearms or hands on the ball.',
      'Exhale and roll the ball forward a comfortable distance.',
      'Keep the ribs from dumping.',
      'Roll back in with control.',
    ],
    commonMistakes: ['Sagging through the low back', 'Going too far too soon'],
    difficulty: 'advanced',
    muscleGroup: 'core',
    secondaryMuscles: ['shoulders', 'full body'],
    equipment: 'pilates ball',
    sessionRole: 'main',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.5,
    donorId: 'Plank',
  },
  {
    id: 'Ball_Spine_Stretch',
    name: 'Ball Spine Stretch',
    description: 'Seated spine stretch supported by the pilates ball behind or under the hands.',
    instructions: [
      'Sit tall with the ball nearby for support.',
      'Exhale and articulate forward over the legs.',
      'Use the ball lightly if needed for balance.',
      'Stack the spine to return.',
    ],
    commonMistakes: ['Rounding only at the neck', 'Forcing the stretch'],
    difficulty: 'beginner',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['lower back', 'core'],
    equipment: 'pilates ball',
    sessionRole: 'cooldown',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.25,
    donorId: 'Spine_Stretch_Forward',
    tags: ['mat_pilates', 'flexibility_length'],
    categories: ['pilates', 'flexibility'],
  },
  {
    id: 'Ball_Side_Crunch',
    name: 'Ball Side Crunch',
    description: 'Side-lying or seated lateral flexion with the pilates ball for waist support.',
    instructions: [
      'Set up with the ball supporting the side body or under the hand.',
      'Exhale and shorten the top waist.',
      'Inhale to lengthen without collapsing.',
      'Keep the neck long.',
    ],
    commonMistakes: ['Pulling on the neck', 'Twisting instead of side-bending'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['outer thighs'],
    equipment: 'pilates ball',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Mermaid_Stretch',
  },

  // Reformer (studio)
  {
    id: 'Reformer_Footwork',
    name: 'Reformer Footwork',
    description: 'Classic reformer footwork series for legs and pelvic stability.',
    instructions: [
      'Lie on the reformer carriage with feet on the footbar.',
      'Exhale to press the carriage out with control.',
      'Inhale to return without slamming the stoppers.',
      'Keep the pelvis neutral.',
    ],
    commonMistakes: ['Hyperextending knees', 'Tucking aggressively'],
    difficulty: 'beginner',
    muscleGroup: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings', 'core'],
    equipment: 'reformer',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Bodyweight_Squat',
    tags: ['reformer_pilates', 'mat_pilates'],
  },
  {
    id: 'Reformer_Hundred',
    name: 'Reformer Hundred',
    description: 'Hundred variation on the reformer with straps or arms pumping.',
    instructions: [
      'Set up in Hundred position on the carriage.',
      'Pump the arms while breathing five in, five out.',
      'Keep the carriage quiet unless cued otherwise.',
      'Modify legs bent if needed.',
    ],
    commonMistakes: ['Neck strain', 'Losing abdominal connection'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['arms', 'hip flexors'],
    equipment: 'reformer',
    sessionRole: 'warmup',
    repsBaseline: null,
    holdSeconds: 50,
    caloriesFactor: 0.5,
    donorId: 'Pilates_Hundred',
    youtubeVideoId: '9mlone4NObI',
    tags: ['reformer_pilates', 'core_focus'],
  },
  {
    id: 'Reformer_Long_Stretch',
    name: 'Reformer Long Stretch',
    description: 'Plank-based long stretch on the reformer for full-body strength.',
    instructions: [
      'Start in a plank with hands on the footbar.',
      'Exhale and press the carriage back.',
      'Inhale to return without sinking the hips.',
      'Keep the neck long.',
    ],
    commonMistakes: ['Sagging hips', 'Shrugging into the ears'],
    difficulty: 'advanced',
    muscleGroup: 'full body',
    secondaryMuscles: ['core', 'shoulders'],
    equipment: 'reformer',
    sessionRole: 'main',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.55,
    donorId: 'Plank',
    tags: ['reformer_pilates'],
  },
  {
    id: 'Reformer_Elephant',
    name: 'Reformer Elephant',
    description: 'Standing elephant on the reformer for hamstrings and abdominal scoop.',
    instructions: [
      'Stand on the reformer in elephant setup with hands on the footbar.',
      'Exhale and scoop to move the carriage.',
      'Keep heels reaching and spine rounded intentionally.',
      'Return with control.',
    ],
    commonMistakes: ['Locking the knees', 'Losing the scoop'],
    difficulty: 'intermediate',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['core', 'shoulders'],
    equipment: 'reformer',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Pilates_Roll_Up',
    tags: ['reformer_pilates'],
  },
  {
    id: 'Reformer_Mermaid',
    name: 'Reformer Mermaid',
    description: 'Seated mermaid side stretch on the reformer for lateral mobility.',
    instructions: [
      'Sit sideways on the reformer in mermaid setup.',
      'Inhale to reach the arm up and open the side body.',
      'Exhale to return with control.',
      'Keep the sit bones grounded.',
    ],
    commonMistakes: ['Collapsing into the supporting hip', 'Forcing range'],
    difficulty: 'beginner',
    muscleGroup: 'core',
    secondaryMuscles: ['shoulders', 'outer thighs'],
    equipment: 'reformer',
    sessionRole: 'cooldown',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.3,
    donorId: 'Mermaid_Stretch',
    tags: ['reformer_pilates', 'flexibility_length'],
    categories: ['pilates', 'flexibility'],
  },
  {
    id: 'Reformer_Arms_Supine',
    name: 'Reformer Arms Supine',
    description: 'Supine arm work in straps for shoulder mobility and core control.',
    instructions: [
      'Lie on the carriage with arms in straps.',
      'Exhale and move the arms through the cued pattern.',
      'Keep the ribs heavy and pelvis quiet.',
      'Avoid yanking the straps.',
    ],
    commonMistakes: ['Arching the low back', 'Shrugging'],
    difficulty: 'intermediate',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['core', 'arms'],
    equipment: 'reformer',
    sessionRole: 'main',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Pilates_Teaser',
    tags: ['reformer_pilates'],
  },

  // Extra mat classics quality fillers
  {
    id: 'Mat_Half_Roll_Down',
    name: 'Half Roll-Down',
    description: 'Seated half roll-down to train spinal articulation and abdominal scoop.',
    instructions: [
      'Sit tall with knees bent or legs long.',
      'Exhale and roll halfway back, keeping a C-curve.',
      'Hold, then stack to sitting.',
      'Move vertebra by vertebra.',
    ],
    commonMistakes: ['Collapsing the chest', 'Using momentum'],
    difficulty: 'beginner',
    muscleGroup: 'core',
    secondaryMuscles: ['hip flexors'],
    equipment: 'mat',
    sessionRole: 'warmup',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Pilates_Roll_Up',
    tags: ['mat_pilates', 'core_focus'],
  },
  {
    id: 'Mat_Pelvic_Curl',
    name: 'Pelvic Curl',
    description: 'Articulated pelvic curl to warm the spine and wake the glutes.',
    instructions: [
      'Lie on your back with knees bent, feet hip-width.',
      'Exhale and peel the spine up into a bridge.',
      'Inhale at the top, exhale to roll down.',
      'Keep the neck long.',
    ],
    commonMistakes: ['Pushing into the neck', 'Skipping spinal articulation'],
    difficulty: 'beginner',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: 'mat',
    sessionRole: 'warmup',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Pelvic_Tilt_Into_Bridge',
  },
  {
    id: 'Mat_Single_Leg_Circles',
    name: 'Single Leg Circles',
    description: 'Classical single-leg circles for hip mobility with a quiet pelvis.',
    instructions: [
      'Lie on your back with one leg extended to the ceiling.',
      'Draw controlled circles from the hip.',
      'Reverse direction after several reps.',
      'Keep the pelvis glued to the mat.',
    ],
    commonMistakes: ['Rocking the hips', 'Circles too large'],
    difficulty: 'intermediate',
    muscleGroup: 'hip flexors',
    secondaryMuscles: ['core', 'outer thighs'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.35,
    donorId: 'Leg_Lift',
  },
  {
    id: 'Mat_Rolling_Like_a_Ball',
    name: 'Rolling Like a Ball',
    description: 'Classical rolling like a ball for massage and core control.',
    instructions: [
      'Balance in a tucked seat with hands on shins.',
      'Inhale to roll back to the shoulders.',
      'Exhale to roll up to balance without putting feet down.',
      'Keep the shape round.',
    ],
    commonMistakes: ['Using momentum only', 'Landing on the neck'],
    difficulty: 'intermediate',
    muscleGroup: 'core',
    secondaryMuscles: ['full body'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.4,
    donorId: 'Open_Leg_Rocker',
  },
  {
    id: 'Mat_Spine_Twist',
    name: 'Spine Twist',
    description: 'Seated spine twist for rotational mobility with a tall seat.',
    instructions: [
      'Sit tall with legs long or crossed.',
      'Exhale and rotate through the waist.',
      'Pulse gently if cued, then return to center.',
      'Grow taller on every twist.',
    ],
    commonMistakes: ['Rounding the spine', 'Twisting only from the arms'],
    difficulty: 'beginner',
    muscleGroup: 'core',
    secondaryMuscles: ['upper back'],
    equipment: 'mat',
    sessionRole: 'cooldown',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.25,
    donorId: 'Seated_Spine_Twist',
    tags: ['mat_pilates', 'flexibility_length'],
    categories: ['pilates', 'flexibility', 'mobility'],
  },
  {
    id: 'Mat_Leg_Pull_Front',
    name: 'Leg Pull Front',
    description: 'Plank-based leg pull front for shoulder and core strength.',
    instructions: [
      'Start in a strong plank.',
      'Lift one leg slightly without tipping the hips.',
      'Lower and switch sides.',
      'Keep the wrists stacked under shoulders.',
    ],
    commonMistakes: ['Sagging hips', 'Hiking one hip'],
    difficulty: 'advanced',
    muscleGroup: 'full body',
    secondaryMuscles: ['core', 'shoulders', 'glutes'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 8,
    holdSeconds: null,
    caloriesFactor: 0.5,
    donorId: 'Plank',
  },
  {
    id: 'Mat_Side_Bend',
    name: 'Side Bend',
    description: 'Side plank variation lifting into a side bend for oblique strength.',
    instructions: [
      'Set up in a side plank on hand or forearm.',
      'Exhale and lift the hips into a side bend.',
      'Inhale to lower with control.',
      'Keep the neck long.',
    ],
    commonMistakes: ['Collapsing the supporting shoulder', 'Twisting the chest forward'],
    difficulty: 'advanced',
    muscleGroup: 'core',
    secondaryMuscles: ['shoulders', 'outer thighs'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 6,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Side_Plank',
  },
  {
    id: 'Mat_Neck_Pull',
    name: 'Neck Pull',
    description: 'Classical neck pull for advanced spinal articulation and abs.',
    instructions: [
      'Lie with hands behind the head, legs long.',
      'Exhale and roll up through the spine.',
      'Reach forward, then articulate down with control.',
      'Do not pull on the neck.',
    ],
    commonMistakes: ['Yanking the head', 'Using momentum'],
    difficulty: 'advanced',
    muscleGroup: 'core',
    secondaryMuscles: ['hamstrings'],
    equipment: 'mat',
    sessionRole: 'main',
    repsBaseline: 5,
    holdSeconds: null,
    caloriesFactor: 0.45,
    donorId: 'Pilates_Roll_Up',
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

  if (!existsSync(donorThumb)) {
    throw new Error(`Missing donor thumbnail for ${donorId}`);
  }
  if (!existsSync(donorGif)) {
    throw new Error(`Missing donor gif frame for ${donorId}`);
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
    youtubeVideoId: draft.youtubeVideoId ?? null,
    youtubeAttribution: draft.youtubeVideoId ? PILATES_ANYTIME : null,
  };
}

function writeManifest(exercises: Exercise[]): void {
  writeExerciseAssetManifest(exercises, 'scripts/expand-pilates-library.ts');
}

function main(): void {
  const existing = JSON.parse(
    require('node:fs').readFileSync(seedPath, 'utf8'),
  ) as Exercise[];

  const normalizedExisting = existing.map((exercise) => ({
    ...exercise,
    youtubeVideoId: exercise.youtubeVideoId ?? null,
    youtubeAttribution: exercise.youtubeAttribution ?? null,
  }));

  // Attach known Pilates Anytime Hundred video to existing Hundred entry.
  const hundred = normalizedExisting.find((e) => e.id === 'Pilates_Hundred');
  if (hundred) {
    hundred.youtubeVideoId = '9mlone4NObI';
    hundred.youtubeAttribution = PILATES_ANYTIME;
  }
  // Only attach confirmed Pilates Anytime embeds; other IDs stay null until curated.

  const existingIds = new Set(normalizedExisting.map((e) => e.id));
  const additions = NEW_EXERCISES.filter((draft) => !existingIds.has(draft.id)).map(toExercise);

  const merged = [...normalizedExisting, ...additions];
  writeFileSync(seedPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

  const youtubeMap = merged
    .filter((e) => e.youtubeVideoId)
    .map((e) => ({
      exerciseId: e.id,
      youtubeVideoId: e.youtubeVideoId,
      title: e.name,
      attribution: e.youtubeAttribution ?? PILATES_ANYTIME,
    }));
  writeFileSync(youtubeMapPath, `${JSON.stringify(youtubeMap, null, 2)}\n`, 'utf8');

  writeManifest(merged);

  const byEquipment: Record<string, number> = {};
  for (const exercise of merged) {
    byEquipment[exercise.equipment] = (byEquipment[exercise.equipment] ?? 0) + 1;
  }

  console.log(
    JSON.stringify(
      {
        total: merged.length,
        added: additions.length,
        youtubeMapped: youtubeMap.length,
        byEquipment,
        thumbCount: readdirSync(thumbnailDir).length,
        gifCount: readdirSync(gifDir).length,
      },
      null,
      2,
    ),
  );
}

main();
