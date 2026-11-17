import { Laptop, Shield } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Settings</h2>
        <p className="text-text-secondary">Manage application preferences and defaults.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-900 rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-gray-800">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Laptop className="w-4 h-4" />
              General
            </h3>
          </div>
          <div className="p-6 space-y-4 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">Startup</div>
                <div className="text-sm text-text-secondary">Launch AgiRity at system startup</div>
              </div>
              <div className="w-10 h-6 bg-gray-700 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">Theme</div>
                <div className="text-sm text-text-secondary">Appearance preference</div>
              </div>
              <span className="text-sm text-text-secondary">System Default</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-gray-800">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Data & Privacy
            </h3>
          </div>
          <div className="p-6 text-center text-text-secondary text-sm">
            Settings configuration will be available in future updates.
          </div>
        </div>
      </div>
    </div>
  );
}
