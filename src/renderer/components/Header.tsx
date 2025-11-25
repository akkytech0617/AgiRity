import { Plus, Search, Settings } from 'lucide-react';

interface HeaderProps {
  onNewWorkspace: () => void;
}

export function Header({ onNewWorkspace }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">AgiRity</span>
      </div>

      <div className="flex-1 max-w-md mx-8 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search workspaces..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onNewWorkspace}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
