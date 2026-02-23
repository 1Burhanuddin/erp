import { Button } from "@/components/ui/button";
import { Star, Search, SlidersHorizontal, Plus, Heart, ShoppingBag } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useStoreProducts, useStoreCategories, useStoreDetails } from "@/api/ecommerce";
import { useAppDispatch } from "@/store/hooks";
import { useState, useMemo } from "react";
import { addToCart } from "@/store/slices/cartSlice";

const LandingPage = () => {
    const { slug } = useParams();
    const { data: store, isLoading: storeLoading, error: storeError } = useStoreDetails(slug);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data: products, isLoading, error: productsError } = useStoreProducts(store?.id, selectedCategory || undefined);
    const { data: categories, isLoading: isCatLoading, error: categoriesError } = useStoreCategories(store?.id);

    if (storeError) console.error("LandingPage: Store details error:", storeError);
    if (productsError) console.error("LandingPage: Products error:", productsError);
    if (categoriesError) console.error("LandingPage: Categories error:", categoriesError);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const getLink = (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return slug ? `/s/${slug}${cleanPath}` : cleanPath;
    };

    const [searchQuery, setSearchQuery] = useState("");

    const uniqueCategories = useMemo(() => {
        if (!categories) return [];
        const seen = new Set();
        return categories.filter(cat => {
            const key = cat.name?.toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [categories]);

    const displayedProducts = useMemo(() => {
        if (!products) return [];
        if (!searchQuery.trim()) return products;

        const lowerQuery = searchQuery.toLowerCase().trim();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            (p.description && p.description.toLowerCase().includes(lowerQuery))
        );
    }, [products, searchQuery]);

    if (storeLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-r-white" />
            </div>
        );
    }

    return (
        <div className="pb-32 pt-6 px-6 md:px-12 lg:px-24 xl:px-32 max-w-[1920px] mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Area - Responsive Layout */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                {/* Greeting */}
                <div className="space-y-1">
                    <p className="text-white/40 text-sm md:text-base">Welcome to</p>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase">{store?.name || "Our Shop"}</h2>
                </div>

                {/* Search */}
                <div className="flex-1 w-full lg:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all focus:bg-white/10"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto gap-3 md:gap-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex items-center gap-2 px-6 py-3 md:py-4 rounded-2xl transition-all whitespace-nowrap text-sm font-bold ${selectedCategory === null ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    All Items
                </button>
                {isCatLoading ? (
                    [1, 2, 3, 4, 5].map(i => <div key={i} className="h-11 md:h-14 w-24 md:w-32 bg-white/5 rounded-2xl animate-pulse shrink-0" />)
                ) : (
                    uniqueCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-3 md:py-4 rounded-2xl transition-all whitespace-nowrap text-sm font-bold ${selectedCategory === cat.id ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                        >
                            {cat.name}
                        </button>
                    ))
                )}
            </div>

            {/* Product Grid - Responsive */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="space-y-4">
                            <div className="aspect-[3/4] rounded-[2rem] bg-white/5 animate-pulse" />
                            <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse" />
                            <div className="h-3 w-1/2 bg-white/5 rounded-full animate-pulse" />
                        </div>
                    ))
                ) : displayedProducts && displayedProducts.length > 0 ? displayedProducts.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => navigate(getLink(`/product/${product.id}`))}
                        className="space-y-4 group cursor-pointer"
                    >
                        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                            <img
                                src={product.image_url || "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=800"}
                                alt={product.name}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-80"
                            />
                            {/* Hover Overlay for Add to Cart on Large Screens */}
                            <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hidden lg:block z-10">
                                <Button
                                    className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] backdrop-blur-md"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(addToCart({
                                            productId: product.id,
                                            name: product.name,
                                            price: product.online_price || product.sale_price || 0,
                                            image: product.image_url || "",
                                            quantity: 1
                                        }));
                                    }}
                                >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-3 px-2">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-sm md:text-base line-clamp-2 leading-tight">{product.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] md:text-xs text-yellow-500 font-bold shrink-0 bg-yellow-500/10 px-2 py-1 rounded-full">
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <span>5.0</span>
                                </div>
                            </div>
                            <div className="space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
                                <span className="text-lg md:text-xl font-black tracking-tight">₹{product.online_price || product.sale_price || 0}</span>
                                {/* Mobile/Tablet Add to Cart (hidden on hover for large screens) */}
                                <Button
                                    className="w-full lg:hidden h-10 md:h-12 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white text-xs md:text-sm font-bold transition-colors hover:text-black"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(addToCart({
                                            productId: product.id,
                                            name: product.name,
                                            price: product.online_price || product.sale_price || 0,
                                            image: product.image_url || "",
                                            quantity: 1
                                        }));
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 text-center">
                        <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
                        <p className="text-white/40 text-lg font-medium">No products found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;

