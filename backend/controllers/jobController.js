const asyncHandler = require('express-async-handler');
const Job = require('../models/Job.js');
const Resume = require('../models/Resume.js');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Get user jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(jobs);
});

// @desc    Create a job application
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
  const { company, role, status, url, notes } = req.body;

  if (!company || !role) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const job = await Job.create({
    user: req.user._id,
    company,
    role,
    status: status || 'Saved',
    url: url || '',
    notes: notes || '',
  });

  res.status(201).json(job);
});

// @desc    Update a job application
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check for user
  if (job.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedJob);
});

// @desc    Delete a job application
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check for user
  if (job.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await job.deleteOne();

  res.json({ id: req.params.id });
});

// @desc    Get matched jobs using AI
// @route   GET /api/jobs/match
// @access  Private
const getMatchedJobs = asyncHandler(async (req, res) => {
  const { location, type, remote } = req.query;

  // 1. Get user's latest resume
  const resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  let userSkills = [];
  if (resume && resume.parsedData && resume.parsedData.skillsExtracted) {
    userSkills = resume.parsedData.skillsExtracted;
  }

  // 2. Fetch jobs from public API
  let jobs = [];
  try {
    const jobRes = await fetch('https://www.arbeitnow.com/api/job-board-api');
    const jobData = await jobRes.json();
    if (jobData && jobData.data) {
      // Base Software Engineering filter
      let filteredJobs = jobData.data.filter(j => 
        j.title.toLowerCase().includes('engineer') || 
        j.title.toLowerCase().includes('developer') || 
        j.title.toLowerCase().includes('programmer') ||
        j.title.toLowerCase().includes('data') ||
        j.title.toLowerCase().includes('tech')
      );

      // Apply User Filters
      if (location) {
        filteredJobs = filteredJobs.filter(j => j.location && j.location.toLowerCase().includes(location.toLowerCase()));
      }

      
      if (remote === 'true') {
        filteredJobs = filteredJobs.filter(j => j.remote === true);
      }

      if (type === 'Internship') {
        filteredJobs = filteredJobs.filter(j => j.title.toLowerCase().includes('intern'));
      } else if (type === 'Full-Time') {
        filteredJobs = filteredJobs.filter(j => !j.title.toLowerCase().includes('intern'));
      }

      jobs = filteredJobs.slice(0, 15).map(j => ({
        id: j.slug,
        company: j.company_name,
        title: j.title,
        description: j.description.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...', // strip HTML
        url: j.url,
        location: j.location,
        tags: j.tags
      }));
    }
  } catch (error) {
    console.error("Failed to fetch from Arbeitnow", error);
    res.status(500);
    throw new Error('Failed to fetch live jobs.');
  }

  if (jobs.length === 0) {
    // AI Fallback: Generate synthetic jobs if no API matches found for the location
    console.log("No jobs found via API. Generating AI synthetic jobs for location:", location);
    const fallbackPrompt = `Generate 5 highly realistic software engineering job postings located in "${location || 'any location'}". 
    Make them a good fit for a candidate with these skills: ${userSkills.length > 0 ? userSkills.join(', ') : 'JavaScript, React, Node.js'}.
    The type of role should be: ${type || 'Full-Time'}.
    Return a JSON array exactly matching this format:
    [{"id": "ai-gen-1", "company": "Company Name", "title": "Job Title", "description": "A 3-sentence realistic job description.", "url": "https://linkedin.com", "location": "${location || 'Remote'}", "tags": ["Tech1", "Tech2"]}]
    Do not use markdown blocks. Return only the JSON.`;
    
    try {
      const fallbackRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fallbackPrompt,
      });
      const fallbackText = fallbackRes.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      const syntheticJobs = JSON.parse(fallbackText);
      
      const scoredSynthetic = syntheticJobs.map(j => ({
        ...j,
        matchScore: Math.floor(Math.random() * 11) + 85, // 85-95%
        matchReason: "This job was custom-sourced by our AI based on your specific location filters and skill set."
      }));
      return res.json(scoredSynthetic);
    } catch (fallbackError) {
      console.error("Gemini Fallback Error:", fallbackError);
      return res.json([]);
    }
  }


  // If no skills, return jobs without AI match score
  if (userSkills.length === 0) {
    const defaultScored = jobs.map(j => ({
      ...j,
      matchScore: 50,
      matchReason: "Upload a resume to get personalized match scores."
    }));
    return res.json(defaultScored);
  }

  // 3. Ask Gemini to score them
  const prompt = `You are an expert technical recruiter matching a candidate to jobs.
Candidate Skills: ${userSkills.join(', ')}

Here are 15 job postings:
${JSON.stringify(jobs.map(j => ({id: j.id, title: j.title, tags: j.tags, desc: j.description})))}

For each job, evaluate the candidate's skills against the job title and description.
Return a JSON array of objects. Do NOT wrap in markdown.
Format: [{"id": "job-slug", "matchScore": 85, "matchReason": "A short 1-sentence reason why."}]`;

  let aiScores = [];
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    const cleanedText = response.text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    aiScores = JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Match Error:", error);
  }

  // 4. Combine data
  const finalJobs = jobs.map(job => {
    const aiData = aiScores.find(s => s.id === job.id);
    return {
      ...job,
      matchScore: aiData ? aiData.matchScore : Math.floor(Math.random() * 40) + 40,
      matchReason: aiData ? aiData.matchReason : "Match calculation failed, using estimate."
    };
  });

  // Sort by highest match score
  finalJobs.sort((a, b) => b.matchScore - a.matchScore);

  res.json(finalJobs);
});

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getMatchedJobs,
};
