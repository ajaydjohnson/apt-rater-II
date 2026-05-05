import { useState, useEffect } from "react";

const STORAGE_KEY = "nyc-apt-rater-v1";

const CATEGORIES = [
  {
    id: "commute",
    label: "Commute",
    weight: 16,
    description: "Transit access, travel time, subway proximity",
    icon: "🚇",
  },
  {
    id: "value",
    label: "Price / Value",
    weight: 16,
    description: "Rent vs. what you're actually getting",
    icon: "💰",
  },
  {
    id: "coolness",
    label: "Coolness / Vibe",
    weight: 16,
    description: "Character, design, uniqueness — does it feel like a home you'd want?",
    icon: "✨",
  },
  {
    id: "neighborhood",
    label: "Neighborhood",
    weight: 16,
    description: "Vibe, safety, walkability, character",
    icon: "🏙️",
  },
  {
    id: "size",
    label: "Size & Layout",
    weight: 16,
    description: "Square footage, room flow, functional space",
    icon: "📐",
  },
  {
    id: "amenities",
    label: "Amenities",
    weight: 9,
    description: "In-unit laundry, dishwasher, gym, doorman, roof",
    icon: "⚡",
  },
  {
    id: "light",
    label: "Natural Light",
    weight: 7,
    description: "Windows, exposure direction, shadows, airiness",
    icon: "☀️",
  },
  {
    id: "storage",
    label: "Storage",
    weight: 4,
    description: "Closets, storage unit, bike storage, space to hide stuff",
    icon: "📦",
  },
];

const TOTAL_WEIGHT = CATEGORIES.reduce((sum, c) => sum + c.weight, 0);

const defaultScores = () =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, 5]));

const scoreColor = (score) => {
  if (score >= 85) return "#a8e6a3";
  if (score >= 70) return "#f0d080";
  if (score >= 55) return "#f0a060";
  return "#e07070";
};

const scoreLabel = (score) => {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Solid";
  if (score >= 55) return "Okay";
  return "Weak";
};

function ApartmentCard({ apt, index, onUpdate, onRemove, isActive, onClick }) {
  const total = CATEGORIES.reduce((sum, c) => {
    return sum + (apt.scores[c.id] / 10) * c.weight;
  }, 0);

  const rounded = Math.round(total);
  const color = scoreColor(rounded);

  return (
    <div
      onClick={onClick}
      style={{
        background: isActive ? "#1a1a2e" : "#111118",
        border: `1px solid ${isActive ? "#c9a96e" : "#2a2a3a"}`,
        borderRadius: "12px",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "15px",
            color: isActive ? "#c9a96e" : "#e8e4dc",
            fontWeight: 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {apt.name || `Apartment ${index + 1}`}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#666",
            marginTop: "2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {apt.address || "No address"}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: "22px",
            fontFamily: "'DM Serif Display', Georgia, serif",
            color,
            lineHeight: 1,
          }}
        >
          {rounded}
        </div>
        <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>
          / 100
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ score }) {
  const color = scoreColor(score);
  const circumference = 2 * Math.PI * 52;
  const dash = (score / 100) * circumference;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dasharray 0.4s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "32px",
            color,
            lineHeight: 1,
          }}
        >
          {Math.round(score)}
        </div>
        <div style={{ fontSize: "10px", color: "#777", marginTop: "2px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {scoreLabel(Math.round(score))}
        </div>
      </div>
    </div>
  );
}

export default function ApartmentRater() {
  const [apartments, setApartments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apartments?.length) return parsed.apartments;
      }
    } catch {}
    return [{ id: 1, name: "", address: "", scores: defaultScores(), notes: "" }];
  });

  const [activeId, setActiveId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeId) return parsed.activeId;
      }
    } catch {}
    return 1;
  });

  const [nextId, setNextId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nextId) return parsed.nextId;
      }
    } catch {}
    return 2;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ apartments, activeId, nextId }));
    } catch {}
  }, [apartments, activeId, nextId]);

  const activeApt = apartments.find((a) => a.id === activeId);

  const total = CATEGORIES.reduce((sum, c) => {
    return sum + (activeApt.scores[c.id] / 10) * c.weight;
  }, 0);

  const updateField = (field, value) => {
    setApartments((prev) =>
      prev.map((a) =>
        a.id === activeId ? { ...a, [field]: value } : a
      )
    );
  };

  const updateScore = (catId, value) => {
    setApartments((prev) =>
      prev.map((a) =>
        a.id === activeId
          ? { ...a, scores: { ...a.scores, [catId]: Number(value) } }
          : a
      )
    );
  };

  const addApartment = () => {
    const newApt = {
      id: nextId,
      name: "",
      address: "",
      scores: defaultScores(),
      notes: "",
    };
    setApartments((prev) => [...prev, newApt]);
    setActiveId(nextId);
    setNextId((n) => n + 1);
  };

  const removeApartment = (id) => {
    if (apartments.length === 1) return;
    const remaining = apartments.filter((a) => a.id !== id);
    setApartments(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const sorted = [...apartments].sort((a, b) => {
    const scoreA = CATEGORIES.reduce((s, c) => s + (a.scores[c.id] / 10) * c.weight, 0);
    const scoreB = CATEGORIES.reduce((s, c) => s + (b.scores[c.id] / 10) * c.weight, 0);
    return scoreB - scoreA;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0b0b12;
          color: #e8e4dc;
          font-family: 'DM Mono', monospace;
        }

        .app-wrap {
          min-height: 100vh;
          background: #0b0b12;
          display: flex;
          flex-direction: column;
        }

        .header {
          padding: 28px 32px 20px;
          border-bottom: 1px solid #1e1e2e;
        }

        .header h1 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 26px;
          font-weight: 400;
          color: #e8e4dc;
          letter-spacing: -0.01em;
        }

        .header p {
          font-size: 11px;
          color: #555;
          margin-top: 4px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .main {
          display: flex;
          flex: 1;
          gap: 0;
          min-height: 0;
        }

        .sidebar {
          width: 280px;
          flex-shrink: 0;
          border-right: 1px solid #1e1e2e;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
        }

        .sidebar-label {
          font-size: 10px;
          color: #444;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0 4px 6px;
          border-bottom: 1px solid #1a1a2a;
          margin-bottom: 4px;
        }

        .add-btn {
          background: transparent;
          border: 1px dashed #2a2a3a;
          border-radius: 10px;
          padding: 10px;
          color: #555;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
        }

        .add-btn:hover {
          border-color: #c9a96e;
          color: #c9a96e;
        }

        .detail-panel {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
        }

        .apt-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 10px;
          color: #555;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .field-input {
          background: #111118;
          border: 1px solid #2a2a3a;
          border-radius: 8px;
          padding: 8px 12px;
          color: #e8e4dc;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }

        .field-input:focus {
          border-color: #c9a96e;
        }

        .field-input::placeholder {
          color: #333;
        }

        .score-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #1e1e2e;
        }

        .categories {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }

        .cat-row {
          display: grid;
          grid-template-columns: 28px 1fr 60px auto 44px;
          align-items: center;
          gap: 12px;
        }

        .cat-icon {
          font-size: 16px;
          text-align: center;
        }

        .cat-info {
          min-width: 0;
        }

        .cat-name {
          font-size: 13px;
          color: #e8e4dc;
          margin-bottom: 1px;
        }

        .cat-desc {
          font-size: 10px;
          color: #444;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .weight-badge {
          font-size: 10px;
          color: #555;
          text-align: right;
          letter-spacing: 0.05em;
        }

        .slider-wrap {
          position: relative;
        }

        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 3px;
          border-radius: 2px;
          background: #1e1e2e;
          outline: none;
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #c9a96e;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        .score-val {
          font-size: 15px;
          font-family: 'DM Serif Display', Georgia, serif;
          text-align: right;
          min-width: 24px;
        }

        .contrib {
          font-size: 10px;
          color: #444;
          text-align: right;
          min-width: 44px;
        }

        .notes-area {
          background: #111118;
          border: 1px solid #2a2a3a;
          border-radius: 8px;
          padding: 12px;
          color: #e8e4dc;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          outline: none;
          resize: vertical;
          width: 100%;
          min-height: 80px;
          transition: border-color 0.2s;
        }

        .notes-area:focus {
          border-color: #c9a96e;
        }

        .notes-area::placeholder {
          color: #333;
        }

        .section-label {
          font-size: 10px;
          color: #444;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .remove-btn {
          background: transparent;
          border: none;
          color: #333;
          font-size: 14px;
          cursor: pointer;
          padding: 2px;
          transition: color 0.2s;
          line-height: 1;
        }

        .remove-btn:hover {
          color: #e07070;
        }

        @media (max-width: 700px) {
          .main { flex-direction: column; }
          .sidebar { width: 100%; border-right: none; border-bottom: 1px solid #1e1e2e; }
          .apt-meta { grid-template-columns: 1fr; }
          .detail-panel { padding: 16px; }
          .cat-desc { display: none; }
        }
      `}</style>

      <div className="app-wrap">
        <div className="header">
          <h1>NYC Apartment Rater</h1>
          <p>Score each unit across 10 weighted categories &mdash; total out of 100</p>
        </div>

        <div className="main">
          <div className="sidebar">
            <div className="sidebar-label">
              {apartments.length} unit{apartments.length !== 1 ? "s" : ""} &mdash; ranked
            </div>
            {sorted.map((apt, i) => (
              <div key={apt.id} style={{ position: "relative" }}>
                <ApartmentCard
                  apt={apt}
                  index={apartments.indexOf(apt)}
                  isActive={apt.id === activeId}
                  onClick={() => setActiveId(apt.id)}
                />
                {apartments.length > 1 && (
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeApartment(apt.id);
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      fontSize: "12px",
                    }}
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button className="add-btn" onClick={addApartment}>
              + Add apartment
            </button>
          </div>

          <div className="detail-panel">
            <div className="apt-meta">
              <div className="field-group">
                <div className="field-label">Apartment Name</div>
                <input
                  className="field-input"
                  placeholder="e.g. Park Slope 2BR"
                  value={activeApt.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className="field-group">
                <div className="field-label">Address</div>
                <input
                  className="field-input"
                  placeholder="e.g. 123 4th Ave, Brooklyn"
                  value={activeApt.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
            </div>

            <div className="score-header">
              <div>
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "17px", color: "#e8e4dc", marginBottom: "4px" }}>
                  Score Breakdown
                </div>
                <div style={{ fontSize: "11px", color: "#444" }}>
                  Drag sliders 0–10 per category
                </div>
              </div>
              <ScoreGauge score={total} />
            </div>

            <div className="categories">
              {CATEGORIES.map((cat) => {
                const val = activeApt.scores[cat.id];
                const contrib = ((val / 10) * cat.weight).toFixed(1);
                const pct = val / 10;
                const rgb =
                  pct >= 0.85
                    ? "168,230,163"
                    : pct >= 0.7
                    ? "240,208,128"
                    : pct >= 0.5
                    ? "240,160,96"
                    : "224,112,112";

                return (
                  <div key={cat.id} className="cat-row">
                    <div className="cat-icon">{cat.icon}</div>
                    <div className="cat-info">
                      <div className="cat-name">{cat.label}</div>
                      <div className="cat-desc">{cat.description}</div>
                      <div
                        className="slider-wrap"
                        style={{ marginTop: "6px" }}
                      >
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={val}
                          onChange={(e) => updateScore(cat.id, e.target.value)}
                          className="slider"
                          style={{
                            background: `linear-gradient(to right, rgba(${rgb},0.8) 0%, rgba(${rgb},0.8) ${val * 10}%, #1e1e2e ${val * 10}%, #1e1e2e 100%)`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="weight-badge">{cat.weight}pts</div>
                    <div
                      className="score-val"
                      style={{ color: `rgba(${rgb},1)` }}
                    >
                      {val}
                    </div>
                    <div className="contrib">+{contrib}</div>
                  </div>
                );
              })}
            </div>

            <div className="section-label">Notes</div>
            <textarea
              className="notes-area"
              placeholder="Holdover fee, floor plan issues, dealbreakers, things to follow up on..."
              value={activeApt.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
