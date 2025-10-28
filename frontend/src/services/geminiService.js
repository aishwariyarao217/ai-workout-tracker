import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Validate Gemini API key
if (!apiKey || apiKey.includes('your_') || apiKey.trim() === '') {
  console.warn('⚠️ Gemini API key not found or invalid. AI workout generation will be disabled.');
  console.warn('Please set VITE_GEMINI_API_KEY in your .env file to enable AI features.');
}

const genAI = apiKey && !apiKey.includes('your_') && apiKey.trim() !== '' 
  ? new GoogleGenerativeAI(apiKey)
  : null;

console.log('🤖 Gemini AI initialized:', genAI ? '✅ Success' : '❌ Disabled (check API key)');

export const geminiService = {
  async generateWorkoutSuggestion(userPreferences, workoutHistory = []) {
    try {
      // Check if we have a valid API key
      if (!genAI) {
        console.log('Gemini: No API key available, using fallback workout');
        return this.createFallbackWorkout(userPreferences);
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create a detailed prompt for workout generation
      const prompt = this.createWorkoutPrompt(userPreferences, workoutHistory);
      
      // Log the prompt in a clear, visible way
      console.log('================ GEMINI PROMPT ================\n' + prompt + '\n===============================================');
      
      console.log('Gemini: Sending prompt:', prompt);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini: Received response:', text);
      
      // Parse the AI response into a structured workout
      const parsedWorkout = this.parseWorkoutResponse(text, userPreferences);
      console.log('Gemini: Parsed workout structure:', parsedWorkout);
      return parsedWorkout;
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      console.log('Gemini: Falling back to template workout due to API error');
      return this.createFallbackWorkout(userPreferences);
    }
  },

  createWorkoutPrompt(userPreferences, workoutHistory) {
    const { fitnessLevel, focusArea, duration, intensity } = userPreferences;
    
    // Add strong randomness to the prompt to ensure unique workouts
    const randomizer = Math.floor(Math.random() * 100000) + '-' + new Date().toISOString();
    const uuid = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now());
    const emojis = ['🔥','💪','🏋️‍♂️','🏃‍♂️','🤸‍♂️','🚴‍♂️','🏆','🥇','🎯','⏱️','🦾','🦵','🧘‍♂️','🤖','🥊','🧗‍♂️'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const motivationalPhrases = [
      'Push your limits!',
      'Stronger every day!',
      'No excuses!',
      'Crush your workout!',
      'You got this!',
      'Train insane or remain the same!',
      'Be your best self!',
      'One more rep!',
      'Earn your shower!',
      'Sweat now, shine later!'
    ];
    const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];

    // Add core category to the exercise pool in the prompt
    const exercisePool = `EXERCISE TYPES TO INCLUDE (choose 5-6 from these, and always include at least one from 'Core' for full body workouts):\n- Barbell: Back Squats, Front Squats, Deadlifts, Bench Press, Overhead Press, Clean & Press, Snatches, Thrusters, Romanian Deadlifts\n- Dumbbell: Squats, Lunges, Deadlifts, Bench Press, Shoulder Press, Rows, Thrusters, Clean & Press, Snatches, Complex movements\n- Gymnastics: Pull-ups, Push-ups, Toes-to-bar, L-Sits (NO advanced gymnastics like muscle-ups)\n- Bodyweight: Air Squats, Lunges, Box Jumps, Burpees, Mountain Climbers, Pistol Squats\n- Monostructural: Running, Rowing, Air Bike, Jump Rope, Burpees, Double-unders\n- Machine: Leg Press, Lat Pulldown, Cable Machine exercises, Smith Machine exercises\n- Cardio Equipment: Treadmill, Rowing Machine, Exercise Bike\n- Other: Kettlebells, Resistance Bands, Medicine Balls, Box/Platform exercises\n- Core: Plank Variations, Russian Twists, V-Ups, Hanging Knee Raises, Hollow Holds, Sit-Ups, Abmat Sit-Ups, Bicycle Crunches, Leg Raises, Flutter Kicks, Superman Holds, Dead Bugs`;

    // Analyze recent workout patterns
    const recentWorkouts = workoutHistory.slice(0, 5);
    const workoutAnalysis = this.analyzeWorkoutHistory(recentWorkouts);

    // Add core requirement for full body
    const coreRequirement = focusArea && focusArea.toLowerCase() === 'full body'
      ? '\nIMPORTANT: The workout MUST include at least one core exercise (e.g., planks, sit-ups, hollow holds, Russian twists, L-sits, leg raises, or similar).\n'
      : '';

    // Construct the prompt
    let prompt = `You are a CrossFit coach. Generate a unique, authentic CrossFit WOD (Workout of the Day) for a user.\n\n${exercisePool}\n\nUser Preferences: Fitness Level: ${fitnessLevel}, Focus Area: ${focusArea}, Duration: ${duration} min, Intensity: ${intensity}.\n\nRequirements:\n- 4-6 exercises per workout\n- Include warmup and cooldown\n- For full body workouts, always include at least one core movement\n- Avoid advanced gymnastics (no muscle-ups, handstand walks, etc.)\n- Avoid hardcoded or repeated workouts\n- Use only the user's available equipment\n- Make it fun and challenging!\n\nRandomizer: ${randomizer} | UUID: ${uuid} | ${randomEmoji} | ${randomPhrase}`;

    return prompt;
  },

  analyzeWorkoutHistory(workouts) {
    if (workouts.length === 0) {
      return "No recent workout history available.";
    }

    const focusAreas = workouts.map(w => w.focusArea).filter(Boolean);
    const mostCommonFocus = focusAreas.length > 0 
      ? focusAreas.sort((a, b) => 
          focusAreas.filter(v => v === a).length - focusAreas.filter(v => v === b).length
        ).pop()
      : 'none';

    const totalExercises = workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);
    const avgExercisesPerWorkout = Math.round(totalExercises / workouts.length);

    return `Recent workout patterns:
- Most common focus area: ${mostCommonFocus}
- Average exercises per workout: ${avgExercisesPerWorkout}
- Total recent workouts: ${workouts.length}
- Recent workout dates: ${workouts.map(w => new Date(w.createdAt?.toDate?.() || w.createdAt).toLocaleDateString()).join(', ')}`;
  },

  parseWorkoutResponse(responseText, userPreferences) {
    try {
      console.log('Gemini: Raw response received:', responseText);
      console.log('Gemini: Response type:', typeof responseText);
      console.log('Gemini: Response length:', responseText?.length);
      
      // First, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('Gemini: No JSON found in response, attempting to parse as text workout');
        console.log('Gemini: Full response text:', responseText);
        
        // Try to parse as a text-based workout description
        const textWorkout = this.parseTextWorkout(responseText, userPreferences);
        if (textWorkout) {
          console.log('Gemini: Successfully parsed text workout');
          return textWorkout;
        }
        
        throw new Error('No valid JSON found in response and text parsing failed');
      }

      const workoutData = JSON.parse(jsonMatch[0]);
      console.log('Gemini: Parsed JSON workout data:', workoutData);
      
      // Validate and enhance the workout data
      const exercises = workoutData.exercises || [];
      
      // For CrossFit workouts, we expect strength and WOD sections, not just exercises array
      console.log('Gemini: Checking workout structure:', {
        hasStrength: !!workoutData.strength,
        hasWod: !!workoutData.wod,
        hasExercises: !!workoutData.exercises,
        strengthData: workoutData.strength,
        wodData: workoutData.wod
      });
      
      if (!workoutData.strength || !workoutData.wod) {
        console.warn('Gemini returned invalid CrossFit structure, attempting to convert...');
        console.log('Gemini: Raw workout data:', workoutData);
        
        // Try to convert old format to new CrossFit structure
        if (workoutData.exercises && workoutData.exercises.length > 0) {
          console.log('Gemini: Converting old format to CrossFit structure');
          const convertedWorkout = this.convertToCrossFitStructure(workoutData, userPreferences);
          if (convertedWorkout) {
            console.log('Gemini: Successfully converted workout structure');
            return convertedWorkout;
          }
        }
        
        console.warn('Gemini: Conversion failed, using fallback');
        return this.createFallbackWorkout(userPreferences);
      }
      
      const workout = {
        name: workoutData.name || `${userPreferences.focusArea} ${userPreferences.fitnessLevel} Workout`,
        difficulty: workoutData.difficulty || userPreferences.fitnessLevel,
        intensity: workoutData.intensity || userPreferences.intensity,
        focusArea: workoutData.focusArea || userPreferences.focusArea,
        estimatedDuration: workoutData.estimatedDuration || userPreferences.duration,
        warmup: workoutData.warmup || this.createDefaultWarmup(userPreferences),
        strength: workoutData.strength || this.createDefaultStrength(userPreferences),
        wod: workoutData.wod || this.createDefaultWOD(userPreferences),
        cooldown: workoutData.cooldown || this.createDefaultCooldown(userPreferences),
        type: 'ai-generated',
        createdAt: new Date().toISOString()
      };

      // Ensure we have the CrossFit structure
      if (!workout.strength || !workout.wod) {
        console.warn('Missing CrossFit structure, using fallback');
        return this.createFallbackWorkout(userPreferences);
      }

      return workout;
      
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.log('Raw response:', responseText);
      
      // Fallback to a basic workout if parsing fails
      return this.createFallbackWorkout(userPreferences);
    }
  },

  parseTextWorkout(responseText, userPreferences) {
    try {
      console.log('Gemini: Attempting to parse text workout from:', responseText);
      
      // Extract workout name from the text
      const wodMatch = responseText.match(/WOD[:\s]+"([^"]+)"|Workout of the Day[:\s]+"([^"]+)"|"([^"]+)"\s*\(/);
      const nameMatch = responseText.match(/workout[:\s]+([^\n]+)/i) || 
                       responseText.match(/wod[:\s]+([^\n]+)/i) ||
                       responseText.match(/^([^\n]+)/);
      
      let workoutName = 'CrossFit Workout';
      if (wodMatch) {
        workoutName = wodMatch[1] || wodMatch[2] || wodMatch[3] || 'CrossFit WOD';
      } else if (nameMatch) {
        workoutName = nameMatch[1].trim();
      }
      
      // Extract exercises from the specific format Gemini is returning
      // Pattern: * Exercise Name: X reps or * Exercise Name (details): X reps
      const exercisePatterns = [
        /\*\s*([^:]+):\s*(\d+)\s*reps?/gi,
        /\*\s*([^:]+):\s*([^0-9]+)\s*(\d+)\s*reps?/gi,
        /\*\s*([^:]+):\s*([^0-9]+)\s*(\d+)\s*seconds?/gi,
        /\*\s*([^:]+):\s*(\d+)\s*seconds?/gi,
        /\*\s*([^:]+)\s*\(([^)]+)\):\s*(\d+)\s*reps?/gi,
        /\*\s*([^:]+)\s*\(([^)]+)\):\s*([^0-9]+)\s*(\d+)\s*reps?/gi
      ];
      
      let exercises = [];
      
      // First, try to find all bullet points with exercises
      const allBulletPoints = responseText.match(/\*\s*([^:\n]+):\s*([^\n]+)/gi);
      console.log('Gemini: Found bullet points:', allBulletPoints);
      
      if (allBulletPoints) {
        for (const bulletPoint of allBulletPoints) {
          // Extract exercise name and details
          const match = bulletPoint.match(/\*\s*([^:]+):\s*(.+)/);
          if (match) {
            const exerciseName = match[1].trim();
            const details = match[2].trim();
            
            // Skip warm-up and cool-down exercises
            if (exerciseName.toLowerCase().includes('jumping jack') ||
                exerciseName.toLowerCase().includes('high knee') ||
                exerciseName.toLowerCase().includes('butt kick') ||
                exerciseName.toLowerCase().includes('arm circle') ||
                exerciseName.toLowerCase().includes('stretch') ||
                exerciseName.toLowerCase().includes('cool-down') ||
                exerciseName.toLowerCase().includes('warm-up') ||
                exerciseName.toLowerCase().includes('static') ||
                exerciseName.toLowerCase().includes('dynamic')) {
              continue;
            }
            
            // Determine weight/category based on exercise name
            let weight = 'Bodyweight';
            let category = 'conditioning';
            
            if (exerciseName.toLowerCase().includes('squat') && 
                !exerciseName.toLowerCase().includes('air')) {
              weight = 'Barbell';
              category = 'strength';
            } else if (exerciseName.toLowerCase().includes('row')) {
              weight = 'Dumbbell';
              category = 'strength';
            } else if (exerciseName.toLowerCase().includes('plank')) {
              category = 'core';
            }
            
            exercises.push({
              name: exerciseName,
              sets: 3,
              reps: details,
              weight: weight,
              category: category
            });
          }
        }
      }
      
      // If no exercises found with bullet points, try the regex patterns
      if (exercises.length === 0) {
        for (const pattern of exercisePatterns) {
          const matches = [...responseText.matchAll(pattern)];
          for (const match of matches) {
            const exerciseName = match[1].trim();
            const reps = match[2] || match[3] || match[4] || '10-15';
            const weight = match[2] && match[2].includes('reps') ? 'Bodyweight' : (match[2] || 'Bodyweight');
            
            // Skip warm-up and cool-down exercises
            if (exerciseName.toLowerCase().includes('jumping jack') ||
                exerciseName.toLowerCase().includes('high knee') ||
                exerciseName.toLowerCase().includes('butt kick') ||
                exerciseName.toLowerCase().includes('arm circle') ||
                exerciseName.toLowerCase().includes('stretch') ||
                exerciseName.toLowerCase().includes('cool-down') ||
                exerciseName.toLowerCase().includes('warm-up')) {
              continue;
            }
            
            exercises.push({
              name: exerciseName,
              sets: 3,
              reps: reps,
              weight: weight,
              category: 'conditioning'
            });
          }
        }
      }
      
      console.log('Gemini: Extracted exercises:', exercises);
      
      // If still no exercises found, create some basic ones based on the response
      if (exercises.length === 0) {
        console.log('Gemini: No exercises found, creating default ones');
        exercises = [
          { name: 'Back Squats', sets: 3, reps: '8', weight: 'Barbell', category: 'strength' },
          { name: 'Dumbbell Rows', sets: 3, reps: '10 per arm', weight: 'Dumbbell', category: 'strength' },
          { name: 'Box Jumps', sets: 3, reps: '10', weight: 'Bodyweight', category: 'conditioning' },
          { name: 'Plank', sets: 3, reps: '30 seconds', weight: 'Bodyweight', category: 'core' },
          { name: 'Burpees', sets: 3, reps: '15', weight: 'Bodyweight', category: 'conditioning' }
        ];
      }
      
      // Create a proper CrossFit structure
      const strengthExercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes('squat') ||
        ex.name.toLowerCase().includes('row') ||
        ex.name.toLowerCase().includes('press') ||
        ex.name.toLowerCase().includes('deadlift') ||
        ex.name.toLowerCase().includes('bench')
      );
      
      const wodExercises = exercises.filter(ex => 
        !ex.name.toLowerCase().includes('squat') &&
        !ex.name.toLowerCase().includes('row') &&
        !ex.name.toLowerCase().includes('press') &&
        !ex.name.toLowerCase().includes('deadlift') &&
        !ex.name.toLowerCase().includes('bench')
      );
      
      const workout = {
        name: workoutName,
        difficulty: userPreferences.fitnessLevel,
        intensity: userPreferences.intensity,
        focusArea: userPreferences.focusArea,
        estimatedDuration: userPreferences.duration,
        warmup: this.createDefaultWarmup(userPreferences),
        strength: {
          name: 'Strength',
          exercises: strengthExercises.length > 0 ? strengthExercises : exercises.slice(0, 2)
        },
        wod: {
          name: 'WOD',
          exercises: wodExercises.length > 0 ? wodExercises : exercises.slice(2)
        },
        cooldown: this.createDefaultCooldown(userPreferences),
        type: 'ai-generated',
        createdAt: new Date().toISOString()
      };
      
      console.log('Gemini: Created text-based workout:', workout);
      return workout;
      
    } catch (error) {
      console.error('Error parsing text workout:', error);
      return null;
    }
  },

  convertToCrossFitStructure(workoutData, userPreferences) {
    try {
      const { exercises = [] } = workoutData;
      
      if (exercises.length === 0) return null;
      
      // Split exercises into strength and WOD sections
      const strengthExercises = exercises.filter(ex => 
        ex.category === 'strength' || 
        ex.name.toLowerCase().includes('squat') ||
        ex.name.toLowerCase().includes('deadlift') ||
        ex.name.toLowerCase().includes('press') ||
        ex.name.toLowerCase().includes('bench') ||
        ex.name.toLowerCase().includes('row')
      );
      
      const wodExercises = exercises.filter(ex => 
        ex.category === 'conditioning' || 
        ex.category === 'gymnastics' ||
        ex.name.toLowerCase().includes('burpee') ||
        ex.name.toLowerCase().includes('jump') ||
        ex.name.toLowerCase().includes('run') ||
        ex.name.toLowerCase().includes('row') ||
        ex.name.toLowerCase().includes('bike')
      );
      
      // If we don't have enough exercises in each category, redistribute
      if (strengthExercises.length < 1) {
        strengthExercises.push(...wodExercises.slice(0, 1));
        wodExercises.splice(0, 1);
      }
      if (wodExercises.length < 2) {
        wodExercises.push(...strengthExercises.slice(1, 2));
        strengthExercises.splice(1, 1);
      }
      
      const convertedWorkout = {
        name: workoutData.name || `${userPreferences.focusArea} ${userPreferences.fitnessLevel} Workout`,
        difficulty: workoutData.difficulty || userPreferences.fitnessLevel,
        intensity: workoutData.intensity || userPreferences.intensity,
        focusArea: workoutData.focusArea || userPreferences.focusArea,
        estimatedDuration: workoutData.estimatedDuration || userPreferences.duration,
        warmup: workoutData.warmup || this.createDefaultWarmup(userPreferences),
        strength: {
          duration: "10-15 minutes",
          focus: strengthExercises[0]?.name || "Strength Work",
          exercises: strengthExercises.map(ex => ({
            name: ex.name,
            sets: ex.sets || "3",
            reps: ex.reps || "8-12",
            rest: ex.rest || "90 seconds",
            category: "strength",
            instructions: ex.instructions || `Perform ${ex.name} with proper form`,
            scaling: ex.scaling || "Adjust weight as needed"
          }))
        },
        wod: {
          duration: "10-15 minutes",
          workoutType: "AMRAP",
          description: "Complete as many rounds as possible in 10 minutes",
          exercises: wodExercises.map(ex => ({
            name: ex.name,
            reps: ex.reps || "10",
            category: ex.category || "conditioning",
            instructions: ex.instructions || `Perform ${ex.reps || '10'} ${ex.name}`,
            scaling: ex.scaling || "Scale as needed for your level"
          }))
        },
        cooldown: workoutData.cooldown || this.createDefaultCooldown(userPreferences),
        type: 'ai-generated-converted',
        createdAt: new Date().toISOString()
      };
      
      console.log('Gemini: Converted workout structure:', convertedWorkout);
      return convertedWorkout;
      
    } catch (error) {
      console.error('Gemini: Error converting workout structure:', error);
      return null;
    }
  },

  createFallbackWorkout(userPreferences) {
    const { fitnessLevel, focusArea, duration, intensity, availableEquipment = ['dumbbells', 'barbell'] } = userPreferences;
    
    // In fallback logic, add a 'core' category and ensure at least one core movement for full body
    const fallbackExercises = {
      'barbell': [
        { name: 'Back Squats', type: 'barbell' },
        { name: 'Front Squats', type: 'barbell' },
        { name: 'Deadlifts', type: 'barbell' },
        { name: 'Bench Press', type: 'barbell' },
        { name: 'Overhead Press', type: 'barbell' },
        { name: 'Clean & Press', type: 'barbell' },
        { name: 'Snatches', type: 'barbell' },
        { name: 'Thrusters', type: 'barbell' },
        { name: 'Romanian Deadlifts', type: 'barbell' }
      ],
      'dumbbell': [
        { name: 'Dumbbell Squats', type: 'dumbbell' },
        { name: 'Dumbbell Lunges', type: 'dumbbell' },
        { name: 'Dumbbell Deadlifts', type: 'dumbbell' },
        { name: 'Dumbbell Bench Press', type: 'dumbbell' },
        { name: 'Dumbbell Shoulder Press', type: 'dumbbell' },
        { name: 'Dumbbell Rows', type: 'dumbbell' },
        { name: 'Dumbbell Thrusters', type: 'dumbbell' },
        { name: 'Dumbbell Clean & Press', type: 'dumbbell' },
        { name: 'Dumbbell Snatches', type: 'dumbbell' },
        { name: 'Dumbbell Complex', type: 'dumbbell' }
      ],
      'gymnastics': [
        { name: 'Pull-ups', type: 'gymnastics' },
        { name: 'Push-ups', type: 'gymnastics' },
        { name: 'Toes-to-bar', type: 'gymnastics' },
        { name: 'L-Sits', type: 'gymnastics' }
      ],
      'bodyweight': [
        { name: 'Air Squats', type: 'bodyweight' },
        { name: 'Lunges', type: 'bodyweight' },
        { name: 'Box Jumps', type: 'bodyweight' },
        { name: 'Burpees', type: 'bodyweight' },
        { name: 'Mountain Climbers', type: 'bodyweight' },
        { name: 'Pistol Squats', type: 'bodyweight' }
      ],
      'monostructural': [
        { name: 'Running', type: 'monostructural' },
        { name: 'Rowing', type: 'monostructural' },
        { name: 'Air Bike', type: 'monostructural' },
        { name: 'Jump Rope', type: 'monostructural' },
        { name: 'Double-unders', type: 'monostructural' }
      ],
      'machine': [
        { name: 'Leg Press', type: 'machine' },
        { name: 'Lat Pulldown', type: 'machine' },
        { name: 'Cable Machine Exercise', type: 'machine' },
        { name: 'Smith Machine Exercise', type: 'machine' }
      ],
      'cardio equipment': [
        { name: 'Treadmill', type: 'cardio equipment' },
        { name: 'Rowing Machine', type: 'cardio equipment' },
        { name: 'Exercise Bike', type: 'cardio equipment' }
      ],
      'other': [
        { name: 'Kettlebell Swings', type: 'other' },
        { name: 'Resistance Band Pulls', type: 'other' },
        { name: 'Medicine Ball Slams', type: 'other' },
        { name: 'Box Step-Ups', type: 'other' }
      ],
      'core': [
        { name: 'Plank', type: 'core' },
        { name: 'Side Plank', type: 'core' },
        { name: 'Russian Twists', type: 'core' },
        { name: 'V-Ups', type: 'core' },
        { name: 'Hanging Knee Raises', type: 'core' },
        { name: 'Hollow Holds', type: 'core' },
        { name: 'Sit-Ups', type: 'core' },
        { name: 'Abmat Sit-Ups', type: 'core' },
        { name: 'Bicycle Crunches', type: 'core' },
        { name: 'Leg Raises', type: 'core' },
        { name: 'Flutter Kicks', type: 'core' },
        { name: 'Superman Holds', type: 'core' },
        { name: 'Dead Bugs', type: 'core' }
      ],
      'full body': [
        { name: 'Air Squats', type: 'bodyweight' },
        { name: 'Push-ups', type: 'gymnastics' },
        { name: 'Burpees', type: 'bodyweight' },
        { name: 'Dumbbell Thrusters', type: 'dumbbell' },
        { name: 'Pull-ups', type: 'gymnastics' },
        { name: 'Kettlebell Swings', type: 'other' },
        { name: 'Plank', type: 'core' },
        { name: 'Russian Twists', type: 'core' }
      ]
    };

    // Filter exercises based on available equipment
    const filterExercisesByEquipment = (exercises) => {
      return exercises.filter(exercise => {
        const exerciseName = exercise.name.toLowerCase();
        const hasEquipment = availableEquipment.map(eq => eq.toLowerCase());
        
        // Check equipment requirements - be more flexible with alternatives
        if (exerciseName.includes('barbell') && !hasEquipment.includes('barbell')) {
          // Allow dumbbell alternatives for barbell exercises
          if (hasEquipment.includes('dumbbells')) {
            return true; // Will be replaced with dumbbell version
          }
          return false;
        }
        if (exerciseName.includes('dumbbell') && !hasEquipment.includes('dumbbells')) return false;
        if (exerciseName.includes('bench') && !hasEquipment.includes('bench')) {
          // Allow floor or standing alternatives
          return true; // Will be modified to floor version
        }
        if (exerciseName.includes('pull-up') && !hasEquipment.includes('pullup_bar')) {
          // Allow resistance band alternatives
          if (hasEquipment.includes('resistance_bands')) {
            return true; // Will be replaced with band rows
          }
          return false;
        }
        if (exerciseName.includes('box jump') && !hasEquipment.includes('box_platform')) {
          // Allow alternatives like step-ups or regular jumps
          return true; // Will be modified to step-ups
        }
        if (exerciseName.includes('row') && !hasEquipment.includes('rowing_machine')) {
          // Allow alternatives like running or bike
          if (hasEquipment.includes('treadmill') || hasEquipment.includes('bike')) {
            return true; // Will be replaced with cardio alternative
          }
          return false;
        }
        if (exerciseName.includes('running') && !hasEquipment.includes('treadmill')) {
          // Allow outdoor running or other cardio
          return true; // Can be done outdoors
        }
        if (exerciseName.includes('wall ball') && !hasEquipment.includes('medicine_balls')) {
          // Allow alternatives like air squats
          return true; // Will be replaced with air squats
        }
        if (exerciseName.includes('kettlebell') && !hasEquipment.includes('kettlebells')) {
          // Allow dumbbell alternatives
          if (hasEquipment.includes('dumbbells')) {
            return true; // Will be replaced with dumbbell version
          }
          return false;
        }
        if (exerciseName.includes('resistance band') && !hasEquipment.includes('resistance_bands')) return false;
        if (exerciseName.includes('lat pulldown') && !hasEquipment.includes('lat_pulldown')) {
          // Allow dumbbell row alternatives
          if (hasEquipment.includes('dumbbells')) {
            return true; // Will be replaced with dumbbell rows
          }
          return false;
        }
        if (exerciseName.includes('leg press') && !hasEquipment.includes('leg_press')) {
          // Allow squat alternatives
          return true; // Will be replaced with squats
        }
        if (exerciseName.includes('cable') && !hasEquipment.includes('cable_machine')) {
          // Allow dumbbell alternatives
          if (hasEquipment.includes('dumbbells')) {
            return true; // Will be replaced with dumbbell version
          }
          return false;
        }
        if (exerciseName.includes('smith') && !hasEquipment.includes('smith_machine')) {
          // Allow free weight alternatives
          if (hasEquipment.includes('barbell') || hasEquipment.includes('dumbbells')) {
            return true; // Will be replaced with free weight version
          }
          return false;
        }
        if (exerciseName.includes('dip') && !hasEquipment.includes('dip_bars')) {
          // Allow push-up alternatives
          return true; // Will be replaced with push-ups
        }
        if (exerciseName.includes('bike') && !hasEquipment.includes('bike')) {
          // Allow other cardio alternatives
          return true; // Will be replaced with other cardio
        }
        
        return true;
      });
    };

    // Select and filter exercises based on focus area and equipment
    const selectedExercises = fallbackExercises[focusArea] || fallbackExercises['full body'] || [];
    const filteredExercises = filterExercisesByEquipment(selectedExercises);

    // In fallback logic, ensure at least one core exercise for full body fallback
    let finalExercises = filteredExercises;
    if (focusArea && focusArea.toLowerCase() === 'full body') {
      const coreList = fallbackExercises['core'];
      const hasCore = filteredExercises.some(ex => coreList.some(coreEx => ex.name === coreEx.name));
      if (!hasCore && coreList.length > 0) {
        // Add a random core exercise
        const randomCore = coreList[Math.floor(Math.random() * coreList.length)];
        finalExercises = [...filteredExercises, randomCore];
      }
    }

    const fallbackWorkout = {
      name: `CrossFit ${focusArea} ${fitnessLevel} WOD`,
      difficulty: fitnessLevel,
      intensity: intensity,
      focusArea: focusArea,
      estimatedDuration: duration,
      warmup: this.createDefaultWarmup(userPreferences),
      strength: this.createDefaultStrength(userPreferences),
      wod: this.createDefaultWOD(userPreferences),
      cooldown: this.createDefaultCooldown(userPreferences),
      type: 'ai-generated-fallback',
      createdAt: new Date().toISOString(),
      // Optionally, add the exercises array for legacy support
      exercises: finalExercises
    };

    console.log('Gemini: Created fallback workout with structure:', fallbackWorkout);
    return fallbackWorkout;
  },

  createDefaultWarmup(userPreferences) {
    return {
      duration: "5-8 minutes",
      exercises: [
        {
          name: "Light Jogging",
          duration: "2 minutes",
          instructions: "Easy pace to get blood flowing"
        },
        {
          name: "Arm Circles",
          duration: "30 seconds each direction",
          instructions: "Forward and backward arm circles"
        },
        {
          name: "Hip Circles",
          duration: "30 seconds each direction",
          instructions: "Standing hip circles to loosen hips"
        },
        {
          name: "Air Squats",
          duration: "10 reps",
          instructions: "Slow, controlled squats to warm up legs"
        },
        {
          name: "Push-ups",
          duration: "5-10 reps",
          instructions: "Easy push-ups to warm up upper body"
        }
      ]
    };
  },

  createDefaultStrength(userPreferences) {
    const { fitnessLevel, availableEquipment = ['dumbbells', 'barbell'] } = userPreferences;
    
    const mainLifts = availableEquipment.includes('barbell') ? [
      { name: 'Back Squat', reps: '5x5', rest: '3 minutes' },
      { name: 'Deadlift', reps: '5x5', rest: '3 minutes' },
      { name: 'Bench Press', reps: '5x5', rest: '3 minutes' },
      { name: 'Overhead Press', reps: '5x5', rest: '3 minutes' }
    ] : [
      { name: 'Dumbbell Squats', reps: '3x8-12', rest: '2 minutes' },
      { name: 'Dumbbell Deadlifts', reps: '3x8-12', rest: '2 minutes' },
      { name: 'Dumbbell Bench Press', reps: '3x8-12', rest: '2 minutes' },
      { name: 'Dumbbell Shoulder Press', reps: '3x8-12', rest: '2 minutes' }
    ];

    const selectedLift = mainLifts[Math.floor(Math.random() * mainLifts.length)];
    
    return {
      duration: "10-15 minutes",
      focus: selectedLift.name,
      exercises: [
        {
          name: selectedLift.name,
          sets: selectedLift.reps.split('x')[0],
          reps: selectedLift.reps.split('x')[1],
          rest: selectedLift.rest,
          category: "strength",
          instructions: `Focus on proper form and progressive loading for ${selectedLift.name}`,
          scaling: fitnessLevel === 'beginner' ? 'Start with lighter weights and focus on form' : 
                  fitnessLevel === 'intermediate' ? 'Moderate weight with good form' : 
                  'Heavy weight while maintaining form'
        }
      ]
    };
  },

  createDefaultWOD(userPreferences) {
    const { fitnessLevel, availableEquipment = ['dumbbells', 'barbell'] } = userPreferences;
    
    const wodExercises = [
      { name: 'Burpees', reps: '10', category: 'conditioning' },
      { name: 'Air Squats', reps: '15', category: 'strength' },
      { name: 'Push-ups', reps: '10', category: 'gymnastics' },
      { name: 'Dumbbell Thrusters', reps: '8', category: 'strength' },
      { name: 'Box Jumps', reps: '12', category: 'conditioning' },
      { name: 'Pull-ups', reps: '5', category: 'gymnastics' },
      { name: 'Mountain Climbers', reps: '20', category: 'conditioning' },
      { name: 'Jumping Jacks', reps: '15', category: 'conditioning' },
      { name: 'High Knees', reps: '30 seconds', category: 'conditioning' },
      { name: 'Butterfly Kicks', reps: '20', category: 'conditioning' }
    ];

    // Mix cardio and strength exercises
    const cardioExercises = wodExercises.filter(ex => ex.category === 'conditioning');
    const strengthExercises = wodExercises.filter(ex => ex.category === 'strength' || ex.category === 'gymnastics');
    
    const selectedExercises = [
      ...cardioExercises.slice(0, 2), // 2 cardio exercises
      ...strengthExercises.slice(0, 2) // 2 strength/gymnastics exercises
    ];
    
    return {
      duration: "10-15 minutes",
      workoutType: "AMRAP",
      description: "Complete as many rounds as possible in 10 minutes",
      exercises: selectedExercises.map(exercise => ({
        name: exercise.name,
        reps: exercise.reps,
        category: exercise.category,
        instructions: `Perform ${exercise.reps} ${exercise.name} with good form`,
        scaling: fitnessLevel === 'beginner' ? 'Reduce reps or use easier variation' : 
                fitnessLevel === 'intermediate' ? 'Moderate pace' : 
                'Fast pace with good form'
      }))
    };
  },

  createDefaultCooldown(userPreferences) {
    return {
      duration: "3-5 minutes",
      exercises: [
        {
          name: "Light Walking",
          duration: "2 minutes",
          instructions: "Easy walking to gradually lower heart rate"
        },
        {
          name: "Static Stretches",
          duration: "30 seconds each",
          instructions: "Hold stretches for major muscle groups"
        },
        {
          name: "Deep Breathing",
          duration: "1 minute",
          instructions: "Slow, deep breaths to relax"
        }
      ]
    };
  }
}; 