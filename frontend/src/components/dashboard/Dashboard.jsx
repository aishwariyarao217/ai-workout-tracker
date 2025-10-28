import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../../services/workoutService';
import { LogOut, Plus, Activity, Calendar, Target, TrendingUp, Home } from 'lucide-react';
import WorkoutHistory from './WorkoutHistory';
import WorkoutSuggestions from './WorkoutSuggestions';
import CreateWorkout from './CreateWorkout';
import Homepage from './Homepage';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showCreateWorkout, setShowCreateWorkout] = useState(false);
  const [homepageRefresh, setHomepageRefresh] = useState(0);

  useEffect(() => {
    if (currentUser) {
      loadWorkouts();
    }
  }, [currentUser]);

  const loadWorkouts = async () => {
    console.log('loadWorkouts called');
    console.log('Current user:', currentUser?.uid);
    
    if (!currentUser?.uid) {
      console.log('No current user, skipping workout load');
      return;
    }
    
    try {
      console.log('Calling workoutService.getWorkouts...');
      const userWorkouts = await workoutService.getWorkouts(currentUser.uid);
      console.log('Workouts loaded:', userWorkouts);
      console.log('Number of workouts:', userWorkouts.length);
      
      // Log each workout for debugging
      userWorkouts.forEach((workout, index) => {
        console.log(`Workout ${index + 1}:`, {
          id: workout.id,
          name: workout.name,
          createdAt: workout.createdAt
        });
      });
      
      setWorkouts(userWorkouts);
      console.log('Workouts state updated');
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleWorkoutCreated = () => {
    setShowCreateWorkout(false);
    loadWorkouts();
    // Trigger homepage refresh
    setHomepageRefresh(prev => prev + 1);
  };

  const handleWorkoutDeleted = () => {
    loadWorkouts();
    // Trigger homepage refresh
    setHomepageRefresh(prev => prev + 1);
  };

  const handleWorkoutRepeated = () => {
    loadWorkouts();
    // Trigger homepage refresh
    setHomepageRefresh(prev => prev + 1);
  };

  const handleWorkoutUpdated = () => {
    loadWorkouts();
    // Trigger homepage refresh
    setHomepageRefresh(prev => prev + 1);
  };

  // Calculate stats
  const totalWorkouts = workouts.length;
  const thisWeekWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.createdAt?.toDate?.() || workout.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  const totalExercises = workouts.reduce((total, workout) => {
    return total + (workout.exercises?.length || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Workout AI Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {currentUser?.displayName || currentUser?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'home', name: 'Home', icon: Home },
              { id: 'history', name: 'Workout History', icon: Calendar },
              { id: 'suggestions', name: 'AI Suggestions', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'home' && (
          <div className="px-4 sm:px-0">
            <Homepage refresh={homepageRefresh} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="px-4 sm:px-0">
            <WorkoutHistory 
              workouts={workouts} 
              compact={false} 
              onWorkoutDeleted={handleWorkoutDeleted} 
              onWorkoutRepeated={handleWorkoutRepeated}
              onWorkoutUpdated={handleWorkoutUpdated}
            />
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="px-4 sm:px-0">
            <WorkoutSuggestions 
              onWorkoutCreated={handleWorkoutCreated} 
              onWorkoutDeleted={handleWorkoutDeleted}
              onWorkoutUpdated={handleWorkoutUpdated}
            />
          </div>
        )}
      </main>

      {/* Create Workout Modal */}
      {showCreateWorkout && (
        <CreateWorkout
          onClose={() => setShowCreateWorkout(false)}
          onWorkoutCreated={handleWorkoutCreated}
        />
      )}
    </div>
  );
} 