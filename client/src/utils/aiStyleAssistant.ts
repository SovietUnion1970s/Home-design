/**
 * AI Style Assistant — Smart responses for Vietnamese interior design styles.
 * Powered by Google Gemini API.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface StyleSuggestion {
  style: string;
  palette: string[];
  furniture: string[];
  materials: { floor: string; wallPaint: string };
  tips: string[];
}

export interface AIResponse {
  message: string;
  suggestion?: StyleSuggestion;
  tips?: string[];
}

export async function queryAIStyleAssistant(prompt: string): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    // ─── Fallback (Mock) ───
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const suggestion: StyleSuggestion = {
      style: 'Phong cách Tối Giản Tự Nhiên',
      palette: ['#EAEAEA', '#333333', '#10B981'],
      furniture: ['sofa', 'plant'],
      materials: { floor: 'wood', wallPaint: '#fbfbfb' },
      tips: [
         "Tích hợp cây xanh vào góc phòng",
         "Dùng đèn ray nam châm thay vì downlight nổi"
      ]
    };
    const extraTips = ["Giữ các đường nét gọn gàng để tối ưu không gian."];
    
    const greeting = ['Đây là gợi ý của tôi:', 'Tôi đề xuất phong cách:'][Math.floor(Math.random() * 2)];
    return {
      message: `*(Chế độ Offline Mock - Thêm VITE_GEMINI_API_KEY để dùng AI thật)*\n\n${greeting} **${suggestion.style}**\n\nBảng màu gồm ${suggestion.palette.length} tông màu hài hòa. Tôi đề xuất loại vật liệu sàn **${suggestion.materials.floor}** và tường tone **${suggestion.materials.wallPaint}**.`,
      suggestion,
      tips: [...suggestion.tips, ...extraTips],
    };
  }

  // ─── Real Gemini Call ───
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const systemInstruction = `
      Bạn là một Kiến trúc sư nội thất tài năng phân tích câu hỏi bằng Tiếng Việt.
      Hãy trả về CHỈ MỘT chuỗi JSON hợp lệ không có markdown \`\`\` với định dạng:
      {
        "message": "Lời giải thích phong cách, chất liệu, phân tích ngắn gọn, khoảng 2-3 câu",
        "suggestion": {
          "style": "Tên phong cách (VD: Wabi-Sabi)",
          "palette": ["#Hex1", "#Hex2", "#Hex3"],
          "furniture": ["tên đồ vật bằng tiếng anh, vd: bed, sofa, plant"],
          "materials": { "floor": "wood|tile|concrete|marble", "wallPaint": "#HexMàuSơnTường" }
        },
        "tips": ["Mẹo 1", "Mẹo 2", "Mẹo 3"]
      }
      User Prompt: "${prompt}"
    `;

    const result = await model.generateContent(systemInstruction);
    const text = result.response.text().replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
    const parsed = JSON.parse(text);
    return parsed as AIResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: "Xin lỗi, đã có lỗi kết nối tới AI. Vui lòng kiểm tra API Key hoặc thử lại.",
    };
  }
}
