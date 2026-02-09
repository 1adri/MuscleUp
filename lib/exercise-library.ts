
export type ExerciseMeta = {
  /** Path under /public */
  demoSrc?: string
  description: string
  cues?: string[]
}

function norm(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

const metas: Array<{ names: string[]; meta: ExerciseMeta }> = [
  {
    names: [
      "dumbbell bench press",
      "db bench press",
      "anim dumbbell bench press",
      "bench press dumbbell",
      "bench press",
      "benchpress",
      "barbell bench press",
    ],
    meta: {
      demoSrc: "/animations/anim-dumbbell-bench-press.gif",
      description:
        "Press the dumbbells from chest level to full extension while keeping your shoulders packed and wrists stacked over elbows.",
      cues: ["Feet planted", "Elbows ~45°", "Control the descent"],
    },
  },
  {
    names: ["incline dumbbell press", "incline db press"],
    meta: {
      demoSrc: "/animations/Incline-Dumbbell-Press.gif",
      description:
        "Incline press emphasizes upper chest. Lower the dumbbells to upper-chest level and press up without shrugging your shoulders.",
      cues: ["Chest up", "Don’t flare elbows", "Smooth tempo"],
    },
  },
  {
    names: ["dumbbell shoulder press", "db shoulder press", "overhead dumbbell press"],
    meta: {
      demoSrc: "/animations/Dumbbell-Shoulder-Press.gif",
      description:
        "Press overhead in a straight line while bracing your core. Keep ribs down to avoid arching your back.",
      cues: ["Brace core", "Ribs down", "Full lockout"],
    },
  },
  {
    names: [
      "bent over dumbbell row",
      "bent-over dumbbell row",
      "db row",
      "one arm dumbbell row",
      "dumbbell row",
      "dumbbell rows",
      "dumbbell bent row",
    ],
    meta: {
      demoSrc: "/animations/Bent-Over-Dumbbell-Row.gif",
      description:
        "Hinge at the hips, keep a flat back, and row the dumbbell toward your hip to target lats and upper back.",
      cues: ["Hinge + flat back", "Pull to hip", "Squeeze shoulder blade"],
    },
  },
  {
    names: ["seated row machine", "machine row", "seated cable row"],
    meta: {
      demoSrc: "/animations/Seated-Row-Machine.gif",
      description:
        "Row the handle to your torso while keeping your chest tall. Control the return to maintain tension.",
      cues: ["Chest tall", "Elbows back", "Control return"],
    },
  },
  {
    names: ["lat pulldown", "lat pull-down", "pulldown"],
    meta: {
      demoSrc: "/animations/Lat-Pulldown.gif",
      description:
        "Pull the bar to upper chest by driving elbows down. Avoid leaning back excessively or yanking with momentum.",
      cues: ["Elbows down", "Chest up", "No swinging"],
    },
  },
  {
    names: ["leg press"],
    meta: {
      demoSrc: "/animations/Leg-Press.gif",
      description:
        "Press through mid-foot/heel, keep knees tracking over toes, and avoid locking out hard at the top.",
      cues: ["Full range", "Knees track toes", "Don’t bounce"],
    },
  },
  {
    names: ["seated leg curl", "leg curl"],
    meta: {
      demoSrc: "/animations/Seated-Leg-Curl.gif",
      description:
        "Curl with control, squeeze hamstrings at the bottom, and return slowly to keep tension on the muscle.",
      cues: ["Slow eccentric", "Full squeeze", "Stay seated"],
    },
  },
  {
    names: ["barbell squat", "back squat", "barbell full squat", "squat"],
    meta: {
      demoSrc: "/animations/barbell-full-squat.gif",
      description:
        "Descend with control, keep your torso braced, and drive up by pushing the floor away through your whole foot.",
      cues: ["Brace + breathe", "Knees track toes", "Drive up"],
    },
  },
  {
    names: ["dumbbell calf raise", "calf raise"],
    meta: {
      demoSrc: "/animations/Dumbbell-Calf-Raise.gif",
      description:
        "Rise onto your toes with a pause at the top, then lower fully to stretch the calves before the next rep.",
      cues: ["Pause at top", "Full stretch", "No bouncing"],
    },
  },
  {
    names: ["walking lunge", "dumbbell walking lunge", "dumbbell walking lunges"],
    meta: {
      demoSrc: "/animations/dumbbell-walking-lunges.gif",
      description:
        "Step forward, drop the back knee toward the floor, and keep your front knee over mid-foot as you stand through the front leg.",
      cues: ["Tall torso", "Soft knee touch", "Drive through front heel"],
    },
  },
  {
    names: ["plank"],
    meta: {
      demoSrc: "/animations/plank.gif",
      description:
        "Maintain a straight line from head to heels. Brace your core and squeeze glutes to prevent sagging.",
      cues: ["Brace hard", "Glutes on", "Neutral neck"],
    },
  },
  {
    names: ["russian twist"],
    meta: {
      demoSrc: "/animations/russian-twist.gif",
      description:
        "Rotate from your torso (not just arms). Keep a long spine and move under control.",
      cues: ["Long spine", "Rotate torso", "Controlled reps"],
    },
  },
  {
    names: ["glute bridge", "resistance band glute bridge", "band glute bridge"],
    meta: {
      demoSrc: "/animations/resistance-band-glute-bridge.gif",
      description:
        "Drive hips up by squeezing glutes. Keep ribs down and don’t overextend your low back at the top.",
      cues: ["Glutes squeeze", "Ribs down", "Pause at top"],
    },
  },
  {
    names: ["tricep pushdown", "pushdown", "cable pushdown"],
    meta: {
      demoSrc: "/animations/Pushdown.gif",
      description:
        "Keep elbows pinned to your sides. Extend fully at the bottom and return with control.",
      cues: ["Elbows stay put", "Full extension", "Slow return"],
    },
  },
  {
    names: ["dumbbell bicep curl", "bicep curl", "dumbbell curls", "anim dumbbell bicep curls"],
    meta: {
      demoSrc: "/animations/anim-dumbbell-bicep-curls.gif",
      description:
        "Curl without swinging. Keep elbows close, squeeze at the top, and lower slowly.",
      cues: ["No momentum", "Elbows close", "Slow lower"],
    },
  },
  {
    names: ["dumbbell lunges", "lunges", "dumbbell lunge"],
    meta: {
      demoSrc: "/animations/Dumbbell-Lunges.gif",
      description:
        "Step forward, lower your back knee toward the floor, and drive through your front heel to return to start. Keep your torso upright.",
      cues: ["Front knee over ankle", "Back knee toward floor", "Stay upright"],
    },
  },
  {
    names: ["dumbbell lateral raise", "lateral raise", "side raise"],
    meta: {
      demoSrc: "/animations/Dumbell Lateral Raise.gif",
      description:
        "Raise dumbbells out to the sides with slight elbow bend until arms are parallel to floor. Control the descent.",
      cues: ["Slight elbow bend", "Raise to shoulder height", "Control descent"],
    },
  },
  {
    names: ["hip thrusts", "barbell hip thrust", "hip thrust"],
    meta: {
      demoSrc: "/animations/Hip-Thrusts.gif",
      description:
        "Drive hips up by squeezing glutes at the top. Keep upper back against bench and shoulders packed.",
      cues: ["Glutes squeeze at top", "Upper back supported", "Full hip drive"],
    },
  },
  {
    names: ["leg extensions", "leg extension"],
    meta: {
      demoSrc: "/animations/Leg-Extensions.gif",
      description:
        "Extend legs against resistance by straightening knees. Squeeze quads at the top and lower with control.",
      cues: ["Full extension at top", "Squeeze quads", "Control the weight"],
    },
  },
  {
    names: ["pushup", "push-up", "push up", "pushups"],
    meta: {
      demoSrc: "/animations/Pushup.gif",
      description:
        "Lower your body until chest is near floor while keeping elbows at ~45°. Press back to start position.",
      cues: ["Elbows ~45°", "Chest toward floor", "Keep body straight"],
    },
  },
  {
    names: ["side lunge", "side lunges"],
    meta: {
      demoSrc: "/animations/Side-Lunge.gif",
      description:
        "Step to the side, shift weight to one leg while keeping the other straight. Drive through your leg to return.",
      cues: ["Chest up", "Deep side step", "Controlled return"],
    },
  },
  {
    names: ["tricep dips", "dips", "tricep dip", "bodyweight dips"],
    meta: {
      demoSrc: "/animations/Tricep-Dips.gif",
      description:
        "Lower your body by bending elbows, keeping them close to your body. Press back up to full extension.",
      cues: ["Elbows close", "Full range", "Controlled tempo"],
    },
  },
  {
    names: ["jumping jack", "jumping jacks", "jumpin jacks"],
    meta: {
      demoSrc: "/animations/Jumping-jack.gif",
      description:
        "Jump while spreading legs and raising arms overhead. Land softly and return to start position.",
      cues: ["Soft landing", "Full extension overhead", "Controlled pace"],
    },
  },
  {
    names: ["deadlift", "barbell deadlift", "barbell-deadlift-movement"],
    meta: {
      demoSrc: "/animations/barbell-deadlift-movement.gif",
      description:
        "Hinge at the hips with a neutral spine and drive through heels to stand tall. Keep the bar close to your body.",
      cues: ["Neutral spine", "Bar close to shins", "Drive through heels"],
    },
  },
  {
    names: ["supine leg raises", "leg raises", "lying leg raises"],
    meta: {
      demoSrc: "/animations/supine-leg-raises.gif",
      description:
        "Lie flat, keep your lower back pressed to the floor, and lift legs using your lower abs while controlling the descent.",
      cues: ["Lower back down", "Controlled descent", "Lead with pelvis"],
    },
  },
]

const byName = new Map<string, ExerciseMeta>()
for (const item of metas) {
  for (const n of item.names) byName.set(norm(n), item.meta)
}

/** Best-effort lookup. Returns a generic description if we don't recognize the name. */
export function getExerciseMeta(name: string): ExerciseMeta {
  const key = norm(name)
  const direct = byName.get(key)
  if (direct) return direct

  // fuzzy contains match (helps with names like "Lat Pulldown (wide grip)")
  for (const [k, meta] of byName.entries()) {
    if (key.includes(k) || k.includes(key)) return meta
  }

  return {
    description:
      "Focus on controlled reps and full range of motion. Keep good form, and stop 1–2 reps before failure.",
    cues: ["Control the weight", "Full range", "Breathe + brace"],
  }
}
