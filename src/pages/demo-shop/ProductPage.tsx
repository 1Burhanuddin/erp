import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Heart, Minus, Plus, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { useEcommerceProduct, useStoreProducts, useStoreDetails } from "@/api/ecommerce";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, updateQuantity, removeFromCart } from "@/store/slices/cartSlice";

const ProductPage = () => {
    const { slug, id } = useParams();
    const { data: store } = useStoreDetails(slug);
    const { data: product, isLoading } = useEcommerceProduct(id || "");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const getLink = (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return slug ? `/s/${slug}${cleanPath}` : cleanPath;
    };
    const cartItems = useAppSelector(state => state.cart.items);
    const cartItem = cartItems.find(item => item.productId === id);
    const isInCart = !!cartItem;

    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("M");
    const [selectedColor, setSelectedColor] = useState("#333");

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-r-white" />
            </div>
        );
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Product not found</div>;
    }

    const price = product.online_price || product.sale_price || 0;
    const images: string[] = Array.isArray(product.images)
        ? (product.images as string[])
        : [product.image_url || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200"];

    const handleAddToCart = () => {
        dispatch(addToCart({
            productId: product.id,
            name: product.name,
            price: price,
            image: images[0],
            quantity: quantity,
            color: selectedColor
        }));
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
        <div className="bg-black min-h-screen pb-32">
            {/* Hero Image Section */}
            <section className="relative aspect-[3/4] md:aspect-video w-full overflow-hidden">
                <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </section>

            {/* Product Details Section - Straight Alignment */}
            <section className="px-6 -mt-10 relative z-20 space-y-8 pb-10">
                <div className="glass-dark rounded-[2.5rem] p-8 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                <Minus className="w-4 h-4 text-white/40 cursor-pointer" onClick={() => setQuantity(Math.max(1, quantity - 1))} />
                                <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                                <Plus className="w-4 h-4 text-white/40 cursor-pointer" onClick={() => setQuantity(quantity + 1)} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-yellow-500" />
                                <span className="text-sm font-bold">5.0</span>
                            </div>
                            <span className="text-white/40 text-sm">(1,502 reviews)</span>
                        </div>
                    </div>

                    <p className="text-white/60 text-sm leading-relaxed">
                        {product.description || "As simple and elegant shape makes it perfect for those of you who want minimal clothes. Read More..."}
                    </p>

                    {/* Size Selection */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold">Choose Size</h4>
                        <div className="flex gap-3">
                            {['S', 'M', 'L', 'XL'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-10 h-10 rounded-full border text-xs font-bold transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/10'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold">Color</h4>
                        <div className="flex gap-3">
                            {['#333', '#888', '#fff'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${selectedColor === color ? 'border-white' : 'border-transparent'}`}
                                >
                                    <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features/Trust */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-dark p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium">Authentic</span>
                    </div>
                    <div className="glass-dark p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                        <Truck className="w-6 h-6 text-purple-400" />
                        <span className="text-xs font-medium">Fast Ship</span>
                    </div>
                </div>
            </section>

            {/* Sticky Bottom Bar - Positioned where bottom nav used to be */}
            <div className="fixed bottom-8 left-0 right-0 px-6 z-40 pointer-events-none">
                <div className="glass-dark rounded-[2.5rem] h-20 px-4 flex items-center justify-between border-white/5 shadow-2xl pointer-events-auto max-w-lg mx-auto">
                    <div className="px-4">
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Price</p>
                        <p className="text-xl font-bold">₹{price * quantity}</p>
                    </div>
                    <Button
                        onClick={isInCart ? () => navigate(getLink('/checkout')) : handleAddToCart}
                        className="h-14 px-10 rounded-full bg-white text-black font-extrabold hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        {isInCart ? "Checkout" : "Add to Cart"}
                        <ShoppingBag className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
