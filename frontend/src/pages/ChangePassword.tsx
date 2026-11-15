import {
  ExclamationTriangleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";
import { useChangePassword } from "../hooks/useAuth";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../schemas/auth";

export default function ChangePassword() {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const changePasswordMutation = useChangePassword();

  const onSubmit = async (data: ChangePasswordFormData) => {
    await changePasswordMutation.mutateAsync({
      old_password: data.old_password,
      new_password: data.new_password,
    });
    await checkAuth();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-32 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-600 via-orange-500 to-red-500 rounded-2xl mb-5 shadow-xl shadow-amber-500/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <ShieldCheckIcon className="w-10 h-10 text-white relative z-10" />
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-amber-400 via-orange-300 to-red-300 bg-clip-text text-transparent">
              Change Password
            </h1>
          </div>

          {/* Warning Message */}
          <div className="mb-8 p-4 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/40 rounded-xl shadow-lg shadow-amber-500/10">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Password change required
                </p>
                <p className="text-sm text-amber-200/80 mt-1">
                  You must change your password before continuing.
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  label="Current Password"
                  type="password"
                  {...register("old_password")}
                  placeholder="Enter your current password"
                  error={errors.old_password?.message}
                  required
                  autoFocus
                  autoComplete="current-password"
                  className="pl-11"
                />
              </div>

              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  label="New Password"
                  type="password"
                  {...register("new_password")}
                  placeholder="Enter your new password"
                  error={errors.new_password?.message}
                  required
                  autoComplete="new-password"
                  helperText="Must be at least 6 characters"
                  className="pl-11"
                />
              </div>

              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  label="Confirm New Password"
                  type="password"
                  {...register("confirm_password")}
                  placeholder="Confirm your new password"
                  error={errors.confirm_password?.message}
                  required
                  autoComplete="new-password"
                  className="pl-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full group relative overflow-hidden mt-6"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="flex items-center justify-center relative z-10">
                <SparklesIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Update Password</span>
              </div>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
