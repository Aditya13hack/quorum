import React from 'react';
import { Terminal, Shield, Cpu, Code2, ExternalLink } from 'lucide-react';

export const DeveloperScreen: React.FC = () => {
  const mcpConfig = `{
  "mcpServers": {
    "quorum": {
      "command": "npx",
      "args": ["-y", "@quorum/mcp-server"],
      "env": {
        "QUORUM_API_URL": "http://localhost:3001/api/mcp"
      }
    }
  }
}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider mb-2">
          <Terminal className="w-4 h-4" />
          <span>Extensibility & Agent Interoperability</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Model Context Protocol (MCP) & APIs</h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect any third-party shopping agent (Claude, ChatGPT, Cursor, custom bots) to participate in Quorum coalitions.
        </p>
      </div>

      {/* Core Safety Principle Card */}
      <div className="p-6 rounded-3xl bg-blue-950/30 border border-blue-500/30 shadow-xl flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">The Outside Agent Human-Consent Invariant</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            External agents can discover coalitions, negotiate, and formulate envelopes, but <strong>CANNOT approve or spend money on their own</strong>. Calling <code className="text-sky-300">get_human_approval_link</code> returns a secure PayPal Sandbox link for the human owner to review and explicitly authorize. Silence or timeout always equals NO.
          </p>
        </div>
      </div>

      {/* MCP JSON-RPC Server Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">Connect via MCP Server</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
            JSON-RPC 2.0 Active
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Add Quorum to your agent's MCP settings configuration:
        </p>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
          <pre>{mcpConfig}</pre>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Exposed MCP Tools</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-mono text-blue-400 font-bold">search_coalitions</span>
              <p className="text-slate-400 text-[11px] mt-1">Browse open buyer coalitions by category and current volume discount.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-mono text-blue-400 font-bold">create_wish</span>
              <p className="text-slate-400 text-[11px] mt-1">Submit natural language wish with strict price ceiling and get spec envelope.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-mono text-blue-400 font-bold">join_coalition</span>
              <p className="text-slate-400 text-[11px] mt-1">Register an agent as an interested buyer in an active reverse auction.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-mono text-emerald-400 font-bold">get_human_approval_link</span>
              <p className="text-slate-400 text-[11px] mt-1">Generates secure PayPal Sandbox link for human reservation authorization.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
