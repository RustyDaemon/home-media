import { CheckIcon } from '@heroicons/react/24/solid';
import type { DropdownOption } from '../types/media';
import { cn } from '../utils/cn';

interface LanguageBadgeProps {
	language: DropdownOption;
	isDefault?: boolean;
	className?: string;
	size?: 'sm' | 'md' | 'lg';
}

export default function LanguageBadge({
	language,
	isDefault = false,
	className,
	size = 'md',
}: LanguageBadgeProps) {
	const sizeClasses = {
		sm: 'text-xs px-1.5 py-0.5',
		md: 'text-sm px-2 py-1',
		lg: 'text-lg px-1.5 py-0.5',
	};

	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 rounded border',
				isDefault
					? 'bg-green-900/30 border-green-700/50 text-green-300'
					: 'bg-gray-800 border-gray-700 text-gray-300',
				sizeClasses[size],
				className
			)}
			title={isDefault ? `${language.label} (Your default)` : language.label}
		>
			{language.flag && <span>{language.flag}</span>}
			{/* Always show label for lg size if no flag is present */}
			{(size !== 'lg' || !language.flag) && <span>{language.label}</span>}
			{isDefault && <CheckIcon className='h-3 w-3 text-green-400' />}
		</span>
	);
}
