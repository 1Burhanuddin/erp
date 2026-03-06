import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Mail, Loader2, User, Eye, EyeOff, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const isLogin = mode === "signin";

    // Form Fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI State
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check if already logged in
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate("/");
        });
    }, [navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate("/");
            } else {
                // Validation
                if (password !== confirmPassword) {
                    toast.error("Passwords do not match");
                    setLoading(false);
                    return;
                }
                if (!name) {
                    toast.error("Please enter your name");
                    setLoading(false);
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                        emailRedirectTo: `${window.location.origin}/`,
                    },
                });
                if (error) throw error;

                toast.success("Account created! You can now sign in.");
                setMode("signin");
            }
        } catch (error: any) {
            toast.error(error.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Modern Design */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img 
                    src="/auth_banner2.svg" 
                    alt="Business professional working"
                    className="absolute inset-0 w-full h-full object-contain"
                />
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 lg:w-1/2 bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Mobile Branding */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Operra
                            </h1>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium tracking-widest uppercase">
                            Enterprise Resource Planning
                        </p>
                    </div>

                    {/* Auth Card */}
                    <Card className="border-0 shadow-xl bg-white dark:bg-zinc-800 rounded-2xl">
                        <CardHeader className="space-y-1 pb-8 pt-10 px-8">
                            <CardTitle className="text-2xl font-bold text-center text-blue-900 dark:text-white">
                                {isLogin ? "Operra" : "Create Account"}
                            </CardTitle>
                            <CardDescription className="text-center text-base text-gray-600 dark:text-gray-400">
                                {isLogin
                                    ? "Sign in to access your dashboard"
                                    : "Sign up to get started with Operra"}
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleAuth}>
                            <CardContent className="space-y-5 px-8">
                                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-zinc-700 p-1 rounded-xl">
                                        <TabsTrigger
                                            value="signin"
                                            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-blue-400 rounded-lg font-medium"
                                        >
                                            Sign In
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="signup"
                                            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-blue-400 rounded-lg font-medium"
                                        >
                                            Sign Up
                                        </TabsTrigger>
                                    </TabsList>

                                    <motion.div
                                        layout
                                        className="relative overflow-hidden p-2 -m-2"
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={mode}
                                                initial={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: mode === "signin" ? 20 : -20 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="space-y-4"
                                            >
                                                {!isLogin && (
                                                    <div className="space-y-2">
                                                        <div className="relative">
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                                                            <FloatingLabelInput
                                                                id="fullName"
                                                                label="Full Name"
                                                                type="text"
                                                                className="pl-11 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 rounded-xl"
                                                                labelClassName="peer-placeholder-shown:left-10 peer-focus:left-3 bg-white dark:bg-zinc-800 px-2 rounded"
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                                required={!isLogin}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                                                        <FloatingLabelInput
                                                            id="email"
                                                            label="Email"
                                                            type="email"
                                                            className="pl-11 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 rounded-xl"
                                                            labelClassName="peer-placeholder-shown:left-10 peer-focus:left-3 bg-white dark:bg-zinc-800 px-2 rounded"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                                                        <FloatingLabelInput
                                                            id="password"
                                                            label="Password"
                                                            type={showPassword ? "text" : "password"}
                                                            className="pl-11 pr-11 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 rounded-xl"
                                                            labelClassName="peer-placeholder-shown:left-10 peer-focus:left-3 bg-white dark:bg-zinc-800 px-2 rounded"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {!isLogin && (
                                                    <div className="space-y-2">
                                                        <div className="relative">
                                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                                                            <FloatingLabelInput
                                                                id="confirmPassword"
                                                                label="Confirm Password"
                                                                type={showPassword ? "text" : "password"}
                                                                className="pl-11 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 rounded-xl"
                                                                labelClassName="peer-placeholder-shown:left-10 peer-focus:left-3 bg-white dark:bg-zinc-800 px-2 rounded"
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                required={!isLogin}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.div>
                                </Tabs>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-4 px-8 pb-8">
                                <Button
                                    className="w-full font-semibold h-12 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl border-0 transition-colors"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLogin ? "Sign In" : "Create Account"}
                                </Button>

                                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    {isLogin ? (
                                        <>
                                            Don&apos;t have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => setMode("signup")}
                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline font-semibold"
                                            >
                                                Sign up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => setMode("signin")}
                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline font-semibold"
                                            >
                                                Sign in
                                            </button>
                                        </>
                                    )}
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Auth;
