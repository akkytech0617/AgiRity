import { Laptop, Shield } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-500">Manage application preferences and defaults.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Laptop className="w-4 h-4" />
              General
            </h3>
          </div>
          <div className="p-6 space-y-4 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Startup</div>
                <div className="text-sm text-gray-500">Launch AgiRity at system startup</div>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Theme</div>
                <div className="text-sm text-gray-500">Appearance preference</div>
              </div>
              <span className="text-sm text-gray-500">System Default</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Data & Privacy
            </h3>
          </div>
          <div className="p-6 text-center text-gray-500 text-sm">
            Settings configuration will be available in future updates.
          </div>
        </div>
      </div>
    </div>
  );
}
