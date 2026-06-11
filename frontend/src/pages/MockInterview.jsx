import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { Mic, MicOff, Video, AlertTriangle, CheckCircle, Bot, PhoneOff, Settings, Activity } from 'lucide-react';
import axios from 'axios';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

const MockInterview = () => {
  const [topic, setTopic] = useState('Data Structures & Algorithms (DSA)');
  const [customTopic, setCustomTopic] = useState('');
  
  // Stages: 'setup' -> 'system-check' -> 'interview'
  const [stage, setStage] = useState('setup');
  
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [history, setHistory] = useState([]);
  
  // System Check States
  const [micLevel, setMicLevel] = useState(0);
  const [hasPassedCheck, setHasPassedCheck] = useState(false);
  const audioContextRef = useRef(null);
  
  // Audio & UI states
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Stop speech and tracks when component unmounts
  useEffect(() => {
    return () => {
      synth.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialize Web Speech API for Mic
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentText = finalTranscript || interimTranscript;
        
        if (currentText) {
          setTranscript((prev) => {
             // Basic concatenation for UI display. For production, more robust interim tracking is needed.
             // We'll just display the latest detected sentence.
             return currentText; 
          });
          
          // Reset silence timer on every new word detected
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          
          silenceTimerRef.current = setTimeout(() => {
            // User stopped speaking for 3 seconds -> Auto Submit
            recognition.stop();
            setIsRecording(false);
          }, 3000);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        // If it stops but we still want to be recording, restart it (unless we manually stopped it)
        // Handled via useEffect below based on state
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // --- AUTO SUBMIT LOOP LOGIC ---
  // When recording stops and we have a transcript, submit it automatically.
  useEffect(() => {
    if (stage === 'interview' && !isRecording && transcript.trim() && !isAiSpeaking && !isLoading) {
      handleSubmitAnswer(transcript);
    }
  }, [isRecording, stage, isAiSpeaking, isLoading]);

  // When AI finishes speaking, start recording automatically
  useEffect(() => {
    if (stage === 'interview' && !isAiSpeaking && !isLoading && !evaluation && !isRecording) {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        // Already started or error
      }
    }
  }, [isAiSpeaking, isLoading, stage, evaluation]);


  // Timer logic
  useEffect(() => {
    let timer;
    if (stage === 'interview' && timeLeft > 0 && !evaluation) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !evaluation) {
      handleEndInterview();
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft, evaluation]);

  // Proctoring: Tab Switching and Blur
  useEffect(() => {
    if (stage !== 'interview' || evaluation) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("WARNING: Interview Terminated. You have switched tabs, which violates the interview rules.");
        handleEndInterview();
      }
    };

    const handleBlur = () => {
      alert("WARNING: Interview Terminated. You lost focus on the interview window (clicked away).");
      handleEndInterview();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [stage, evaluation]);

  const speakAiResponse = (text) => {
    setIsAiSpeaking(true);
    synth.cancel(); // stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    
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

  const startSystemCheck = async () => {
    setStage('system-check');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Audio Level Analyzer
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      const microphone = audioCtx.createMediaStreamSource(stream);
      const scriptProcessor = audioCtx.createScriptProcessor(2048, 1, 1);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioCtx.destination);
      
      scriptProcessor.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;
        for (let i = 0; i < array.length; i++) {
          values += (array[i]);
        }
        const average = values / array.length;
        setMicLevel(Math.round(average));
        
        // If sound is detected, they pass the mic check
        if (average > 10) {
          setHasPassedCheck(true);
        }
      };

    } catch (err) {
      console.error("Camera/Mic Error:", err);
      alert("Could not access camera/microphone. Please enable permissions to continue.");
      setStage('setup');
    }
  };

  const handleStartInterview = async () => {
    setStage('interview');
    
    // Stop the audio processor to save memory during the interview
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    const selectedTopic = topic === 'Custom' ? customTopic : topic;
    setIsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const userName = userInfo?.name || 'Candidate';
      
      const { data } = await axios.post('/api/interview/next', 
        { topic: selectedTopic, history: [], userName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory([{ role: 'ai', text: data.text }]);
      speakAiResponse(data.text);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (textToSubmit) => {
    const newHistory = [...history, { role: 'user', text: textToSubmit }];
    setHistory(newHistory);
    setTranscript('');
    setIsLoading(true);

    const selectedTopic = topic === 'Custom' ? customTopic : topic;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const userName = userInfo?.name || 'Candidate';

      const { data } = await axios.post('/api/interview/next', 
        { topic: selectedTopic, history: newHistory, userName },
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
    synth.cancel(); 
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

  // --- STAGE: EVALUATION ---
  if (evaluation) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Interview Evaluation</h1>
        <Card>
          <CardBody className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700" />
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
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl">
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} /> Key Strengths
                </h3>
                <ul className="space-y-2">
                  {evaluation.strengths?.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-800 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl">
                <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} /> Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {evaluation.improvements?.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-800 dark:text-slate-300 flex items-start gap-2">
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

  // --- STAGE: SETUP ---
  if (stage === 'setup') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video size={32} className="text-primary-500" />
            AI Mock Interview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Practice highly realistic, hands-free voice interviews with our AI.</p>
        </div>

        <Card>
          <CardBody className="py-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-lg flex items-start gap-3 mb-8">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-700 dark:text-amber-400 font-medium">Important Interview Guidelines</h4>
                <p className="text-amber-600 dark:text-amber-500/80 text-sm mt-1 leading-relaxed">
                  For a realistic experience, please ensure you are in a quiet environment. This is a <strong>Hands-Free</strong> interview. The AI will speak, then your mic will automatically turn on. Once you stop speaking, your answer will automatically be submitted.
                  <br /><br />
                  <strong>Strict Proctoring Enabled:</strong> Do not switch tabs or click away from this window, or the interview will instantly terminate.
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

              <Button onClick={startSystemCheck} className="w-full flex justify-center items-center gap-2" size="lg">
                <Settings size={20} />
                Proceed to System Check
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // --- STAGE: SYSTEM CHECK ---
  if (stage === 'system-check') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={32} className="text-primary-500" />
            System Check
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Let's make sure your camera and microphone are working properly.</p>
        </div>

        <Card>
          <CardBody className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">1. Camera Preview</h3>
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                />
              </div>
            </div>

            <div className="space-y-6 flex flex-col justify-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">2. Microphone Test</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Please say something out loud to test your microphone.</p>
                
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-75"
                    style={{ width: `${Math.min(micLevel * 2, 100)}%` }}
                  ></div>
                </div>
              </div>

              {hasPassedCheck ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                  <CheckCircle size={16} /> Perfect! Environment is ready.
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle size={16} /> Waiting to hear your voice...
                </div>
              )}

              <Button 
                onClick={handleStartInterview} 
                className="w-full mt-auto py-3" 
                disabled={!hasPassedCheck}
              >
                Start Interview
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // --- STAGE: INTERVIEW ---
  const currentAiMessage = history.filter(m => m.role === 'ai').pop()?.text || "";

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col max-w-6xl mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isAiSpeaking ? 'bg-primary-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
            {topic === 'Custom' ? customTopic : topic}
          </h2>
        </div>
        <div className={`text-2xl font-mono font-bold tracking-wider ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
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
                <Bot size={64} className={isAiSpeaking ? 'text-primary-500' : 'text-slate-500'} />
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
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
            {transcript ? (
              <p className="text-lg text-white font-medium drop-shadow-md">
                "{transcript}"
              </p>
            ) : (
              <p className="text-white/50 italic text-sm">
                {isRecording ? "Listening automatically... stop speaking to submit." : "Wait for AI to finish..."}
              </p>
            )}
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div> REC
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Control Bar */}
      <div className="flex justify-between items-center px-8 py-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${isRecording ? 'bg-red-500/20 text-red-500 ring-2 ring-red-500/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Mic size={20} className={isRecording ? "animate-pulse" : ""} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Hands-Free Mode Active</p>
            <p className="text-xs text-slate-500">
              {isAiSpeaking ? "Interviewer is speaking..." : isRecording ? "Speak now. Pausing will auto-submit." : "Processing..."}
            </p>
          </div>
        </div>

        <button 
          onClick={handleEndInterview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-200 dark:border-red-900/50 font-medium text-sm"
        >
          <PhoneOff size={16} /> End Interview
        </button>
      </div>
    </div>
  );
};

export default MockInterview;
