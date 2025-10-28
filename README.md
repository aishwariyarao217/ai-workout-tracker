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
   ```bash
   cp env.example .env
   ```
   
   Update your `.env` file with your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
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

- Firebase Authentication for secure user management
- Environment variables for API keys
- Client-side validation and error handling
- Secure Firebase rules for data protection

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

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the maintainers

---

**Made with ❤️ for the fitness community**
