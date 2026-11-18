import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
} from '@heroui/react/dropdown';
import { ChevronDown, Plus } from 'lucide-react';
import type { Workspace } from '@/shared/types';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  onSelect,
  onNew,
}: Readonly<WorkspaceSwitcherProps>) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <div
          role="button"
          tabIndex={0}
          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-surface transition-colors text-sm font-medium text-text-primary cursor-pointer"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: activeWorkspace ? '#4a90e2' : '#6b7280' }}
          />
          <span className="truncate max-w-40">{activeWorkspace?.name ?? 'Select workspace'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
        </div>
      </DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu
          items={[
            ...workspaces.map((ws) => ({
              id: ws.id,
              name: ws.name,
              itemCount: ws.items.length,
            })),
            { id: '__new__', name: '+ New Workspace', itemCount: -1 },
          ]}
          onAction={(key) => {
            const id = String(key);
            if (id === '__new__') {
              onNew();
            } else {
              onSelect(id);
            }
          }}
        >
          {(item) =>
            item.itemCount === -1 ? (
              <DropdownItem id={item.id} className="text-primary font-medium">
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  New Workspace
                </span>
              </DropdownItem>
            ) : (
              <DropdownItem id={item.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: '#4a90e2' }}
                  />
                  <span className="truncate">{item.name}</span>
                  <span className="text-xs text-text-secondary ml-auto">
                    {item.itemCount} items
                  </span>
                </span>
              </DropdownItem>
            )
          }
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );
}
