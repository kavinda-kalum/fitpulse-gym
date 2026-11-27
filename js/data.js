/* FitPulse demo data — edit freely. Everything the app shows comes from here
   (plus whatever the user logs, which is saved in localStorage). */
window.FP_DATA = {
  user: { name: "Kavinda Kalum", first: "Kavinda", initials: "KK" },

  weeklyGoal: 6, // gym sessions per week (Mon–Sat, Sunday is rest)

  /* ---------- Exercise library (from "Complete Gym Workout Guide") ----------
     type: "compound" → 3–4 sets × 6–12 reps, rest 2–3 min
           "isolation" → 2–3 sets × 10–15 reps, rest 1–2 min
           "core" → 2–3 sets × 10–20 reps or timed holds
           "cardio" → 15–30 min at a suitable pace                         */
  library: [
    { key: "chest", name: "Chest", img: "assets/img/bench-press.jpg", exercises: [
      ["Barbell Bench Press", "compound"], ["Incline Bench Press", "compound"], ["Decline Bench Press", "compound"],
      ["Dumbbell Bench Press", "compound"], ["Incline Dumbbell Press", "compound"], ["Dumbbell Chest Fly", "isolation"],
      ["Cable Chest Fly", "isolation"], ["Pec Deck Fly", "isolation"], ["Push-Ups", "compound"], ["Chest Dips", "compound"] ] },
    { key: "back", name: "Back", img: "assets/img/lat-pulldown.jpg", exercises: [
      ["Lat Pulldown", "compound"], ["Pull-Ups", "compound"], ["Chin-Ups", "compound"], ["Barbell Bent-Over Row", "compound"],
      ["Seated Cable Row", "compound"], ["One-Arm Dumbbell Row", "compound"], ["T-Bar Row", "compound"], ["Deadlift", "compound"],
      ["Straight-Arm Pulldown", "isolation"], ["Chest-Supported Row", "compound"] ] },
    { key: "shoulders", name: "Shoulders", img: "assets/img/shoulder-press.jpg", exercises: [
      ["Shoulder Press", "compound"], ["Dumbbell Shoulder Press", "compound"], ["Arnold Press", "compound"], ["Lateral Raises", "isolation"],
      ["Front Raises", "isolation"], ["Rear Delt Fly", "isolation"], ["Reverse Pec Deck", "isolation"], ["Upright Row", "compound"],
      ["Face Pulls", "isolation"], ["Machine Shoulder Press", "compound"] ] },
    { key: "biceps", name: "Biceps", img: "assets/img/bicep-curl.jpg", exercises: [
      ["Barbell Curl", "isolation"], ["Dumbbell Curl", "isolation"], ["Hammer Curl", "isolation"], ["Preacher Curl", "isolation"],
      ["Concentration Curl", "isolation"], ["Incline Dumbbell Curl", "isolation"], ["Cable Bicep Curl", "isolation"], ["EZ-Bar Curl", "isolation"],
      ["Reverse Curl", "isolation"], ["Spider Curl", "isolation"] ] },
    { key: "triceps", name: "Triceps", img: "assets/img/pushups.jpg", exercises: [
      ["Triceps Pushdown", "isolation"], ["Rope Pushdown", "isolation"], ["Overhead Triceps Extension", "isolation"], ["Dumbbell Triceps Extension", "isolation"],
      ["Skull Crushers", "isolation"], ["Close-Grip Bench Press", "compound"], ["Triceps Dips", "compound"], ["Diamond Push-Ups", "compound"],
      ["Cable Kickbacks", "isolation"], ["Single-Arm Pushdown", "isolation"] ] },
    { key: "legs", name: "Legs", img: "assets/img/back-squat.jpg", exercises: [
      ["Barbell Squat", "compound"], ["Front Squat", "compound"], ["Leg Press", "compound"], ["Leg Extension", "isolation"],
      ["Leg Curl", "isolation"], ["Romanian Deadlift", "compound"], ["Walking Lunges", "compound"], ["Bulgarian Split Squat", "compound"],
      ["Goblet Squat", "compound"], ["Hack Squat", "compound"], ["Calf Raises", "isolation"], ["Standing Calf Raises", "isolation"],
      ["Seated Calf Raises", "isolation"], ["Hip Thrust", "compound"], ["Glute Kickbacks", "isolation"] ] },
    { key: "core", name: "Abs & Core", img: "assets/img/core.jpg", exercises: [
      ["Crunches", "core"], ["Sit-Ups", "core"], ["Plank", "hold"], ["Side Plank", "hold"], ["Hanging Leg Raises", "core"],
      ["Lying Leg Raises", "core"], ["Cable Crunches", "core"], ["Russian Twists", "core"], ["Bicycle Crunches", "core"],
      ["Mountain Climbers", "core"], ["Reverse Crunches", "core"], ["Ab Wheel Rollouts", "core"] ] },
    { key: "forearms", name: "Forearms & Grip", img: "assets/img/deadlift.jpg", exercises: [
      ["Wrist Curls", "isolation"], ["Reverse Wrist Curls", "isolation"], ["Hammer Curls", "isolation"], ["Reverse Barbell Curls", "isolation"],
      ["Farmer's Walk", "carry"], ["Plate Pinch Hold", "hold"], ["Dead Hangs", "hold"] ] },
    { key: "glutes", name: "Glutes", img: "assets/img/hip-thrust.jpg", exercises: [
      ["Hip Thrust", "compound"], ["Glute Bridge", "compound"], ["Cable Kickbacks", "isolation"], ["Hip Abduction", "isolation"],
      ["Sumo Squats", "compound"], ["Bulgarian Split Squats", "compound"], ["Step-Ups", "compound"], ["Romanian Deadlift", "compound"] ] },
    { key: "cardio", name: "Cardio & Conditioning", img: "assets/img/rowing.jpg", exercises: [
      ["Treadmill Walking or Running", "cardio"], ["Stationary Cycling", "cardio"], ["Elliptical Trainer", "cardio"], ["Rowing Machine", "cardio"],
      ["Stair Climber", "cardio"], ["Jump Rope", "interval"], ["Burpees", "interval"], ["Jumping Jacks", "interval"],
      ["High Knees", "interval"], ["Outdoor Walking", "cardio"] ] }
  ],

  // Default prescriptions from the guide's "Sets, Reps and Rest Guidelines"
  prescriptions: {
    compound: { label: "Compound", text: "3–4 sets × 6–12 reps", rest: "Rest 2–3 min" },
    isolation: { label: "Isolation", text: "2–3 sets × 10–15 reps", rest: "Rest 1–2 min" },
    core: { label: "Core", text: "2–3 sets × 10–20 reps", rest: "Rest 45–60 sec" },
    hold: { label: "Hold", text: "2–3 × 30–60 sec hold", rest: "Rest 45–60 sec" },
    carry: { label: "Carry", text: "3 × 30–40 m walk", rest: "Rest 60–90 sec" },
    interval: { label: "Interval", text: "3–5 rounds × 30–45 sec", rest: "Rest 30–60 sec" },
    cardio: { label: "Cardio", text: "15–30 min steady pace", rest: "Cool down 5 min" }
  },

  guidelines: [
    "Compound exercises: usually 2–4 working sets of 6–12 repetitions.",
    "Isolation exercises: usually 2–3 sets of 10–15 repetitions.",
    "Core exercises: usually 2–3 sets of 10–20 repetitions, or controlled timed holds.",
    "Rest about 2–3 minutes after demanding compound sets and 1–2 minutes after isolation sets.",
    "Cardio: start with 15–30 minutes at a pace appropriate to your fitness level."
  ],
  safety: [
    "Warm up for 5–10 minutes and perform lighter warm-up sets before heavy lifts.",
    "Learn correct technique before increasing the weight. Use a spotter for heavy lifts when appropriate.",
    "Choose a manageable number of exercises — you don't need every exercise in one session.",
    "Progress gradually by adding repetitions or a small amount of weight while keeping good form.",
    "Allow muscle groups time to recover, sleep adequately and stay hydrated.",
    "Stop if you feel sharp pain, dizziness or unusual shortness of breath. Seek qualified medical advice when needed."
  ],

  // Weekly schedule from the guide. Index 0 = Monday. null = rest / recovery.
  split: ["chest-triceps", "back-biceps", "legs-abs", "shoulders-traps", "chest-back", "arms-abs", null],

  // Personal records (kg)
  prs: [
    { lift: "Barbell Bench Press", kg: 70, reps: 5, img: "assets/img/bench-press.jpg", date: "23 Nov" },
    { lift: "Barbell Squat", kg: 100, reps: 5, img: "assets/img/back-squat.jpg", date: "25 Nov" },
    { lift: "Deadlift", kg: 120, reps: 3, img: "assets/img/deadlift.jpg", date: "24 Nov" },
    { lift: "Shoulder Press", kg: 45, reps: 5, img: "assets/img/shoulder-press.jpg", date: "26 Nov" }
  ],

  // Programs built from the library. Each exercise: sets, reps, kg (null = bodyweight), rest (sec)
  workouts: [
    {
      id: "chest-triceps", title: "Chest + Triceps", short: "Chest", cat: "Push", focus: "Chest · Triceps", level: "Intermediate",
      mins: 60, kcal: 390, img: "assets/img/bench-press.jpg",
      desc: "Monday in the guide's schedule. Heavy presses first, then flyes, dips and triceps finishers.",
      exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: "8", kg: 60, rest: 150, img: "assets/img/bench-press.jpg" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10", kg: 22, rest: 120, img: "assets/img/bench-press.jpg" },
        { name: "Cable Chest Fly", sets: 3, reps: "12", kg: 15, rest: 75, img: "assets/img/pushups.jpg" },
        { name: "Chest Dips", sets: 3, reps: "10", kg: null, rest: 90, img: "assets/img/pushups.jpg" },
        { name: "Close-Grip Bench Press", sets: 3, reps: "8", kg: 45, rest: 120, img: "assets/img/bench-press.jpg" },
        { name: "Rope Pushdown", sets: 3, reps: "12", kg: 25, rest: 60, img: "assets/img/pushups.jpg" },
        { name: "Overhead Triceps Extension", sets: 3, reps: "12", kg: 20, rest: 60, img: "assets/img/pushups.jpg" }
      ]
    },
    {
      id: "back-biceps", title: "Back + Biceps", short: "Back", cat: "Pull", focus: "Back · Biceps", level: "Intermediate",
      mins: 60, kcal: 380, img: "assets/img/lat-pulldown.jpg",
      desc: "Tuesday. Deadlifts and rows for a thicker back, pulldowns for width, then curls.",
      exercises: [
        { name: "Deadlift", sets: 4, reps: "5", kg: 100, rest: 180, img: "assets/img/deadlift.jpg" },
        { name: "Lat Pulldown", sets: 4, reps: "10", kg: 55, rest: 120, img: "assets/img/lat-pulldown.jpg" },
        { name: "Barbell Bent-Over Row", sets: 3, reps: "8", kg: 60, rest: 120, img: "assets/img/deadlift.jpg" },
        { name: "Seated Cable Row", sets: 3, reps: "12", kg: 50, rest: 90, img: "assets/img/lat-pulldown.jpg" },
        { name: "Straight-Arm Pulldown", sets: 3, reps: "12", kg: 25, rest: 60, img: "assets/img/lat-pulldown.jpg" },
        { name: "Barbell Curl", sets: 3, reps: "10", kg: 25, rest: 75, img: "assets/img/bicep-curl.jpg" },
        { name: "Hammer Curl", sets: 3, reps: "12", kg: 12, rest: 60, img: "assets/img/bicep-curl.jpg" }
      ]
    },
    {
      id: "legs-abs", title: "Legs + Abs", short: "Legs", cat: "Legs", focus: "Quads · Hamstrings · Calves · Abs", level: "Advanced",
      mins: 65, kcal: 470, img: "assets/img/back-squat.jpg",
      desc: "Wednesday. Squat heavy, hinge, finish legs with machines — then a short ab circuit.",
      exercises: [
        { name: "Barbell Squat", sets: 4, reps: "6", kg: 80, rest: 180, img: "assets/img/back-squat.jpg" },
        { name: "Romanian Deadlift", sets: 3, reps: "10", kg: 70, rest: 150, img: "assets/img/deadlift.jpg" },
        { name: "Leg Press", sets: 3, reps: "12", kg: 140, rest: 120, img: "assets/img/back-squat.jpg" },
        { name: "Leg Extension", sets: 3, reps: "12", kg: 40, rest: 75, img: "assets/img/back-squat.jpg" },
        { name: "Leg Curl", sets: 3, reps: "12", kg: 35, rest: 75, img: "assets/img/back-squat.jpg" },
        { name: "Standing Calf Raises", sets: 4, reps: "15", kg: 60, rest: 60, img: "assets/img/back-squat.jpg" },
        { name: "Hanging Leg Raises", sets: 3, reps: "12", kg: null, rest: 60, img: "assets/img/core.jpg" },
        { name: "Plank", sets: 3, reps: "45 sec", kg: null, rest: 45, img: "assets/img/core.jpg" }
      ]
    },
    {
      id: "shoulders-traps", title: "Shoulders + Traps", short: "Delts", cat: "Shoulders", focus: "Front · Side · Rear delts · Traps", level: "Intermediate",
      mins: 55, kcal: 340, img: "assets/img/shoulder-press.jpg",
      desc: "Thursday. Overhead pressing for strength, raises for shape, rows and carries for the traps.",
      exercises: [
        { name: "Shoulder Press", sets: 4, reps: "8", kg: 40, rest: 150, img: "assets/img/shoulder-press.jpg" },
        { name: "Arnold Press", sets: 3, reps: "10", kg: 14, rest: 90, img: "assets/img/shoulder-press.jpg" },
        { name: "Lateral Raises", sets: 3, reps: "15", kg: 8, rest: 60, img: "assets/img/shoulder-press.jpg" },
        { name: "Rear Delt Fly", sets: 3, reps: "15", kg: 6, rest: 60, img: "assets/img/shoulder-press.jpg" },
        { name: "Upright Row", sets: 3, reps: "10", kg: 30, rest: 90, img: "assets/img/strength.jpg" },
        { name: "Face Pulls", sets: 3, reps: "15", kg: 20, rest: 60, img: "assets/img/lat-pulldown.jpg" },
        { name: "Farmer's Walk", sets: 3, reps: "40 m", kg: 24, rest: 90, img: "assets/img/deadlift.jpg" }
      ]
    },
    {
      id: "chest-back", title: "Chest + Back", short: "Ch+Bk", cat: "Upper", focus: "Chest · Back supersets", level: "Intermediate",
      mins: 55, kcal: 400, img: "assets/img/strength.jpg",
      desc: "Friday. Push–pull pairings: alternate a chest move with a back move to save time.",
      exercises: [
        { name: "Incline Bench Press", sets: 4, reps: "8", kg: 50, rest: 120, img: "assets/img/bench-press.jpg" },
        { name: "Pull-Ups", sets: 4, reps: "8", kg: null, rest: 120, img: "assets/img/lat-pulldown.jpg" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "10", kg: 24, rest: 90, img: "assets/img/bench-press.jpg" },
        { name: "T-Bar Row", sets: 3, reps: "10", kg: 40, rest: 90, img: "assets/img/deadlift.jpg" },
        { name: "Pec Deck Fly", sets: 3, reps: "12", kg: 40, rest: 60, img: "assets/img/pushups.jpg" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10", kg: 26, rest: 60, img: "assets/img/strength.jpg" },
        { name: "Push-Ups", sets: 2, reps: "max", kg: null, rest: 60, img: "assets/img/pushups.jpg" }
      ]
    },
    {
      id: "arms-abs", title: "Arms + Abs", short: "Arms", cat: "Arms", focus: "Biceps · Triceps · Forearms · Abs", level: "All levels",
      mins: 50, kcal: 300, img: "assets/img/bicep-curl.jpg",
      desc: "Saturday. Biceps and triceps supersets, a grip finisher and core work.",
      exercises: [
        { name: "EZ-Bar Curl", sets: 3, reps: "10", kg: 25, rest: 75, img: "assets/img/bicep-curl.jpg" },
        { name: "Skull Crushers", sets: 3, reps: "10", kg: 25, rest: 75, img: "assets/img/bench-press.jpg" },
        { name: "Incline Dumbbell Curl", sets: 3, reps: "12", kg: 10, rest: 60, img: "assets/img/bicep-curl.jpg" },
        { name: "Triceps Pushdown", sets: 3, reps: "12", kg: 25, rest: 60, img: "assets/img/pushups.jpg" },
        { name: "Preacher Curl", sets: 2, reps: "12", kg: 20, rest: 60, img: "assets/img/bicep-curl.jpg" },
        { name: "Wrist Curls", sets: 2, reps: "15", kg: 15, rest: 45, img: "assets/img/bicep-curl.jpg" },
        { name: "Cable Crunches", sets: 3, reps: "15", kg: 30, rest: 45, img: "assets/img/core.jpg" },
        { name: "Russian Twists", sets: 3, reps: "20", kg: 8, rest: 45, img: "assets/img/core.jpg" }
      ]
    },
    {
      id: "glutes", title: "Glute Builder", short: "Glutes", cat: "Glutes", focus: "Glutes · Hamstrings", level: "All levels",
      mins: 45, kcal: 330, img: "assets/img/hip-thrust.jpg",
      desc: "An extra lower-body day from the guide's glute section — swap it in for Legs + Abs any week.",
      exercises: [
        { name: "Hip Thrust", sets: 4, reps: "10", kg: 80, rest: 120, img: "assets/img/hip-thrust.jpg" },
        { name: "Bulgarian Split Squats", sets: 3, reps: "10", kg: 12, rest: 90, img: "assets/img/back-squat.jpg" },
        { name: "Romanian Deadlift", sets: 3, reps: "10", kg: 60, rest: 120, img: "assets/img/deadlift.jpg" },
        { name: "Sumo Squats", sets: 3, reps: "12", kg: 24, rest: 90, img: "assets/img/strength.jpg" },
        { name: "Cable Kickbacks", sets: 3, reps: "15", kg: 10, rest: 60, img: "assets/img/hip-thrust.jpg" },
        { name: "Hip Abduction", sets: 3, reps: "15", kg: 40, rest: 60, img: "assets/img/hip-thrust.jpg" }
      ]
    },
    {
      id: "cardio", title: "Cardio & Conditioning", short: "Cardio", cat: "Cardio", focus: "Heart · Endurance · Fat loss", level: "All levels",
      mins: 35, kcal: 350, img: "assets/img/rowing.jpg",
      desc: "Use on rest days or after a lift. Steady machine cardio plus a short interval finisher.",
      exercises: [
        { name: "Rowing Machine", sets: 1, reps: "10 min", kg: null, rest: 60, img: "assets/img/rowing.jpg" },
        { name: "Stair Climber", sets: 1, reps: "10 min", kg: null, rest: 60, img: "assets/img/run.jpg" },
        { name: "Jump Rope", sets: 3, reps: "45 sec", kg: null, rest: 30, img: "assets/img/hiit.jpg" },
        { name: "Burpees", sets: 3, reps: "10", kg: null, rest: 45, img: "assets/img/hiit.jpg" },
        { name: "High Knees", sets: 3, reps: "30 sec", kg: null, rest: 30, img: "assets/img/run.jpg" },
        { name: "Mountain Climbers", sets: 3, reps: "30 sec", kg: null, rest: 30, img: "assets/img/core.jpg" }
      ]
    }
  ],

  history: [
    { date: "Wed, 25 Nov", workout: "legs-abs", hr: 138, status: "Personal best" },
    { date: "Tue, 24 Nov", workout: "back-biceps", hr: 131, status: "Personal best" },
    { date: "Mon, 23 Nov", workout: "chest-triceps", hr: 129, status: "Completed" },
    { date: "Sat, 21 Nov", workout: "arms-abs", hr: 124, status: "Completed" },
    { date: "Fri, 20 Nov", workout: "chest-back", hr: 127, status: "Completed" }
  ],

  activity: {
    week: {
      range: "23–29 Nov", labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      kcal: [260, 310, 290, 380, 330, 520, 360], prev: [250, 300, 330, 300, 350, 380, 330],
      steps: [6200, 7400, 9800, 8100, 8752, 11200, 5400]
    },
    month: {
      range: "November 2026", labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      kcal: [2100, 2280, 2190, 2450], prev: [1900, 2000, 2100, 2150],
      steps: [52000, 58400, 55100, 56852]
    },
    rings: { move: [520, 600], exercise: [45, 60], stand: [10, 12] },
    byType: [["Legs + Abs", 470], ["Chest + Triceps", 390], ["Back + Biceps", 380], ["Shoulders + Traps", 340]],
    today: { workoutMin: 45, kcal: 520, steps: 8752, active: "1h 15m", goalPct: 75, heart: 72 }
  },

  body: {
    goal: 70.0, start: 75.5,
    weights: [
      { d: "Jul", w: 75.5 }, { d: "Aug", w: 74.6 }, { d: "Sep", w: 74.0 },
      { d: "Oct", w: 73.1 }, { d: "Nov", w: 72.4 }
    ],
    bmi: 23.1, fat: 18.2, fatChange: -1.4, muscle: 34.6, muscleChange: 0.8,
    updated: "23 Nov",
    measures: [
      { key: "chest", label: "Chest", value: 98.0, prev: 97.4 },
      { key: "waist", label: "Waist", value: 78.4, prev: 80.5 },
      { key: "hips", label: "Hips", value: 94.2, prev: 95.5 },
      { key: "arms", label: "Arms", value: 34.5, prev: 33.6 },
      { key: "thighs", label: "Thighs", value: 56.0, prev: 56.8 },
      { key: "neck", label: "Neck", value: 37.8, prev: 38.0 }
    ]
  },

  nutrition: {
    goal: 2000, burned: 520, water: 6, waterGoal: 8,
    macros: [
      { key: "carbs", label: "Carbs", g: 180, goal: 250 },
      { key: "protein", label: "Protein", g: 120, goal: 140 },
      { key: "fats", label: "Fats", g: 60, goal: 70 }
    ],
    meals: [
      { meal: "Breakfast", dish: "Kiribath with lunu miris", kcal: 480, img: "assets/img/kiribath.jpg", logged: true },
      { meal: "Lunch", dish: "Red rice & chicken curry", kcal: 720, img: "assets/img/rice-curry.jpg", logged: true },
      { meal: "Evening tea", dish: "Thambili & ulundu vadai", kcal: 250, img: "assets/img/thambili-vadai.jpg", logged: true },
      { meal: "Dinner", dish: "Egg hoppers & seeni sambol", kcal: 450, img: "assets/img/egg-hoppers.jpg", logged: false }
    ],
    // Quick-add list in the "Log food" dialog
    quickAdd: [
      { dish: "String hoppers & kiri hodi", kcal: 380 },
      { dish: "Pol roti with lunu miris", kcal: 260 },
      { dish: "Parippu (dhal) curry", kcal: 180 },
      { dish: "Chicken kottu roti", kcal: 650 },
      { dish: "Fish ambul thiyal & rice", kcal: 520 },
      { dish: "Gotukola sambol", kcal: 60 },
      { dish: "Watalappan", kcal: 300 },
      { dish: "Kola kanda", kcal: 140 }
    ]
  }
};
