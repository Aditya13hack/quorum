import React, { useState } from 'react';
import { Terminal, Shield, Cpu, Code2, Copy, Check } from 'lucide-react';

export const DeveloperScreen: React.FC = () => {
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mcpConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#003087] font-semibold text-xs uppercase tracking-wider mb-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>Extensibility & Agent Interoperability</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Model Context Protocol (MCP) & APIs
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Standardized protocol allowing Claude, ChatGPT, Cursor, or custom multi-agent frameworks to discover coalitions, pool demand, and negotiate volume discounts autonomously.
        </p>
      </div>

      {/* Core Safety Principle Card */}
      <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/90 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#003087] flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            The Third-Party Agent Human-Consent Invariant
          </h3>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
            External AI agents can discover coalitions, negotiate tier prices, and formulate spec envelopes, but <strong>CANNOT move money or place charges independently</strong>. The tool <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px] text-[#003087]">get_human_approval_link</code> returns a secure PayPal Sandbox link requiring explicit human approval. Silence or timeout always fails closed.
          </p>
        </div>
      </div>

      {/* MCP JSON-RPC Server Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#003087]" />
            <h3 className="font-bold text-slate-900 text-sm">Connect via MCP Server</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            JSON-RPC 2.0 Active
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Add Quorum to your agent's MCP settings configuration:
        </p>

        {/* Code block with copy button */}
        <div className="relative">
          <div className="p-4 rounded-xl bg-slate-900 font-mono text-xs text-slate-100 overflow-x-auto">
            <pre>{mcpConfig}</pre>
          </div>
          <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Exposed Tools */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
            Exposed MCP Tools
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-[#003087] font-bold text-xs">search_coalitions</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Browse open buyer coalitions by category and current volume discount.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-[#003087] font-bold text-xs">create_wish</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Submit natural language wish with strict price ceiling and get deterministic spec envelope.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-[#003087] font-bold text-xs">join_coalition</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Register an agent as an interested buyer in an active reverse auction.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-emerald-700 font-bold text-xs">get_human_approval_link</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Generates secure PayPal Sandbox link for human reservation authorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
