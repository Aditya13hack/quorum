import React, { useState } from 'react';
import { Terminal, Shield, Cpu, Copy, Check } from 'lucide-react';

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
        <div className="flex items-center gap-2 text-[#003087] font-medium text-xs mb-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>Interoperability</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Model Context Protocol (MCP) and APIs
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
          Standardized interface allowing external shopping agents (Claude, ChatGPT, Cursor, or custom frameworks) to discover coalitions and negotiate volume tiers.
        </p>
      </div>

      {/* Safety Principle Card */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#003087] flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-medium text-slate-900 text-sm">
            Human consent invariant
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            External agents may query catalog coalitions, propose tiers, and formulate envelopes, but <strong>cannot capture money or make unauthorized charges</strong>. The tool <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-[#003087]">get_human_approval_link</code> returns a secure PayPal Sandbox link requiring explicit human signature. Silence or timeout always fails closed.
          </p>
        </div>
      </div>

      {/* MCP JSON-RPC Server Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-[#003087]" />
            <h3 className="font-medium text-slate-900 text-sm">Server configuration</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
            JSON-RPC 2.0 active
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Add Quorum to your agent client configuration file:
        </p>

        {/* Code block with copy button */}
        <div className="relative">
          <div className="p-4 rounded-xl bg-slate-900 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            <pre>{mcpConfig}</pre>
          </div>
          <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors duration-150 border border-slate-700"
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
          <h4 className="font-medium text-slate-900 text-xs mb-3">
            Exposed tools
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-[#003087] font-medium text-xs">search_coalitions</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Browse open buyer coalitions by category and current volume discount.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-[#003087] font-medium text-xs">create_wish</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Submit natural language demand with a hard price ceiling to compile a specification envelope.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-[#003087] font-medium text-xs">join_coalition</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Register an agent as a prospective buyer in an active reverse auction.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-emerald-700 font-medium text-xs">get_human_approval_link</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Generates a secure PayPal Sandbox link for human authorization and reservation hold.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
