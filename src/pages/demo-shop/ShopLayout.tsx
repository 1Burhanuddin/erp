import { useNavigate, useParams, Outlet, Link, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Heart, Compass, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { useLayoutEffect } from "react";
import { useStoreDetails } from "@/api/ecommerce";

const ShopLayout = () => {
    const { slug } = useParams();
    const { data: store, error: storeError, isLoading: isStoreLoading } = useStoreDetails(slug);

    if (storeError) {
        console.error("ShopLayout: Error loading store details:", storeError);
    }

    const cartItems = useAppSelector(state => state.cart.items);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const getLink = (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return slug ? `/s/${slug}${cleanPath}` : cleanPath;
    };

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const isHome = pathname === getLink('/') || pathname === '/';
    const isProduct = pathname.includes('/product/');
    const isCheckout = pathname.includes('/checkout');

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden relative">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full" />
            </div>

            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHome ? 'bg-transparent' : 'glass-dark'}`}>
                <div className="container mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
                    {/* Back Button for non-home pages */}
                    {!isHome ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-full hover:bg-white/10"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    ) : (
                        <div className="w-10" /> // Spacer
                    )}

                    {/* Title/Logo */}
                    <div className="text-center flex-1">
                        {!isHome && (
                            <h1 className="text-xl font-bold tracking-tighter uppercase whitespace-nowrap">
                                {isCheckout ? 'Checkout' : isProduct ? '' : store?.name || 'Shop'}
                            </h1>
                        )}
                    </div>

                    {/* Top Actions */}
                    <div className="flex items-center justify-end w-10">
                        {/* 3-dot button removed per user request */}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                <Outlet />
            </main>

            {/* Floating Cart Bar - Above Nav */}
            {!isProduct && <CartFloatingBar getLink={getLink} />}

            {/* Premium Bottom Navigation */}
            {!isProduct && (
                <div className="fixed bottom-8 left-0 right-0 z-[60] flex justify-center px-6 pointer-events-none animate-in slide-in-from-bottom-10 duration-500">
                    <nav className="glass-dark px-10 h-16 rounded-full flex items-center gap-16 pointer-events-auto border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <Link to={getLink('/')} className={`transition-all ${isHome ? 'text-white scale-125' : 'text-white/40 hover:text-white/60'}`}>
                            <Compass className="w-6 h-6" />
                        </Link>
                        <Link to={getLink('/checkout')} className={`relative transition-all ${isCheckout ? 'text-white scale-125' : 'text-white/40 hover:text-white/60'}`}>
                            <ShoppingBag className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <Link to={getLink('/profile')} className={`transition-all ${pathname.includes('/profile') ? 'text-white scale-125' : 'text-white/40 hover:text-white/60'}`}>
                            <User className="w-6 h-6" />
                        </Link>
                    </nav>
                </div>
            )}
        </div>
    );
};

const CartFloatingBar = ({ getLink }: { getLink: (p: string) => string }) => {
    const navigate = useNavigate();
    const cartItems = useAppSelector(state => state.cart.items);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const { pathname } = useLocation();

    // Don't show on checkout or product pages to avoid clutter with specific page actions
    if (cartCount === 0 || pathname.includes('/checkout') || pathname.includes('/product/')) return null;

    return (
        <div className="fixed bottom-28 left-0 right-0 z-50 flex justify-center px-6 animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-none">
            <div className="glass-dark w-full max-w-sm h-16 rounded-2xl flex items-center justify-between px-6 border-white/10 shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center relative border border-white/10">
                        <ShoppingBag className="w-5 h-5 text-white/60" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[8px] font-bold rounded-full flex items-center justify-center border border-black shadow-lg">
                            {cartCount}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">Total</p>
                        <p className="text-sm font-bold leading-none">₹{totalPrice}</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(getLink('/checkout'))}
                    className="h-10 px-6 rounded-xl bg-white text-black font-extrabold text-xs shadow-xl active:scale-95 transition-transform"
                >
                    Checkout
                </Button>
            </div>
        </div>
    );
};

// Need to import ArrowLeft since it's used
export default ShopLayout;
