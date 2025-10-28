# Workout AI Tracker

A React web application that provides AI-generated workout suggestions and tracks exercise history using Firebase for authentication and data storage.

## Features

- 🔐 **User Authentication**: Secure login/signup with Firebase Auth
- 🤖 **AI Workout Suggestions**: Personalized workout recommendations based on fitness level and preferences
- 📊 **Workout Tracking**: Complete exercise history with detailed workout logs
- 📱 **Responsive Design**: Modern UI that works on desktop and mobile
- 🎯 **Customizable Workouts**: Create and save your own workout routines
- 📈 **Progress Analytics**: Track your fitness journey with statistics and insights

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workout-ai-tracker/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get your Firebase configuration

4. **Configure Firebase**

   Update the Firebase configuration in `src/firebase/config.js`:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. **Set up Firestore Security Rules**

   In your Firebase Console, go to Firestore Database > Rules and add these rules:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   └── PrivateRoute.jsx
│   └── dashboard/
│       ├── Dashboard.jsx
│       ├── WorkoutHistory.jsx
│       ├── WorkoutSuggestions.jsx
│       └── CreateWorkout.jsx
├── contexts/
│   └── AuthContext.jsx
├── services/
│   ├── workoutService.js
│   └── aiWorkoutService.js
├── firebase/
│   └── config.js
├── App.jsx
└── main.jsx
```

## Features Overview

### Authentication
- User registration and login
- Secure password handling
- Protected routes

### AI Workout Suggestions
- Personalized recommendations based on:
  - Fitness level (Beginner/Intermediate/Advanced)
  - Focus area (Upper body, Lower body, Core, Cardio, Full body)
  - Duration preferences
  - Intensity level
- Quick workout options for busy days
- AI-powered suggestions based on workout history

### Workout Management
- Create custom workouts
- Add exercises with sets, reps, duration, and rest periods
- Categorize exercises by body part
- Save and track workout history

### Dashboard
- Overview statistics (total workouts, weekly progress, etc.)
- Recent workout history
- Quick actions for creating workouts and getting suggestions

## Usage

1. **Sign up/Login**: Create an account or sign in with existing credentials
2. **Set Preferences**: Configure your fitness level, focus areas, and duration preferences
3. **Get AI Suggestions**: Browse AI-generated workout recommendations
4. **Create Workouts**: Build custom workout routines
5. **Track Progress**: View your workout history and statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Future Enhancements

- [ ] Workout timer functionality
- [ ] Progress photos and measurements
- [ ] Social features and workout sharing
- [ ] Integration with fitness trackers
- [ ] Advanced analytics and progress charts
- [ ] Workout templates and programs
- [ ] Nutrition tracking integration
