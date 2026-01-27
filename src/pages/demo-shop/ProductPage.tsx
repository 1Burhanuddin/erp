import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Truck, ShieldCheck, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useEcommerceProduct } from "@/api/ecommerce";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, updateQuantity, removeFromCart } from "@/store/slices/cartSlice";
import { toast } from "sonner";

const ProductPage = () => {
    const { id } = useParams();
    const { data: product, isLoading } = useEcommerceProduct(id || "");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const cartItems = useAppSelector(state => state.cart.items);

    // Check if product is already in cart (simple check by ID)
    const cartItem = cartItems.find(item => item.productId === id);
    const isInCart = !!cartItem;

    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState("Default");

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Gallery Skeleton */}
                    <div className="aspect-[4/5] rounded-[2.5rem] bg-stone-100 animate-pulse" />

                    {/* Details Skeleton */}
                    <div className="space-y-8 md:space-y-12 py-4">
                        <div className="space-y-4">
                            <div className="h-4 w-24 bg-stone-100 rounded-full animate-pulse" />
                            <div className="h-12 w-3/4 bg-stone-100 rounded-xl animate-pulse" />
                            <div className="h-8 w-32 bg-stone-100 rounded-xl animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 w-full bg-stone-100 rounded-full animate-pulse" />
                            <div className="h-4 w-full bg-stone-100 rounded-full animate-pulse" />
                            <div className="h-4 w-2/3 bg-stone-100 rounded-full animate-pulse" />
                        </div>
                        <div className="h-20 w-full bg-stone-100 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
    }

    // Safely handle images
    const images: string[] = Array.isArray(product.images)
        ? (product.images as string[])
        : product.image_url
            ? [product.image_url]
            : ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200"];

    const price = product.online_price || product.sale_price || 0;

    const handleAddToCart = () => {
        dispatch(addToCart({
            productId: product.id,
            name: product.name,
            price: price,
            image: images[0],
            quantity: quantity,
            color: selectedColor
        }));
        // No toast as requested
    };

    const handleBuyNow = () => {
        navigate("/shop-preview/checkout");
    };

    const onMainAction = () => {
        if (!isInCart) {
            handleAddToCart();
        }
    };

    const handleUpdateQuantity = (newQty: number) => {
        if (!product) return;

        if (newQty < 1) {
            dispatch(removeFromCart({ productId: product.id, color: selectedColor }));
        } else {
            dispatch(updateQuantity({ productId: product.id, color: selectedColor, quantity: newQty }));
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">



            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-stone-100">
                        <img
                            src={images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            {images.slice(1).map((img, i) => (
                                <div key={i} className="aspect-square rounded-[2rem] overflow-hidden bg-stone-100">
                                    <img src={img} alt="Detail" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="lg:sticky lg:top-10 h-fit space-y-6 md:space-y-8 py-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-stone-500 text-sm font-medium uppercase tracking-wider">
                            <span>{(product as any).category?.name || 'General'}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-none text-stone-900">
                            {product.name}
                        </h1>
                        <p className="text-xl md:text-2xl font-medium text-stone-800">
                            ₹{price}
                        </p>
                    </div>

                    <div className="space-y-5">
                        <p className="text-stone-600 leading-relaxed text-base">
                            {product.description || "Experience the perfect blend of form and function. Crafted with precision and care, this item adds a touch of sophistication to your collection."}
                        </p>

                        {/* Variants (Mock for now or extract from features) */}
                        <div className="space-y-4">
                            <span className="text-sm font-bold uppercase tracking-wider text-stone-900">Variant</span>
                            <div className="flex flex-wrap gap-3">
                                {['Default'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${selectedColor === color
                                            ? 'bg-stone-900 text-white shadow-lg scale-105'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            onClick={onMainAction}
                            className="flex-1 rounded-full text-lg h-14 bg-stone-900 hover:bg-stone-800 text-white shadow-xl shadow-stone-900/10"
                        >
                            {isInCart ? "Buy Now" : `Add to Cart - ₹${price * quantity}`}
                        </Button>
                    </div>

                    {/* Features */}

                </div>
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="fixed bottom-4 inset-x-4 md:hidden z-40">
                {isInCart && (
                    <div className="flex items-center justify-between gap-3 h-16 rounded-full bg-stone-900 text-white pl-2 pr-2 shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
                        {/* Item Info */}
                        <div className="flex items-center gap-3 overflow-hidden" onClick={handleBuyNow}>
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 shrink-0">
                                <img src={cartItem?.image || images[0]} alt="Product" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-sm font-bold truncate leading-tight max-w-[100px]">{cartItem?.name || product.name}</span>
                                <span className="text-[10px] text-stone-400 font-medium">₹{cartItem?.price || price}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 bg-stone-800 rounded-full p-1 ml-auto shrink-0">
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleUpdateQuantity((cartItem?.quantity || 0) - 1); }}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-white hover:bg-stone-700 hover:text-white"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-sm w-6 text-center">{cartItem?.quantity}</span>
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleUpdateQuantity((cartItem?.quantity || 0) + 1); }}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-white hover:bg-stone-700 hover:text-white"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
