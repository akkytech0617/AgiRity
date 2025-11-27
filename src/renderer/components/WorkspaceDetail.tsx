import { Monitor, Globe, Folder, Code, Clock, ArrowRight, Play, Zap, Plus } from 'lucide-react';
import { Workspace, WorkspaceItem } from '../../shared/types';

interface WorkspaceDetailProps {
  workspace: Workspace;
  onLaunch: (id: string) => void;
  onLaunchItem?: (item: WorkspaceItem) => void;
}

export function WorkspaceDetail({ workspace, onLaunch, onLaunchItem }: WorkspaceDetailProps) {
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'app': return <Monitor className="w-5 h-5 text-primary" />;
      case 'browser': return <Globe className="w-5 h-5 text-success" />;
      case 'folder': return <Folder className="w-5 h-5 text-warning" />;
      default: return <Code className="w-5 h-5 text-text-secondary" />;
    }
  };

  // Fallback if no presets defined
  const presets = workspace.presets || [
    {
      name: 'Launch All',
      description: 'Start all items in this workspace',
      itemNames: workspace.items.map(i => i.name)
    }
  ];

  const getItemsForPreset = (itemNames: string[]): WorkspaceItem[] => {
    return workspace.items.filter(item => itemNames.includes(item.name));
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Presets Grid */}
      <div className="mb-10">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent-orange fill-current" />
          Launch Presets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {presets.map((preset, idx) => {
            const presetItems = getItemsForPreset(preset.itemNames);
            const appCount = presetItems.filter(i => i.type === 'app').length;
            const browserCount = presetItems.filter(i => i.type === 'browser').length;

            return (
              <div 
                key={idx}
                className="bg-white rounded-card border border-border p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Play className="w-24 h-24 -mr-6 -mt-6" />
                </div>

                <div className="relative z-10">
                  <h3 className="font-display font-bold text-text-primary mb-1">{preset.name}</h3>
                  <p className="text-xs text-text-secondary mb-4 min-h-[2.5em]">{preset.description}</p>
                  
                  <div className="flex items-center gap-1 mb-5">
                     {presetItems.slice(0, 5).map((item, i) => (
                       <div key={i} className="p-1 bg-surface rounded border border-border" title={item.name}>
                         {/* Small icons for preview */}
                         {item.type === 'app' && <Monitor className="w-3 h-3 text-primary" />}
                         {item.type === 'browser' && <Globe className="w-3 h-3 text-success" />}
                         {item.type === 'folder' && <Folder className="w-3 h-3 text-warning" />}
                       </div>
                     ))}
                     {presetItems.length > 5 && (
                       <span className="text-[10px] text-gray-400 font-medium">+{presetItems.length - 5}</span>
                     )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs text-gray-500">
                      {appCount > 0 && <span>{appCount} apps</span>}
                      {appCount > 0 && browserCount > 0 && <span className="mx-1">•</span>}
                      {browserCount > 0 && <span>{browserCount} tabs</span>}
                    </div>
                    <button 
                      onClick={() => onLaunch(workspace.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-600 text-white rounded-button text-xs font-bold shadow-sm transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Launch
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Tools List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-text-primary">Workspace Tools</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{workspace.items.length} items</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border hover:border-primary-300 hover:text-primary text-text-secondary rounded-button text-xs font-medium shadow-sm transition-all">
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {workspace.items.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white p-3 rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary-200 transition-all group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                  {getItemIcon(item.type)}
                </div>
                <button 
                  onClick={() => onLaunchItem?.(item)}
                  className="p-1 text-gray-300 hover:text-primary hover:bg-primary-50 rounded transition-colors"
                  title="Launch this item only"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              <div className="flex-1 min-w-0 mb-2">
                <h4 className="font-medium text-sm text-gray-900 truncate mb-0.5" title={item.name}>{item.name}</h4>
                <p className="text-[10px] text-gray-400 truncate" title={item.path || item.folder || item.urls?.join(', ')}>
                  {item.type}
                </p>
              </div>
              
              {/* Config Badges */}
              <div className="flex items-center gap-1 mt-auto pt-2 border-t border-gray-50">
                {item.waitTime ? (
                  <div className="flex items-center gap-1 text-[10px] text-amber-600" title={`Wait ${item.waitTime}s`}>
                    <Clock className="w-3 h-3" />
                    <span>{item.waitTime}s</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-gray-300" title="Instant start">
                    <Clock className="w-3 h-3" />
                  </div>
                )}
                
                {item.dependsOn && (
                  <div className="flex items-center gap-1 text-[10px] text-purple-600 ml-auto" title={`After ${item.dependsOn}`}>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
