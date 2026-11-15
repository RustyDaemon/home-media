import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { LoginResponse } from '../api/client';
import { apiClient, tokenManager } from '../api/client';
import { PageSkeleton } from '../components/Skeleton';

interface AuthContextType {
	isAuthenticated: boolean;
	mustChangePassword: boolean;
	username: string | null;
	isGuest: boolean;
	defaultLanguageId: number | null;
	loading: boolean;
	login: (response: LoginResponse) => void;
	guestLogin: (response: LoginResponse) => void;
	logout: () => void;
	checkAuth: () => Promise<void>;
	updateDefaultLanguage: (languageId: number | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [mustChangePassword, setMustChangePassword] = useState(false);
	const [username, setUsername] = useState<string | null>(null);
	const [isGuest, setIsGuest] = useState(false);
	const [defaultLanguageId, setDefaultLanguageId] = useState<number | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	const checkAuth = async () => {
		const token = tokenManager.getToken();
		if (!token) {
			setIsAuthenticated(false);
			setIsGuest(false);
			setDefaultLanguageId(null);
			setLoading(false);
			return;
		}

		try {
			const status = await apiClient.getAuthStatus();
			setIsAuthenticated(status.authenticated);
			setMustChangePassword(status.must_change_password);
			setUsername(status.username);
			setIsGuest(status.is_guest);
			setDefaultLanguageId(status.default_language_id);
		} catch {
			// Token is invalid or expired
			setIsAuthenticated(false);
			setIsGuest(false);
			setDefaultLanguageId(null);
			tokenManager.removeToken();
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	// Apply the result of a login mutation to auth state. The token is already
	// persisted by apiClient.login/guestLogin, so this only updates React state.
	const login = (response: LoginResponse) => {
		setIsAuthenticated(true);
		setMustChangePassword(response.must_change_password);
		setUsername(response.username);
		setIsGuest(response.is_guest);
		setDefaultLanguageId(response.default_language_id);
	};

	const guestLogin = (response: LoginResponse) => {
		setIsAuthenticated(true);
		setMustChangePassword(false);
		setUsername(response.username);
		setIsGuest(true);
		setDefaultLanguageId(response.default_language_id);
	};

	const logout = () => {
		apiClient.logout();
		setIsAuthenticated(false);
		setMustChangePassword(false);
		setUsername(null);
		setIsGuest(false);
		setDefaultLanguageId(null);
	};

	const updateDefaultLanguage = async (languageId: number | null) => {
		await apiClient.updateDefaultLanguage({
			default_language_id: languageId,
		});
		setDefaultLanguageId(languageId);
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				mustChangePassword,
				username,
				isGuest,
				defaultLanguageId,
				loading,
				login,
				guestLogin,
				logout,
				checkAuth,
				updateDefaultLanguage,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, mustChangePassword, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <PageSkeleton />;
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	if (mustChangePassword && location.pathname !== '/change-password') {
		return <Navigate to='/change-password' replace />;
	}

	return <>{children}</>;
}

export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
	const { isGuest, loading } = useAuth();

	if (loading) {
		return <PageSkeleton />;
	}

	// Redirect guests to dashboard
	if (isGuest) {
		return <Navigate to='/' replace />;
	}

	return <>{children}</>;
}
