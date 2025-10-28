import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Collection references
const getWorkoutsCollection = (userId) => collection(db, 'users', userId, 'workouts');
const getExercisesCollection = (userId) => collection(db, 'users', userId, 'exercises');

// Workout operations
export const workoutService = {
  // Add a new workout
  async addWorkout(userId, workoutData) {
    try {
      const docRef = await addDoc(getWorkoutsCollection(userId), {
        ...workoutData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...workoutData };
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  },

  // Get all workouts for a user
  async getWorkouts(userId) {
    try {
      const workoutsRef = collection(db, 'users', userId, 'workouts');
      const q = query(workoutsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting workouts:', error);
      throw error;
    }
  },

  // Update a workout
  async updateWorkout(userId, workoutId, workoutData) {
    try {
      const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
      await updateDoc(workoutRef, {
        ...workoutData,
        updatedAt: serverTimestamp()
      });
      return { id: workoutId, ...workoutData };
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  },

  // Delete a workout
  async deleteWorkout(userId, workoutId) {
    console.log('workoutService.deleteWorkout called with:', { userId, workoutId });
    try {
      const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
      console.log('Workout reference created:', workoutRef.path);
      const docSnap = await getDoc(workoutRef);
      if (!docSnap.exists()) {
        console.warn('Document does not exist, treating as already deleted:', workoutRef.path);
        return true;
      }
      console.log('Document exists, proceeding to delete');
      await deleteDoc(workoutRef);
      console.log('Workout deleted from Firestore successfully');
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  // Duplicate/Repeat a workout
  async repeatWorkout(userId, workoutData) {
    try {
      // Create a copy of the workout data without the id and timestamps
      const { id, createdAt, updatedAt, ...workoutCopy } = workoutData;
      
      // Add "(Repeated)" to the name to distinguish it
      const repeatedWorkout = {
        ...workoutCopy,
        name: `${workoutCopy.name} (Repeated)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(getWorkoutsCollection(userId), repeatedWorkout);
      return { id: docRef.id, ...repeatedWorkout };
    } catch (error) {
      console.error('Error repeating workout:', error);
      throw error;
    }
  }
};

// Exercise operations
export const exerciseService = {
  // Add a new exercise to a workout
  async addExercise(userId, workoutId, exerciseData) {
    try {
      const docRef = await addDoc(getExercisesCollection(userId), {
        ...exerciseData,
        workoutId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...exerciseData };
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  },

  // Get exercises for a specific workout
  async getExercisesByWorkout(userId, workoutId) {
    try {
      const q = query(
        getExercisesCollection(userId),
        where('workoutId', '==', workoutId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting exercises:', error);
      throw error;
    }
  },

  // Update an exercise
  async updateExercise(userId, exerciseId, exerciseData) {
    try {
      const exerciseRef = doc(db, 'users', userId, 'exercises', exerciseId);
      await updateDoc(exerciseRef, {
        ...exerciseData,
        updatedAt: serverTimestamp()
      });
      return { id: exerciseId, ...exerciseData };
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  },

  // Delete an exercise
  async deleteExercise(userId, exerciseId) {
    try {
      const exerciseRef = doc(db, 'users', userId, 'exercises', exerciseId);
      await deleteDoc(exerciseRef);
      return exerciseId;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  }
}; 