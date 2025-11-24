import { Box } from 'lucide-react';

export function ToolsRegistry() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tool Registry</h2>
        <p className="text-gray-500">Manage your installed tools and discover new ones.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Box className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Coming in Phase 2</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The Tool Registry will allow you to auto-detect installed applications, categorize them, and manage global tool configurations.
        </p>
      </div>
    </div>
  );
}
