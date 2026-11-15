import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

/**
 * Top-level error boundary. Catches render/lifecycle errors anywhere in the
 * tree and shows a self-contained fallback instead of a blank screen. Error
 * boundaries must be class components.
 */
export default class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('Uncaught error:', error, info.componentStack);
	}

	private handleReload = () => {
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className='min-h-screen flex items-center justify-center p-4 bg-gray-950'>
					<div className='w-full max-w-md text-center bg-gray-900 border border-gray-700 rounded-2xl p-8'>
						<h1 className='text-2xl font-bold text-white mb-3'>
							Something went wrong
						</h1>
						<p className='text-gray-400 mb-6'>
							An unexpected error occurred. Please reload the page to continue.
						</p>
						<button
							type='button'
							onClick={this.handleReload}
							className='px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors'
						>
							Reload
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
