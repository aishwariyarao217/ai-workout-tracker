import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/workoutService';
import { Calendar, Clock, Target, Trash2, Edit, Eye, Repeat } from 'lucide-react';
import WorkoutModifier from './WorkoutModifier';

export default function WorkoutHistory({ workouts, compact = false, onWorkoutDeleted, onWorkoutRepeated, onWorkoutUpdated }) {
  const { currentUser } = useAuth();
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [showModifier, setShowModifier] = useState(false);
  const [workoutToModify, setWorkoutToModify] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteWorkout = async (workoutId) => {
    setDeleteError(null);
    console.log('Delete button clicked for workout:', workoutId);
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }
    setLoadingStates(prev => ({ ...prev, [workoutId]: true }));
    try {
      const success = await workoutService.deleteWorkout(currentUser.uid, workoutId);
      if (!success) {
        setDeleteError('Failed to delete workout.');
      } else {
        setDeleteError(null);
        if (onWorkoutDeleted) onWorkoutDeleted();
      }
    } catch (error) {
      setDeleteError('Error deleting workout: ' + (error.message || error));
      console.error('Delete error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [workoutId]: false }));
    }
  };

  const handleRepeatWorkout = async (workout) => {
    // Set loading state for this specific workout
    setLoadingStates(prev => ({ ...prev, [workout.id]: true }));
    
    try {
      await workoutService.repeatWorkout(currentUser.uid, workout);
      // Call the callback to update the parent component's state
      if (onWorkoutRepeated) {
        onWorkoutRepeated();
      }
      alert('Workout repeated successfully!');
    } catch (error) {
      console.error('Error repeating workout:', error);
      alert('Failed to repeat workout');
    } finally {
      // Clear loading state for this specific workout
      setLoadingStates(prev => ({ ...prev, [workout.id]: false }));
    }
  };

  const formatDate = (date) => {
    const d = new Date(date?.toDate?.() || date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return `${duration} min`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'upper body': 'bg-blue-100 text-blue-800',
      'lower body': 'bg-green-100 text-green-800',
      'core': 'bg-yellow-100 text-yellow-800',
      'cardio': 'bg-red-100 text-red-800',
      'full body': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No workouts yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your first workout!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div key={workout.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{workout.name}</h3>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(workout.createdAt)}
                  </div>
                  {workout.estimatedDuration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(workout.estimatedDuration)}
                    </div>
                  )}
                  {workout.focusArea && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(workout.focusArea)}`}>
                      {workout.focusArea}
                    </span>
                  )}
                  {workout.type === 'ai-generated' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🤖 AI
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setWorkoutToModify(workout);
                    setShowModifier(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600"
                  title="Modify workout"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteWorkout(workout.id)}
                  disabled={loadingStates[workout.id]}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="Delete workout"
                >
                  {loadingStates[workout.id] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleRepeatWorkout(workout)}
                  disabled={loadingStates[workout.id]}
                  className="p-2 text-gray-400 hover:text-green-600 disabled:opacity-50"
                  title="Repeat workout"
                >
                  {loadingStates[workout.id] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Exercise List */}
            {expandedWorkout === workout.id && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                {/* Warmup Section */}
                {workout.warmup && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      Warmup ({workout.warmup.duration})
                    </h4>
                    <div className="space-y-3">
                      {workout.warmup.exercises.map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{exercise.name}</h5>
                            <div className="mt-1 text-xs text-gray-500">
                              <span>{exercise.duration}</span>
                            </div>
                            {exercise.instructions && (
                              <p className="mt-1 text-xs text-gray-600">{exercise.instructions}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Exercises */}
                {workout.exercises && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-blue-500" />
                      Main Workout
                    </h4>
                    <div className="space-y-3">
                      {workout.exercises.map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{exercise.name}</h5>
                            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                              {exercise.sets && (
                                <span>{exercise.sets} sets</span>
                              )}
                              {exercise.reps && (
                                <span>{exercise.reps} reps</span>
                              )}
                              {exercise.duration && (
                                <span>{exercise.duration}</span>
                              )}
                              {exercise.rest && (
                                <span>Rest: {exercise.rest}</span>
                              )}
                            </div>
                            {exercise.instructions && (
                              <p className="mt-1 text-xs text-gray-600">{exercise.instructions}</p>
                            )}
                          </div>
                          {exercise.category && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
                              {exercise.category}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cooldown Section */}
                {workout.cooldown && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      Cooldown ({workout.cooldown.duration})
                    </h4>
                    <div className="space-y-3">
                      {workout.cooldown.exercises.map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{exercise.name}</h5>
                            <div className="mt-1 text-xs text-gray-500">
                              <span>{exercise.duration}</span>
                            </div>
                            {exercise.instructions && (
                              <p className="mt-1 text-xs text-gray-600">{exercise.instructions}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show actual workout data if it was modified */}
                {(workout.actualDuration || workout.notes || 
                  workout.exercises?.some(e => e.actualSets || e.actualReps || e.actualWeight || e.notes) ||
                  workout.strength?.exercises?.some(e => e.actualSets || e.actualReps || e.actualWeight || e.notes) ||
                  workout.wod?.exercises?.some(e => e.actualSets || e.actualReps || e.actualWeight || e.notes) ||
                  workout.warmup?.exercises?.some(e => e.completed || e.notes) ||
                  workout.cooldown?.exercises?.some(e => e.completed || e.notes)
                ) && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">What You Actually Did</h4>
                    {workout.actualDuration && (
                      <div className="text-sm text-blue-800 mb-2">
                        <strong>Actual Duration:</strong> {workout.actualDuration} minutes
                      </div>
                    )}
                    {workout.notes && (
                      <div className="text-sm text-blue-800 mb-2">
                        <strong>Notes:</strong> {workout.notes}
                      </div>
                    )}
                    
                    {/* Legacy exercises */}
                    {workout.exercises?.some(e => e.actualSets || e.actualReps || e.actualWeight || e.notes) && (
                      <div className="space-y-2 mb-3">
                        <h5 className="text-sm font-medium text-blue-800">Main Workout:</h5>
                        {workout.exercises.map((exercise, index) => (
                          (exercise.actualSets || exercise.actualReps || exercise.actualWeight || exercise.notes) && (
                            <div key={index} className="text-sm text-blue-800 ml-2">
                              <strong>{exercise.name}:</strong>
                              {exercise.actualSets && <span className="ml-2">Sets: {exercise.actualSets}</span>}
                              {exercise.actualReps && <span className="ml-2">Reps: {exercise.actualReps}</span>}
                              {exercise.actualWeight && <span className="ml-2">Weight: {exercise.actualWeight}lbs</span>}
                              {exercise.notes && <span className="ml-2">Notes: {exercise.notes}</span>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* Strength section */}
                    {workout.strength?.exercises?.some(e => e.actualSets || e.actualReps || e.actualWeight || e.notes) && (
                      <div className="space-y-2 mb-3">
                        <h5 className="text-sm font-medium text-blue-800">Strength:</h5>
                        {workout.strength.exercises.map((exercise, index) => (
                          (exercise.actualSets || exercise.actualReps || exercise.actualWeight || exercise.notes) && (
                            <div key={index} className="text-sm text-blue-800 ml-2">
                              <strong>{exercise.name}:</strong>
                              {exercise.actualSets && <span className="ml-2">Sets: {exercise.actualSets}</span>}
                              {exercise.actualReps && <span className="ml-2">Reps: {exercise.actualReps}</span>}
                              {exercise.actualWeight && <span className="ml-2">Weight: {exercise.actualWeight}lbs</span>}
                              {exercise.notes && <span className="ml-2">Notes: {exercise.notes}</span>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* WOD section */}
                    {workout.wod?.exercises?.some(e => e.actualSets || e.actualReps || e.actualWeight || e.notes) && (
                      <div className="space-y-2 mb-3">
                        <h5 className="text-sm font-medium text-blue-800">WOD:</h5>
                        {workout.wod.exercises.map((exercise, index) => (
                          (exercise.actualSets || exercise.actualReps || exercise.actualWeight || exercise.notes) && (
                            <div key={index} className="text-sm text-blue-800 ml-2">
                              <strong>{exercise.name}:</strong>
                              {exercise.actualSets && <span className="ml-2">Sets: {exercise.actualSets}</span>}
                              {exercise.actualReps && <span className="ml-2">Reps: {exercise.actualReps}</span>}
                              {exercise.actualWeight && <span className="ml-2">Weight: {exercise.actualWeight}lbs</span>}
                              {exercise.notes && <span className="ml-2">Notes: {exercise.notes}</span>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* Warmup section */}
                    {workout.warmup?.exercises?.some(e => e.completed || e.notes) && (
                      <div className="space-y-2 mb-3">
                        <h5 className="text-sm font-medium text-blue-800">Warmup:</h5>
                        {workout.warmup.exercises.map((exercise, index) => (
                          (exercise.completed || exercise.notes) && (
                            <div key={index} className="text-sm text-blue-800 ml-2">
                              <strong>{exercise.name}:</strong>
                              {exercise.completed && <span className="ml-2">✓ Completed</span>}
                              {exercise.notes && <span className="ml-2">Notes: {exercise.notes}</span>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* Cooldown section */}
                    {workout.cooldown?.exercises?.some(e => e.completed || e.notes) && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-blue-800">Cooldown:</h5>
                        {workout.cooldown.exercises.map((exercise, index) => (
                          (exercise.completed || exercise.notes) && (
                            <div key={index} className="text-sm text-blue-800 ml-2">
                              <strong>{exercise.name}:</strong>
                              {exercise.completed && <span className="ml-2">✓ Completed</span>}
                              {exercise.notes && <span className="ml-2">Notes: {exercise.notes}</span>}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Compact view - just show exercise count */}
            {compact && !expandedWorkout && workout.exercises && (
              <div className="mt-2 text-sm text-gray-500">
                {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          {deleteError && (
            <div className="text-red-600 font-semibold my-2">{deleteError}</div>
          )}
        </div>
      ))}

      {/* Workout Modifier Modal */}
      {showModifier && workoutToModify && (
        <WorkoutModifier
          workout={workoutToModify}
          onClose={() => {
            setShowModifier(false);
            setWorkoutToModify(null);
          }}
          onWorkoutUpdated={() => {
            // Call the callback to update the parent component's state
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