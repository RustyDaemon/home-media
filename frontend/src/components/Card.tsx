import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type CardVariant = 'default' | 'section' | 'bar';

interface CardProps {
	children: ReactNode;
	className?: string;
	hover?: boolean;
	onClick?: () => void;
	variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
	default: 'rounded-2xl shadow-xl p-6',
	section: 'rounded-2xl shadow-xl',
	bar: 'rounded-xl shadow-lg',
};

export default function Card({
	children,
	className,
	hover = false,
	onClick,
	variant = 'default',
}: CardProps) {
	return (
		<div
			className={cn(
				'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border border-gray-700/50 transition-all duration-300',
				variantClasses[variant],
				hover &&
					'hover:shadow-2xl hover:border-gray-600/60 cursor-pointer hover:from-gray-900 hover:to-gray-800',
				onClick && 'text-left w-full',
				className
			)}
			onClick={onClick}
		>
			{children}
		</div>
	);
}
