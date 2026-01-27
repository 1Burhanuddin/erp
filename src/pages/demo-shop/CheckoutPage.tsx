import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, CreditCard, ShoppingBag, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { useCreateEcommerceOrder } from "@/api/ecommerce";
import { useState } from "react";
import { toast } from "sonner";

const CheckoutPage = () => {
    const cartItems = useAppSelector(state => state.cart.items);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const createOrder = useCreateEcommerceOrder();

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: ""
    });

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxes = subtotal * 0.18; // Mock 18% tax
    const total = subtotal + taxes;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        if (!formData.email || !formData.firstName || !formData.address) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await createOrder.mutateAsync({
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: "9999999999", // Mock phone
                    address: formData.address,
                    city: formData.city
                },
                items: cartItems.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.price,
                    subtotal: item.price * item.quantity
                })),
                total_amount: total
            });

            toast.success("Order placed successfully!", {
                description: "Check your email for confirmation."
            });
            dispatch(clearCart());
            navigate("/shop-preview");
        } catch (error) {
            toast.error("Failed to place order. Please try again.");
            console.error(error);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center space-y-4">
                <h1 className="text-3xl font-bold mb-4">Your cart is empty!</h1>
                <Link to="/shop-preview">
                    <Button className="rounded-full bg-black">Continue Shopping...</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                {/* Left: Form */}
                <div className="space-y-10 order-2 lg:order-1">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">Checkout</h1>
                        <p className="text-stone-500">Complete your details to secure your curated items.</p>
                    </div>

                    <div className="space-y-6">
                        <section className="space-y-4">
                            <h2 className="font-bold text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">1</span>
                                Contact
                            </h2>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input
                                        name="email" value={formData.email} onChange={handleInputChange}
                                        placeholder="you@example.com"
                                        className="h-12 rounded-full bg-stone-50 border-stone-200 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-white bg-stone-900">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm text-stone-600">Email me with news and offers</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 pt-6 border-t border-stone-100">
                            <h2 className="font-bold text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">2</span>
                                Shipping
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label>First name *</Label>
                                    <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" className="h-12 rounded-full bg-stone-50 border-stone-200" />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label>Last name</Label>
                                    <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className="h-12 rounded-full bg-stone-50 border-stone-200" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Address *</Label>
                                    <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Minimalism St" className="h-12 rounded-full bg-stone-50 border-stone-200" />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label>City</Label>
                                    <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" className="h-12 rounded-full bg-stone-50 border-stone-200" />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label>Postal Code</Label>
                                    <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="400001" className="h-12 rounded-full bg-stone-50 border-stone-200" />
                                </div>
                            </div>
                        </section>



                        <div className="pt-6">
                            <Button
                                size="lg"
                                onClick={handlePlaceOrder}
                                disabled={createOrder.isPending}
                                className="w-full h-16 rounded-full text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-900/10"
                            >
                                {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {createOrder.isPending ? "Processing..." : `Place Order - ₹${total.toLocaleString()}`}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="order-1 lg:order-2">
                    <div className="bg-stone-900 rounded-[2.5rem] p-8 md:p-10 text-stone-100 sticky top-24 shadow-2xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl">Order Summary</h3>
                                <p className="text-stone-400 text-sm">{cartItems.length} items in cart</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-6 mb-8 border-b border-white/10 pb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-20 h-24 bg-white/5 rounded-2xl overflow-hidden shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="font-bold line-clamp-1">{item.name}</h4>
                                        <p className="text-sm text-stone-400">Variant: {item.color}</p>
                                        <p className="text-sm text-stone-400">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="font-mono font-medium">₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-stone-400">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-stone-400">
                                <span>Shipping</span>
                                <span className="text-orange-400 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-stone-400">
                                <span>Est. Taxes (18%)</span>
                                <span>₹{taxes.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10 mt-4">
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
