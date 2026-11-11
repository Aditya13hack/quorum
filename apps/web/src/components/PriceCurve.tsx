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
  const padding = { top: 28, right: 32, bottom: 38, left: 60 };

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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-3 border-b border-slate-100 gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">Volume-Tier Pricing Curve</h3>
          <p className="text-xs text-slate-500">Autonomous step-function discount schedule unlocked by committed demand</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-0.5 border-t border-dashed border-rose-500"></span>
            Solo Retail (${(soloPriceCents / 100).toFixed(0)})
          </div>
          <div className="flex items-center gap-1.5 text-[#0079C1]">
            <span className="w-3 h-0.5 bg-[#0079C1]"></span>
            Quorum Volume Tier
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Subtle horizontal grid lines */}
          {[280, 320, 360, 400].map((price) => (
            <g key={price}>
              <line
                x1={padding.left}
                y1={scaleY(price)}
                x2={width - padding.right}
                y2={scaleY(price)}
                stroke="#F1F5F9"
                strokeWidth="1.5"
              />
              <text
                x={padding.left - 12}
                y={scaleY(price) + 4}
                fill="#64748B"
                fontSize="11"
                textAnchor="end"
                className="mono font-medium"
              >
                ${price}
              </text>
            </g>
          ))}

          {/* X Axis horizontal baseline */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#E2E8F0"
            strokeWidth="1"
          />

          {/* X Axis ticks */}
          {[10, 20, 30, 40, 50].map((m) => (
            <g key={m}>
              <line
                x1={scaleX(m)}
                y1={height - padding.bottom}
                x2={scaleX(m)}
                y2={height - padding.bottom + 5}
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <text
                x={scaleX(m)}
                y={height - padding.bottom + 18}
                fill="#64748B"
                fontSize="11"
                textAnchor="middle"
                className="mono font-medium"
              >
                {m}
              </text>
            </g>
          ))}

          {/* Solo retail benchmark dashed line */}
          <line
            x1={padding.left}
            y1={scaleY(soloDollars)}
            x2={width - padding.right}
            y2={scaleY(soloDollars)}
            stroke="#EF4444"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Quorum Target vertical guideline */}
          <line
            x1={quorumX}
            y1={padding.top}
            x2={quorumX}
            y2={height - padding.bottom}
            stroke="#D97706"
            strokeDasharray="3 3"
            strokeWidth="1.5"
          />
          <text
            x={quorumX}
            y={padding.top - 8}
            fill="#B45309"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            QUORUM THRESHOLD ({quorumTarget})
          </text>

          {/* Fill under step curve */}
          <path
            d={`${pathD} L ${scaleX(maxMembers)} ${height - padding.bottom} L ${scaleX(0)} ${height - padding.bottom} Z`}
            fill="#F0F7FF"
          />

          {/* Primary step curve line */}
          <path
            d={pathD}
            fill="none"
            stroke="#0079C1"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Current member position line */}
          <line
            x1={currentX}
            y1={padding.top}
            x2={currentX}
            y2={height - padding.bottom}
            stroke="#003087"
            strokeWidth="1.5"
          />

          {/* Current Position Node */}
          <circle cx={currentX} cy={currentY} r="5" fill="#003087" />
          <circle cx={currentX} cy={currentY} r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
        <span>X: Number of aggregated consumer AI agents</span>
        <span className="text-[#003087] font-semibold">
          Current State: {currentMembers} Members @ ${(currentPriceCents / 100).toFixed(2)}/unit
        </span>
      </div>
    </div>
  );
};
