const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Challenge = require('./models/Challenge');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const challenges = [
  {
    title: 'Analyze a Mock Resume',
    description: 'Upload a sample resume to the Resume Analyzer and see if it scores above 75%.',
    type: 'action',
    points: 20
  },
  {
    title: 'Complete a Mock Interview',
    description: 'Use the AI Interview tool to complete a 5-minute mock interview session.',
    type: 'action',
    points: 50
  },
  {
    title: 'Link Your GitHub',
    description: 'Make sure your GitHub profile is linked in the Coding Stats section.',
    type: 'action',
    points: 10
  },
  {
    title: 'Track 3 New Jobs',
    description: 'Find 3 interesting roles in the Discover Jobs section and add them to your Job Tracker.',
    type: 'action',
    points: 15
  },
  {
    title: 'Solve a LeetCode Easy',
    description: 'Solve one easy algorithm problem on LeetCode and verify your Coding Stats update.',
    type: 'action',
    points: 30
  },
  {
    title: 'CS Trivia: Big O Notation',
    description: 'What is the time complexity of accessing an element in an array by its index?',
    type: 'quiz',
    points: 15,
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctAnswer: 'O(1)'
  },
  {
    title: 'CS Trivia: Data Structures',
    description: 'Which data structure uses LIFO (Last In First Out) principle?',
    type: 'quiz',
    points: 15,
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correctAnswer: 'Stack'
  },
  {
    title: 'CS Trivia: Networking',
    description: 'Which HTTP method is typically used to update an existing resource?',
    type: 'quiz',
    points: 15,
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctAnswer: 'PUT'
  },
  {
    title: 'CS Trivia: Databases',
    description: 'What does ACID stand for in the context of databases?',
    type: 'quiz',
    points: 20,
    options: [
      'Automatic, Consistent, Isolated, Durable',
      'Atomicity, Consistency, Isolation, Durability',
      'Asynchronous, Concurrent, Indexed, Distributed',
      'Accurate, Calculated, Integrated, Dependable'
    ],
    correctAnswer: 'Atomicity, Consistency, Isolation, Durability'
  }
];

const seedChallenges = async () => {
  try {
    await connectDB();
    await Challenge.deleteMany(); // Clear existing challenges
    await Challenge.insertMany(challenges);
    console.log('Challenges Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding data: ${error}`);
    process.exit(1);
  }
};

seedChallenges();
