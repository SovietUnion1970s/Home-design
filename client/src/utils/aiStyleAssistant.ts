/**
 * AI Style Assistant — Smart mock responses for Vietnamese interior design styles.
 * In production, replace with an actual LLM API call (OpenAI, Gemini, etc.)
 */

export interface StyleSuggestion {
  style: string;
  palette: string[];
  furniture: string[];
  materials: { floor: string; wallPaint: string };
  tips: string[];
}

const STYLE_DATABASE: Record<string, StyleSuggestion> = {
  'nhật bản': {
    style: 'Tối giản Nhật Bản (Wabi-Sabi)',
    palette: ['#f5f0e8', '#d4c5a9', '#8b7355', '#2c2c2c', '#4a7c59'],
    furniture: ['sofa', 'coffee-table', 'desk', 'bed'],
    materials: { floor: 'wood', wallPaint: '#f5f0e8' },
    tips: [
      'Sử dụng tông màu trung tính — be, nâu gỗ, trắng kem',
      'Nội thất thấp sát đất, đường nét đơn giản',
      'Không gian thoáng đãng, không lộn xộn',
      'Ánh sáng tự nhiên là chủ đạo, tránh đèn quá sáng',
    ],
  },
  'bắc âu': {
    style: 'Scandinavian Hiện đại',
    palette: ['#ffffff', '#e8e8e8', '#c9b99a', '#4a90e2', '#2d5a27'],
    furniture: ['sofa', 'chair', 'desk', 'bed', 'wardrobe'],
    materials: { floor: 'wood', wallPaint: '#f8f8f6' },
    tips: [
      'Nền trắng kết hợp gỗ sáng màu — sồi, bạch dương',
      'Điểm nhấn màu xanh Scandinavian hoặc xanh lá',
      'Textiles ấm áp: len, vải bông tự nhiên',
      'Đơn giản nhưng chú trọng chất lượng vật liệu',
    ],
  },
  'hiện đại': {
    style: 'Contemporary Modern',
    palette: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'],
    furniture: ['sofa', 'tv-unit', 'coffee-table', 'bed', 'wardrobe'],
    materials: { floor: 'concrete', wallPaint: '#1a1a2e' },
    tips: [
      'Đường thẳng, góc vuông vức — không đường cong',
      'Vật liệu: Kính, thép, bê tông mài',
      'Ánh sáng LED gián tiếp tạo không khí',
      'Nội thất ít nhưng chất lượng cao',
    ],
  },
  'địa trung hải': {
    style: 'Địa Trung Hải (Mediterranean)',
    palette: ['#1a6b9a', '#f4a261', '#e76f51', '#2a9d8f', '#ffffff'],
    furniture: ['sofa', 'chair', 'coffee-table', 'bathtub'],
    materials: { floor: 'tile', wallPaint: '#faf3e0' },
    tips: [
      'Tường trắng vôi kết hợp gốm sứ màu sắc',
      'Sàn gạch Mosaic hoặc đất nung',
      'Cung cấp nhiều đường cong, vòm',
      'Cây xanh trong nhà — dương xỉ, ô liu mini',
    ],
  },
  'công nghiệp': {
    style: 'Industrial Loft',
    palette: ['#2d2926', '#5c5c5c', '#8b8b8b', '#c17f24', '#1a1a1a'],
    furniture: ['sofa', 'chair', 'tv-unit', 'desk'],
    materials: { floor: 'concrete', wallPaint: '#3a3a3a' },
    tips: [
      'Xi măng lộ, gạch thô, kim loại gỉ',
      'Trần cao lộ ống nước và dầm sắt',
      'Bóng đèn Edison, đèn treo công nghiệp',
      'Kết hợp da và gỗ tái chế',
    ],
  },
  'boho': {
    style: 'Bohemian / Boho',
    palette: ['#c17f24', '#8b5e3c', '#d4845a', '#6b4226', '#f4e4c1'],
    furniture: ['sofa', 'chair', 'coffee-table', 'bed'],
    materials: { floor: 'wood', wallPaint: '#f4e4c1' },
    tips: [
      'Tầng lớp texture — thảm, gối, khăn đan',
      'Cây xanh rất nhiều — macramé, giỏ mây',
      'Màu sắc nồng đậm: cam đất, vàng nghệ, đỏ đất',
      'Kết hợp đồ vintage và handmade',
    ],
  },
};

const FALLBACK: StyleSuggestion = {
  style: 'Phong cách Tự do',
  palette: ['#a855f7', '#2dd4bf', '#f59e0b', '#f1f5f9', '#1e293b'],
  furniture: ['sofa', 'bed', 'desk', 'chair'],
  materials: { floor: 'wood', wallPaint: '#c7d2fe' },
  tips: [
    'Kết hợp theo sở thích cá nhân',
    'Giữ mạch nhất quán về tone màu',
    'Thử nghiệm và điều chỉnh theo trải nghiệm thực tế',
  ],
};

// AI Tips for generic requests
const GENERIC_TIPS: Record<string, string[]> = {
  'phong thủy': [
    'Cửa ra vào không đối diện thẳng phòng ngủ',
    'Bếp không nên ở phía Tây Bắc',
    'Gương không đặt đối diện giường',
    'Góc tường sắc nhọn nên che bằng cây xanh',
  ],
  'nhỏ': [
    'Dùng gương lớn để tạo cảm giác rộng hơn',
    'Sàn liền mạch không ngắt quãng',
    'Nội thất đa năng (sofa bed, bàn gập)',
    'Màu sáng làm không gian trông rộng hơn',
  ],
  'trần cao': [
    'Đèn thả trần tạo điểm nhấn chiều đứng',
    'Kệ sách từ sàn đến trần',
    'Rèm dài chạm sàn từ gần trần',
  ],
};

function findMatch(input: string): StyleSuggestion {
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(STYLE_DATABASE)) {
    if (lower.includes(key)) return value;
  }
  return FALLBACK;
}

function findTips(input: string): string[] {
  const lower = input.toLowerCase();
  for (const [key, tips] of Object.entries(GENERIC_TIPS)) {
    if (lower.includes(key)) return tips;
  }
  return [];
}

export interface AIResponse {
  message: string;
  suggestion?: StyleSuggestion;
  tips?: string[];
}

export async function queryAIStyleAssistant(prompt: string): Promise<AIResponse> {
  // Simulate AI thinking delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

  const suggestion = findMatch(prompt);
  const extraTips = findTips(prompt);

  const greetings = ['Đây là gợi ý của tôi:', 'Tôi đề xuất phong cách:', 'Dựa trên yêu cầu của bạn:'];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  return {
    message: `${greeting} **${suggestion.style}**\n\nBảng màu gồm ${suggestion.palette.length} tông màu hài hòa. Tôi đề xuất loại vật liệu sàn **${suggestion.materials.floor}** và tường tone **${suggestion.materials.wallPaint}**.`,
    suggestion,
    tips: [...suggestion.tips, ...extraTips],
  };
}
