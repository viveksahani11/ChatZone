import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeClosed, LockKeyhole, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import signupAnimation from "../assests/lottie/signup-animation.json"



const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                <User className="w-5 h-5 text-white" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                className="input input-bordered w-full pl-10 bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-[0_0_10px_theme('colors.primary')] transition-all duration-300"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full pl-10 bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-[0_0_10px_theme('colors.primary')] transition-all duration-300"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                <LockKeyhole className="w-5 h-5 text-white" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input input-bordered w-full pl-10 pr-10 bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-[0_0_10px_theme('colors.primary')] transition-all duration-300"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {formData.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-white"
                >
                  {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account? <Link to="/login" className="link link-primary">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side Animation */}
      {/* Right Side Animation */}
<div className="hidden lg:flex flex-col items-center justify-center bg-base-200  p-6">
  <Lottie animationData={signupAnimation} loop={true} className="w-full max-w-xl" />
  <div className="mt-4 text-center text-white space-y-2">
    <h2 className="text-2xl font-bold">Welcome to ChatZone 🚀</h2>
    <p className="text-sm text-white/70 max-w-xs">
      Experience the future of messaging with secure, real-time chat powered by modern tech.
    </p>
  </div>
</div>

    </div>
  );
};

export default SignUpPage;
