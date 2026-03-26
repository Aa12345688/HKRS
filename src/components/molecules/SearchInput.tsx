import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../atoms/Input';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ className = '', onSearch, ...props }) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 text-gray-500 z-10 pointer-events-none transition-colors duration-300 peer-focus:text-blue-500">
        <Search size={18} strokeWidth={2.5} />
      </div>
      <Input
        type="text"
        className="pl-11 h-11 peer"
        placeholder="搜尋零件名稱、適用車款或條碼..."
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  );
};
