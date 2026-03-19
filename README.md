# Workout AI Tracker 💪

A modern, AI-powered CrossFit workout tracking application built with React, Firebase, and Google's Gemini AI. Generate personalized workouts, track your progress, and achieve your fitness goals with intelligent workout suggestions.

![Workout AI Tracker](https://img.shields.io/badge/React-18-blue) ![Firebase](https://img.shields.io/badge/Firebase-9-orange) ![Gemini AI](https://img.shields.io/badge/Gemini-AI-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ Features

### 🤖 AI-Powered Workout Generation
- **Gemini AI Integration**: Generate unique, personalized CrossFit workouts using Google's Gemini AI
- **Smart Randomization**: Every workout is different with enhanced randomization algorithms
- **Intelligent Parsing**: Handles both JSON and text responses from AI seamlessly
- **Fallback System**: Robust error handling with template-based workouts when AI is unavailable

### 📊 Comprehensive Progress Tracking
- **Exercise Progress Summary**: Track your personal records and workout frequency
- **Normalized Exercise Names**: Prevents duplicate entries (e.g., "kettlebell swing" vs "kettlebell swings")
- **Workout History**: Complete history of all your workouts with detailed analytics
- **Real-time Updates**: Progress updates automatically when workouts are created, modified, or deleted

### 🏋️ CrossFit-Style Workouts
- **Structured Format**: Warm-up, Strength, WOD (Workout of the Day), and Cool-down sections
- **Exercise Categories**: Barbell, Dumbbell, Bodyweight, Gymnastics, Monostructural, and Core exercises
- **Equipment Filtering**: Filter exercises based on available equipment
- **Difficulty Scaling**: Beginner to advanced workout variations

### 🔄 Workout Management
- **Create Custom Workouts**: Build your own workouts with the intuitive workout builder
- **Clone & Repeat**: Easily repeat previous workouts from your history
- **Workout Modifier**: Edit and customize any workout to fit your needs
- **Real-time Sync**: All data synced to Firebase for cross-device access

### 🎯 User Experience
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Dark/Light Theme**: Clean, professional interface with Tailwind CSS
- **Fast Performance**: Optimized with Vite for lightning-fast development and builds
- **Intuitive Navigation**: Easy-to-use dashboard with tabbed interface

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Google Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/workout-ai-tracker.git
   cd workout-ai-tracker
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   
   **Option A: Quick Setup (Recommended)**
   ```bash
   npm run setup
   ```
   
   **Option B: Manual Setup**
   ```bash
   cp env.example .env
   ```
   
   Then edit the `.env` file with your actual credentials:
   ```env
   # Firebase Configuration (get from Firebase Console)
   VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Gemini AI Configuration (get from Google AI Studio)
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key
   ```

4. **Get Your Credentials**
   
   **Firebase Setup:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Go to Project Settings > General tab
   - Scroll to "Your apps" section and add a web app
   - Copy the config values to your `.env` file
   
   **Gemini AI Setup:**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Click "Get API Key" in the left sidebar
   - Create a new API key
   - Copy the key to your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## 🏗️ Project Structure

```
workout-ai-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Authentication components
│   │   │   └── dashboard/      # Main dashboard components
│   │   ├── contexts/           # React contexts
│   │   ├── firebase/           # Firebase configuration
│   │   ├── services/           # API and business logic
│   │   └── assets/             # Static assets
│   ├── public/                 # Public assets
│   └── package.json           # Dependencies and scripts
└── README.md                  # Project documentation
```

## 🔧 Key Technologies

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **AI**: Google Gemini AI API
- **State Management**: React Context API
- **Routing**: React Router
- **Icons**: Lucide React

## 📱 Usage

### Creating Workouts
1. Navigate to the "Suggestions" tab
2. Set your preferences (focus area, duration, intensity, equipment)
3. Click "Generate AI Workout" for personalized suggestions
4. Review and customize the generated workout
5. Save to your workout history

### Tracking Progress
1. Complete workouts and log your actual performance
2. View your progress in the "Home" tab
3. Check the Exercise Progress Summary for personal records
4. Review your workout history in the "History" tab

### Managing Workouts
- **Repeat**: Clone any previous workout
- **Modify**: Edit workouts to fit your current needs
- **Delete**: Remove workouts you no longer need

## 🤖 AI Features

The app uses Google's Gemini AI to generate unique, personalized workouts. Key features:

- **Enhanced Randomization**: UUID, random emojis, and motivational phrases ensure unique workouts
- **Intelligent Parsing**: Handles both structured JSON and unstructured text responses
- **Fallback System**: Template-based workouts when AI is unavailable
- **Exercise Normalization**: Consistent exercise naming to prevent duplicates

## 🔒 Security

- **No Hardcoded Credentials**: All sensitive data is stored in environment variables
- **Environment Validation**: App validates required credentials on startup
- **Firebase Authentication**: Secure user management with Firebase Auth
- **Client-side Validation**: Input validation and error handling
- **Secure Firebase Rules**: Proper Firestore security rules for data protection
- **Git Ignore**: `.env` files are excluded from version control

### Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use environment variables** - All credentials are loaded from `.env`
3. **Validate on startup** - App checks for required credentials
4. **Rotate API keys** - Regularly update your API keys
5. **Use Firebase security rules** - Implement proper Firestore rules

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent workout generation
- Firebase for backend services
- React and Vite teams for the amazing development experience
- Tailwind CSS for beautiful styling
- The CrossFit community for inspiration
