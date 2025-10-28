#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Workout AI Tracker - Configuration Check');
console.log('==========================================\n');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

let allGood = true;

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('   Run: npm run setup');
  allGood = false;
} else {
  console.log('✅ .env file exists');
  
  // Read and check .env content
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_GEMINI_API_KEY'
  ];
  
  console.log('\n📋 Environment Variables Check:');
  
  requiredVars.forEach(varName => {
    const line = lines.find(l => l.startsWith(varName + '='));
    if (!line) {
      console.log(`❌ ${varName} - Missing`);
      allGood = false;
    } else {
      const value = line.split('=')[1];
      if (!value || value.includes('your_') || value.trim() === '') {
        console.log(`⚠️  ${varName} - Not configured (placeholder value)`);
        allGood = false;
      } else {
        console.log(`✅ ${varName} - Configured`);
      }
    }
  });
}

// Check if env.example exists
if (fs.existsSync(envExamplePath)) {
  console.log('\n✅ env.example template exists');
} else {
  console.log('\n❌ env.example template missing');
  allGood = false;
}

// Check package.json for setup script
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.scripts && packageJson.scripts.setup) {
    console.log('\n✅ Setup script available (npm run setup)');
  } else {
    console.log('\n❌ Setup script missing from package.json');
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 All checks passed! Your project is ready to run.');
  console.log('\nNext steps:');
  console.log('1. npm run dev');
  console.log('2. Open http://localhost:5173');
} else {
  console.log('⚠️  Some issues found. Please fix them before running the app.');
  console.log('\nQuick fix:');
  console.log('1. Run: npm run setup');
  console.log('2. Edit .env file with your actual credentials');
  console.log('3. Run: npm run dev');
}

console.log('\n📚 For detailed setup instructions, see README.md');

