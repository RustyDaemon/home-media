import type { InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
	required?: boolean;
}

export default function Input({
	label,
	error,
	helperText,
	className,
	required,
	...props
}: InputProps) {
	return (
		<div className='space-y-1'>
			{label && (
				<label className='block text-sm font-medium text-gray-300'>
					{label}
					{required && <span className='text-red-400 ml-1'>*</span>}
				</label>
			)}
			<input
				className={cn(
					'bg-gray-900 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-2 text-white transition-all duration-200',
					'focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
					'placeholder:text-gray-400/80',
					error &&
						'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-500/10',
					'w-full',
					className
				)}
				{...props}
			/>
			{error && (
				<p className='text-sm text-red-400 flex items-center gap-1'>
					<span className='w-1 h-1 bg-red-400 rounded-full'></span>
					{error}
				</p>
			)}
			{helperText && !error && (
				<p className='text-sm text-gray-400'>{helperText}</p>
			)}
		</div>
	);
}
