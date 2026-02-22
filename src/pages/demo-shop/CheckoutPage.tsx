import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, CreditCard, ShoppingBag, Loader2, MapPin, Mail, Phone } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { useCreateEcommerceOrder, useStoreDetails } from "@/api/ecommerce";
import { useState } from "react";
import { toast } from "sonner";

const CheckoutPage = () => {
    const { slug } = useParams();
    const { data: store } = useStoreDetails(slug);
    const cartItems = useAppSelector(state => state.cart.items);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const createOrder = useCreateEcommerceOrder();

    const getLink = (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return slug ? `/s/${slug}${cleanPath}` : cleanPath;
    };

    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        address: "",
        city: ""
    });

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // Mock total for simplicity in this view

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        if (!formData.email || !formData.firstName || !formData.address) {
            toast.error("Please fill in all required fields");
            return;
        }
        // Mock order logic...
        dispatch(clearCart());
        toast.success("Order Placed!");
        navigate(getLink('/'));
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-white/20" />
                </div>
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <Link to={getLink('/')}>
                    <Button className="rounded-full bg-white text-black h-14 px-8 font-bold">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen pb-40 pt-20 px-6 space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                <p className="text-white/40 text-sm">Almost there! Complete your details.</p>
            </div>

            {/* Cart Items - Straight Stack */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Cart Items</h2>
                <div className="space-y-3">
                    {cartItems.map((item, i) => (
                        <div key={i} className="glass-dark p-4 rounded-3xl flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                            </div>
                            <div className="font-bold text-sm whitespace-nowrap">₹{item.price * item.quantity}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shipping Form - Straight Alignment */}
            <div className="space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Shipping Information</h2>

                <div className="space-y-4">
                    <div className="glass-dark p-6 rounded-[2rem] space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                name="email" value={formData.email} onChange={handleInputChange}
                                placeholder="Email Address"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                name="firstName" value={formData.firstName} onChange={handleInputChange}
                                placeholder="Full Name"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                name="address" value={formData.address} onChange={handleInputChange}
                                placeholder="Shipping Address"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="glass-dark p-6 rounded-[2rem] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Payment Method</p>
                                <p className="text-xs text-white/40">Cash on Delivery</p>
                            </div>
                        </div>
                        <Check className="w-6 h-6 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className="glass-dark p-8 rounded-[2.5rem] space-y-4">
                <div className="flex justify-between items-center text-white/60 text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-white/60 text-sm">
                    <span>Shipping</span>
                    <span className="text-green-400 font-bold">FREE</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold">Total Power</span>
                    <span className="text-2xl font-bold">₹{total}</span>
                </div>
            </div>

            {/* Fixed Bottom Action - Positioned above floating nav */}
            <div className="fixed bottom-28 left-0 right-0 p-6 z-50 pointer-events-none">
                <Button
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending}
                    className="w-full h-20 rounded-[2.5rem] bg-white text-black text-xl font-extrabold uppercase hover:bg-white/90 shadow-[0_20px_50px_rgba(255,255,255,0.15)] transition-all active:scale-95 pointer-events-auto max-w-lg mx-auto"
                >
                    {createOrder.isPending ? "Hold tight..." : "Pay Now"}
                </Button>
            </div>
        </div>
    );
};

import { User } from "lucide-react";

export default CheckoutPage;
