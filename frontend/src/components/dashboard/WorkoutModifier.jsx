import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/workoutService';
import { Edit, Save, X, Plus, Trash2, Clock, Target } from 'lucide-react';

export default function WorkoutModifier({ workout, onClose, onWorkoutUpdated }) {
  const { currentUser } = useAuth();
  const [modifiedWorkout, setModifiedWorkout] = useState({
    ...workout,
    // Handle both old structure (exercises array) and new CrossFit structure (strength + wod)
    // Preserve existing values instead of resetting them
    exercises: workout.exercises?.map(ex => ({ 
      ...ex, 
      actualSets: ex.actualSets || '', 
      actualReps: ex.actualReps || '', 
      actualWeight: ex.actualWeight || '', 
      actualRest: ex.actualRest || '',
      notes: ex.notes || '' 
    })) || [],
    strength: workout.strength ? {
      ...workout.strength,
      exercises: workout.strength.exercises?.map(ex => ({ 
        ...ex, 
        actualSets: ex.actualSets || '', 
        actualReps: ex.actualReps || '', 
        actualWeight: ex.actualWeight || '', 
        actualRest: ex.actualRest || '',
        notes: ex.notes || '' 
      })) || []
    } : null,
    wod: workout.wod ? {
      ...workout.wod,
      exercises: workout.wod.exercises?.map(ex => ({ 
        ...ex, 
        actualSets: ex.actualSets || '', 
        actualReps: ex.actualReps || '', 
        actualWeight: ex.actualWeight || '', 
        actualRest: ex.actualRest || '',
        notes: ex.notes || '' 
      })) || []
    } : null,
    warmup: workout.warmup ? {
      ...workout.warmup,
      exercises: workout.warmup.exercises?.map(ex => ({ 
        ...ex, 
        completed: ex.completed || false, 
        notes: ex.notes || '' 
      })) || []
    } : null,
    cooldown: workout.cooldown ? {
      ...workout.cooldown,
      exercises: workout.cooldown.exercises?.map(ex => ({ 
        ...ex, 
        completed: ex.completed || false, 
        notes: ex.notes || '' 
      })) || []
    } : null,
    actualDuration: workout.actualDuration || '',
    difficulty: workout.difficulty || 'moderate',
    notes: workout.notes || '',
    completed: workout.completed || false
  });
  const [loading, setLoading] = useState(false);

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...modifiedWorkout.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setModifiedWorkout(prev => ({ ...prev, exercises: updatedExercises }));
  };

  const handleWarmupChange = (index, field, value) => {
    if (!modifiedWorkout.warmup) return;
    const updatedWarmup = { ...modifiedWorkout.warmup };
    updatedWarmup.exercises[index] = { ...updatedWarmup.exercises[index], [field]: value };
    setModifiedWorkout(prev => ({ ...prev, warmup: updatedWarmup }));
  };

  const handleCooldownChange = (index, field, value) => {
    if (!modifiedWorkout.cooldown) return;
    const updatedCooldown = { ...modifiedWorkout.cooldown };
    updatedCooldown.exercises[index] = { ...updatedCooldown.exercises[index], [field]: value };
    setModifiedWorkout(prev => ({ ...prev, cooldown: updatedCooldown }));
  };

  const handleStrengthChange = (index, field, value) => {
    if (!modifiedWorkout.strength) return;
    const updatedStrength = { ...modifiedWorkout.strength };
    updatedStrength.exercises[index] = { ...updatedStrength.exercises[index], [field]: value };
    setModifiedWorkout(prev => ({ ...prev, strength: updatedStrength }));
  };

  const handleWodChange = (index, field, value) => {
    if (!modifiedWorkout.wod) return;
    const updatedWod = { ...modifiedWorkout.wod };
    updatedWod.exercises[index] = { ...updatedWod.exercises[index], [field]: value };
    setModifiedWorkout(prev => ({ ...prev, wod: updatedWod }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update the existing workout with the modifications
      const workoutToSave = {
        ...modifiedWorkout,
        updatedAt: new Date().toISOString()
      };

      await workoutService.updateWorkout(currentUser.uid, workout.id, workoutToSave);
      
      if (onWorkoutUpdated) {
        onWorkoutUpdated();
      }
      onClose();
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Modify Workout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Workout Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{workout.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Difficulty:</span>
              <span className="ml-2 capitalize">{workout.difficulty}</span>
            </div>
            <div>
              <span className="text-gray-500">Intensity:</span>
              <span className="ml-2 capitalize">{workout.intensity}</span>
            </div>
            <div>
              <span className="text-gray-500">Focus Area:</span>
              <span className="ml-2 capitalize">{workout.focusArea}</span>
            </div>
            <div>
              <span className="text-gray-500">Workout Type:</span>
              <span className="ml-2">{workout.workoutType}</span>
            </div>
          </div>
        </div>

        {/* Actual Duration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actual Duration (minutes)
          </label>
          <input
            type="number"
            value={modifiedWorkout.actualDuration}
            onChange={(e) => setModifiedWorkout(prev => ({ ...prev, actualDuration: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter actual duration"
          />
        </div>

        {/* Warmup Section */}
        {modifiedWorkout.warmup && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              Warmup ({modifiedWorkout.warmup.duration})
            </h3>
            <div className="space-y-3">
              {modifiedWorkout.warmup.exercises.map((exercise, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exercise.completed}
                        onChange={(e) => handleWarmupChange(index, 'completed', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Completed</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exercise.instructions}</p>
                  <input
                    type="text"
                    value={exercise.notes}
                    onChange={(e) => handleWarmupChange(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Exercises (Legacy Structure) */}
        {modifiedWorkout.exercises && modifiedWorkout.exercises.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-500" />
              Main Workout
            </h3>
            <div className="space-y-4">
              {modifiedWorkout.exercises.map((exercise, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{exercise.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Sets
                      </label>
                      <input
                        type="text"
                        value={exercise.actualSets}
                        onChange={(e) => handleExerciseChange(index, 'actualSets', e.target.value)}
                        placeholder={exercise.sets || 'Sets'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Reps
                      </label>
                      <input
                        type="text"
                        value={exercise.actualReps}
                        onChange={(e) => handleExerciseChange(index, 'actualReps', e.target.value)}
                        placeholder={exercise.reps || 'Reps'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (lbs)
                      </label>
                      <input
                        type="text"
                        value={exercise.actualWeight}
                        onChange={(e) => handleExerciseChange(index, 'actualWeight', e.target.value)}
                        placeholder="Weight used"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rest Time
                      </label>
                      <input
                        type="text"
                        value={exercise.actualRest}
                        onChange={(e) => handleExerciseChange(index, 'actualRest', e.target.value)}
                        placeholder={exercise.rest || 'Rest'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={exercise.notes}
                      onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                      placeholder="How did this exercise feel? Any modifications?"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows="2"
                    />
                  </div>
                  {exercise.scaling && (
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Scaling:</strong> {exercise.scaling}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strength Section (CrossFit Structure) */}
        {modifiedWorkout.strength && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-500" />
              Strength Work ({modifiedWorkout.strength.duration}) - {modifiedWorkout.strength.focus}
            </h3>
            <div className="space-y-4">
              {modifiedWorkout.strength.exercises.map((exercise, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{exercise.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Sets
                      </label>
                      <input
                        type="text"
                        value={exercise.actualSets}
                        onChange={(e) => handleStrengthChange(index, 'actualSets', e.target.value)}
                        placeholder={exercise.sets || 'Sets'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Reps
                      </label>
                      <input
                        type="text"
                        value={exercise.actualReps}
                        onChange={(e) => handleStrengthChange(index, 'actualReps', e.target.value)}
                        placeholder={exercise.reps || 'Reps'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (lbs)
                      </label>
                      <input
                        type="text"
                        value={exercise.actualWeight}
                        onChange={(e) => handleStrengthChange(index, 'actualWeight', e.target.value)}
                        placeholder="Weight used"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rest Time
                      </label>
                      <input
                        type="text"
                        value={exercise.actualRest}
                        onChange={(e) => handleStrengthChange(index, 'actualRest', e.target.value)}
                        placeholder={exercise.rest || 'Rest'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={exercise.notes}
                      onChange={(e) => handleStrengthChange(index, 'notes', e.target.value)}
                      placeholder="How did this exercise feel? Any modifications?"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows="2"
                    />
                  </div>
                  {exercise.scaling && (
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Scaling:</strong> {exercise.scaling}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WOD Section (CrossFit Structure) */}
        {modifiedWorkout.wod && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-500" />
              Conditioning WOD ({modifiedWorkout.wod.duration}) - {modifiedWorkout.wod.workoutType}
            </h3>
            <div className="space-y-4">
              {modifiedWorkout.wod.exercises.map((exercise, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{exercise.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Sets
                      </label>
                      <input
                        type="text"
                        value={exercise.actualSets}
                        onChange={(e) => handleWodChange(index, 'actualSets', e.target.value)}
                        placeholder={exercise.sets || 'Sets'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Reps
                      </label>
                      <input
                        type="text"
                        value={exercise.actualReps}
                        onChange={(e) => handleWodChange(index, 'actualReps', e.target.value)}
                        placeholder={exercise.reps || 'Reps'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (lbs)
                      </label>
                      <input
                        type="text"
                        value={exercise.actualWeight}
                        onChange={(e) => handleWodChange(index, 'actualWeight', e.target.value)}
                        placeholder="Weight used"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rest Time
                      </label>
                      <input
                        type="text"
                        value={exercise.actualRest}
                        onChange={(e) => handleWodChange(index, 'actualRest', e.target.value)}
                        placeholder={exercise.rest || 'Rest'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={exercise.notes}
                      onChange={(e) => handleWodChange(index, 'notes', e.target.value)}
                      placeholder="How did this exercise feel? Any modifications?"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows="2"
                    />
                  </div>
                  {exercise.scaling && (
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Scaling:</strong> {exercise.scaling}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cooldown Section */}
        {modifiedWorkout.cooldown && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-500" />
              Cooldown ({modifiedWorkout.cooldown.duration})
            </h3>
            <div className="space-y-3">
              {modifiedWorkout.cooldown.exercises.map((exercise, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exercise.completed}
                        onChange={(e) => handleCooldownChange(index, 'completed', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Completed</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exercise.instructions}</p>
                  <input
                    type="text"
                    value={exercise.notes}
                    onChange={(e) => handleCooldownChange(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Workout Notes
          </label>
          <textarea
            value={modifiedWorkout.notes}
            onChange={(e) => setModifiedWorkout(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="How did the workout feel overall? Any challenges or achievements?"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
          />
        </div>

        {/* Workout Completed */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={modifiedWorkout.completed}
              onChange={(e) => setModifiedWorkout(prev => ({ ...prev, completed: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Mark workout as completed</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1" />
            {loading ? 'Saving...' : 'Save Modified Workout'}
          </button>
        </div>
      </div>
    </div>
  );
} 