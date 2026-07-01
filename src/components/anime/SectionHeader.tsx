import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  viewAllLink?: string;
  onViewAll?: () => void;
}

export default function SectionHeader({ title, icon, viewAllLink, onViewAll }: SectionHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#ff4444]">{icon}</span>}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {(viewAllLink || onViewAll) && (
        <button
          onClick={onViewAll || (() => viewAllLink && navigate(viewAllLink))}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#ff4444] transition-colors"
        >
          View All <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
