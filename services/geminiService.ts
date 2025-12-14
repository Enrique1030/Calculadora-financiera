
import { GoogleGenAI } from "@google/genai";
import { CalculationResult, LoanParams } from "../types";

const SYSTEM_INSTRUCTION = `Actúa como un asesor financiero experto. Tu objetivo es analizar los detalles del préstamo proporcionados por el usuario.
Proporciona un análisis conciso y optimizado para lectura en móvil.
1. Evalúa si la Tasa Efectiva Anual (TEA) es competitiva (asumiendo un contexto de mercado de consumo estándar).
2. Resalta el impacto del periodo de gracia (especialmente si es capitalizable) y los costos del seguro.
3. Observa la fecha de desembolso para identificar si es un préstamo histórico o una proyección futura.
4. Da un veredicto claro: "Favorable", "Neutral" o "Costoso".
5. Proporciona 2 consejos accionables para reducir el pago de intereses.
Usa formato Markdown. Mantén la respuesta breve (menos de 200 palabras).
RESPONDE SIEMPRE EN ESPAÑOL.`;

export const getFinancialAdvice = async (params: LoanParams, result: CalculationResult): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return "Error: Falta la API Key. Por favor verifica tu configuración.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Por favor analiza este escenario de préstamo:
    - Monto del Préstamo: ${params.amount}
    - Fecha de Desembolso: ${params.startDate}
    - Plazo: ${params.term} ${params.termUnit}
    - Tasa Anual (TEA): ${(result.summary.annualRate * 100).toFixed(2)}%
    - Tasa Mensual (TEM): ${(result.summary.monthlyRate * 100).toFixed(2)}%
    - Interés Total a Pagar: ${result.summary.totalInterest.toFixed(2)}
    - Costo Total del Préstamo: ${result.summary.totalPayment.toFixed(2)}
    - Periodo de Gracia: ${params.gracePeriod} meses (${params.graceType === 'total' ? 'Capitalizable (Total)' : 'Solo Interés (Parcial)'})
    - Días de Gracia: ${params.graceDays} días
    - Seguros y Comisiones incluidos en el cálculo.
    
    ¿Es esta una buena decisión financiera para un préstamo personal? Menciona cualquier riesgo específico.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "No hay análisis disponible en este momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, no pude conectar con el asesor financiero de IA en este momento.";
  }
};
