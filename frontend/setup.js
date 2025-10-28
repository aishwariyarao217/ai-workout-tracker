#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Workout AI Tracker Setup');
console.log('============================\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupEnvironment();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setupEnvironment();
}

function setupEnvironment() {
  console.log('\n📋 Setting up environment variables...\n');
  
  // Copy env.example to .env
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from template');
  } else {
    console.log('❌ env.example file not found!');
    rl.close();
    return;
  }

  console.log('\n🔧 Next steps:');
  console.log('1. Open .env file in your editor');
  console.log('2. Replace all placeholder values with your actual credentials:');
  console.log('   - Firebase: Get from https://console.firebase.google.com/');
  console.log('   - Gemini AI: Get from https://aistudio.google.com/');
  console.log('3. Save the file');
  console.log('4. Run: npm run dev');
  
  console.log('\n📚 For detailed setup instructions, see README.md');
  console.log('\n🎉 Setup complete! Happy coding!');
  
  rl.close();
}

