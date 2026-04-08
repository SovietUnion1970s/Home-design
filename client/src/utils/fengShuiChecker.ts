/**
 * AI Feng Shui Checker — Pure geometry/logic rules engine
 * No API needed. Checks basic Vietnamese/Chinese Feng Shui principles.
 */

import type { Wall } from '../store/designStore';

export interface FengShuiIssue {
  severity: 'warning' | 'tip' | 'good';
  icon: string;
  title: string;
  description: string;
}

export interface FengShuiReport {
  score: number;  // 0-100
  issues: FengShuiIssue[];
  overallMessage: string;
}

export function analyzeFengShui(walls: Wall[]): FengShuiReport {
  const issues: FengShuiIssue[] = [];
  let score = 70;

  if (walls.length === 0) {
    return {
      score: 0,
      issues: [],
      overallMessage: 'Vẽ bản thiết kế để nhận đánh giá phong thủy'
    };
  }

  // ── Rule 1: Room size adequacy ──────────────────────────────
  const totalLength = walls.reduce((sum, w) => {
    const dx = w.end.x - w.start.x;
    const dy = w.end.y - w.start.y;
    return sum + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  if (totalLength < 10) {
    issues.push({
      severity: 'warning',
      icon: '📐',
      title: 'Không gian quá nhỏ',
      description: 'Tổng diện tích tường quá ngắn. Phong thủy khuyên không gian sống tối thiểu 20m² để khí lưu thông tốt.',
    });
    score -= 10;
  } else if (totalLength >= 20) {
    issues.push({
      severity: 'good',
      icon: '✅',
      title: 'Không gian rộng rãi',
      description: 'Không gian đủ lớn để khí (energy) lưu thông tự do — rất tốt theo phong thủy.',
    });
    score += 5;
  }

  // ── Rule 2: Wall balance (not too many short walls) ─────────
  const shortWalls = walls.filter(w => {
    const dx = w.end.x - w.start.x;
    const dy = w.end.y - w.start.y;
    return Math.sqrt(dx * dx + dy * dy) < 1;
  });

  if (shortWalls.length > 2) {
    issues.push({
      severity: 'warning',
      icon: '🚧',
      title: 'Quá nhiều góc khuất',
      description: `${shortWalls.length} cạnh tường quá ngắn tạo nhiều góc khuất. Phong thủy khuyên nên tránh các góc tường nhọn — đặt cây xanh để hóa giải.`,
    });
    score -= 8;
  }

  // ── Rule 3: Number of rooms / open plan ────────────────────
  if (walls.length >= 12) {
    issues.push({
      severity: 'tip',
      icon: '🚪',
      title: 'Nhiều phòng — Tính liên thông',
      description: 'Không gian nhiều vách ngăn — đảm bảo có lối đi thông thoáng giữa các phòng để khí không bị ứ đọng.',
    });
  }

  // ── Rule 4: Irregular shapes ────────────────────────────────
  const uniqueAngles = new Set<string>();
  walls.forEach(w => {
    const dx = w.end.x - w.start.x;
    const dy = w.end.y - w.start.y;
    const angle = Math.round(Math.atan2(dy, dx) * (180 / Math.PI) / 45) * 45;
    uniqueAngles.add(String(angle));
  });

  if (uniqueAngles.size <= 2) {
    issues.push({
      severity: 'good',
      icon: '⬛',
      title: 'Hình dạng đều đặn',
      description: 'Mặt bằng hình vuông hoặc chữ nhật đều đặn — rất tốt theo phong thủy, dễ bố trí không gian.',
    });
    score += 10;
  } else if (uniqueAngles.size >= 4) {
    issues.push({
      severity: 'warning',
      icon: '🔱',
      title: 'Mặt bằng không đều',
      description: 'Nhà có nhiều góc khuất hoặc hình dạng phức tạp. Phong thủy khuyên nên dùng gương và ánh sáng để "vuông hóa" không gian.',
    });
    score -= 7;
  }

  // ── Rule 5: Wall thickness ──────────────────────────────────
  const thinWalls = walls.filter(w => w.thickness < 0.15);
  if (thinWalls.length > 0) {
    issues.push({
      severity: 'tip',
      icon: '🧱',
      title: 'Tường mỏng',
      description: `${thinWalls.length} tường quá mỏng. Theo phong thủy, tường dày giúp cách âm và tạo cảm giác an toàn, vững chắc.`,
    });
    score -= 5;
  }

  // ── Rule 6: Basic Compass recommendation ───────────────────
  issues.push({
    severity: 'tip',
    icon: '🧭',
    title: 'Hướng nhà',
    description: 'Hướng tốt nhất là Nam và Đông Nam — đón ánh sáng tự nhiên ban ngày và gió mát về chiều.',
  });

  issues.push({
    severity: 'tip',
    icon: '🌿',
    title: 'Cây xanh trong nhà',
    description: 'Đặt cây xanh ở góc Đông và Đông Nam để tăng sinh khí. Tránh cây có gai trong phòng ngủ.',
  });

  // ── Score clamp ────────────────────────────────────────────
  score = Math.max(20, Math.min(95, score));

  const overallMessages: Record<string, string> = {
    '9': '🌟 Phong thủy xuất sắc! Không gian thiết kế rất hài hòa và cân bằng.',
    '8': '✨ Phong thủy tốt. Một vài điểm nhỏ cần chú ý thêm.',
    '7': '👍 Phong thủy ổn. Áp dụng các gợi ý để cải thiện thêm.',
    '6': '⚠️ Cần cải thiện. Có một số điểm phong thủy cần chú ý.',
    '5': '🔄 Phong thủy chưa tốt. Hãy xem xét lại bố cục mặt bằng.',
  };

  const scoreKey = String(Math.floor(score / 10));
  const overallMessage = overallMessages[scoreKey] || overallMessages['7'];

  return { score, issues, overallMessage };
}
