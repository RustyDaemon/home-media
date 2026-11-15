import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	loading?: boolean;
	children: ReactNode;
}

const variants = {
	primary:
		'bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-800 hover:to-sky-600 text-white border border-sky-500/30 hover:border-sky-500/60 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-0.5',
	secondary:
		'bg-gray-800/80 hover:bg-gray-700/90 text-white border border-gray-600/50 hover:border-gray-600/80',
	danger:
		'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border border-red-500/30 hover:border-red-500/60',
	ghost:
		'bg-transparent hover:bg-gray-700 text-white border border-transparent hover:border-gray-500',
};

const sizes = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2',
	lg: 'px-6 py-3 text-lg',
};

export default function Button({
	variant = 'primary',
	size = 'md',
	loading = false,
	disabled,
	className,
	children,
	onClick,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(
				'cursor-pointer',
				'font-medium rounded-lg transition-all duration-200 ease-in-out',
				'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				variants[variant],
				sizes[size],
				className
			)}
			disabled={disabled || loading}
			onClick={onClick}
			{...props}
		>
			{loading ? (
				<div className='flex items-center space-x-2'>
					<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
					<span>Loading...</span>
				</div>
			) : (
				children
			)}
		</button>
	);
}
