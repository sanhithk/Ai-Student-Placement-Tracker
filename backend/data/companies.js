const companies = [
  {
    id: 'google',
    name: 'Google',
    logoUrl: 'https://logo.clearbit.com/google.com',
    tier: 'MAANG',
    difficultyScore: 95,
    hiringWorkflow: [
      { step: 1, name: 'Online Assessment', duration: '90 mins', type: 'DSA', description: '2 Medium/Hard algorithmic questions on HackerRank or specialized platform.' },
      { step: 2, name: 'Phone Screen', duration: '45 mins', type: 'DSA', description: '1-2 DSA questions focusing on logic, edge cases, and optimization. Usually conducted via Google Docs.' },
      { step: 3, name: 'Onsite Rounds (4-5)', duration: '45 mins each', type: 'Mixed', description: '3-4 Technical (Advanced DSA, System Design for experienced roles) and 1 Googleyness (Behavioral) round.' }
    ],
    recommendedDSA: ['Graphs & Trees', 'Dynamic Programming', 'Tries', 'Sliding Window', 'Advanced Sorting'],
    techSubjects: ['System Design (Basics for New Grads)', 'Operating Systems', 'Networking Concepts'],
    hrQuestions: [
      'Tell me about a time you faced a difficult technical challenge and how you overcame it.',
      'How do you handle disagreements with team members?',
      'Describe a situation where you had to learn a new technology quickly.'
    ],
    resources: [
      { name: 'Google Interview Prep Guide', url: 'https://careers.google.com/interview/' },
      { name: 'LeetCode Google Tagged', url: 'https://leetcode.com/company/google/' }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logoUrl: 'https://logo.clearbit.com/amazon.com',
    tier: 'MAANG',
    difficultyScore: 90,
    hiringWorkflow: [
      { step: 1, name: 'Online Assessment 1', duration: '90 mins', type: 'Coding', description: '2 coding questions + debugging section.' },
      { step: 2, name: 'Online Assessment 2', duration: '60 mins', type: 'Behavioral/Work Style', description: 'Amazon Leadership Principles work simulation.' },
      { step: 3, name: 'Virtual Onsite (3-4 Rounds)', duration: '60 mins each', type: 'Mixed', description: 'Heavy focus on Leadership Principles mixed with DSA and Object Oriented Design.' }
    ],
    recommendedDSA: ['Arrays & Strings', 'Linked Lists', 'Trees & BST', 'Graph Traversal', 'Hash Maps'],
    techSubjects: ['Object Oriented Design', 'Databases', 'Scalability basics'],
    hrQuestions: [
      'Tell me about a time you showed customer obsession.',
      'Describe a time you took a calculated risk and failed. What did you learn?',
      'Give an example of a time you disagreed and committed.'
    ],
    resources: [
      { name: 'Amazon Leadership Principles', url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles' }
    ]
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    tier: 'MAANG / Big Tech',
    difficultyScore: 88,
    hiringWorkflow: [
      { step: 1, name: 'Online Assessment', duration: '90 mins', type: 'Coding', description: 'Usually 3 questions of varying difficulty on Codility.' },
      { step: 2, name: 'Technical Rounds (3-4)', duration: '45 mins each', type: 'DSA/System Design', description: 'Focus on clean code, algorithms, and sometimes System Design or Low-Level Design.' },
      { step: 3, name: 'As-App Round', duration: '60 mins', type: 'Behavioral/Tech', description: 'Final round with a senior leader, assessing culture fit and deep technical understanding.' }
    ],
    recommendedDSA: ['Linked Lists', 'Trees', 'Strings', 'Sorting & Searching', 'Matrix'],
    techSubjects: ['OS (Deadlocks, Memory)', 'DBMS (SQL Queries, Normalization)', 'System Architecture'],
    hrQuestions: [
      'Why Microsoft?',
      'Tell me about a project you are most proud of.',
      'How do you stay updated with new technologies?'
    ],
    resources: [
      { name: 'Microsoft Interview Tips', url: 'https://careers.microsoft.com/v2/global/en/interviewtips' }
    ]
  },
  {
    id: 'tcs',
    name: 'Tata Consultancy Services (TCS)',
    logoUrl: 'https://logo.clearbit.com/tcs.com',
    tier: 'Service Based (Mass Recruiter)',
    difficultyScore: 60,
    hiringWorkflow: [
      { step: 1, name: 'TCS NQT', duration: '180 mins', type: 'Aptitude/Coding', description: 'Numerical, Verbal, Reasoning, Programming Logic, and 2 Hands-on Coding questions.' },
      { step: 2, name: 'Technical Interview', duration: '30 mins', type: 'Technical', description: 'Questions on resume projects, core subjects (Java/C++, DBMS, OS).' },
      { step: 3, name: 'Managerial/HR Round', duration: '20 mins', type: 'Behavioral', description: 'Willingness to relocate, background check, basic HR questions.' }
    ],
    recommendedDSA: ['Arrays', 'Strings', 'Basic Math', 'Sorting', 'Number Theory (Primes, GCD)'],
    techSubjects: ['C/C++/Java Basics', 'SQL Queries', 'Software Development Life Cycle (SDLC)'],
    hrQuestions: [
      'Why do you want to join TCS?',
      'Are you willing to relocate to any location in India?',
      'Are you open to working in different technologies and shifts?'
    ],
    resources: [
      { name: 'TCS NQT Prep', url: 'https://learning.tcsionhub.in/' }
    ]
  },
  {
    id: 'infosys',
    name: 'Infosys',
    logoUrl: 'https://logo.clearbit.com/infosys.com',
    tier: 'Service Based',
    difficultyScore: 65,
    hiringWorkflow: [
      { step: 1, name: 'Online Assessment', duration: '100 mins', type: 'Aptitude', description: 'Logical Reasoning, Quantitative Aptitude, Verbal Ability. (HackWithInfy has heavy coding).' },
      { step: 2, name: 'Technical Interview', duration: '40 mins', type: 'Technical', description: 'Deep dive into projects, OOPs concepts, basic DBMS.' },
      { step: 3, name: 'HR Interview', duration: '15 mins', type: 'Behavioral', description: 'Standard HR check.' }
    ],
    recommendedDSA: ['Arrays', 'Strings', 'Linked Lists (for SP/DSP roles)'],
    techSubjects: ['OOPs Concepts in depth', 'DBMS & SQL', 'Computer Networks'],
    hrQuestions: [
      'Where do you see yourself in 5 years?',
      'What are your strengths and weaknesses?',
      'Explain your final year project.'
    ],
    resources: []
  },
  {
    id: 'accenture',
    name: 'Accenture',
    logoUrl: 'https://logo.clearbit.com/accenture.com',
    tier: 'Consulting / Tech',
    difficultyScore: 68,
    hiringWorkflow: [
      { step: 1, name: 'Cognitive & Technical Assessment', duration: '90 mins', type: 'Aptitude/Tech', description: 'English, Critical Reasoning, Abstract Reasoning, Common App/MS Office, Pseudocode, Network Security.' },
      { step: 2, name: 'Coding Assessment', duration: '45 mins', type: 'Coding', description: '2 Coding questions (Easy-Medium).' },
      { step: 3, name: 'Communication Assessment', duration: '30 mins', type: 'Verbal', description: 'Reading, listening, speaking test.' },
      { step: 4, name: 'Interview', duration: '30 mins', type: 'Mixed', description: 'Combined Technical + HR round focusing on adaptability and project work.' }
    ],
    recommendedDSA: ['Basic Arrays', 'String Manipulation', 'Loops and Conditions'],
    techSubjects: ['Cloud Basics', 'Agile Methodology', 'Pseudocode reading'],
    hrQuestions: [
      'Tell me about a time you learned a new skill on your own.',
      'How do you manage conflicting priorities?',
      'Why Accenture?'
    ],
    resources: []
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    logoUrl: 'https://logo.clearbit.com/deloitte.com',
    tier: 'Big 4',
    difficultyScore: 75,
    hiringWorkflow: [
      { step: 1, name: 'Online Assessment', duration: '90 mins', type: 'Aptitude/Tech', description: 'AMCAT pattern - Quants, Logical, Verbal, and 2 Coding Questions.' },
      { step: 2, name: 'Group Discussion / Jam', duration: '20 mins', type: 'Communication', description: 'Case study or general topic discussion (depends on role).' },
      { step: 3, name: 'Technical + HR Interview', duration: '45 mins', type: 'Mixed', description: 'Focus on analytical thinking, DBMS, projects, and consulting mindset.' }
    ],
    recommendedDSA: ['Arrays', 'Strings', 'SQL Queries (Very Important)'],
    techSubjects: ['DBMS', 'Data Warehousing Basics', 'Software Engineering Principles'],
    hrQuestions: [
      'How would you explain a complex technical concept to a non-technical client?',
      'Why Deloitte over other Big 4?',
      'Tell me about a time you worked in a challenging team.'
    ],
    resources: []
  },
  {
    id: 'cognizant',
    name: 'Cognizant',
    logoUrl: 'https://logo.clearbit.com/cognizant.com',
    tier: 'Service Based',
    difficultyScore: 62,
    hiringWorkflow: [
      { step: 1, name: 'Online Assessment', duration: '100 mins', type: 'Aptitude/Coding', description: 'Quants, Logical, English, Automata Fix (Debugging), Automata (Coding).' },
      { step: 2, name: 'Technical Interview', duration: '30 mins', type: 'Technical', description: 'Resume review, OOPs, DBMS.' },
      { step: 3, name: 'HR Interview', duration: '15 mins', type: 'Behavioral', description: 'Location preference, night shifts.' }
    ],
    recommendedDSA: ['Debugging skills', 'Arrays', 'Strings'],
    techSubjects: ['OOPs', 'DBMS', 'Basic Web Technologies (HTML/CSS/JS)'],
    hrQuestions: [
      'Are you comfortable working in night shifts?',
      'Why should we hire you?',
      'What do you know about Cognizant?'
    ],
    resources: []
  }
];

module.exports = companies;
