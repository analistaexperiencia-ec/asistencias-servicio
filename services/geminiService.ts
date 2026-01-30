
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiAssistance = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ayuda al usuario a encontrar el mejor tipo de proveedor para este problema en Ecuador: "${query}". Responde de forma muy breve y profesional.`,
      config: {
        systemInstruction: "Eres un asistente de seguros y asistencia vial experto en Ecuador. Recomienda solo las categorías: Grúa, Médica, Auxilio Vial, Dental o Seguro.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, no puedo procesar tu solicitud en este momento.";
  }
};
