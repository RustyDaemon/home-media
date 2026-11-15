import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import { RequestsFeatureRoute } from './components/RequestsFeatureRoute';
import ThemedToastContainer from './components/ThemedToastContainer';
import {
	AdminOnlyRoute,
	AuthProvider,
	ProtectedRoute,
} from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import AddMedia from './pages/AddMedia';
import AddRequest from './pages/AddRequest';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import EditMedia from './pages/EditMedia';
import EditRequest from './pages/EditRequest';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Requests from './pages/Requests';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<SearchProvider>
					<Router>
						<Routes>
							{/* Public routes */}
							<Route path='/login' element={<Login />} />

							{/* Protected routes */}
							<Route
								path='/change-password'
								element={
									<ProtectedRoute>
										<ChangePassword />
									</ProtectedRoute>
								}
							/>

							{/* Main app routes */}
							<Route
								path='/*'
								element={
									<ProtectedRoute>
										<Layout>
											<Routes>
												<Route path='/' element={<Dashboard />} />
												<Route
													path='/requests'
													element={
														<RequestsFeatureRoute>
															<Requests />
														</RequestsFeatureRoute>
													}
												/>
												<Route
													path='/requests/add'
													element={
														<RequestsFeatureRoute>
															<AdminOnlyRoute>
																<AddRequest />
															</AdminOnlyRoute>
														</RequestsFeatureRoute>
													}
												/>
												<Route
													path='/requests/edit/:id'
													element={
														<RequestsFeatureRoute>
															<AdminOnlyRoute>
																<EditRequest />
															</AdminOnlyRoute>
														</RequestsFeatureRoute>
													}
												/>
												<Route
													path='/add'
													element={
														<AdminOnlyRoute>
															<AddMedia />
														</AdminOnlyRoute>
													}
												/>
												<Route
													path='/edit/:id'
													element={
														<AdminOnlyRoute>
															<EditMedia />
														</AdminOnlyRoute>
													}
												/>
												<Route path='/settings' element={<Settings />} />
												<Route path='*' element={<NotFound />} />
											</Routes>
										</Layout>
									</ProtectedRoute>
								}
							/>
						</Routes>
						<ThemedToastContainer />
					</Router>
				</SearchProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
