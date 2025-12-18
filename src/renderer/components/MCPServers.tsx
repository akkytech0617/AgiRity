import { Database, Plus } from 'lucide-react';

export function MCPServers() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">MCP Servers</h2>
          <p className="text-gray-500">Manage Model Context Protocol servers and connections.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed">
          <Plus className="w-4 h-4" />
          Add Server
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Coming in Phase 3</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Connect and manage MCP servers to extend AgiRity's capabilities. This feature will allow
          you to integrate with external data sources and AI models.
        </p>
      </div>
    </div>
  );
}
