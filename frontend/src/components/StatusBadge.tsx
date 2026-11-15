import type { DropdownOption } from '../types/media';
import { cn } from '../utils/cn';

type Size = 'xs' | 'sm' | 'md';

interface StatusBadgeProps {
	availability: DropdownOption;
	size?: Size;
	className?: string;
}

const sizeClasses: Record<Size, string> = {
	xs: 'px-2 py-0.5 text-[10px]',
	sm: 'px-2 py-0.5 text-xs',
	md: 'px-2 py-1 text-xs',
};

const colorByValue: Record<string, string> = {
	available: 'bg-green-900/30 text-green-400 border-green-700/50',
	delivery: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
};
const fallbackColor = 'bg-red-900/30 text-red-400 border-red-700/50';

export default function StatusBadge({
	availability,
	size = 'md',
	className,
}: StatusBadgeProps) {
	const color = colorByValue[availability.value] ?? fallbackColor;
	return (
		<span
			className={cn(
				'inline-flex font-semibold rounded-full border',
				sizeClasses[size],
				color,
				className
			)}
		>
			{availability.label}
		</span>
	);
}
