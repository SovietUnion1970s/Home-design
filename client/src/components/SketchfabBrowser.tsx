import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useDesignStore } from '../store/designStore';
import type { FurnitureItem } from '../store/designStore';

interface ModelEntry {
  id: string;
  name: string;
  category: string;
  type: string;
  label: string;
  dim: string;
  thumbnail: string;
  assetUrl: string;
  scale: [number, number, number];
  color: string;
  author: string;
}

const CATEGORIES = [
  { id: 'all',    label: 'Tất cả' },
  { id: 'living', label: 'Phòng khách' },
  { id: 'dining', label: 'Phòng ăn' },
  { id: 'office', label: 'Văn phòng' },
  { id: 'decor',  label: 'Trang trí' },
  { id: 'rooms',  label: 'Công trình' },
];

interface Props {
  onAdd?: () => void;
}

const SketchfabBrowser: React.FC<Props> = ({ onAdd }) => {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addFurniture, selectFurniture } = useDesignStore();

  useEffect(() => {
    setLoading(true);
    fetch('/models/registry.json')
      .then(r => r.json())
      .then((data: ModelEntry[]) => {
        setModels(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return models.filter(m => {
      const matchCat = activeCategory === 'all' || m.category === activeCategory;
      const matchQ   = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.label.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [models, query, activeCategory]);

  const handleAdd = (m: ModelEntry) => {
    const item: FurnitureItem = {
      id: Math.random().toString(36).slice(2),
      type:     m.type,
      label:    m.label,
      assetUrl: m.assetUrl,
      position: [Math.random() * 4 + 1, 0, Math.random() * 4 + 1],
      rotation: [0, 0, 0],
      scale:    m.scale || [1, 1, 1],
      color:    m.color || '#888',
    };
    addFurniture(item);
    selectFurniture(item.id);
    onAdd?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search */}
      <div style={{ padding: '10px 12px 0' }}>
        <div className="search-wrap">
          <Search size={14} />
          <input
            className="search-input"
            placeholder="Tìm kiếm mô hình..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Category pills */}
        <div className="cat-pills">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`cat-pill ${activeCategory === c.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>
            <span className="spin" style={{ display: 'inline-block', marginBottom: 8, fontSize: 18 }}>↻</span>
            <div>Đang tải thư viện...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-4)', fontSize: 13 }}>
            Không tìm thấy mô hình
          </div>
        ) : (
          <div className="sfab-grid">
            {filtered.map(m => (
              <div
                key={m.id}
                className="sfab-card"
                onClick={() => handleAdd(m)}
                title={`Thêm "${m.name}" vào thiết kế`}
              >
                {m.thumbnail ? (
                  <img
                    src={m.thumbnail}
                    alt={m.name}
                    className="sfab-thumb"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const placeholder = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="sfab-thumb-placeholder"
                  style={{ display: m.thumbnail ? 'none' : 'flex' }}
                >
                  {m.type === 'sofa' ? '🛋️' :
                   m.type === 'plant' ? '🌿' :
                   m.type === 'chair' ? '🪑' :
                   m.type === 'house' ? '🏠' : '📦'}
                </div>
                <div className="sfab-info">
                  <div className="sfab-name">{m.name}</div>
                  <div className="sfab-author">{m.dim} • {m.author}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SketchfabBrowser;
