import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/workoutService';
import { X, Plus, Trash2, Save } from 'lucide-react';

export default function CreateWorkout({ onClose, onWorkoutCreated }) {
  const { currentUser } = useAuth();
  const [workout, setWorkout] = useState({
    name: '',
    focusArea: 'full body',
    estimatedDuration: 45,
    exercises: []
  });
  const [loading, setLoading] = useState(false);

  const handleAddExercise = () => {
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        name: '',
        sets: 3,
        reps: '',
        duration: '',
        rest: '60 seconds',
        category: 'full body',
        instructions: ''
      }]
    }));
  };

  const handleUpdateExercise = (index, field, value) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const handleRemoveExercise = (index) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleSaveWorkout = async () => {
    if (!workout.name.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (workout.exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    // Validate exercises
    const validExercises = workout.exercises.filter(exercise => 
      exercise.name.trim() && (exercise.reps || exercise.duration)
    );

    if (validExercises.length === 0) {
      alert('Please add valid exercises with names and reps/duration');
      return;
    }

    setLoading(true);
    try {
      const workoutData = {
        ...workout,
        exercises: validExercises,
        createdAt: new Date().toISOString()
      };
      
      await workoutService.addWorkout(currentUser.uid, workoutData);
      onWorkoutCreated();
      onClose();
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Workout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Workout Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Name
              </label>
              <input
                type="text"
                value={workout.name}
                onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter workout name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Area
                </label>
                <select
                  value={workout.focusArea}
                  onChange={(e) => setWorkout(prev => ({ ...prev, focusArea: e.target.value }))}
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
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  value={workout.estimatedDuration}
                  onChange={(e) => setWorkout(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
              <button
                onClick={handleAddExercise}
                className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Exercise {index + 1}</h4>
                    <button
                      onClick={() => handleRemoveExercise(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exercise Name
                      </label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Push-ups"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={exercise.category}
                        onChange={(e) => handleUpdateExercise(index, 'category', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="full body">Full Body</option>
                        <option value="upper body">Upper Body</option>
                        <option value="lower body">Lower Body</option>
                        <option value="core">Core</option>
                        <option value="cardio">Cardio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sets
                      </label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reps (or Duration)
                      </label>
                      <input
                        type="text"
                        value={exercise.reps}
                        onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 10-15 or 30 seconds"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rest Time
                      </label>
                      <input
                        type="text"
                        value={exercise.rest}
                        onChange={(e) => handleUpdateExercise(index, 'rest', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 60 seconds"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions (Optional)
                      </label>
                      <textarea
                        value={exercise.instructions}
                        onChange={(e) => handleUpdateExercise(index, 'instructions', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows="2"
                        placeholder="Exercise instructions..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {workout.exercises.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No exercises added yet. Click "Add Exercise" to get started.</p>
                </div>
              )}
            </div>
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
              onClick={handleSaveWorkout}
              disabled={loading}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 