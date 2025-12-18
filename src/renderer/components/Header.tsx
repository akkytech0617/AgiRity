import { Pencil } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  tags?: string[];
  showEditButton?: boolean;
  onEdit?: () => void;
}

export function Header({ title, subtitle, tags, showEditButton, onEdit }: HeaderProps) {
  return (
    <header className="h-20 border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0 bg-white">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          {tags?.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
        {subtitle != null && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {showEditButton === true && onEdit != null && (
        <button
          onClick={onEdit}
          className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-full transition-colors"
          title="Edit"
        >
          <Pencil className="w-5 h-5" />
        </button>
      )}
    </header>
  );
}
