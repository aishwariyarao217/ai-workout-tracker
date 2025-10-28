import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/workoutService';
import { aiWorkoutService } from '../../services/aiWorkoutService';
import { Target, Clock, Zap, Check, Plus, Sparkles, Eye, Trash2, Edit, Heart } from 'lucide-react';
import WorkoutModifier from './WorkoutModifier';

export default function WorkoutSuggestions({ onWorkoutCreated, onWorkoutDeleted, onWorkoutUpdated }) {
  console.log('WorkoutSuggestions: Component loading...');
  const { currentUser } = useAuth();
  const [userPreferences, setUserPreferences] = useState({
    fitnessLevel: 'beginner',
    focusArea: 'full body',
    duration: 45,
    intensity: 'moderate',
    exerciseCount: 5,
    availableEquipment: ['dumbbells', 'barbell'] // Default to basic equipment
  });
  const [suggestions, setSuggestions] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showModifier, setShowModifier] = useState(false);
  const [workoutToModify, setWorkoutToModify] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('WorkoutSuggestions: Component mounted');
    console.log('WorkoutSuggestions: currentUser:', currentUser);
    
    if (currentUser) {
      loadWorkoutHistory();
    } else {
      console.log('WorkoutSuggestions: No currentUser, cannot load workout history');
      setError('Please log in to view AI suggestions');
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('WorkoutSuggestions: Generating suggestions with:', { userPreferences, workoutHistory });
    try {
      generateSuggestions();
    } catch (err) {
      console.error('WorkoutSuggestions: Error generating suggestions:', err);
      setError('Failed to generate workout suggestions');
    }
  }, [userPreferences, workoutHistory]);

  const loadWorkoutHistory = async () => {
    console.log('WorkoutSuggestions: Loading workout history for user:', currentUser?.uid);
    try {
      const workouts = await workoutService.getWorkouts(currentUser.uid);
      console.log('WorkoutSuggestions: Loaded workouts:', workouts);
      setWorkoutHistory(workouts);
    } catch (error) {
      console.error('WorkoutSuggestions: Error loading workout history:', error);
      setError('Failed to load workout history');
    }
  };

  const generateSuggestions = async () => {
    console.log('WorkoutSuggestions: Starting to generate suggestions');
    console.log('WorkoutSuggestions: User preferences with equipment:', userPreferences);
    try {
      const options = aiWorkoutService.generateWorkoutOptions(userPreferences);
      console.log('WorkoutSuggestions: Generated options:', options);
      
      const personalized = aiWorkoutService.getPersonalizedSuggestions(workoutHistory, userPreferences);
      console.log('WorkoutSuggestions: Generated personalized:', personalized);
      
      const quick = aiWorkoutService.getQuickWorkout(userPreferences);
      console.log('WorkoutSuggestions: Generated quick workout:', quick);
      
      const allSuggestions = [
        { ...personalized, type: 'personalized', title: '🏋️ Template: Personalized for You' },
        { ...quick, type: 'quick', title: '⚡ Template: Quick Workout' },
        ...options.map(option => ({ ...option, type: 'standard', title: `🏋️ Template: ${option.name}` }))
      ];
      
      console.log('WorkoutSuggestions: All suggestions:', allSuggestions);
      setSuggestions(allSuggestions);
    } catch (err) {
      console.error('WorkoutSuggestions: Error in generateSuggestions:', err);
      setError('Failed to generate workout suggestions');
    }
  };

  const generateGeminiWorkout = async () => {
    console.log('WorkoutSuggestions: Generating Gemini workout');
    console.log('WorkoutSuggestions: Using equipment:', userPreferences.availableEquipment);
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      const geminiWorkout = await aiWorkoutService.generateGeminiWorkout(userPreferences, workoutHistory);
      console.log('WorkoutSuggestions: Gemini workout generated:', geminiWorkout);
      console.log('WorkoutSuggestions: Has strength section?', !!geminiWorkout.strength);
      console.log('WorkoutSuggestions: Has WOD section?', !!geminiWorkout.wod);
      console.log('WorkoutSuggestions: Has exercises array?', !!geminiWorkout.exercises);
      console.log('WorkoutSuggestions: Full workout structure:', {
        name: geminiWorkout.name,
        strength: geminiWorkout.strength,
        wod: geminiWorkout.wod,
        exercises: geminiWorkout.exercises,
        warmup: geminiWorkout.warmup,
        cooldown: geminiWorkout.cooldown,
        type: geminiWorkout.type
      });
      
      // Validate that we have a workout with some content
      if (!geminiWorkout || (!geminiWorkout.strength && !geminiWorkout.wod && !geminiWorkout.exercises)) {
        throw new Error('Generated workout is empty or invalid');
      }
      
      // Add the Gemini workout to the suggestions
      const geminiSuggestion = {
        ...geminiWorkout,
        type: 'gemini',
        title: '🔥 CrossFit WOD: AI Generated'
      };
      
      setSuggestions(prev => [geminiSuggestion, ...prev]);
      console.log('WorkoutSuggestions: Successfully added workout to suggestions');
    } catch (error) {
      console.error('WorkoutSuggestions: Error generating Gemini workout:', error);
      setError(`Failed to generate AI workout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async (workout) => {
    setLoading(true);
    try {
      await workoutService.addWorkout(currentUser.uid, workout);
      onWorkoutCreated();
      setSelectedWorkout(null);
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this AI-generated workout?')) {
      return;
    }

    setLoading(true);
    try {
      await workoutService.deleteWorkout(currentUser.uid, workoutId);
      // Remove from suggestions if it's there
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== workoutId));
      // Notify parent component
      if (onWorkoutDeleted) {
        onWorkoutDeleted();
      }
      setSelectedWorkout(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[intensity] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              if (currentUser) loadWorkoutHistory();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-yellow-900 mb-2">Authentication Required</h2>
          <p className="text-yellow-700">Please log in to view AI workout suggestions.</p>
        </div>
      </div>
    );
  }

  console.log('WorkoutSuggestions: Rendering with suggestions:', suggestions);

  return (
    <div className="space-y-6">
      {/* Preferences Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Workout Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fitness Level
            </label>
            <select
              value={userPreferences.fitnessLevel}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, fitnessLevel: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focus Area
            </label>
            <select
              value={userPreferences.focusArea}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, focusArea: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="full body">Full Body</option>
              <option value="upper body">Upper Body</option>
              <option value="lower body">Lower Body</option>
              <option value="core">Core</option>
              <option value="cardio">Cardio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <select
              value={userPreferences.duration}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intensity
            </label>
            <select
              value={userPreferences.intensity}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, intensity: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Exercises
            </label>
            <select
              value={userPreferences.exerciseCount}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, exerciseCount: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={3}>3 exercises</option>
              <option value={4}>4 exercises</option>
              <option value={5}>5 exercises</option>
              <option value={6}>6 exercises</option>
              <option value={7}>7 exercises</option>
              <option value={8}>8 exercises</option>
            </select>
          </div>
        </div>

        {/* Equipment Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Available Equipment
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { id: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
              { id: 'barbell', label: 'Barbell', icon: '⚖️' },
              { id: 'bench', label: 'Bench', icon: '🛏️' },
              { id: 'pullup_bar', label: 'Pull-up Bar', icon: '🏋️‍♂️' },
              { id: 'kettlebells', label: 'Kettlebells', icon: '🔔' },
              { id: 'resistance_bands', label: 'Resistance Bands', icon: '🎯' },
              { id: 'treadmill', label: 'Treadmill', icon: '🏃' },
              { id: 'rowing_machine', label: 'Rowing Machine', icon: '🚣' },
              { id: 'bike', label: 'Exercise Bike', icon: '🚴' },
              { id: 'leg_press', label: 'Leg Press', icon: '🦵' },
              { id: 'lat_pulldown', label: 'Lat Pulldown', icon: '💪' },
              { id: 'cable_machine', label: 'Cable Machine', icon: '🔗' },
              { id: 'smith_machine', label: 'Smith Machine', icon: '🏗️' },
              { id: 'dip_bars', label: 'Dip Bars', icon: '🏋️‍♀️' },
              { id: 'box_platform', label: 'Box/Platform', icon: '📦' },
              { id: 'medicine_balls', label: 'Medicine Balls', icon: '⚽' }
            ].map((equipment) => (
              <label key={equipment.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userPreferences.availableEquipment.includes(equipment.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setUserPreferences(prev => ({
                        ...prev,
                        availableEquipment: [...prev.availableEquipment, equipment.id]
                      }));
                    } else {
                      setUserPreferences(prev => ({
                        ...prev,
                        availableEquipment: prev.availableEquipment.filter(item => item !== equipment.id)
                      }));
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <span className="mr-1">{equipment.icon}</span>
                  {equipment.label}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select all equipment you have access to. The AI will generate workouts using only your available equipment.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={generateSuggestions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Generate Template Workouts
          </button>
          <button
            onClick={generateGeminiWorkout}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>🤖</span>
            )}
            {loading ? 'Generating AI CrossFit WOD...' : 'Generate AI CrossFit WOD'}
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Sparkles className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">AI-Generated Workout Suggestions</h2>
        </div>

        {suggestions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center">Loading suggestions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((workout, index) => (
              <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{workout.title}</h3>
                    {workout.type === 'personalized' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Difficulty:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                        {workout.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Intensity:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(workout.intensity)}`}>
                        {workout.intensity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {workout.estimatedDuration} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Exercises:</span>
                      <span className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {workout.exercises?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedWorkout(workout)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Target className="h-4 w-4 mr-1" />
                      Preview
                    </button>
                    {workout.id ? (
                      <>
                        <button
                          onClick={() => {
                            setWorkoutToModify(workout);
                            setShowModifier(true);
                          }}
                          className="flex-1 flex items-center justify-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modify
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {loading ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleSaveWorkout(workout)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout Preview Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedWorkout.name}</h3>
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Difficulty:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedWorkout.difficulty)}`}>
                      {selectedWorkout.difficulty}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Intensity:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(selectedWorkout.intensity)}`}>
                      {selectedWorkout.intensity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2">{selectedWorkout.estimatedDuration} minutes</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Focus Area:</span>
                    <span className="ml-2 capitalize">{selectedWorkout.focusArea}</span>
                  </div>
                  {selectedWorkout.workoutType && (
                    <div>
                      <span className="text-gray-500">Workout Type:</span>
                      <span className="ml-2 font-medium text-purple-600">{selectedWorkout.workoutType}</span>
                    </div>
                  )}
                </div>

                {/* Warmup Section */}
                {selectedWorkout.warmup && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-orange-700 mb-4 flex items-center bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <Clock className="h-5 w-5 mr-2" />
                      🏃 WARMUP ({selectedWorkout.warmup.duration})
                    </h4>
                    <div className="space-y-3">
                      {selectedWorkout.warmup.exercises.map((exercise, index) => (
                        <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                          <div className="mt-1 text-sm text-gray-600">
                            <div>Duration: {exercise.duration}</div>
                            {exercise.instructions && (
                              <div className="mt-2 text-xs text-gray-500">
                                <strong>Instructions:</strong> {exercise.instructions}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strength Section */}
                {selectedWorkout.strength && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-red-700 mb-4 flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
                      <Zap className="h-5 w-5 mr-2" />
                      💪 STRENGTH WORK ({selectedWorkout.strength.duration}) - {selectedWorkout.strength.focus}
                    </h4>
                    <div className="space-y-3">
                      {selectedWorkout.strength.exercises.map((exercise, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                          <div className="mt-1 text-sm text-gray-600 space-y-1">
                            {exercise.sets && <div>Sets: {exercise.sets}</div>}
                            {exercise.reps && <div>Reps: {exercise.reps}</div>}
                            {exercise.rest && <div>Rest: {exercise.rest}</div>}
                            {exercise.instructions && (
                              <div className="mt-2 text-xs text-gray-500">
                                <strong>Instructions:</strong> {exercise.instructions}
                              </div>
                            )}
                            {exercise.scaling && (
                              <div className="mt-2 text-xs text-blue-600">
                                <strong>Scaling:</strong> {exercise.scaling}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WOD Section */}
                {selectedWorkout.wod && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-purple-700 mb-4 flex items-center bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <Target className="h-5 w-5 mr-2" />
                      🔥 CONDITIONING WOD ({selectedWorkout.wod.duration}) - {selectedWorkout.wod.workoutType}
                    </h4>
                    {selectedWorkout.wod.description && (
                      <p className="text-sm text-gray-600 mb-3">{selectedWorkout.wod.description}</p>
                    )}
                    <div className="space-y-3">
                      {selectedWorkout.wod.exercises.map((exercise, index) => (
                        <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                          <div className="mt-1 text-sm text-gray-600 space-y-1">
                            {exercise.reps && <div>Reps: {exercise.reps}</div>}
                            {exercise.duration && <div>Duration: {exercise.duration}</div>}
                            {exercise.instructions && (
                              <div className="mt-2 text-xs text-gray-500">
                                <strong>Instructions:</strong> {exercise.instructions}
                              </div>
                            )}
                            {exercise.scaling && (
                              <div className="mt-2 text-xs text-blue-600">
                                <strong>Scaling:</strong> {exercise.scaling}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy Main Exercises (for template workouts) */}
                {selectedWorkout.exercises && !selectedWorkout.strength && !selectedWorkout.wod && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-blue-700 mb-4 flex items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <Target className="h-5 w-5 mr-2" />
                      🏋️ MAIN WORKOUT
                    </h4>
                    <div className="space-y-3">
                      {selectedWorkout.exercises.map((exercise, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                          <div className="mt-1 text-sm text-gray-600 space-y-1">
                            {exercise.sets && <div>Sets: {exercise.sets}</div>}
                            {exercise.reps && <div>Reps: {exercise.reps}</div>}
                            {exercise.duration && <div>Duration: {exercise.duration}</div>}
                            {exercise.rest && <div>Rest: {exercise.rest}</div>}
                            {exercise.instructions && (
                              <div className="mt-2 text-xs text-gray-500">
                                <strong>Instructions:</strong> {exercise.instructions}
                              </div>
                            )}
                            {exercise.scaling && (
                              <div className="mt-2 text-xs text-blue-600">
                                <strong>Scaling:</strong> {exercise.scaling}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cooldown Section */}
                {selectedWorkout.cooldown && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-green-700 mb-4 flex items-center bg-green-50 p-3 rounded-lg border border-green-200">
                      <Heart className="h-5 w-5 mr-2" />
                      ❄️ COOLDOWN ({selectedWorkout.cooldown.duration})
                    </h4>
                    <div className="space-y-3">
                      {selectedWorkout.cooldown.exercises.map((exercise, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                          <div className="mt-1 text-sm text-gray-600">
                            <div>Duration: {exercise.duration}</div>
                            {exercise.instructions && (
                              <div className="mt-2 text-xs text-gray-500">
                                <strong>Instructions:</strong> {exercise.instructions}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-3">
                    {selectedWorkout.id && (
                      <button
                        onClick={() => handleDeleteWorkout(selectedWorkout.id)}
                        disabled={loading}
                        className="flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {loading ? 'Deleting...' : 'Delete Workout'}
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedWorkout(null)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    {!selectedWorkout.id && (
                      <button
                        onClick={() => handleSaveWorkout(selectedWorkout)}
                        disabled={loading}
                        className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {loading ? 'Saving...' : 'Save Workout'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Modifier Modal */}
      {showModifier && workoutToModify && (
        <WorkoutModifier
          workout={workoutToModify}
          onClose={() => {
            setShowModifier(false);
            setWorkoutToModify(null);
          }}
          onWorkoutUpdated={() => {
            if (onWorkoutUpdated) {
              onWorkoutUpdated();
            }
            setShowModifier(false);
            setWorkoutToModify(null);
          }}
        />
      )}
    </div>
  );
} 