import { GoogleGenAI } from "@google/genai";

export const getGeminiAssistance = async (query: string) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY no configurada. La asistencia por IA no estará disponible.");
    return "Para usar la asistencia inteligente, configura la clave de API.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
    return "Lo siento, no puedo procesar tu solicitud de asistencia inteligente ahora.";
  }
};