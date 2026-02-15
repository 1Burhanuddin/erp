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
        <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 dark:bg-zinc-900 relative overflow-hidden">
            {/* Decorative Blobs - Desktop */}
            <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
                {/* Purple blob - top left */}
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-lavender-500 dark:bg-lavender-600 rounded-[40%_60%_70%_30%/40%_50%_60%_50%]"></div>

                {/* Coral blob - top right */}
                <div className="absolute -top-20 right-0 w-[400px] h-[400px] bg-coral dark:bg-coral-dark rounded-[60%_40%_30%_70%/60%_30%_70%_40%]"></div>

                {/* Yellow blob - bottom right */}
                <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-butter dark:bg-butter-dark rounded-[30%_70%_70%_30%/30%_30%_70%_70%]"></div>

                {/* Purple blob - bottom left */}
                <div className="absolute bottom-20 -left-20 w-[350px] h-[350px] bg-lavender-400 dark:bg-lavender-700 rounded-[70%_30%_50%_50%/30%_60%_40%_70%]"></div>
            </div>

            {/* Main Content Container */}
            <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
                {/* Left Side - Branding (Desktop) */}
                <div className="hidden lg:flex flex-col justify-center flex-1 space-y-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-3xl p-10 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <LayoutDashboard className="h-12 w-12 text-[#8B6B9E] dark:text-[#9B7BAE]" />
                        <h1 className="text-5xl font-bold text-[#8B6B9E] dark:text-[#9B7BAE] tracking-tight">
                            Operra
                        </h1>
                    </div>
                    <p className="text-sm text-[#8B6B9E]/70 dark:text-[#9B7BAE]/70 font-medium tracking-widest uppercase">
                        Enterprise Resource Planning
                    </p>

                    <div className="space-y-4 pt-6">
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                            Streamline Your Business Operations
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
                            Manage inventory, sales, purchases, contacts, and employees all in one powerful platform.
                        </p>

                        {/* Feature List */}
                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-[#8B6B9E]"></div>
                                <span>Real-time inventory tracking</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-[#F5A5A0]"></div>
                                <span>Comprehensive sales & purchase management</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-[#F4E5A0]"></div>
                                <span>Employee management & attendance tracking</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-[#9B7BAE]"></div>
                                <span>Advanced reporting & analytics</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="w-full lg:w-auto lg:flex-1 max-w-xl relative">
                    {/* Mobile Branding */}
                    <div className="lg:hidden text-center mb-6 relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <LayoutDashboard className="h-8 w-8 text-lavender-500 dark:text-lavender-400" />
                            <h1 className="text-3xl font-bold text-lavender-500 dark:text-lavender-400 tracking-tight">
                                Operra
                            </h1>
                        </div>
                        <p className="text-xs text-lavender-500/70 dark:text-lavender-400/70 font-medium tracking-widest uppercase">
                            Enterprise Resource Planning
                        </p>
                    </div>

                    {/* Mobile Decorative Blobs - Positioned relative to viewport */}
                    <div className="lg:hidden fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                        {/* Purple blob - top left */}
                        <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-lavender-500 dark:bg-lavender-600 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] -translate-x-1/3 -translate-y-1/3"></div>

                        {/* Yellow blob - top right */}
                        <div className="absolute top-10 right-0 w-[150px] h-[150px] bg-butter dark:bg-butter-dark rounded-[40%_60%_70%_30%/40%_50%_60%_50%] translate-x-1/3"></div>

                        {/* Coral blob - bottom right */}
                        <div className="absolute bottom-20 right-0 w-[180px] h-[180px] bg-coral dark:bg-coral-dark rounded-[70%_30%_50%_50%/30%_60%_40%_70%] translate-x-1/4"></div>

                        {/* Small purple blob - bottom left */}
                        <div className="absolute bottom-0 left-0 w-[120px] h-[120px] bg-lavender-400 dark:bg-lavender-700 rounded-[50%_50%_50%_50%/50%_50%_50%_50%] -translate-x-1/4 translate-y-1/4"></div>
                    </div>

                    {/* Auth Card */}
                    <Card className="border-0 shadow-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl relative z-10">
                        <CardHeader className="space-y-1 pb-6 pt-8 px-8">
                            <CardTitle className="text-3xl font-bold text-center lg:text-left text-gray-800 dark:text-gray-100">
                                {isLogin ? "Welcome Back" : "Create Account"}
                            </CardTitle>
                            <CardDescription className="text-center lg:text-left text-base">
                                {isLogin
                                    ? "Enter your credentials to access your account"
                                    : "Enter your details to create your account"}
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleAuth}>
                            <CardContent className="space-y-5 px-8">
                                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                                    </TabsList>

                                    <motion.div
                                        layout
                                        className="relative overflow-hidden"
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
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                                            <FloatingLabelInput
                                                                id="fullName"
                                                                label="Full Name"
                                                                type="text"
                                                                className="pl-10"
                                                                labelClassName="peer-placeholder-shown:left-9 peer-focus:left-1"
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                                required={!isLogin}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                                        <FloatingLabelInput
                                                            id="email"
                                                            label="Email"
                                                            type="email"
                                                            className="pl-10"
                                                            labelClassName="peer-placeholder-shown:left-9 peer-focus:left-1"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                                        <FloatingLabelInput
                                                            id="password"
                                                            label="Password"
                                                            type={showPassword ? "text" : "password"}
                                                            className="pl-10 pr-10"
                                                            labelClassName="peer-placeholder-shown:left-9 peer-focus:left-1"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
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
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                                            <FloatingLabelInput
                                                                id="confirmPassword"
                                                                label="Confirm Password"
                                                                type={showPassword ? "text" : "password"}
                                                                className="pl-10"
                                                                labelClassName="peer-placeholder-shown:left-9 peer-focus:left-1"
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
                                    className="w-full font-semibold h-12 text-base bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLogin ? "Sign In" : "Create Account"}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    {isLogin ? (
                                        <>
                                            Don&apos;t have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => setMode("signup")}
                                                className="text-[#8B6B9E] dark:text-[#9B7BAE] hover:underline font-medium"
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
                                                className="text-[#8B6B9E] dark:text-[#9B7BAE] hover:underline font-medium"
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
