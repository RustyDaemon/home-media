import { cn } from '../utils/cn';

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return <div className={cn('skeleton-shimmer rounded-md', className)} />;
}

export function SkeletonText({ className }: SkeletonProps) {
	return <Skeleton className={cn('h-4 w-full', className)} />;
}

export function SkeletonRow() {
	return (
		<tr className='border-b border-gray-700/50'>
			<td className='py-3 px-4'>
				<Skeleton className='h-4 w-3/4' />
				<Skeleton className='h-3 w-1/3 mt-2' />
			</td>
			<td className='py-3 px-4'>
				<Skeleton className='h-4 w-20' />
			</td>
			<td className='py-3 px-4'>
				<Skeleton className='h-6 w-24 rounded-full' />
			</td>
			<td className='py-3 px-4'>
				<Skeleton className='h-6 w-16 rounded' />
			</td>
			<td className='py-3 px-4'>
				<Skeleton className='h-6 w-16 rounded' />
			</td>
			<td className='py-3 px-4'>
				<div className='flex justify-end gap-2'>
					<Skeleton className='h-8 w-8 rounded-lg' />
					<Skeleton className='h-8 w-8 rounded-lg' />
				</div>
			</td>
		</tr>
	);
}

export function SkeletonCard() {
	return (
		<div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4 space-y-3'>
			<Skeleton className='h-5 w-2/3' />
			<Skeleton className='h-3 w-1/3' />
			<div className='flex gap-2 pt-2'>
				<Skeleton className='h-5 w-12 rounded-full' />
				<Skeleton className='h-5 w-16 rounded-full' />
			</div>
			<div className='flex gap-1'>
				<Skeleton className='h-5 w-8 rounded' />
				<Skeleton className='h-5 w-8 rounded' />
			</div>
		</div>
	);
}

export function SkeletonStripTile() {
	return (
		<div className='flex-shrink-0 w-44 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 space-y-2'>
			<Skeleton className='h-4 w-3/4' />
			<Skeleton className='h-3 w-1/2' />
			<Skeleton className='h-5 w-16 rounded-full' />
		</div>
	);
}

export function SkeletonForm() {
	return (
		<div className='space-y-6'>
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className='space-y-2'>
					<Skeleton className='h-4 w-24' />
					<Skeleton className='h-10 w-full rounded-lg' />
				</div>
			))}
			<div className='flex justify-end gap-3 pt-2'>
				<Skeleton className='h-10 w-24 rounded-lg' />
				<Skeleton className='h-10 w-32 rounded-lg' />
			</div>
		</div>
	);
}

export function SkeletonRequestCard() {
	return (
		<div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4 space-y-3'>
			<div className='flex items-center justify-between'>
				<Skeleton className='h-5 w-1/3' />
				<Skeleton className='h-6 w-20 rounded-full' />
			</div>
			<Skeleton className='h-4 w-1/2' />
			<Skeleton className='h-3 w-1/4' />
		</div>
	);
}

export function SkeletonStatTiles() {
	return (
		<div className='space-y-3'>
			<div className='grid grid-cols-2 gap-3'>
				<Skeleton className='h-28 rounded-xl' />
				<Skeleton className='h-28 rounded-xl' />
			</div>
			<div className='space-y-2'>
				<SkeletonText className='w-2/3' />
				<SkeletonText className='w-1/2' />
				<SkeletonText className='w-3/5' />
			</div>
		</div>
	);
}

export function PageSkeleton() {
	return (
		<div className='min-h-screen bg-[var(--app-bg)] p-4 sm:p-6'>
			<div className='max-w-7xl mx-auto space-y-6'>
				<Skeleton className='h-14 w-full rounded-2xl' />
				<Skeleton className='h-24 w-full rounded-2xl' />
				<div className='space-y-3'>
					<Skeleton className='h-10 w-full rounded-xl' />
					<Skeleton className='h-64 w-full rounded-2xl' />
				</div>
			</div>
		</div>
	);
}
