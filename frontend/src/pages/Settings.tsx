import { ArrowLeftIcon, CogIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import FileBackupModal from '../components/DatabaseFileBackupModal';
import Dropdown from '../components/Dropdown';
import BackupModal from '../components/SqlDumpBackupModal';
import ThemeDropdown, { type ThemeOption } from '../components/ThemeDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, type Density } from '../contexts/ThemeContext';
import {
	useCreateDatabaseBackup,
	useCreateFileBackup,
	useExportMediaToCSV,
} from '../hooks/useBackup';
import { useDropdownOptions } from '../hooks/useMedia';
import { useVersion } from '../hooks/useVersion';

type SettingsTab = 'general' | 'appearance' | 'system';

const THEME_OPTIONS: ThemeOption[] = [
	{
		value: 'midnight',
		name: 'Midnight',
		description: 'Cyan & magenta neon glow on near-black',
		swatch: {
			bg: '#0a0a0a',
			from: '#111827',
			to: '#1f2937',
			accent: '#06b6d4',
		},
	},
	{
		value: 'nord',
		name: 'Nord',
		description: 'Cool slate blues, calm and easy on the eyes',
		swatch: {
			bg: '#2e3440',
			from: '#3b4252',
			to: '#434c5e',
			accent: '#88c0d0',
		},
	},
	{
		value: 'cyberpunk',
		name: 'Cyberpunk',
		description: 'Magenta & cyan neon on deep purple-black',
		swatch: {
			bg: '#0a0014',
			from: '#15001f',
			to: '#2a0033',
			accent: '#ff0080',
		},
	},
	{
		value: 'linen',
		name: 'Linen',
		description: 'Warm cream paper with rust & teal accents',
		swatch: {
			bg: '#faf3e7',
			from: '#f5ecd9',
			to: '#ede2c8',
			accent: '#0e7490',
		},
	},
	{
		value: 'snow',
		name: 'Snow',
		description: 'Crisp white with vivid blue accents',
		swatch: {
			bg: '#ffffff',
			from: '#f8fafc',
			to: '#f1f5f9',
			accent: '#2563eb',
		},
	},
	{
		value: 'steampunk',
		name: 'Steampunk',
		description: 'Brass & copper on dark leather',
		swatch: {
			bg: '#1a1209',
			from: '#2a1f0e',
			to: '#3d2e16',
			accent: '#d4a85a',
		},
	},
	{
		value: 'homelab',
		name: 'HomeLab',
		description: 'LED green on server-rack black',
		swatch: {
			bg: '#0c1410',
			from: '#131c17',
			to: '#1f2a23',
			accent: '#84cc16',
		},
	},
	{
		value: 'arch',
		name: 'Arch',
		description: 'Vivid Arch blue on saturated navy',
		swatch: {
			bg: '#0a1929',
			from: '#102a43',
			to: '#1d3557',
			accent: '#1793d1',
		},
	},
];

export default function Settings() {
	const navigate = useNavigate();
	const {
		logout,
		username,
		isGuest,
		defaultLanguageId,
		updateDefaultLanguage,
	} = useAuth();
	const { theme, setTheme, density, setDensity } = useTheme();
	const { data: versionInfo } = useVersion();
	const [activeTab, setActiveTab] = useState<SettingsTab>('general');
	const [backupModalOpen, setBackupModalOpen] = useState(false);
	const [backupData, setBackupData] = useState<string>('');
	const [fileBackupModalOpen, setFileBackupModalOpen] = useState(false);
	const [fileBackupFilename, setFileBackupFilename] = useState<string>('');

	const { data: dropdownOptions } = useDropdownOptions();

	const backupMutation = useCreateDatabaseBackup();
	const fileBackupMutation = useCreateFileBackup();
	const csvExportMutation = useExportMediaToCSV();

	const handleCreateBackup = () => {
		backupMutation.mutate(undefined, {
			onSuccess: data => {
				setBackupData(data.sql_dump);
				setBackupModalOpen(true);
			},
		});
	};

	const handleCreateFileBackup = () => {
		fileBackupMutation.mutate(undefined, {
			onSuccess: data => {
				setFileBackupFilename(data.backup_filename);
				setFileBackupModalOpen(true);
			},
		});
	};

	const handleExportCSV = () => {
		csvExportMutation.mutate();
	};

	const handleLanguageChange = (value: number) => {
		// value 0 means "None (English fallback)"
		const languageId = value === 0 ? null : value;
		updateDefaultLanguage(languageId);
	};

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<div className='space-y-6'>
			{/* Combined Header with Tabs */}
			<Card variant='section' className='overflow-hidden'>
				{/* Header */}
				<div className='flex items-center space-x-4 p-5 pb-4'>
					<Button variant='ghost' onClick={() => navigate('/')}>
						<ArrowLeftIcon className='h-5 w-5' />
					</Button>
					<div className='flex items-center space-x-3'>
						<div className='p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/40'>
							<CogIcon className='h-6 w-6 text-purple-300' />
						</div>
						<h1 className='text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-300 to-purple-400 bg-clip-text text-transparent'>
							Settings
						</h1>
					</div>
				</div>

				{/* Tabs */}
				<nav className='flex space-x-8 px-6 border-t border-gray-700/50'>
					<button
						onClick={() => setActiveTab('general')}
						className={`py-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-all duration-200 ${
							activeTab === 'general'
								? 'border-purple-500 text-purple-300'
								: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
						}`}
					>
						General
					</button>
					<button
						onClick={() => setActiveTab('appearance')}
						className={`py-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-all duration-200 ${
							activeTab === 'appearance'
								? 'border-purple-500 text-purple-300'
								: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
						}`}
					>
						Appearance
					</button>
					{/* Hide System tab for guest users */}
					{!isGuest && (
						<button
							onClick={() => setActiveTab('system')}
							className={`py-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-all duration-200 ${
								activeTab === 'system'
									? 'border-purple-500 text-purple-300'
									: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
							}`}
						>
							System
						</button>
					)}
				</nav>
			</Card>

			{/* Settings Content */}
			<div className='space-y-6'>
				{activeTab === 'general' && (
					<>
						{/* Language Preferences - Only show for admin users */}
						{!isGuest && (
							<Card className='p-6'>
								<div className='space-y-4'>
									<div>
										<h2 className='text-xl font-semibold text-white mb-2'>
											Audio/Subtitle Language Preferences
										</h2>
									</div>

									<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 flex justify-between items-center shadow-md'>
										<div className='flex flex-col'>
											<h3 className='text-gray-300 font-medium mb-1'>
												Preferred audio/subtitle language
											</h3>
										</div>
										<div className='min-w-[200px]'>
											<Dropdown
												value={defaultLanguageId || 0}
												onChange={handleLanguageChange}
												options={[...(dropdownOptions?.languages || [])]}
												placeholder='Select default language'
											/>
										</div>
									</div>
								</div>
							</Card>
						)}

						{/* Version Information */}
						<Card className='p-6'>
							<div className='space-y-4'>
								<div>
									<h2 className='text-xl font-semibold text-white mb-2'>
										Application Info
									</h2>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 shadow-md'>
										<h3 className='text-gray-300 font-medium mb-1'>Version</h3>
										<p className='text-cyan-400 text-sm'>{__APP_VERSION__}</p>
									</div>
									<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 shadow-md'>
										<h3 className='text-gray-300 font-medium mb-1'>About</h3>
										<p className='text-purple-400 text-sm'>
											<a
												href='https://github.com/rustydaemon'
												target='_blank'
												rel='noopener noreferrer'
												className='text-amber-400 hover:text-amber-300 underline'
											>
												GitHub
											</a>{' '}
											{', '}
											<a
												href='https://hub.docker.com/r/rustydaemon/homemedia'
												target='_blank'
												rel='noopener noreferrer'
												className='text-amber-400 hover:text-amber-300 underline'
											>
												dockerHub
											</a>
										</p>
									</div>
								</div>

								{versionInfo?.update_required && (
									<div className='p-3 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/40 rounded-lg flex items-start gap-3 shadow-md'>
										<div className='flex-1'>
											<p className='text-amber-200 text-sm'>
												A new version is available{' '}
												<a
													href='https://hub.docker.com/r/rustydaemon/homemedia'
													target='_blank'
													rel='noopener noreferrer'
													className='text-amber-400 hover:text-amber-300 underline'
												>
													{versionInfo.latest_version}
												</a>
											</p>
										</div>
									</div>
								)}
							</div>
						</Card>

						{/* Account Management */}
						<Card className='p-6'>
							<div className='space-y-4'>
								<div>
									<h2 className='text-xl font-semibold text-white mb-2'>
										Account
									</h2>
								</div>

								<div className='gap-4'>
									<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 flex justify-between shadow-md'>
										<div className='flex flex-col'>
											<h3 className='text-gray-300 font-medium mb-1'>
												Logged in as
											</h3>
											<p className='text-cyan-300 text-sm font-semibold'>
												{username}
											</p>
										</div>
										<div className='flex justify-end items-start'>
											<Button variant='danger' onClick={handleLogout}>
												Logout
											</Button>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</>
				)}

				{activeTab === 'appearance' && (
					<Card className='p-6'>
						<div className='space-y-5'>
							<div className='flex items-center gap-3'>
								<h2 className='text-xl font-semibold text-white'>Appearance</h2>
							</div>

							<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 flex justify-between items-center shadow-md gap-4'>
								<div className='flex flex-col'>
									<h3 className='text-gray-300 font-medium mb-1'>Theme</h3>
									<p className='text-gray-400 text-xs'>
										Color palette used across the app
									</p>
								</div>
								<div className='min-w-[220px]'>
									<ThemeDropdown
										options={THEME_OPTIONS}
										value={theme}
										onChange={setTheme}
									/>
								</div>
							</div>

							<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 flex justify-between items-center shadow-md gap-4'>
								<div className='flex flex-col'>
									<h3 className='text-gray-300 font-medium mb-1'>
										Table density
									</h3>
									<p className='text-gray-400 text-xs'>
										Row spacing in lists and tables
									</p>
								</div>
								<div
									className='inline-flex rounded-lg border border-gray-700/50 overflow-hidden flex-shrink-0'
									role='group'
								>
									{(['comfortable', 'compact'] as Density[]).map(opt => {
										const isActive = density === opt;
										return (
											<button
												key={opt}
												onClick={() => setDensity(opt)}
												className={`px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer capitalize ${
													isActive
														? 'bg-gradient-to-br from-cyan-600/30 to-sky-600/30 text-cyan-200'
														: 'bg-gray-900/40 text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
												}`}
												aria-pressed={isActive}
											>
												{opt}
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</Card>
				)}

				{activeTab === 'system' && (
					<>
						{/* Database Backup */}
						<Card className='p-6'>
							<div className='space-y-6'>
								<div>
									<h2 className='text-xl font-semibold text-white mb-2'>
										Database Management
									</h2>
								</div>

								{/* Backup Section - 50/50 layout */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 shadow-md'>
										<div className='space-y-4'>
											<div>
												<h3 className='text-white font-medium'>
													SQL Dump Backup
												</h3>
												<p className='text-gray-400 text-sm mt-1'>
													Generate a SQL dump of your database.
												</p>
											</div>
											<Button
												variant='secondary'
												onClick={handleCreateBackup}
												disabled={backupMutation.isPending}
											>
												{backupMutation.isPending
													? 'Creating SQL Dump...'
													: 'Create SQL Dump'}
											</Button>
										</div>
									</div>

									<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 shadow-md'>
										<div className='space-y-4'>
											<div>
												<h3 className='text-white font-medium'>
													Database File Backup
												</h3>
												<p className='text-gray-400 text-sm mt-1'>
													Create a physical copy of the database file.
												</p>
											</div>
											<Button
												variant='secondary'
												onClick={handleCreateFileBackup}
												disabled={fileBackupMutation.isPending}
											>
												{fileBackupMutation.isPending
													? 'Creating Database Backup...'
													: 'Create Database Backup'}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</Card>

						{/* CSV Import/Export */}
						<Card className='p-6'>
							<div className='space-y-6'>
								<div>
									<h2 className='text-xl font-semibold text-white mb-2'>
										Data Import/Export
									</h2>
								</div>

								{/* CSV Import/Export Section - 50/50 layout */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									{/* CSV Import Section */}
									<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 shadow-md'>
										<div className='space-y-4'>
											<div>
												<h3 className='text-white font-medium'>
													Import from CSV
												</h3>
												<p className='text-gray-400 text-sm mt-1'>
													Import media entries from a CSV file.
												</p>
											</div>
											<Button
												variant='secondary'
												disabled={true}
												className='opacity-50 cursor-not-allowed'
											>
												Import CSV (Coming Soon)
											</Button>
										</div>
									</div>

									{/* CSV Export Section */}
									<div className='p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 shadow-md'>
										<div className='space-y-4'>
											<div>
												<h3 className='text-white font-medium'>
													Export to CSV
												</h3>
												<p className='text-gray-400 text-sm mt-1'>
													Export your entire media collection to a CSV file.
												</p>
											</div>
											<Button
												variant='secondary'
												onClick={handleExportCSV}
												disabled={csvExportMutation.isPending}
											>
												{csvExportMutation.isPending
													? 'Exporting...'
													: 'Export CSV'}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</>
				)}
			</div>

			{/* SQL Backup Modal */}
			<BackupModal
				isOpen={backupModalOpen}
				onClose={() => setBackupModalOpen(false)}
				sqlDump={backupData}
			/>

			{/* File Backup Modal */}
			<FileBackupModal
				isOpen={fileBackupModalOpen}
				onClose={() => setFileBackupModalOpen(false)}
				backupFilename={fileBackupFilename}
			/>
		</div>
	);
}
