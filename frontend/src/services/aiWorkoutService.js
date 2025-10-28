// AI Workout Suggestion Service
// This service provides AI-generated workout suggestions based on user preferences and fitness level

import { geminiService } from './geminiService';

const workoutTemplates = {
  beginner: {
    strength: [
      {
        name: "Barbell Back Squats",
        sets: 3,
        reps: "8-10",
        rest: "90 seconds",
        category: "lower body",
        instructions: "Barbell on upper back, squat down keeping chest up"
      },
      {
        name: "Barbell Bench Press",
        sets: 3,
        reps: "8-10",
        rest: "90 seconds",
        category: "upper body",
        instructions: "Lie on bench, lower barbell to chest, press up"
      },
      {
        name: "Dumbbell Push-ups",
        sets: 3,
        reps: "8-12",
        rest: "60 seconds",
        category: "upper body",
        instructions: "Hold dumbbells in hands, perform push-ups with dumbbells on ground"
      },
      {
        name: "Dumbbell Squats",
        sets: 3,
        reps: "12-15",
        rest: "60 seconds",
        category: "lower body",
        instructions: "Hold dumbbells at sides, squat down keeping chest up"
      },
      {
        name: "Dumbbell Rows",
        sets: 3,
        reps: "10-12 each arm",
        rest: "60 seconds",
        category: "upper body",
        instructions: "Bend forward, pull dumbbell to hip, alternate arms"
      },
      {
        name: "Dumbbell Lunges",
        sets: 3,
        reps: "10-12 each leg",
        rest: "60 seconds",
        category: "lower body",
        instructions: "Hold dumbbells at sides, step forward into lunge"
      },
      {
        name: "Dumbbell Shoulder Press",
        sets: 3,
        reps: "8-10",
        rest: "60 seconds",
        category: "upper body",
        instructions: "Press dumbbells overhead, lower with control"
      }
    ],
    cardio: [
      {
        name: "Barbell Thrusters",
        sets: 3,
        reps: "6-8",
        rest: "90 seconds",
        instructions: "Front rack position, squat, press overhead as you stand"
      },
      {
        name: "Dumbbell Thrusters",
        sets: 3,
        reps: "8-12",
        rest: "60 seconds",
        instructions: "Hold dumbbells at shoulders, squat then press overhead"
      },
      {
        name: "Dumbbell Swings",
        sets: 3,
        reps: "12-15",
        rest: "60 seconds",
        instructions: "Swing dumbbell between legs, thrust hips forward"
      },
      {
        name: "Mountain Climbers",
        sets: 3,
        duration: "30 seconds",
        rest: "45 seconds",
        instructions: "From plank position, alternate bringing knees toward chest"
      },
      {
        name: "Jumping Jacks",
        sets: 3,
        duration: "1 minute",
        rest: "30 seconds",
        instructions: "Jump while raising arms overhead, return to starting position"
      }
    ]
  },
  intermediate: {
    strength: [
      {
        name: "Barbell Deadlifts",
        sets: 3,
        reps: "6-8",
        rest: "120 seconds",
        category: "lower body",
        instructions: "Stand over barbell, grip and lift with straight back"
      },
      {
        name: "Barbell Overhead Press",
        sets: 3,
        reps: "6-8",
        rest: "90 seconds",
        category: "upper body",
        instructions: "Press barbell overhead from shoulder level"
      },
      {
        name: "Barbell Front Squats",
        sets: 3,
        reps: "6-8",
        rest: "120 seconds",
        category: "lower body",
        instructions: "Barbell in front rack position, squat down"
      },
      {
        name: "Dumbbell Bench Press",
        sets: 3,
        reps: "8-12",
        rest: "90 seconds",
        category: "upper body",
        instructions: "Lie on bench, press dumbbells up from chest"
      },
      {
        name: "Dumbbell Deadlifts",
        sets: 3,
        reps: "10-12",
        rest: "90 seconds",
        category: "lower body",
        instructions: "Hold dumbbells in front, hinge at hips, stand up"
      },
      {
        name: "Dumbbell Lateral Raises",
        sets: 3,
        reps: "10-12",
        rest: "60 seconds",
        category: "upper body",
        instructions: "Raise dumbbells to sides, lower with control"
      },
      {
        name: "Dumbbell Step-ups",
        sets: 3,
        reps: "10-12 each leg",
        rest: "90 seconds",
        category: "lower body",
        instructions: "Hold dumbbells, step up onto box, alternate legs"
      },
      {
        name: "Dumbbell Bicep Curls",
        sets: 3,
        reps: "10-12",
        rest: "60 seconds",
        category: "upper body",
        instructions: "Curl dumbbells to shoulders, lower with control"
      }
    ],
    cardio: [
      {
        name: "Barbell Clean & Press",
        sets: 3,
        reps: "5-6",
        rest: "90 seconds",
        instructions: "Clean barbell to shoulders, then press overhead"
      },
      {
        name: "Dumbbell Clean & Press",
        sets: 3,
        reps: "6-8",
        rest: "90 seconds",
        instructions: "Clean dumbbells to shoulders, then press overhead"
      },
      {
        name: "Dumbbell Snatches",
        sets: 3,
        reps: "5-8 each arm",
        rest: "90 seconds",
        instructions: "Swing dumbbell up to overhead position"
      },
      {
        name: "Burpees",
        sets: 3,
        reps: "8-12",
        rest: "90 seconds",
        instructions: "Squat, jump back to plank, do push-up, jump forward, jump up"
      },
      {
        name: "Box Jumps",
        sets: 3,
        reps: "8-12",
        rest: "90 seconds",
        instructions: "Jump onto elevated surface, step down, repeat"
      }
    ]
  },
  advanced: {
    strength: [
      {
        name: "Barbell Clean & Press",
        sets: 3,
        reps: "5-6",
        rest: "120 seconds",
        category: "full body",
        instructions: "Clean barbell to shoulders, then press overhead"
      },
      {
        name: "Barbell Snatches",
        sets: 3,
        reps: "3-5",
        rest: "120 seconds",
        category: "full body",
        instructions: "Swing barbell up to overhead position in one motion"
      },
      {
        name: "Barbell Romanian Deadlifts",
        sets: 3,
        reps: "6-8",
        rest: "120 seconds",
        category: "lower body",
        instructions: "Hinge at hips, lower barbell down legs"
      },
      {
        name: "Dumbbell Incline Press",
        sets: 3,
        reps: "6-8",
        rest: "120 seconds",
        category: "upper body",
        instructions: "Lie on incline bench, press dumbbells up from chest"
      },
      {
        name: "Dumbbell Bulgarian Split Squats",
        sets: 3,
        reps: "8-10 each leg",
        rest: "120 seconds",
        category: "lower body",
        instructions: "Back foot on bench, squat down with dumbbells"
      },
      {
        name: "Dumbbell Arnold Press",
        sets: 3,
        reps: "6-8",
        rest: "120 seconds",
        category: "upper body",
        instructions: "Start with dumbbells at chin, rotate and press overhead"
      },
      {
        name: "Dumbbell Romanian Deadlifts",
        sets: 3,
        reps: "8-10",
        rest: "120 seconds",
        category: "lower body",
        instructions: "Hinge at hips, lower dumbbells down legs"
      },
      {
        name: "Dumbbell Tricep Extensions",
        sets: 3,
        reps: "8-10",
        rest: "90 seconds",
        category: "upper body",
        instructions: "Extend arms overhead, lower dumbbells behind head"
      }
    ],
    cardio: [
      {
        name: "Barbell Complex",
        sets: 3,
        reps: "3-5 each movement",
        rest: "120 seconds",
        instructions: "Clean, press, squat, row, deadlift - all with barbell"
      },
      {
        name: "Dumbbell Complex",
        sets: 3,
        reps: "5 each movement",
        rest: "120 seconds",
        instructions: "Clean, press, squat, row, deadlift - all with dumbbells"
      },
      {
        name: "Dumbbell Man Makers",
        sets: 3,
        reps: "6-8",
        rest: "120 seconds",
        instructions: "Row, push-up, clean, press - all in one movement"
      },
      {
        name: "Burpees",
        sets: 4,
        reps: "10-15",
        rest: "90 seconds",
        instructions: "Squat, jump back to plank, do push-up, jump forward, jump up"
      },
      {
        name: "Box Jumps",
        sets: 4,
        reps: "10-15",
        rest: "90 seconds",
        instructions: "Jump onto elevated surface, step down, repeat"
      }
    ]
  }
};

const focusAreas = {
  "upper body": ["Barbell Bench Press", "Barbell Overhead Press", "Barbell Rows", "Dumbbell Push-ups", "Dumbbell Rows", "Dumbbell Shoulder Press", "Dumbbell Bench Press", "Dumbbell Lateral Raises", "Dumbbell Bicep Curls", "Dumbbell Incline Press", "Dumbbell Arnold Press", "Pull-ups", "Push-ups"],
  "lower body": ["Barbell Back Squats", "Barbell Front Squats", "Barbell Deadlifts", "Barbell Romanian Deadlifts", "Dumbbell Squats", "Dumbbell Lunges", "Dumbbell Deadlifts", "Dumbbell Step-ups", "Dumbbell Bulgarian Split Squats", "Dumbbell Romanian Deadlifts", "Box Jumps", "Calf Raises", "Lunges"],
  "core": ["Plank", "Crunches", "Russian Twists", "Leg Raises", "Mountain Climbers", "Dumbbell Woodchops", "Dumbbell Side Bends", "Dumbbell Windmills", "Hollow Holds", "L-Sits", "GHD Sit-ups"],
  "cardio": ["Barbell Thrusters", "Barbell Clean & Press", "Dumbbell Thrusters", "Dumbbell Swings", "Dumbbell Clean & Press", "Dumbbell Snatches", "Burpees", "Mountain Climbers", "Jumping Jacks", "Box Jumps", "Row", "Running"],
  "full body": ["Barbell Thrusters", "Barbell Clean & Press", "Barbell Complex", "Dumbbell Thrusters", "Dumbbell Complex", "Dumbbell Man Makers", "Burpees", "Mountain Climbers", "Jumping Jacks", "Box Jumps", "Dumbbell Clean & Press", "Wall Balls"]
};

// Equipment mapping for exercises
const exerciseEquipment = {
  "Barbell Bench Press": ["barbell", "bench"],
  "Barbell Overhead Press": ["barbell"],
  "Barbell Rows": ["barbell"],
  "Barbell Back Squats": ["barbell"],
  "Barbell Front Squats": ["barbell"],
  "Barbell Deadlifts": ["barbell"],
  "Barbell Romanian Deadlifts": ["barbell"],
  "Barbell Thrusters": ["barbell"],
  "Barbell Clean & Press": ["barbell"],
  "Barbell Complex": ["barbell"],
  "Barbell Snatches": ["barbell"],
  "Dumbbell Push-ups": ["dumbbells"],
  "Dumbbell Rows": ["dumbbells"],
  "Dumbbell Shoulder Press": ["dumbbells"],
  "Dumbbell Bench Press": ["dumbbells", "bench"],
  "Dumbbell Lateral Raises": ["dumbbells"],
  "Dumbbell Bicep Curls": ["dumbbells"],
  "Dumbbell Incline Press": ["dumbbells", "bench"],
  "Dumbbell Arnold Press": ["dumbbells"],
  "Dumbbell Squats": ["dumbbells"],
  "Dumbbell Lunges": ["dumbbells"],
  "Dumbbell Deadlifts": ["dumbbells"],
  "Dumbbell Step-ups": ["dumbbells", "box_platform"],
  "Dumbbell Bulgarian Split Squats": ["dumbbells", "bench"],
  "Dumbbell Romanian Deadlifts": ["dumbbells"],
  "Dumbbell Thrusters": ["dumbbells"],
  "Dumbbell Clean & Press": ["dumbbells"],
  "Dumbbell Snatches": ["dumbbells"],
  "Dumbbell Complex": ["dumbbells"],
  "Dumbbell Man Makers": ["dumbbells"],
  "Dumbbell Woodchops": ["dumbbells"],
  "Dumbbell Side Bends": ["dumbbells"],
  "Dumbbell Windmills": ["dumbbells"],
  "Pull-ups": ["pullup_bar"],
  "Push-ups": [],
  "Box Jumps": ["box_platform"],
  "Burpees": [],
  "Mountain Climbers": [],
  "Jumping Jacks": [],
  "Plank": [],
  "Crunches": [],
  "Russian Twists": ["dumbbells"],
  "Leg Raises": [],
  "Hollow Holds": [],
  "L-Sits": ["dip_bars"],
  "GHD Sit-ups": ["ghd_machine"],
  "Calf Raises": ["box_platform"],
  "Lunges": [],
  "Row": ["rowing_machine"],
  "Running": ["treadmill"],
  "Wall Balls": ["medicine_balls"],
  "Kettlebell Swings": ["kettlebells"],
  "Kettlebell Clean & Press": ["kettlebells"],
  "Kettlebell Snatches": ["kettlebells"],
  "Resistance Band Rows": ["resistance_bands"],
  "Resistance Band Squats": ["resistance_bands"],
  "Resistance Band Press": ["resistance_bands"],
  "Lat Pulldown": ["lat_pulldown"],
  "Leg Press": ["leg_press"],
  "Cable Rows": ["cable_machine"],
  "Cable Press": ["cable_machine"],
  "Smith Machine Squats": ["smith_machine"],
  "Smith Machine Press": ["smith_machine"],
  "Dip Bar Dips": ["dip_bars"],
  "Bike": ["bike"]
};

export const aiWorkoutService = {
  // Filter exercises based on available equipment
  filterExercisesByEquipment(exercises, availableEquipment) {
    return exercises.filter(exercise => {
      const requiredEquipment = exerciseEquipment[exercise.name] || [];
      // If no equipment required, always include
      if (requiredEquipment.length === 0) return true;
      // Check if user has all required equipment
      return requiredEquipment.every(equipment => availableEquipment.includes(equipment));
    });
  },

  // Prioritize exercises that use the user's available equipment
  prioritizeExercisesByEquipment(exercises, availableEquipment) {
    return exercises.sort((a, b) => {
      const aEquipment = exerciseEquipment[a.name] || [];
      const bEquipment = exerciseEquipment[b.name] || [];
      
      // Count how many pieces of user's equipment each exercise uses
      const aEquipmentCount = aEquipment.filter(eq => availableEquipment.includes(eq)).length;
      const bEquipmentCount = bEquipment.filter(eq => availableEquipment.includes(eq)).length;
      
      // Prioritize exercises that use more of the user's equipment
      if (aEquipmentCount !== bEquipmentCount) {
        return bEquipmentCount - aEquipmentCount;
      }
      
      // If equipment usage is equal, prioritize exercises that use equipment over bodyweight
      const aUsesEquipment = aEquipment.length > 0;
      const bUsesEquipment = bEquipment.length > 0;
      
      if (aUsesEquipment !== bUsesEquipment) {
        return bUsesEquipment ? 1 : -1;
      }
      
      return 0;
    });
  },

  // Generate personalized workout based on user preferences
  generateWorkout(userPreferences) {
    const {
      fitnessLevel = 'beginner',
      focusArea = 'full body',
      duration = 45,
      equipment = 'none',
      intensity = 'moderate',
      exerciseCount = 5,
      availableEquipment = ['dumbbells', 'barbell']
    } = userPreferences;

    const template = workoutTemplates[fitnessLevel];
    let exercises = [];

    // Select exercises based on focus area and user's exercise count preference
    if (focusArea === 'full body') {
      const strengthCount = Math.ceil(exerciseCount * 0.6); // 60% strength exercises
      const cardioCount = exerciseCount - strengthCount; // Remaining cardio exercises
      let allExercises = [
        ...template.strength,
        ...template.cardio
      ];
      
      // Filter exercises based on available equipment
      allExercises = this.filterExercisesByEquipment(allExercises, availableEquipment);
      
      // Prioritize exercises that use the user's equipment
      allExercises = this.prioritizeExercisesByEquipment(allExercises, availableEquipment);
      
      exercises = [
        ...allExercises.slice(0, strengthCount),
        ...allExercises.slice(strengthCount, strengthCount + cardioCount)
      ];
    } else {
      const focusExercises = focusAreas[focusArea] || focusAreas['full body'];
      let availableExercises = focusExercises.map(name => {
        // Find exercise in templates or create default
        const found = [...template.strength, ...template.cardio].find(ex => ex.name === name);
        return found || {
          name,
          sets: 3,
          reps: fitnessLevel === 'beginner' ? '8-12' : fitnessLevel === 'intermediate' ? '10-15' : '12-20',
          rest: fitnessLevel === 'beginner' ? '60 seconds' : fitnessLevel === 'intermediate' ? '90 seconds' : '120 seconds',
          category: focusArea
        };
      });
      
      // Filter exercises based on available equipment
      availableExercises = this.filterExercisesByEquipment(availableExercises, availableEquipment);
      
      // Prioritize exercises that use the user's equipment
      availableExercises = this.prioritizeExercisesByEquipment(availableExercises, availableEquipment);
      
      exercises = availableExercises.slice(0, exerciseCount);
    }
    
    // Ensure we have the requested number of exercises
    if (exercises.length < exerciseCount) {
      const allExercises = [...template.strength, ...template.cardio];
      // Filter all exercises by available equipment
      const availableAllExercises = this.filterExercisesByEquipment(allExercises, availableEquipment);
      
      while (exercises.length < exerciseCount && availableAllExercises.length > 0) {
        const randomExercise = availableAllExercises[Math.floor(Math.random() * availableAllExercises.length)];
        if (!exercises.find(ex => ex.name === randomExercise.name)) {
          exercises.push(randomExercise);
        }
        availableAllExercises.splice(availableAllExercises.indexOf(randomExercise), 1);
      }
    }
    
    // Limit to the requested number of exercises
    exercises = exercises.slice(0, exerciseCount);

    // Adjust intensity
    exercises = exercises.map(exercise => {
      const adjusted = { ...exercise };
      if (intensity === 'high') {
        if (adjusted.sets) adjusted.sets += 1;
        if (adjusted.reps) {
          const [min, max] = adjusted.reps.split('-').map(Number);
          adjusted.reps = `${min + 2}-${max + 3}`;
        }
        if (adjusted.duration) {
          const duration = parseInt(adjusted.duration);
          adjusted.duration = `${duration + 15} seconds`;
        }
      } else if (intensity === 'low') {
        if (adjusted.sets && adjusted.sets > 1) adjusted.sets -= 1;
        if (adjusted.reps) {
          const [min, max] = adjusted.reps.split('-').map(Number);
          adjusted.reps = `${Math.max(1, min - 2)}-${Math.max(3, max - 2)}`;
        }
      }
      return adjusted;
    });

    return {
      name: `${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)} ${fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)} Workout`,
      exercises,
      estimatedDuration: duration,
      difficulty: fitnessLevel,
      focusArea,
      intensity,
      createdAt: new Date().toISOString()
    };
  },

  // Generate multiple workout options
  generateWorkoutOptions(userPreferences) {
    const options = [];
    const focusAreas = ['upper body', 'lower body', 'core', 'cardio', 'full body'];
    
    focusAreas.forEach(area => {
      options.push(this.generateWorkout({
        ...userPreferences,
        focusArea: area
      }));
    });

    return options;
  },

  // Get workout suggestions based on previous workouts
  getPersonalizedSuggestions(workoutHistory, userPreferences) {
    // Analyze workout history to find patterns
    const recentWorkouts = workoutHistory.slice(0, 5);
    const focusAreaCounts = {};
    
    recentWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const category = exercise.category || 'full body';
        focusAreaCounts[category] = (focusAreaCounts[category] || 0) + 1;
      });
    });

    // Find least worked area
    const leastWorkedArea = Object.keys(focusAreaCounts).length > 0 
      ? Object.entries(focusAreaCounts).sort(([,a], [,b]) => a - b)[0][0]
      : 'full body';

    // Generate suggestion focusing on least worked area
    return this.generateWorkout({
      ...userPreferences,
      focusArea: leastWorkedArea
    });
  },

  // Get quick workout for busy days
  getQuickWorkout(userPreferences) {
    const quickWorkout = this.generateWorkout({
      ...userPreferences,
      duration: 15,
      intensity: 'moderate',
      exerciseCount: Math.min(userPreferences.exerciseCount || 5, 4) // Cap at 4 for quick workouts
    });

    quickWorkout.name = `Quick ${quickWorkout.name}`;
    quickWorkout.estimatedDuration = 15;

    return quickWorkout;
  },

  // NEW: Generate AI-powered workout using Gemini
  async generateGeminiWorkout(userPreferences, workoutHistory = []) {
    try {
      console.log('AI Workout Service: Generating Gemini workout');
      const geminiWorkout = await geminiService.generateWorkoutSuggestion(userPreferences, workoutHistory);
      console.log('AI Workout Service: Gemini workout generated:', geminiWorkout);
      return geminiWorkout;
    } catch (error) {
      console.error('AI Workout Service: Gemini failed, using Gemini fallback:', error);
      // Use Gemini service fallback instead of template
      console.log('AI Workout Service: Using Gemini fallback workout');
      return geminiService.createFallbackWorkout(userPreferences);
    }
  }
}; 