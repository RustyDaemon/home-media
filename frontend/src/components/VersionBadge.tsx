import { ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import { useVersion } from '../hooks/useVersion';

export default function VersionBadge() {
	const { data: versionInfo } = useVersion();

	if (!versionInfo || !versionInfo.update_required) {
		return null;
	}

	return (
		<a
			href='https://hub.docker.com/r/rustydaemon/homemedia'
			target='_blank'
			rel='noopener noreferrer'
			className='flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-200 hover:-translate-y-0.5 border border-amber-400/40'
			title={`Update available: ${versionInfo.latest_version}`}
		>
			<ArrowUpCircleIcon className='h-4 w-4' />
			<span className='hidden sm:inline'>New Version</span>
			<span className='sm:hidden'>Update</span>
		</a>
	);
}
