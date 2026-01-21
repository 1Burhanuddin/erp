import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8 animate-enter">
                <div className="flex flex-col items-center text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isLogin ? "Welcome back" : "Create an account"}
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        {isLogin
                            ? "Enter your credentials to access your account."
                            : "Enter your email below to create your account."}
                    </p>
                </div>

                <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                    <form onSubmit={handleAuth}>
                        <CardContent className="space-y-4 pt-6">
                            <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="space-y-4">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                className="pl-10"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            className="pl-10"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        {isLogin && (
                                            <a href="#" className="text-xs text-primary hover:underline">
                                                Forgot password?
                                            </a>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="********"
                                            className="pl-10 pr-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus:outline-none"
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
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="********"
                                                className="pl-10"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full font-semibold" type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLogin ? "Sign In" : "Create Account"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                    {isLogin ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button onClick={() => setMode("signin")} className="text-primary hover:underline font-medium">
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>

        </div>
    );
};

export default Auth;
