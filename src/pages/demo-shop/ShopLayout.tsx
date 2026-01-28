import { Outlet, Link, useLocation } from "react-router-dom";
import { ShoppingBag, Search, Menu, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { useLayoutEffect } from "react";
import { useStoreDetails } from "@/api/ecommerce";

const ShopLayout = () => {
    const { data: store } = useStoreDetails();
    const cartItems = useAppSelector(state => state.cart.items);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const showGlobalCart = cartItems.length > 0 && !pathname.includes('/checkout') && !pathname.includes('/product');

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-orange-100">


            {/* Header */}
            <header className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-100">
                <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">


                    {/* Logo */}
                    <Link to="/shop-preview" className="text-xl md:text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity uppercase">
                        {store?.name ? store.name.split(' ').slice(0, 2).join(' ') : "AURA"}<span className="text-orange-500">.</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
                        <Link to="/shop-preview" className="hover:text-orange-600 transition-colors">NEW ARRIVALS</Link>
                        <Link to="/shop-preview" className="hover:text-orange-600 transition-colors">COLLECTIONS</Link>
                        <Link to="/shop-preview" className="hover:text-orange-600 transition-colors">ACCESSORIES</Link>
                        <Link to="/shop-preview" className="hover:text-orange-600 transition-colors">SALE</Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-stone-100 hidden md:flex">
                            <Search className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-stone-100 hidden md:flex">
                            <User className="w-5 h-5" />
                        </Button>
                        <Link to="/shop-preview/checkout">
                            <Button
                                size="icon"
                                className="rounded-full bg-stone-900 text-white hover:bg-stone-800 relative w-10 h-10 md:w-auto md:h-10 md:px-4 flex gap-2 items-center group transition-all"
                            >
                                <ShoppingBag className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                <span className="hidden md:inline">Cart</span>
                                {cartCount > 0 && <span className="bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full absolute -top-1 -right-1 border-2 border-stone-50">{cartCount}</span>}
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer - Hide on Product Page */}
            {!pathname.includes('/product/') && (
                <footer className="bg-stone-900 text-stone-400 py-12 md:py-16 mt-20">
                    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-white text-2xl font-bold tracking-tighter">
                                    {store?.name ? store.name.split(' ').slice(0, 2).join(' ') : "AURA"}<span className="text-orange-500">.</span>
                                </h4>
                                <p className="text-sm leading-relaxed max-w-xs">
                                    Elevating everyday essentials with sustainable materials and timeless design.
                                </p>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-stone-500">Email:</span> {store?.email || "hello@aurastore.com"}</p>
                                <p><span className="text-stone-500">Phone:</span> {store?.phone || "+91 98765 43210"}</p>
                            </div>
                        </div>
                        <div className="md:text-right">
                            <h5 className="text-white font-medium mb-4">Shop</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Accessories</a></li>
                            </ul>
                        </div>
                    </div>
                </footer>
            )}

            {/* Global Mobile Floating Cart Bar */}
            {showGlobalCart && (
                <div className="fixed bottom-4 inset-x-4 md:hidden z-50 animate-in slide-in-from-bottom-5 duration-500">
                    <div
                        onClick={() => navigate('/shop-preview/checkout')}
                        className="flex items-center justify-between gap-3 h-16 rounded-full bg-stone-900 text-white px-6 shadow-2xl cursor-pointer"
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">{cartCount} Items</span>
                            <span className="text-xs text-stone-400">Total: ₹{cartTotal}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-sm">
                            View Cart <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopLayout;
