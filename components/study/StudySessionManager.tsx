
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input'; 
import { Modal } from '../ui/Modal';
import CfaQuiz from './CfaQuiz';
import StudyProgressGauge from './StudyProgressGauge';
import { CFAQuestion, KeyResult } from '../../types';
import { BookIcon, ClockIcon, PlayIcon, PauseIcon, SparklesIcon, EyeIcon, EyeSlashIcon } from '../../constants';
import { GEMINI_TEXT_MODEL } from '../../constants'; 
import useTimer from '../../hooks/useTimer';
import { Tooltip } from '../ui/Tooltip';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { showNotification } from '../../services/notificationService';

const API_KEY = process.env.API_KEY;

interface StudySessionManagerProps {
  addStudyHours: (hours: number, topic: string, linkedKRId?: string) => void; 
  totalStudyHours: number;
  cfaTargetHours: number;
  cfaDeadlineDate: Date;
  mockCFAQuestions: CFAQuestion[];
  cfaTopics: string[];
  onSessionComplete: (minutesStudied: number, topic: string, linkedKRId?: string) => void;
  currentKRs: KeyResult[];
}

const StudySessionManager: React.FC<StudySessionManagerProps> = ({
  addStudyHours, // This prop might be redundant if onSessionComplete handles all logic in App.tsx
  totalStudyHours,
  cfaTargetHours,
  cfaDeadlineDate,
  mockCFAQuestions,
  cfaTopics,
  onSessionComplete,
  currentKRs
}) => {
  const { isActive: timerActive, startTimer, pauseTimer, resetTimer, elapsedTime } = useTimer(3600 * 10); 
  
  const [sessionTopic, setSessionTopic] = useState<string>(cfaTopics[0]);
  const [sessionInProgress, setSessionInProgress] = useState<boolean>(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedKR, setSelectedKR] = useState<string>("");

  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [aiTopic, setAiTopic] = useState<string>(cfaTopics[0]);
  const [aiSubTopic, setAiSubTopic] = useState<string>('');
  const [aiSubSubTopic, setAiSubSubTopic] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<string>('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [aiGeneratorError, setAiGeneratorError] = useState<string | null>(null);

  useEffect(() => {
    if (API_KEY && API_KEY !== "YOUR_API_KEY") {
      try {
        setAi(new GoogleGenAI({ apiKey: API_KEY }));
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI in StudySessionManager:", e);
        setAiGeneratorError("Failed to initialize AI Service for question generation. Ensure API Key is valid.");
      }
    } else {
      setAiGeneratorError("Gemini API Key not configured. AI question generation disabled.");
      console.warn("Gemini API Key not configured for StudySessionManager.");
    }
  }, []);


  const formatElapsedTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  
  const timerDisplay = formatElapsedTime(elapsedTime);
  const timeLeft = 3600 * 10 - elapsedTime;

  const handleStartSession = () => {
    setSessionInProgress(true);
    startTimer(timeLeft > 0 ? timeLeft : 3600*10); 
    if(timeLeft <= 0) resetTimer(3600*10); 
    setSelectedKR(""); 
  };

  const handlePauseSession = () => {
    pauseTimer();
  };

  const handleEndSession = useCallback(() => {
    const studiedMinutes = Math.floor(elapsedTime / 60);
    if (studiedMinutes > 0) {
      onSessionComplete(studiedMinutes, sessionTopic, selectedKR || undefined); // Pass sessionTopic
      showNotification("Study Session Complete!", { 
        body: `You studied '${sessionTopic}' for ${studiedMinutes} minutes. Great job!`,
        tag: `study-session-complete-${Date.now()}`
      });
    }
    setSessionInProgress(false);
    pauseTimer(); 
    resetTimer(3600*10); // Reset timer completely for next session
  }, [elapsedTime, onSessionComplete, pauseTimer, sessionTopic, selectedKR, resetTimer]);
  
  const handleQuizComplete = (score: number, totalQuestions: number) => {
    setIsQuizModalOpen(false);
    if(sessionInProgress && !timerActive && elapsedTime > 0 && (3600*10 - elapsedTime) > 0) startTimer(3600*10 - elapsedTime); 
    alert(`Quiz Complete! You scored ${score}/${totalQuestions}.`);
  };

  const handleGenerateQuestions = async () => {
    if (!ai) {
      setAiGeneratorError("AI Service not initialized. Cannot generate questions.");
      return;
    }
    if (!aiTopic.trim()) {
      setAiGeneratorError("Please provide a main topic.");
      return;
    }

    setIsGeneratingQuestions(true);
    setAiGeneratorError(null);
    setGeneratedQuestions('');

    let prompt = `You are a CFA L1 exam question generator.
Generate 3-5 multiple-choice questions for the CFA Level 1 curriculum based on the following topic structure:
Main Topic: "${aiTopic}"
${aiSubTopic.trim() ? `Sub-topic: "${aiSubTopic}"` : ''}
${aiSubSubTopic.trim() ? `Sub-sub-topic: "${aiSubSubTopic}"` : ''}

For each question:
1. Provide the question text.
2. Provide 3 multiple-choice options, labeled A, B, C.
3. Indicate the correct answer (e.g., "Correct Answer: B").
4. Provide a brief explanation for the correct answer.

Format the output clearly for easy readability. Ensure questions are typical of CFA L1 difficulty.
Example of one question structure:
---
Question 1: [Question Text]
A) [Option A]
B) [Option B]
C) [Option C]
Correct Answer: [Letter]
Explanation: [Brief explanation]
---
`;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{ text: prompt }],
      });
      setGeneratedQuestions(response.text);
    } catch (e: any) {
      console.error("Error generating questions with AI:", e);
      setAiGeneratorError(`Failed to generate questions: ${e.message}. Please check your connection or API key.`);
      setGeneratedQuestions("Error: Could not retrieve questions.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };
  
  const relevantKRs = currentKRs.filter(kr => 
    kr.unit.toLowerCase().includes('hour') || 
    kr.unit.toLowerCase().includes('min') ||
    kr.unit.toLowerCase().includes('session') ||
    kr.unit.toLowerCase().includes('topic') ||
    kr.unit.toLowerCase().includes('module')
  );


  return (
    <div className="space-y-6">
      {!isFocusMode && (
        <Card title="CFA Study Hub" titleIcon={<BookIcon className="high-contrast:text-hc-primary" />}>
          <StudyProgressGauge
            totalStudyHours={totalStudyHours}
            cfaTargetHours={cfaTargetHours}
            cfaDeadlineDate={cfaDeadlineDate}
          />
        </Card>
      )}

      <Card 
        title={sessionInProgress ? `Studying: ${sessionTopic}` : "Ready to Study?"} 
        titleIcon={<ClockIcon className="high-contrast:text-hc-primary" />}
        actions={ sessionInProgress ? (
            <Tooltip text={isFocusMode ? "Disable Focus Mode" : "Enable Focus Mode"}>
                <Button variant="ghost" size="sm" onClick={() => setIsFocusMode(!isFocusMode)} className="p-1.5 high-contrast:text-hc-primary high-contrast:border-hc-primary">
                    {isFocusMode ? <EyeSlashIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                </Button>
            </Tooltip>
        ) : null}
      >
        {!sessionInProgress ? (
          <div className="text-center space-y-4">
            <select
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              className="p-2 border rounded-md bg-light-card dark:bg-dark-card dark:border-gray-600 w-full max-w-xs mx-auto high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border"
            >
              {cfaTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
            </select>
            <Button size="lg" onClick={handleStartSession} leftIcon={<PlayIcon/>}>Start Studying</Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-6xl font-bold font-mono text-primary dark:text-accent high-contrast:text-hc-accent">{timerDisplay}</p>
            <div className="flex justify-center space-x-3">
              {timerActive ? (
                <Button onClick={handlePauseSession} leftIcon={<PauseIcon/>}>Pause</Button>
              ) : (
                <Button onClick={() => startTimer(3600*10 - elapsedTime)} leftIcon={<PlayIcon/>}>Resume</Button>
              )}
              <Button variant="danger" onClick={handleEndSession}>End Session</Button>
            </div>
            {!isFocusMode && (
                <Button variant="ghost" onClick={() => { setIsQuizModalOpen(true); if(timerActive) pauseTimer(); }} leftIcon={<SparklesIcon />}>Take Pop Quiz</Button>
            )}
            {!isFocusMode && relevantKRs.length > 0 && (
                 <div className="mt-4 max-w-md mx-auto">
                    <label htmlFor="studyKRSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 high-contrast:text-hc-text">
                        Link Session to Key Result (Optional):
                    </label>
                    <select
                        id="studyKRSelect"
                        value={selectedKR}
                        onChange={(e) => setSelectedKR(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border"
                    >
                        <option value="">None</option>
                        {relevantKRs.map(kr => (
                        <option key={kr.id} value={kr.id}>
                            {kr.description} (Target: {kr.targetValue} {kr.unit})
                        </option>
                        ))}
                    </select>
                </div>
            )}
          </div>
        )}
      </Card>

      {!isFocusMode && (
        <Card title="AI Question Factory" titleIcon={<SparklesIcon className="high-contrast:text-hc-primary"/>}>
          <div className="space-y-3">
            <div>
              <label htmlFor="aiTopic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 high-contrast:text-hc-text">Main Topic (Required)</label>
              <select
                id="aiTopic"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md bg-light-card dark:bg-dark-card dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border"
              >
                {cfaTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
              </select>
            </div>
            <Input
              label="Sub-topic (Optional)"
              id="aiSubTopic"
              value={aiSubTopic}
              onChange={(e) => setAiSubTopic(e.target.value)}
              placeholder="e.g., Time Value of Money"
            />
            <Input
              label="Sub-sub-topic (Optional)"
              id="aiSubSubTopic"
              value={aiSubSubTopic}
              onChange={(e) => setAiSubSubTopic(e.target.value)}
              placeholder="e.g., Annuities"
            />
            <Button 
              onClick={handleGenerateQuestions} 
              isLoading={isGeneratingQuestions} 
              disabled={isGeneratingQuestions || !ai}
              leftIcon={isGeneratingQuestions ? null : <SparklesIcon />}
              className="w-full"
            >
              {isGeneratingQuestions ? 'Generating Questions...' : 'Generate Questions'}
            </Button>
            {aiGeneratorError && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900 p-2 rounded-md">{aiGeneratorError}</p>}
            {!ai && API_KEY && API_KEY !== "YOUR_API_KEY" && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">AI Service initializing...</p>}
             {!API_KEY || API_KEY === "YOUR_API_KEY" && <p className="text-xs text-red-600 dark:text-red-400 mt-1">API Key not provided. AI features disabled.</p>}
          </div>

          {isGeneratingQuestions && (
            <div className="flex justify-center my-4">
              <LoadingSpinner />
            </div>
          )}

          {generatedQuestions && !isGeneratingQuestions && (
            <div className="mt-4 p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 max-h-96 overflow-y-auto">
              <h4 className="text-md font-semibold mb-2 high-contrast:text-hc-text">Generated Questions:</h4>
              <pre className="whitespace-pre-wrap text-sm text-light-text dark:text-dark-text high-contrast:text-hc-text">{generatedQuestions}</pre>
            </div>
          )}
        </Card>
      )}

      <Modal isOpen={isQuizModalOpen} onClose={() => {
          setIsQuizModalOpen(false);
          if(sessionInProgress && !timerActive && elapsedTime > 0 && (3600*10 - elapsedTime) > 0) startTimer(3600*10 - elapsedTime); 
        }} title={`CFA Pop Quiz - ${sessionTopic}`}>
        <CfaQuiz
          questions={mockCFAQuestions.filter(q => q.topic === sessionTopic || mockCFAQuestions.indexOf(q) < 5)}
          onQuizComplete={handleQuizComplete}
        />
      </Modal>
    </div>
  );
};

export default StudySessionManager;
