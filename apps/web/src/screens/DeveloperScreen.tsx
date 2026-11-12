import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Copy, Check, Play, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DeveloperScreenProps {
  dataMode?: 'simulated' | 'live';
}

export const DeveloperScreen: React.FC<DeveloperScreenProps> = ({ dataMode = 'simulated' }) => {
  const [copied, setCopied] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [agentPersona, setAgentPersona] = useState('claude_desktop_agent');
  const [mcpExecuting, setMcpExecuting] = useState(false);
  const [mcpLog, setMcpLog] = useState<{ request: any; response: any } | null>(null);

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

  // Fetch open coalitions
  useEffect(() => {
    fetch(`/api/coalitions?mode=${dataMode}`)
      .then((res) => res.json())
      .then((data) => {
        const coal = data.coalitions || [];
        setRooms(coal);
        if (coal.length > 0 && !selectedRoomId) {
          setSelectedRoomId(coal[0].id);
        }
      })
      .catch((e) => console.error(e));
  }, [dataMode]);

  // Execute interactive MCP agent call
  const handleSimulateMCPAgent = async () => {
    if (!selectedRoomId) return;
    setMcpExecuting(true);
    const payload = {
      jsonrpc: '2.0',
      id: `mcp_req_${Date.now()}`,
      method: 'tools/call',
      params: {
        name: 'join_coalition',
        arguments: {
          coalitionId: selectedRoomId,
          agentId: `${agentPersona}_${Math.floor(Math.random() * 900) + 100}`,
          maxPriceCents: 40000,
        },
      },
    };

    try {
      const res = await fetch(`/api/mcp?mode=${dataMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      setMcpLog({ request: payload, response: responseData });
    } catch (e: any) {
      alert('MCP call failed: ' + e.message);
    } finally {
      setMcpExecuting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#003087] font-medium text-xs mb-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>Interoperability</span>
          {dataMode === 'live' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
              ⚡ Real-Time Mode
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Model Context Protocol (MCP) and APIs
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
          Standardized interface allowing external shopping agents (Claude Desktop, Cursor, LangChain, or custom autonomous frameworks) to discover coalitions and negotiate volume tiers.
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

      {/* Interactive MCP Autonomous Agent Playground */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Bot className="w-4 h-4 text-[#003087]" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Live MCP Agent Playground</h3>
              <p className="text-xs text-slate-500">Test an outside AI agent calling Quorum's tools via JSON-RPC 2.0</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200 self-start sm:self-auto">
            Ready to dispatch
          </span>
        </div>

        {rooms.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
            No active coalition rooms in {dataMode === 'live' ? 'Real-Time' : 'Simulated'} mode. Go to "Create demand" to launch a live room first.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Target Coalition Pool
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#003087]"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.memberCount} members)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  External Agent Persona
                </label>
                <select
                  value={agentPersona}
                  onChange={(e) => setAgentPersona(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#003087]"
                >
                  <option value="claude_desktop_agent">Anthropic Claude Desktop (claude-3-5-sonnet)</option>
                  <option value="cursor_developer_bot">Cursor Developer Agent (cursor-agent)</option>
                  <option value="langchain_purchasing_bot">LangChain Agentic Commerce Worker</option>
                  <option value="autogen_procurement_bot">Microsoft AutoGen Shopping Agent</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSimulateMCPAgent}
              disabled={mcpExecuting || !selectedRoomId}
              className="w-full py-2.5 px-4 rounded-xl bg-[#003087] hover:bg-[#00256c] disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{mcpExecuting ? 'Dispatching MCP RPC call...' : 'Dispatch Autonomous Agent via MCP (tools/call)'}</span>
            </button>

            {/* MCP JSON-RPC Output Inspector */}
            {mcpLog && (
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>JSON-RPC 2.0 Success</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">Endpoint: /api/mcp</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Request Payload (tools/call):</span>
                  <pre className="overflow-x-auto text-sky-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {JSON.stringify(mcpLog.request, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">MCP Result Payload:</span>
                  <pre className="overflow-x-auto text-emerald-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {JSON.stringify(mcpLog.response, null, 2)}
                  </pre>
                </div>

                <p className="text-slate-400 text-[11px] pt-1">
                  Agent is now connected in the <strong>Coalition room</strong> and logged in the <strong>Safety & guard</strong> audit trail.
                </p>
              </div>
            )}
          </div>
        )}
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
          Add Quorum to your agent client configuration file (e.g. <code className="text-[#003087] font-mono">claude_desktop_config.json</code>):
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
