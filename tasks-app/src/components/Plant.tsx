
interface Props {
  level: number; // 0–4
  streak: number;
  missedDays: number;
}

// SVG plant illustrations for 5 growth stages
function PlantSVG({ level }: { level: number }) {
  const size = [80, 110, 140, 170, 200][level];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: "width 0.6s ease, height 0.6s ease" }}
    >
      {/* Pot */}
      <rect x="72" y="160" width="56" height="30" rx="6" fill="#c2855a" />
      <rect x="66" y="153" width="68" height="12" rx="4" fill="#d9a070" />

      {/* Soil */}
      <ellipse cx="100" cy="158" rx="30" ry="6" fill="#6b4226" opacity="0.5" />

      {/* Stem */}
      <line x1="100" y1="155" x2="100" y2={level < 2 ? 130 : 110} stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />

      {/* Stage 0: Seed sprout - tiny green dot */}
      {level === 0 && (
        <circle cx="100" cy="128" r="8" fill="#86efac" />
      )}

      {/* Stage 1: Small shoot */}
      {level >= 1 && (
        <>
          <ellipse cx="88" cy="118" rx="14" ry="9" fill="#4ade80" transform="rotate(-20 88 118)" />
          <ellipse cx="112" cy="118" rx="14" ry="9" fill="#22c55e" transform="rotate(20 112 118)" />
        </>
      )}

      {/* Stage 2: Two more leaves */}
      {level >= 2 && (
        <>
          <ellipse cx="82" cy="100" rx="16" ry="10" fill="#4ade80" transform="rotate(-35 82 100)" />
          <ellipse cx="118" cy="100" rx="16" ry="10" fill="#22c55e" transform="rotate(35 118 100)" />
          <line x1="100" y1="110" x2="100" y2="80" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
        </>
      )}

      {/* Stage 3: Full foliage base */}
      {level >= 3 && (
        <>
          <circle cx="100" cy="72" r="30" fill="#16a34a" opacity="0.85" />
          <circle cx="80" cy="80" r="20" fill="#22c55e" />
          <circle cx="120" cy="80" r="20" fill="#22c55e" />
          <circle cx="100" cy="60" r="22" fill="#4ade80" />
        </>
      )}

      {/* Stage 4: Flowering full plant */}
      {level >= 4 && (
        <>
          <circle cx="100" cy="42" r="16" fill="#86efac" />
          {/* Flowers */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const fx = 100 + Math.cos(rad) * 18;
            const fy = 42 + Math.sin(rad) * 18;
            return (
              <g key={i}>
                <circle cx={fx} cy={fy} r="5" fill="#fde68a" />
              </g>
            );
          })}
          <circle cx="100" cy="42" r="7" fill="#fbbf24" />
        </>
      )}
    </svg>
  );
}

export default function Plant({ level, streak, missedDays }: Props) {
  const stageLabels = ["זרע", "נבט קטן", "שתיל", "צמח", "פורח"];
  const label = stageLabels[level];

  const statusMessage = () => {
    if (streak > 0) return `רצף של ${streak} ${streak === 1 ? "יום" : "ימים"} 🌱`;
    if (missedDays === 1) return "יום אחד פספסת — הצמח עדיין בסדר";
    if (missedDays > 1) return `פספסת ${missedDays} ימים — הצמח קמל קצת`;
    return "התחל לסמן מטלות כדי לגדל את הצמח!";
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Plant display */}
      <div className="relative flex flex-col items-center">
        <div
          className={`rounded-3xl p-8 flex flex-col items-center gap-4 transition-all duration-700 ${
            level >= 4
              ? "bg-gradient-to-b from-green-50 to-yellow-50 border-2 border-green-300"
              : level >= 2
              ? "bg-green-50 border-2 border-green-200"
              : "bg-slate-50 border-2 border-slate-200"
          }`}
        >
          <PlantSVG level={level} />
          <span className="text-sm font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            שלב {level + 1}/5 — {label}
          </span>
        </div>
      </div>

      {/* Streak info */}
      <div className="text-center">
        <p className="text-lg font-bold text-slate-800">{statusMessage()}</p>
        {streak > 0 && (
          <p className="text-sm text-slate-500 mt-1">שמור על הרצף — המשך לסמן מטלות!</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>שלב הצמח</span>
          <span>{level}/4</span>
        </div>
        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
            style={{ width: `${(level / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>🌱</span>
          <span>🌸</span>
        </div>
      </div>

      {/* Streak dots */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-slate-600">רצף אחרון</p>
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {Array.from({ length: Math.max(7, streak + 2) }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < streak ? "bg-green-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
