# AI-Powered Student Career & Placement Tracker

A production-ready full-stack web application built on the MERN stack. This application serves as a comprehensive platform for students to track job applications, analyze their resumes using AI, monitor coding progress, and get actionable feedback to secure top internships and jobs.

## Features

- **User Authentication:** Secure JWT-based registration and login with bcrypt password hashing.
- **Interactive Dashboard:** Premium UI tracking applications, coding problems, and resume scores using Recharts and Tailwind CSS.
- **AI Resume Analyzer:** Upload PDF resumes and get instant AI-generated feedback and ATS scoring (powered by Google Gemini / OpenAI).
- **Job Tracker:** Manage the entire lifecycle of internship/job applications from Saved to Offered.
- **Cloud Storage:** Securely stores uploaded resume PDFs to Cloudinary.
- **Responsive Design:** Fully responsive UI tailored for both desktop and mobile viewing.

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Recharts, Lucide-React, Axios, Framer Motion.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB, Mongoose.
- **Authentication:** JSON Web Tokens (JWT).
- **Storage:** Multer, Cloudinary.
- **Testing:** Jest, Supertest.
- **DevOps:** Docker, Git.

## Project Structure

```text
ai-placement-tracker/
├── backend/
│   ├── config/          # DB config
│   ├── controllers/     # Route logic
│   ├── middlewares/     # Auth, Error & Upload middlewares
│   ├── models/          # Mongoose Schemas
│   ├── routes/          # Express Routes
│   ├── server.js        # Entry point
│   ├── Dockerfile       # Backend container definition
│   └── .env             # Environment variables
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI & Layout components
    │   ├── context/     # Auth and state contexts
    │   ├── pages/       # Dashboard, ResumeAnalyzer, JobTracker
    │   ├── App.jsx      # Routing setup
    │   └── main.jsx     # React entry point
    ├── tailwind.config.js
    └── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas URI)
- Cloudinary Account (for file uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-placement-tracker.git
   cd ai-placement-tracker
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Deployment Guide

### Deploying the Backend (Render / Railway)
1. Push your code to GitHub.
2. Link your repository to a new web service on Render/Railway.
3. Set the root directory to `backend`.
4. Add all environment variables from your `.env` file into the deployment dashboard.
5. Provide the Build Command: `npm install` and Start Command: `npm start`.

### Deploying the Frontend (Vercel)
1. Link your repository to Vercel.
2. Set the root directory to `frontend`.
3. Vercel will automatically detect Vite. Set the Build Command: `npm run build`.
4. Add any frontend environment variables (like `VITE_API_URL`).
5. Click Deploy.

### Docker Support
To run the backend via Docker:
```bash
cd backend
docker build -t ai-tracker-backend .
docker run -p 5000:5000 --env-file .env ai-tracker-backend
```

## Testing
Run backend unit tests using Jest:
```bash
cd backend
npm test
```

## License
MIT License
