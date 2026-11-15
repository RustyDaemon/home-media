import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Theme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

export interface ThemeOption {
	value: Theme;
	name: string;
	description: string;
	swatch: { bg: string; from: string; to: string; accent: string };
}

interface ThemeSwatchProps {
	swatch: ThemeOption['swatch'];
	className?: string;
}

function ThemeSwatch({ swatch, className }: ThemeSwatchProps) {
	return (
		<div
			className={cn(
				'rounded border border-black/30 overflow-hidden flex flex-shrink-0',
				className
			)}
			style={{ background: swatch.bg }}
		>
			<div
				className='flex-1'
				style={{
					background: `linear-gradient(135deg, ${swatch.from}, ${swatch.to})`,
				}}
			/>
			<div className='w-1/3' style={{ background: swatch.accent }} />
		</div>
	);
}

interface ThemeDropdownProps {
	options: ThemeOption[];
	value: Theme;
	onChange: (value: Theme) => void;
	label?: string;
	className?: string;
}

export default function ThemeDropdown({
	options,
	value,
	onChange,
	label,
	className,
}: ThemeDropdownProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const selected = options.find(o => o.value === value) ?? options[0];

	const handleSelect = (opt: ThemeOption) => {
		onChange(opt.value);
		setIsModalOpen(false);
	};

	const modal = isModalOpen
		? createPortal(
				<div className='fixed inset-0 z-[9999] overflow-y-auto'>
					<div
						className='fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm'
						onClick={() => setIsModalOpen(false)}
					/>
					<div className='flex min-h-full items-center justify-center p-4'>
						<div
							className='relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-6'
							onClick={e => e.stopPropagation()}
						>
							<div className='flex items-center justify-between mb-4 pb-4 border-b border-gray-700/50'>
								<h2 className='text-xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent'>
									Select Theme
								</h2>
								<button
									onClick={() => setIsModalOpen(false)}
									className='p-2 rounded-lg hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer'
								>
									<XMarkIcon className='h-5 w-5' />
								</button>
							</div>

							<div className='max-h-96 overflow-y-auto'>
								<div className='space-y-1'>
									{options.map(opt => {
										const isSelected = opt.value === value;
										return (
											<button
												key={opt.value}
												onClick={() => handleSelect(opt)}
												className={cn(
													'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
													'text-left border border-transparent',
													'hover:bg-gradient-to-br hover:from-sky-600/20 hover:to-cyan-600/20',
													'hover:border-sky-500/40 hover:text-white hover:shadow-md hover:shadow-sky-500/10',
													'focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer',
													isSelected
														? 'bg-gradient-to-br from-sky-600/30 to-cyan-600/30 border-sky-400/50 text-white shadow-lg shadow-sky-500/20'
														: 'text-gray-300 hover:text-white'
												)}
											>
												<ThemeSwatch
													swatch={opt.swatch}
													className='h-8 w-12'
												/>
												<div className='flex-1 min-w-0'>
													<p className='font-medium text-sm'>{opt.name}</p>
													<p className='text-xs text-gray-400 truncate'>
														{opt.description}
													</p>
												</div>
												{isSelected && (
													<CheckIcon className='h-4 w-4 text-sky-400 flex-shrink-0 drop-shadow-sm' />
												)}
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>,
				document.body
			)
		: null;

	return (
		<div className={cn('relative', className)}>
			{label && (
				<label className='block text-sm font-medium text-gray-300 mb-1'>
					{label}
				</label>
			)}

			<button
				type='button'
				onClick={() => setIsModalOpen(true)}
				className={cn(
					'w-full px-3 py-2 bg-gray-900 backdrop-blur-sm border border-gray-600 rounded-lg',
					'text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50',
					'hover:border-sky-400/50 hover:bg-gray-800 transition-all duration-200',
					'flex items-center justify-between cursor-pointer gap-3',
					'shadow-sm hover:shadow-md'
				)}
			>
				<span className='flex items-center gap-2 min-w-0'>
					<ThemeSwatch swatch={selected.swatch} className='h-5 w-8' />
					<span className='truncate'>{selected.name}</span>
				</span>
				<ChevronDownIcon
					className='h-5 w-5 text-gray-400 flex-shrink-0'
					aria-hidden='true'
				/>
			</button>

			{modal}
		</div>
	);
}
