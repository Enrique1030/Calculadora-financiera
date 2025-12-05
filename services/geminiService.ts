
import { GoogleGenAI } from "@google/genai";
import { CalculationResult, LoanParams } from "../types";

const SYSTEM_INSTRUCTION = `Act as an expert financial advisor. Your goal is to analyze loan details provided by the user. 
Provide a concise, mobile-friendly analysis.
1. Evaluate if the Annual Rate (TEA) is competitive (assume standard consumer market context).
2. Highlight the impact of the grace period (especially if capitalized) and insurance costs.
3. Give a clear verdict: "Favorable", "Neutral", or "Expensive".
4. Provide 2 actionable tips to reduce interest.
Format using Markdown. Keep it short (under 200 words).`;

export const getFinancialAdvice = async (params: LoanParams, result: CalculationResult): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return "Error: API Key is missing. Please check your environment configuration.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Please analyze this loan scenario:
    - Loan Amount: ${params.amount}
    - Term: ${params.term} ${params.termUnit}
    - Annual Effective Rate (TEA): ${(result.summary.annualRate * 100).toFixed(2)}%
    - Monthly Rate (TEM): ${(result.summary.monthlyRate * 100).toFixed(2)}%
    - Total Interest Payable: ${result.summary.totalInterest.toFixed(2)}
    - Total Cost of Loan: ${result.summary.totalPayment.toFixed(2)}
    - Grace Period: ${params.gracePeriod} months (${params.graceType === 'total' ? 'Capitalized/Total' : 'Interest Only/Partial'})
    - Grace Days: ${params.graceDays} days (Capitalized)
    - Insurance/Fees included.
    
    Is this a good financial decision for a personal loan? Note any risks with the grace period type selected.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, no pude conectar con el asesor financiero de IA en este momento.";
  }
};
