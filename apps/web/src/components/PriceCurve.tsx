import React from 'react';

interface Tier {
  minBuyers: number;
  priceCents: number;
}

interface PriceCurveProps {
  currentMembers: number;
  soloPriceCents: number;
  currentPriceCents: number;
  quorumTarget: number;
  tiers: Tier[];
}

export const PriceCurve: React.FC<PriceCurveProps> = ({
  currentMembers,
  soloPriceCents,
  currentPriceCents,
  quorumTarget,
  tiers,
}) => {
  const width = 640;
  const height = 240;
  const padding = { top: 24, right: 30, bottom: 36, left: 60 };

  const maxMembers = 50;
  const minPrice = 250;
  const maxPrice = 420;

  const scaleX = (members: number) =>
    padding.left + ((members / maxMembers) * (width - padding.left - padding.right));

  const scaleY = (dollars: number) =>
    height - padding.bottom - (((dollars - minPrice) / (maxPrice - minPrice)) * (height - padding.top - padding.bottom));

  // Build step-function path
  const sortedTiers = [...tiers].sort((a, b) => a.minBuyers - b.minBuyers);
  let pathD = '';

  const soloDollars = soloPriceCents / 100;
  pathD += `M ${scaleX(0)} ${scaleY(soloDollars)} `;

  let prevPrice = soloDollars;
  let prevX = 0;

  for (const t of sortedTiers) {
    const tierDollars = t.priceCents / 100;
    const tierX = t.minBuyers;

    pathD += `L ${scaleX(tierX)} ${scaleY(prevPrice)} `;
    pathD += `L ${scaleX(tierX)} ${scaleY(tierDollars)} `;

    prevPrice = tierDollars;
    prevX = tierX;
  }
  pathD += `L ${scaleX(maxMembers)} ${scaleY(prevPrice)}`;

  const currentX = scaleX(currentMembers);
  const currentY = scaleY(currentPriceCents / 100);
  const quorumX = scaleX(quorumTarget);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-base">Autonomous Volume Curve</h3>
          <p className="text-xs text-slate-400">Unit price automatically steps down as collective agents join forces</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-0.5 border-t border-dashed border-rose-400"></span>
            Solo Price (${(soloPriceCents / 100).toFixed(0)})
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-3 h-0.5 bg-blue-500"></span>
            Quorum Tier
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {[280, 320, 360, 400].map((price) => (
            <g key={price}>
              <line
                x1={padding.left}
                y1={scaleY(price)}
                x2={width - padding.right}
                y2={scaleY(price)}
                stroke="#334155"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={scaleY(price) + 4}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="end"
                className="mono font-semibold"
              >
                ${price}
              </text>
            </g>
          ))}

          {/* X Axis ticks */}
          {[10, 20, 30, 40, 50].map((m) => (
            <g key={m}>
              <line
                x1={scaleX(m)}
                y1={height - padding.bottom}
                x2={scaleX(m)}
                y2={height - padding.bottom + 5}
                stroke="#475569"
                strokeWidth="1"
              />
              <text
                x={scaleX(m)}
                y={height - padding.bottom + 18}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="middle"
                className="mono font-semibold"
              >
                {m}
              </text>
            </g>
          ))}

          {/* Solo baseline dashed line */}
          <line
            x1={padding.left}
            y1={scaleY(soloDollars)}
            x2={width - padding.right}
            y2={scaleY(soloDollars)}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Quorum target vertical indicator */}
          <line
            x1={quorumX}
            y1={padding.top}
            x2={quorumX}
            y2={height - padding.bottom}
            stroke="#eab308"
            strokeDasharray="3 3"
            strokeWidth="1.5"
          />
          <text
            x={quorumX}
            y={padding.top - 6}
            fill="#eab308"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            QUORUM LOCK ({quorumTarget})
          </text>

          {/* Step curve fill area */}
          <path
            d={`${pathD} L ${scaleX(maxMembers)} ${height - padding.bottom} L ${scaleX(0)} ${height - padding.bottom} Z`}
            fill="url(#blueGradient)"
            opacity="0.15"
          />

          {/* Step curve line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Current member position vertical bar */}
          <line
            x1={currentX}
            y1={padding.top}
            x2={currentX}
            y2={height - padding.bottom}
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* Current Position Glowing Node */}
          <circle cx={currentX} cy={currentY} r="7" fill="#0284c7" />
          <circle cx={currentX} cy={currentY} r="4" fill="#38bdf8" />
          <circle cx={currentX} cy={currentY} r="10" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.6" className="animate-ping" />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 mt-2">
        <span>X: Number of pooled buyer agents</span>
        <span className="text-sky-400 font-semibold">
          Active: {currentMembers} Agents @ ${(currentPriceCents / 100).toFixed(2)}/unit
        </span>
      </div>
    </div>
  );
};
