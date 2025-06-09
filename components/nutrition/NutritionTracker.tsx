
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { PlateIcon, SparklesIcon } from '../../constants';
import { GEMINI_TEXT_MODEL } from '../../constants';
import { MealAnalysis, KeyResult } from '../../types'; // Added KeyResult
import { parseJsonFromGeminiResponse } from '../../services/geminiService';

interface NutritionTrackerProps {
  onMealAnalyzed: (analysis: MealAnalysis) => void;
  dailyLog: MealAnalysis[];
  currentKRs: KeyResult[];
}

const API_KEY = process.env.API_KEY;

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ onMealAnalyzed, dailyLog, currentKRs }) => {
  const [mealInput, setMealInput] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [selectedKR, setSelectedKR] = useState<string>("");


  useEffect(() => {
    if (API_KEY && API_KEY !== "YOUR_API_KEY") {
      try {
        setAi(new GoogleGenAI({ apiKey: API_KEY }));
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI in NutritionTracker:", e);
        setError("Failed to initialize AI Service. Ensure API Key is valid.");
      }
    } else {
      setError("Gemini API Key not configured. Nutrition analysis disabled.");
      console.warn("Gemini API Key not configured for NutritionTracker.");
    }
  }, []);

  const handleAnalyzeMeal = async () => {
    if (!ai) {
      setError("AI Service not initialized.");
      return;
    }
    if (!mealInput.trim()) {
      setError("Please describe your meal.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const prompt = `Analyze the following meal description and provide an estimated nutritional breakdown.
Meal: "${mealInput}"
Return the response as a single JSON object with the following keys: 
"mealName" (a short, descriptive name for the meal, e.g., "Chicken Salad Sandwich"), 
"calories" (number, estimated total calories), 
"proteinGrams" (number, estimated grams of protein), 
"carbGrams" (number, estimated grams of carbohydrates), 
"fatGrams" (number, estimated grams of fat),
"notes" (string, any brief notes or assumptions made, e.g., "Assumed medium portion size").
Example: {"mealName": "Oatmeal with Berries", "calories": 350, "proteinGrams": 10, "carbGrams": 60, "fatGrams": 8, "notes": "Assumed 1 cup cooked oatmeal, 1/2 cup mixed berries."}
Ensure the response is ONLY the JSON object.`;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{ text: prompt }],
        config: { responseMimeType: "application/json" }
      });

      const parsedData = parseJsonFromGeminiResponse(response.text);

      if (parsedData && typeof parsedData === 'object' && parsedData.calories !== undefined) {
        const mealWithKR: MealAnalysis = {...parsedData, linkedKRId: selectedKR || undefined };
        setAnalysisResult(mealWithKR);
        onMealAnalyzed(mealWithKR); 
        setMealInput(''); // Clear input after successful analysis
        setSelectedKR(''); // Reset KR selection
      } else {
        console.error("Failed to parse nutrition data from AI:", response.text, parsedData);
        setError("AI provided data in an unexpected format. Please try rephrasing your meal description.");
        setAnalysisResult({ notes: `Raw AI Response: ${response.text}`}); 
      }
    } catch (e: any) {
      console.error("Gemini API error in NutritionTracker:", e);
      setError(`Error analyzing meal: ${e.message || 'Unknown error'}`);
      setAnalysisResult({ notes: `Error: ${e.message}`});
    } finally {
      setIsLoading(false);
    }
  };
  
  const dailyTotals = dailyLog.reduce((acc, meal) => {
    acc.calories += meal.calories || 0;
    acc.proteinGrams += meal.proteinGrams || 0;
    acc.carbGrams += meal.carbGrams || 0;
    acc.fatGrams += meal.fatGrams || 0;
    return acc;
  }, {calories: 0, proteinGrams: 0, carbGrams: 0, fatGrams: 0});

  const relevantKRs = currentKRs.filter(kr => 
    kr.unit.toLowerCase().includes('cal') || 
    kr.unit.toLowerCase().includes('gram') ||
    kr.unit.toLowerCase().includes('meal') ||
    kr.unit.toLowerCase().includes('protein') ||
    kr.unit.toLowerCase().includes('carb') ||
    kr.unit.toLowerCase().includes('fat')
  );

  return (
    <div className="space-y-6">
      <Card title="AI Nutritionist" titleIcon={<PlateIcon className="text-secondary" />}>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Describe what you ate, and the AI will try to estimate its nutritional content.
          This is an estimation and not medical advice.
        </p>
        <TextArea
          value={mealInput}
          onChange={(e) => setMealInput(e.target.value)}
          placeholder="e.g., A bowl of oatmeal with a banana and a handful of almonds, and a black coffee."
          rows={4}
          disabled={isLoading}
        />
        {relevantKRs.length > 0 && (
            <div className="my-3">
                <label htmlFor="nutritionKRSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 high-contrast:text-hc-text">
                    Link Meal to Key Result (Optional):
                </label>
                <select
                    id="nutritionKRSelect"
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
        <Button 
          onClick={handleAnalyzeMeal} 
          disabled={isLoading || !ai} 
          isLoading={isLoading}
          leftIcon={<SparklesIcon className="w-5 h-5" />}
          className="mt-2 w-full"
        >
          {isLoading ? 'Analyzing Meal...' : 'Analyze Meal with AI'}
        </Button>

        {error && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900 p-2 rounded-md mt-3">{error}</p>}
      </Card>

      {analysisResult && !isLoading && ( // only show if not loading to avoid flash of old result
        <Card title={analysisResult.mealName || "Meal Analysis"} titleIcon={<SparklesIcon />}>
          <div className="space-y-1 text-sm">
            <p><strong>Calories:</strong> {analysisResult.calories?.toFixed(0) || 'N/A'} kcal</p>
            <p><strong>Protein:</strong> {analysisResult.proteinGrams?.toFixed(1) || 'N/A'} g</p>
            <p><strong>Carbs:</strong> {analysisResult.carbGrams?.toFixed(1) || 'N/A'} g</p>
            <p><strong>Fat:</strong> {analysisResult.fatGrams?.toFixed(1) || 'N/A'} g</p>
            {analysisResult.notes && <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-2">Notes: {analysisResult.notes}</p>}
             {analysisResult.linkedKRId && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Linked to a Key Result.</p>}
          </div>
        </Card>
      )}
      
      {dailyLog.length > 0 && (
         <Card title="Today's Log & Totals" titleIcon={<PlateIcon />}>
            <div className="mb-4 p-3 bg-primary/10 dark:bg-primary/20 rounded">
                <h4 className="font-semibold text-center">Daily Totals (Estimated)</h4>
                <p className="text-xs text-center">Calories: {dailyTotals.calories.toFixed(0)} kcal</p>
                <p className="text-xs text-center">Protein: {dailyTotals.proteinGrams.toFixed(1)}g, Carbs: {dailyTotals.carbGrams.toFixed(1)}g, Fat: {dailyTotals.fatGrams.toFixed(1)}g</p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {dailyLog.slice().reverse().map((meal, index) => (
                    <div key={index} className="p-2 border dark:border-gray-600 rounded-md text-xs">
                        <p className="font-medium">{meal.mealName || "Logged Meal"}</p>
                        <p>Cals: {meal.calories?.toFixed(0)}, P: {meal.proteinGrams?.toFixed(1)}g, C: {meal.carbGrams?.toFixed(1)}g, F: {meal.fatGrams?.toFixed(1)}g</p>
                        {meal.notes && <p className="italic text-gray-500 dark:text-gray-400">{meal.notes}</p>}
                        {meal.linkedKRId && <p className="text-xxs text-green-500 dark:text-green-400">Linked to KR</p>}
                    </div>
                ))}
            </div>
         </Card>
      )}

    </div>
  );
};

export default NutritionTracker;
