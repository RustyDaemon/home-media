import {
  FilmIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";
import { useGuestLogin, useGuestModeStatus, useLogin } from "../hooks/useAuth";
import { loginSchema, type LoginFormData } from "../schemas/auth";

export default function Login() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Use react-query hooks
  const loginMutation = useLogin();
  const guestLoginMutation = useGuestLogin();
  const { data: guestModeStatus } = useGuestModeStatus();

  const guestModeEnabled = guestModeStatus?.enabled ?? false;

  const onSubmit = async (data: LoginFormData) => {
    const response = await loginMutation.mutateAsync(data);
    login(response);
    navigate("/");
  };

  const handleGuestLogin = async () => {
    const response = await guestLoginMutation.mutateAsync();
    guestLogin(response);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Logo/Title with Icon */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 via-sky-500 to-cyan-500 rounded-2xl mb-6 shadow-xl shadow-purple-500/30 relative group">
              <FilmIcon className="w-10 h-10 text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-sky-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent mb-3 drop-shadow-sm">
              Home Media
            </h1>
            <p className="text-gray-400 text-base">
              Your personal collection awaits
            </p>
          </div>

          <div className="space-y-5">
            {/* Guest Mode Button - Primary with Icon */}
            {guestModeEnabled && (
              <Button
                type="button"
                variant="primary"
                className="w-full group relative overflow-hidden"
                loading={guestLoginMutation.isPending}
                onClick={handleGuestLogin}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <div className="flex items-center justify-center relative z-10">
                  <SparklesIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Browse as Guest</span>
                </div>
              </Button>
            )}

            {/* Admin Login Toggle - only show button when guest mode is enabled and not yet clicked */}
            {guestModeEnabled && !showAdminLogin ? (
              <button
                type="button"
                onClick={() => setShowAdminLogin(true)}
                className="w-full text-center text-sm text-gray-400 hover:text-purple-300 transition-all duration-200 py-3 hover:bg-gray-800/30 rounded-xl"
              >
                <LockClosedIcon className="w-4 h-4 inline-block mr-2" />
                Admin Login
              </button>
            ) : (
              <>
                {/* Divider */}
                {guestModeEnabled && (
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gradient-to-r from-transparent via-gray-800/90 to-transparent text-gray-400">
                        or continue with admin
                      </span>
                    </div>
                  </div>
                )}

                {/* Admin Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-4">
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 pointer-events-none" />
                      <Input
                        label="Username"
                        type="text"
                        {...register("username")}
                        placeholder="Enter your username"
                        error={errors.username?.message}
                        required
                        autoComplete="username"
                        className="pl-11"
                      />
                    </div>

                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 pointer-events-none" />
                      <Input
                        label="Password"
                        type="password"
                        {...register("password")}
                        placeholder="Enter your password"
                        error={errors.password?.message}
                        required
                        autoComplete="current-password"
                        className="pl-11"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full group relative overflow-hidden"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    <div className="flex items-center justify-center relative z-10">
                      <LockClosedIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">Sign In as Admin</span>
                    </div>
                  </Button>

                  {guestModeEnabled && (
                    <button
                      type="button"
                      onClick={() => setShowAdminLogin(false)}
                      className="w-full text-center text-sm text-gray-400 hover:text-purple-300 transition-all duration-200 py-3 hover:bg-gray-800/30 rounded-xl"
                    >
                      ← Back
                    </button>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
