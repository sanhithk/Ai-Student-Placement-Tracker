import React, { useState, useEffect, useRef } from 'react';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { Mic, MicOff, Video, AlertTriangle, CheckCircle, Bot, PhoneOff } from 'lucide-react';
import axios from 'axios';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

const MockInterview = () => {
  const [topic, setTopic] = useState('Data Structures & Algorithms (DSA)');
  const [customTopic, setCustomTopic] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [history, setHistory] = useState([]);
  
  // Audio & UI states
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      synth.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Initialize Web Speech API for Mic
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      // Automatically restart if it stops unexpectedly while supposed to be recording
      recognition.onend = () => {
        if (isRecording) {
            try { recognition.start(); } catch(e) {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isRecording]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isStarted && timeLeft > 0 && !evaluation) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !evaluation) {
      handleEndInterview();
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, evaluation]);

  const speakAiResponse = (text) => {
    setIsAiSpeaking(true);
    synth.cancel(); // stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a good English voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Female')) || 
                           voices.find(v => v.lang.includes('en-US')) || 
                           voices[0];
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsAiSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsAiSpeaking(false);
    };

    synth.speak(utterance);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const handleStart = async () => {
    setIsStarted(true);
    await startCamera();
    
    const selectedTopic = topic === 'Custom' ? customTopic : topic;
    setIsLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.post('/api/interview/next', 
        { topic: selectedTopic, history: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory([{ role: 'ai', text: data.text }]);
      speakAiResponse(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isAiSpeaking) {
      alert("Please wait for the interviewer to finish speaking.");
      return;
    }

    if (isRecording) {
      // User is done speaking, submit the answer
      recognitionRef.current?.stop();
      setIsRecording(false);
      handleSubmitAnswer();
    } else {
      // Start listening
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;
    
    const newHistory = [...history, { role: 'user', text: transcript }];
    setHistory(newHistory);
    setTranscript('');
    setIsLoading(true);

    const selectedTopic = topic === 'Custom' ? customTopic : topic;

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.post('/api/interview/next', 
        { topic: selectedTopic, history: newHistory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHistory((prev) => [...prev, { role: 'ai', text: data.text }]);
      speakAiResponse(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    synth.cancel(); // Stop AI if speaking
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsLoading(true);

    const selectedTopic = topic === 'Custom' ? customTopic : topic;

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.post('/api/interview/evaluate', 
        { topic: selectedTopic, history },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluation(data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- SETUP SCREEN ---
  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video size={32} className="text-primary-500" />
            AI Mock Interview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Practice highly realistic, voice-enabled interviews with our AI.</p>
        </div>

        <Card>
          <CardBody className="py-8">
            <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg flex items-start gap-3 mb-8">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-400 font-medium">Important Interview Guidelines</h4>
                <p className="text-amber-500/80 text-sm mt-1">
                  For a realistic experience, please ensure you are in a quiet environment with a stable network connection. 
                  This feature requires <strong>Camera</strong> and <strong>Microphone</strong> permissions. You will speak your answers out loud, and the AI will speak back!
                </p>
              </div>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Interview Topic</label>
                <select 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                >
                  <option value="Data Structures & Algorithms (DSA)">Data Structures & Algorithms (DSA)</option>
                  <option value="Resume Explanation">Resume Explanation</option>
                  <option value="Frontend Development (React)">Frontend Development (React)</option>
                  <option value="System Design">System Design</option>
                  <option value="Behavioral (STAR Method)">Behavioral (STAR Method)</option>
                  <option value="Custom">Custom Topic...</option>
                </select>
              </div>

              {topic === 'Custom' && (
                <Input
                  label="Enter Custom Topic"
                  placeholder="e.g. Node.js Backend Architecture"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                />
              )}

              <Button onClick={handleStart} className="w-full flex justify-center items-center gap-2" size="lg">
                <Video size={20} />
                Start Voice Interview
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // --- EVALUATION SCREEN ---
  if (evaluation) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Interview Evaluation</h1>
        <Card>
          <CardBody className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                  <circle 
                    cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 - (251.2 * evaluation.score) / 100}
                    className={evaluation.score > 75 ? "text-emerald-500" : "text-amber-500"} 
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-slate-900 dark:text-white">{evaluation.score}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Performance Score</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{evaluation.feedback}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl">
                <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} /> Key Strengths
                </h3>
                <ul className="space-y-2">
                  {evaluation.strengths?.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-xl">
                <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} /> Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {evaluation.improvements?.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button onClick={() => window.location.reload()} className="w-full mt-4">Take Another Interview</Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // --- ACTIVE INTERVIEW SCREEN (SPLIT-SCREEN) ---
  const currentAiMessage = history.filter(m => m.role === 'ai').pop()?.text || "";

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col max-w-6xl mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isAiSpeaking ? 'bg-primary-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
            {topic === 'Custom' ? customTopic : topic}
          </h2>
        </div>
        <div className={`text-2xl font-mono font-bold tracking-wider ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
        
        {/* Left: AI Interviewer */}
        <Card className="flex flex-col h-full overflow-hidden bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 relative">
          <CardBody className="flex flex-col items-center justify-center p-8 text-center relative z-10 h-full">
            
            {/* AI Avatar */}
            <div className={`relative mb-8 transition-transform duration-500 ${isAiSpeaking ? 'scale-110' : 'scale-100'}`}>
              <div className={`absolute inset-0 rounded-full blur-xl ${isAiSpeaking ? 'bg-primary-500/50 animate-pulse' : 'bg-primary-900/20'}`}></div>
              <div className="relative w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-200 dark:border-slate-700 shadow-2xl">
                <Bot size={64} className={isAiSpeaking ? 'text-primary-400' : 'text-slate-500'} />
              </div>
            </div>

            {/* AI Subtitles */}
            <div className="w-full max-w-md min-h-[120px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex gap-2 text-primary-500">
                  <span className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"></span>
                  <span className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  <span className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                </div>
              ) : (
                <p className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white leading-relaxed">
                  {currentAiMessage}
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Right: User Camera & Subtitles */}
        <Card className="flex flex-col h-full overflow-hidden bg-black border-slate-200 dark:border-slate-700 relative">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-80"
          />
          
          {/* User Subtitles Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
            {transcript ? (
              <p className="text-lg text-slate-900 dark:text-white font-medium drop-shadow-md">
                "{transcript}"
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-400/50 italic text-sm">
                {isRecording ? "Listening..." : "Click the microphone to start speaking"}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Control Bar */}
      <div className="flex justify-center items-center gap-6 p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <button 
          onClick={toggleRecording}
          disabled={isAiSpeaking || isLoading}
          className={`flex flex-col items-center justify-center w-20 h-20 rounded-full transition-all ${
            isAiSpeaking || isLoading 
              ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              : isRecording 
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 ring-4 ring-red-500/50' 
                : 'bg-primary-600 text-slate-900 dark:text-white hover:bg-primary-500 hover:scale-105 shadow-lg shadow-primary-500/30'
          }`}
        >
          {isRecording ? <Mic size={32} className="animate-pulse" /> : <Mic size={32} />}
        </button>
        
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 w-32 text-center">
          {isAiSpeaking ? "Interviewer Speaking..." : isRecording ? "Click to Submit" : "Click to Speak"}
        </div>

        <button 
          onClick={handleEndInterview}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-red-900/30 text-red-400 hover:bg-red-500 hover:text-slate-900 dark:text-white transition-all ml-8"
          title="End Interview"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default MockInterview;
