
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse, Part } from '@google/genai';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { GEMINI_TEXT_MODEL, MicrophoneIcon, SpeakerWaveIcon, SparklesIcon, ExternalLinkIcon } from '../../constants';
import { GroundingChunk } from '../../types';

// Minimal interface declarations for Speech API if not globally available
// These are typically part of lib.dom.d.ts but added here for robustness if environment is missing them.
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  // readonly emma?: Document | null; // Available in some implementations
  // readonly interpretation?: any; // Available in some implementations
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string; // SpeechRecognitionErrorCode (e.g., 'no-speech', 'audio-capture', 'not-allowed')
  readonly message: string;
}

interface SpeechGrammar {
  src: string;
  weight?: number;
}
interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
}


interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI?: string;

  start(): void;
  stop(): void;
  abort(): void;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  // onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null; // This event seems less standard or deprecated
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}


// Ensure process.env.API_KEY is available.
const API_KEY = process.env.API_KEY; 

const VoiceAssistant: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [spokenResponse, setSpokenResponse] = useState<string>('');
  const [textResponse, setTextResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);

  useEffect(() => {
    if (API_KEY && API_KEY !== "YOUR_API_KEY") { // Check if API_KEY is defined and not the placeholder
      try {
        setAi(new GoogleGenAI({ apiKey: API_KEY }));
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        setError("Failed to initialize AI Service. Ensure API Key is valid.");
      }
    } else {
      setError("Gemini API Key not configured. Please set process.env.API_KEY in your environment.");
      console.warn("Gemini API Key not configured.");
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
          setError("Speech recognition API constructor not found.");
          return;
      }
      const rec: SpeechRecognition = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.interimResults = false;

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        handleSubmitQuery(transcript); 
      };
      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        setError(`Speech recognition error: ${event.error} - ${event.message}`);
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      setRecognition(rec);
    } else {
      setError("Speech recognition not supported by this browser.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const speakText = (text: string) => {
    if (!text) return;
    try {
      // Cancel any ongoing speech before starting a new one
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
      setSpokenResponse(text);
    } catch (e) {
      console.error("Speech synthesis error:", e);
      setError("Could not speak the response.");
    }
  };

  const handleSubmitQuery = useCallback(async (query?: string) => {
    const currentQuery = query || inputText;
    if (!ai) {
      setError("AI Service not initialized. Check API Key configuration.");
      setIsLoading(false);
      return;
    }
    if (!currentQuery.trim()) {
      setError("Please enter a question.");
      setIsLoading(false);
      return;
    }


    setIsLoading(true);
    setError(null);
    setTextResponse('');
    setSpokenResponse('');
    setGroundingChunks([]);

    try {
      const systemInstruction = "You are a helpful AI life coach and CFA L1 tutor. Provide clear, step-by-step answers. If the question is about recent events or needs web data, use your search tool.";
      const contents: Part[] = [{text: currentQuery}];

      const requestPayload = {
        model: GEMINI_TEXT_MODEL,
        contents: { role: "user", parts: contents },
        config: {
          systemInstruction: systemInstruction,
          tools: [{googleSearch: {}}], // Enable Google Search grounding
        },
      };
      
      const response: GenerateContentResponse = await ai.models.generateContent(requestPayload);
      
      let generatedText = response.text;
      if (!generatedText && response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        generatedText = response.candidates[0].content.parts.map(part => part.text).join('\n');
      }
      
      if(!generatedText) {
        // Check for safety ratings or blocked responses
        if (response.candidates && response.candidates[0] && response.candidates[0].finishReason === 'SAFETY') {
            throw new Error("Response blocked due to safety concerns.");
        }
        throw new Error("No text content in response.");
      }

      setTextResponse(generatedText);
      speakText(generatedText);

      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setGroundingChunks(response.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[]);
      }

    } catch (e: any) {
      console.error("Gemini API error:", e);
      setError(`Error processing your request: ${e.message || 'Unknown error'}`);
      setTextResponse(`Sorry, I encountered an error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, ai]);


  const toggleListen = () => {
    if (!recognition) {
      setError("Speech recognition is not available.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        setInputText(''); // Clear previous text input when starting new listen
        setTextResponse(''); // Clear previous AI response
        setSpokenResponse('');
        setError(null);
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setError("Could not start microphone. Please check permissions and ensure no other tab is using it.");
        setIsListening(false);
      }
    }
  };
  
  const handleFollowUp = (followUpQuestion: string) => {
    setInputText(followUpQuestion);
    handleSubmitQuery(followUpQuestion);
  };


  return (
    <Card title="AI Coach Q&A" titleIcon={<SparklesIcon className="text-primary dark:text-accent" />}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ask me anything about your schedule, fitness, CFA topics, or for general advice.
          I can also search the web for recent information.
        </p>
        <div className="flex space-x-2">
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or use the microphone..."
            rows={3}
            disabled={isLoading || isListening}
          />
          <Button onClick={toggleListen} variant={isListening ? "danger" : "secondary"} disabled={isLoading || !recognition} className="p-3 aspect-square">
            <MicrophoneIcon className="w-5 h-5" />
          </Button>
        </div>
        <Button onClick={() => handleSubmitQuery()} disabled={isLoading || !inputText.trim() || isListening} isLoading={isLoading}>
          Ask AI Coach
        </Button>

        {error && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900 p-2 rounded-md">{error}</p>}

        {(textResponse || isLoading) && (
          <div className="mt-6 p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h4 className="text-md font-semibold mb-2 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-primary dark:text-accent" /> AI Response:
              {textResponse && !isLoading && ( // Show speak button only when there's text and not loading
                 <Button variant="ghost" size="sm" onClick={() => speakText(textResponse)} className="ml-auto p-1">
                    <SpeakerWaveIcon className="w-4 h-4"/>
                </Button>
              )}
            </h4>
            {isLoading && !textResponse && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
            {textResponse && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{textResponse}</div>}

            {groundingChunks.length > 0 && (
              <div className="mt-4 pt-3 border-t dark:border-gray-500">
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Sources from Google Search:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {groundingChunks.map((chunk, index) => {
                    const uri = chunk.web?.uri || chunk.retrievedContext?.uri;
                    const title = chunk.web?.title || chunk.retrievedContext?.title || uri;
                    if (uri) {
                      return (
                        <li key={index} className="text-xs">
                          <a href={uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline dark:text-blue-400 flex items-center">
                            {title} <ExternalLinkIcon className="w-3 h-3 ml-1" />
                          </a>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </div>
            )}
            
            {textResponse && !isLoading && (
              <div className="mt-4 space-x-2">
                <Button size="sm" variant="ghost" onClick={() => handleFollowUp("Can you explain that in simpler terms?")}>Explain Simpler</Button>
                <Button size="sm" variant="ghost" onClick={() => handleFollowUp("Why is that important?")}>Why Important?</Button>
                 <Button size="sm" variant="ghost" onClick={() => handleFollowUp("Give me an example.")}>Example?</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceAssistant;
