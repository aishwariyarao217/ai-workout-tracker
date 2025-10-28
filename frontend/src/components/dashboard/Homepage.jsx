import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/workoutService';
import { 
  Target, 
  Brain, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Dumbbell, 
  Clock, 
  Zap,
  Trophy,
  Activity,
  Users,
  Sparkles
} from 'lucide-react';

export default function Homepage({ refresh }) {
  const { currentUser } = useAuth();
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exerciseStats, setExerciseStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    averageWorkoutDuration: 0,
    mostUsedFocusArea: '',
    streakDays: 0
  });

  // Normalize exercise names to prevent duplicates
  const normalizeExerciseName = (name) => {
    if (!name) return '';
    
    // Convert to lowercase and trim
    let normalized = name.toLowerCase().trim();
    
    // Common variations to standardize
    const variations = {
      'kettlebell swing': 'kettlebell swings',
      'kettlebell swings': 'kettlebell swings',
      'kb swing': 'kettlebell swings',
      'kb swings': 'kettlebell swings',
      'push up': 'push-ups',
      'push ups': 'push-ups',
      'pushup': 'push-ups',
      'pushups': 'push-ups',
      'pull up': 'pull-ups',
      'pull ups': 'pull-ups',
      'pullup': 'pull-ups',
      'pullups': 'pull-ups',
      'sit up': 'sit-ups',
      'sit ups': 'sit-ups',
      'situp': 'sit-ups',
      'situps': 'sit-ups',
      'box jump': 'box jumps',
      'box jumps': 'box jumps',
      'air squat': 'air squats',
      'air squats': 'air squats',
      'back squat': 'back squats',
      'back squats': 'back squats',
      'front squat': 'front squats',
      'front squats': 'front squats',
      'dead lift': 'deadlifts',
      'dead lift': 'deadlifts',
      'deadlift': 'deadlifts',
      'deadlifts': 'deadlifts',
      'bench press': 'bench press',
      'benchpress': 'bench press',
      'overhead press': 'overhead press',
      'ohp': 'overhead press',
      'clean and press': 'clean & press',
      'clean & press': 'clean & press',
      'clean and jerk': 'clean & jerk',
      'clean & jerk': 'clean & jerk',
      'snatch': 'snatches',
      'snatches': 'snatches',
      'thruster': 'thrusters',
      'thrusters': 'thrusters',
      'burpee': 'burpees',
      'burpees': 'burpees',
      'mountain climber': 'mountain climbers',
      'mountain climbers': 'mountain climbers',
      'pistol squat': 'pistol squats',
      'pistol squats': 'pistol squats',
      'lunge': 'lunges',
      'lunges': 'lunges',
      'row': 'rowing',
      'rowing': 'rowing',
      'run': 'running',
      'running': 'running',
      'bike': 'cycling',
      'cycling': 'cycling',
      'jump rope': 'jump rope',
      'jump roping': 'jump rope',
      'double under': 'double-unders',
      'double unders': 'double-unders',
      'double-unders': 'double-unders',
      'toes to bar': 'toes-to-bar',
      'toes-to-bar': 'toes-to-bar',
      'toes to bars': 'toes-to-bar',
      'l sit': 'l-sits',
      'l sits': 'l-sits',
      'l-sits': 'l-sits',
      'plank': 'plank',
      'planks': 'plank',
      'russian twist': 'russian twists',
      'russian twists': 'russian twists',
      'medicine ball': 'medicine ball',
      'med ball': 'medicine ball',
      'wall ball': 'wall balls',
      'wall balls': 'wall balls',
      'wallball': 'wall balls',
      'wallballs': 'wall balls'
    };
    
    // Check for exact matches first
    if (variations[normalized]) {
      return variations[normalized];
    }
    
    // Check for partial matches (e.g., "kettlebell swing" matches "kettlebell swings")
    for (const [key, value] of Object.entries(variations)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
    
    // If no match found, return the original name with proper capitalization
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const loadWorkoutData = useCallback(async () => {
    try {
      console.log('Homepage: Loading workout data...');
      const workouts = await workoutService.getWorkouts(currentUser.uid);
      console.log('Homepage: All workouts loaded:', workouts);
      setWorkoutHistory(workouts);
      
      // Calculate exercise statistics
      const exerciseData = {};
      let totalDuration = 0;
      const focusAreaCounts = {};
      
      workouts.forEach((workout, workoutIndex) => {
        console.log(`Homepage: Processing workout ${workoutIndex + 1}:`, workout.name, workout);
        totalDuration += workout.actualDuration || workout.estimatedDuration || 0;
        
        if (workout.focusArea) {
          focusAreaCounts[workout.focusArea] = (focusAreaCounts[workout.focusArea] || 0) + 1;
        }
        
        // Process exercises for stats
        if (workout.exercises && workout.exercises.length > 0) {
          console.log(`Homepage: Workout ${workout.name} has ${workout.exercises.length} exercises:`, workout.exercises);
          workout.exercises.forEach((exercise, exerciseIndex) => {
            console.log(`Homepage: Exercise ${exerciseIndex + 1}:`, exercise.name, {
              actualWeight: exercise.actualWeight,
              actualReps: exercise.actualReps,
              actualSets: exercise.actualSets
            });
            
            const exerciseName = normalizeExerciseName(exercise.name);
            if (!exerciseData[exerciseName]) {
              exerciseData[exerciseName] = {
                name: exerciseName,
                maxWeight: 0,
                maxReps: 0,
                maxSets: 0,
                totalWorkouts: 0,
                lastPerformed: null,
                category: exercise.category || 'general'
              };
            }
            
            // Update max values
            if (exercise.actualWeight) {
              const weight = parseInt(exercise.actualWeight);
              if (weight > exerciseData[exerciseName].maxWeight) {
                exerciseData[exerciseName].maxWeight = weight;
              }
            }
            
            if (exercise.actualReps) {
              const reps = parseInt(exercise.actualReps);
              if (reps > exerciseData[exerciseName].maxReps) {
                exerciseData[exerciseName].maxReps = reps;
              }
            }
            
            if (exercise.actualSets) {
              const sets = parseInt(exercise.actualSets);
              if (sets > exerciseData[exerciseName].maxSets) {
                exerciseData[exerciseName].maxSets = sets;
              }
            }
            
            exerciseData[exerciseName].totalWorkouts += 1;
            
            const workoutDate = new Date(workout.createdAt?.toDate?.() || workout.createdAt);
            if (!exerciseData[exerciseName].lastPerformed || 
                workoutDate > new Date(exerciseData[exerciseName].lastPerformed)) {
              exerciseData[exerciseName].lastPerformed = workoutDate;
            }
          });
        } else {
          console.log(`Homepage: Workout ${workout.name} has no exercises array`);
        }
        
        // Process CrossFit structure (strength and WOD sections)
        if (workout.strength && workout.strength.exercises) {
          console.log(`Homepage: Workout ${workout.name} has strength exercises:`, workout.strength.exercises);
          workout.strength.exercises.forEach((exercise, exerciseIndex) => {
            console.log(`Homepage: Strength exercise ${exerciseIndex + 1}:`, exercise.name, {
              actualWeight: exercise.actualWeight,
              actualReps: exercise.actualReps,
              actualSets: exercise.actualSets
            });
            
            const exerciseName = normalizeExerciseName(exercise.name);
            if (!exerciseData[exerciseName]) {
              exerciseData[exerciseName] = {
                name: exerciseName,
                maxWeight: 0,
                maxReps: 0,
                maxSets: 0,
                totalWorkouts: 0,
                lastPerformed: null,
                category: exercise.category || 'strength'
              };
            }
            
            // Update max values
            if (exercise.actualWeight) {
              const weight = parseInt(exercise.actualWeight);
              if (weight > exerciseData[exerciseName].maxWeight) {
                exerciseData[exerciseName].maxWeight = weight;
              }
            }
            
            if (exercise.actualReps) {
              const reps = parseInt(exercise.actualReps);
              if (reps > exerciseData[exerciseName].maxReps) {
                exerciseData[exerciseName].maxReps = reps;
              }
            }
            
            if (exercise.actualSets) {
              const sets = parseInt(exercise.actualSets);
              if (sets > exerciseData[exerciseName].maxSets) {
                exerciseData[exerciseName].maxSets = sets;
              }
            }
            
            exerciseData[exerciseName].totalWorkouts += 1;
            
            const workoutDate = new Date(workout.createdAt?.toDate?.() || workout.createdAt);
            if (!exerciseData[exerciseName].lastPerformed || 
                workoutDate > new Date(exerciseData[exerciseName].lastPerformed)) {
              exerciseData[exerciseName].lastPerformed = workoutDate;
            }
          });
        }
        
        if (workout.wod && workout.wod.exercises) {
          console.log(`Homepage: Workout ${workout.name} has WOD exercises:`, workout.wod.exercises);
          workout.wod.exercises.forEach((exercise, exerciseIndex) => {
            console.log(`Homepage: WOD exercise ${exerciseIndex + 1}:`, exercise.name, {
              actualWeight: exercise.actualWeight,
              actualReps: exercise.actualReps,
              actualSets: exercise.actualSets
            });
            
            const exerciseName = normalizeExerciseName(exercise.name);
            if (!exerciseData[exerciseName]) {
              exerciseData[exerciseName] = {
                name: exerciseName,
                maxWeight: 0,
                maxReps: 0,
                maxSets: 0,
                totalWorkouts: 0,
                lastPerformed: null,
                category: exercise.category || 'wod'
              };
            }
            
            // Update max values
            if (exercise.actualWeight) {
              const weight = parseInt(exercise.actualWeight);
              if (weight > exerciseData[exerciseName].maxWeight) {
                exerciseData[exerciseName].maxWeight = weight;
              }
            }
            
            if (exercise.actualReps) {
              const reps = parseInt(exercise.actualReps);
              if (reps > exerciseData[exerciseName].maxReps) {
                exerciseData[exerciseName].maxReps = reps;
              }
            }
            
            if (exercise.actualSets) {
              const sets = parseInt(exercise.actualSets);
              if (sets > exerciseData[exerciseName].maxSets) {
                exerciseData[exerciseName].maxSets = sets;
              }
            }
            
            exerciseData[exerciseName].totalWorkouts += 1;
            
            const workoutDate = new Date(workout.createdAt?.toDate?.() || workout.createdAt);
            if (!exerciseData[exerciseName].lastPerformed || 
                workoutDate > new Date(exerciseData[exerciseName].lastPerformed)) {
              exerciseData[exerciseName].lastPerformed = workoutDate;
            }
          });
        }
      });
      
      // Log for debugging
      console.log('Homepage: Exercise summary recalculated:', exerciseData);
      console.log('Homepage: Number of exercises found:', Object.keys(exerciseData).length);
      setExerciseStats(exerciseData);
      
      // Calculate overall stats
      const mostUsedFocusArea = Object.keys(focusAreaCounts).length > 0 
        ? Object.entries(focusAreaCounts).sort(([,a], [,b]) => b - a)[0][0]
        : 'None';
      
      setStats({
        totalWorkouts: workouts.length,
        totalExercises: Object.keys(exerciseData).length,
        averageWorkoutDuration: workouts.length > 0 ? Math.round(totalDuration / workouts.length) : 0,
        mostUsedFocusArea,
        streakDays: calculateStreakDays(workouts)
      });
      
    } catch (error) {
      console.error('Homepage: Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Initial load
  useEffect(() => {
    if (currentUser) {
      loadWorkoutData();
    }
  }, [currentUser, loadWorkoutData]);

  // Listen for refresh requests
  useEffect(() => {
    if (refresh > 0) {
      console.log('Homepage: Received refresh request, refresh count:', refresh);
      loadWorkoutData();
    }
  }, [refresh, loadWorkoutData]);

  const calculateStreakDays = (workouts) => {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = workouts
      .map(w => new Date(w.createdAt?.toDate?.() || w.createdAt))
      .sort((a, b) => b - a);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i]);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'upper body': 'bg-blue-100 text-blue-800',
      'lower body': 'bg-green-100 text-green-800',
      'core': 'bg-yellow-100 text-yellow-800',
      'cardio': 'bg-red-100 text-red-800',
      'strength': 'bg-purple-100 text-purple-800',
      'conditioning': 'bg-orange-100 text-orange-800',
      'gymnastics': 'bg-indigo-100 text-indigo-800',
      'general': 'bg-gray-100 text-gray-800',
      'wod': 'bg-blue-100 text-blue-800' // Added for WOD
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your AI Workout Tracker</h1>
          <p className="text-xl mb-6">
            Your personal fitness companion powered by AI. Generate CrossFit-style workouts with barbell and dumbbell exercises, 
            track your progress, and achieve your fitness goals.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
              <div className="text-sm opacity-90">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalExercises}</div>
              <div className="text-sm opacity-90">Exercises Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.streakDays}</div>
              <div className="text-sm opacity-90">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.averageWorkoutDuration}min</div>
              <div className="text-sm opacity-90">Avg Duration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center mb-4">
            <Brain className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold">AI-Generated Workouts</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Get personalized CrossFit-style workouts generated by advanced AI. 
            Includes warmup, main workout, and cooldown sections.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Customizable exercise count (3-8 exercises)</li>
            <li>• Barbell & dumbbell movements</li>
            <li>• CrossFit-style WODs</li>
            <li>• Warmup and cooldown included</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center mb-4">
            <Target className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold">Progress Tracking</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Track your actual performance vs. planned workouts. 
            Record sets, reps, weights, and personal notes.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Modify workouts after completion</li>
            <li>• Track actual vs. planned performance</li>
            <li>• Personal notes and observations</li>
            <li>• Progress visualization</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold">Analytics & Insights</h3>
          </div>
          <p className="text-gray-600 mb-4">
            View detailed analytics of your fitness journey. 
            Track max weights, reps, and workout patterns.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Exercise performance history</li>
            <li>• Max weight tracking</li>
            <li>• Workout frequency analysis</li>
            <li>• Focus area distribution</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold">Workout History</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Complete history of all your workouts with detailed 
            exercise breakdowns and performance data.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Complete workout history</li>
            <li>• Exercise-by-exercise breakdown</li>
            <li>• Warmup and cooldown tracking</li>
            <li>• Search and filter options</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center mb-4">
            <Dumbbell className="h-8 w-8 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold">Barbell & Dumbbell</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Comprehensive workouts using both barbell and dumbbell exercises, 
            perfect for gym and home training.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Barbell compound movements</li>
            <li>• Dumbbell accessory work</li>
            <li>• No advanced gymnastics</li>
            <li>• Functional fitness focus</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 text-indigo-600 mr-3" />
            <h3 className="text-lg font-semibold">Smart Recommendations</h3>
          </div>
          <p className="text-gray-600 mb-4">
            AI analyzes your workout history to provide 
            personalized recommendations and avoid overtraining.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Personalized workout suggestions</li>
            <li>• Overtraining prevention</li>
            <li>• Focus area balancing</li>
            <li>• Difficulty progression</li>
          </ul>
        </div>
      </div>

      {/* Exercise Progress Summary */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Exercise Progress Summary</h2>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-gray-600 mt-2">
            Your current max weights, reps, and sets for each exercise
          </p>
        </div>

        {Object.keys(exerciseStats).length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exercise Data Yet</h3>
            <p className="text-gray-500">
              Complete your first workout to start tracking your progress!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exercise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Reps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Sets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workouts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Performed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(exerciseStats)
                  .sort((a, b) => b.totalWorkouts - a.totalWorkouts)
                  .map((exercise, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {exercise.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
                          {exercise.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exercise.maxWeight > 0 ? `${exercise.maxWeight} lbs` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exercise.maxReps > 0 ? exercise.maxReps : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exercise.maxSets > 0 ? exercise.maxSets : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exercise.totalWorkouts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(exercise.lastPerformed)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Most Used Focus Area</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {stats.mostUsedFocusArea}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Workout Duration</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.averageWorkoutDuration} minutes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Streak</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.streakDays} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Workouts</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.totalWorkouts}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 