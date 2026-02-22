import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, ArrowRight, ShoppingBag, LogOut, ChevronRight } from "lucide-react";
import { useStoreDetails } from "@/api/ecommerce";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfilePage = () => {
    const { slug } = useParams();
    const { data: store } = useStoreDetails(slug);
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({ name: "", email: "" });

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: ""
    });

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
            toast.error("Please fill in all fields");
            return;
        }

        // Mock Auth Logic
        setIsLoggedIn(true);
        setUser({
            name: isLogin ? "Demo Customer" : formData.name,
            email: formData.email
        });
        toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser({ name: "", email: "" });
        toast.info("Logged out");
    };

    if (isLoggedIn) {
        return (
            <div className="min-h-screen pt-24 pb-32 px-6 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-white/40 text-sm">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">Account Actions</h3>
                    <div className="glass-dark rounded-[2.5rem] overflow-hidden">
                        {[
                            { icon: ShoppingBag, label: "My Orders", path: "/orders" },
                            { icon: User, label: "Edit Profile", path: "#" },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className="w-full h-16 px-8 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-5 h-5 text-white/60" />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/20" />
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full h-16 rounded-[2rem] bg-stone-900/50 hover:bg-stone-900 text-red-500 border border-red-500/10"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-32 px-6 flex flex-col items-center justify-center space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="text-center space-y-4 max-w-xs">
                <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-[0_20px_40px_rgba(255,255,255,0.2)]">
                    <ShoppingBag className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase">{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
                <p className="text-white/40 text-sm leading-relaxed">
                    Access your orders and personalized shopping experience at {store?.name || 'our shop'}.
                </p>
            </div>

            <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
                {!isLogin && (
                    <div className="relative group">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-sm focus:outline-none focus:border-white/20 transition-all"
                        />
                    </div>
                )}
                <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-sm focus:outline-none focus:border-white/20 transition-all"
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-sm focus:outline-none focus:border-white/20 transition-all"
                    />
                </div>

                <Button className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase text-sm tracking-widest hover:bg-white/90 shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all active:scale-[0.98] mt-4">
                    {isLogin ? 'Login' : 'Sign Up'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </form>

            <div className="text-center">
                <p className="text-white/40 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-white font-bold hover:underline underline-offset-4"
                    >
                        {isLogin ? 'Create One' : 'Login Now'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ProfilePage;
