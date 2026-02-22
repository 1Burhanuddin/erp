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

    if (storeLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-r-white" />
            </div>
        );
    }

    return (
        <div className="pb-32 pt-6 px-6 space-y-8 animate-in fade-in duration-700">
            {/* Greeting & Search */}
            <div className="space-y-6">
                <div className="space-y-1">
                    <p className="text-white/40 text-sm">Welcome to</p>
                    <h2 className="text-2xl font-bold tracking-tight">{store?.name || "Our Shop"}</h2>
                </div>

                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto gap-3 no-scrollbar -mx-6 px-6">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all whitespace-nowrap text-sm font-medium ${selectedCategory === null ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    All Items
                </button>
                {isCatLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-11 w-24 bg-white/5 rounded-2xl animate-pulse" />)
                ) : (
                    uniqueCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-3 rounded-2xl transition-all whitespace-nowrap text-sm font-medium ${selectedCategory === cat.id ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                        >
                            {cat.name}
                        </button>
                    ))
                )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[3/4] rounded-[2rem] bg-white/5 animate-pulse" />
                            <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse" />
                            <div className="h-3 w-1/2 bg-white/5 rounded-full animate-pulse" />
                        </div>
                    ))
                ) : products && products.length > 0 ? products.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => navigate(getLink(`/product/${product.id}`))}
                        className="space-y-3 group cursor-pointer"
                    >
                        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-white/5 border border-white/10">
                            <img
                                src={product.image_url || "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=800"}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm line-clamp-1">{product.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <span>5.0</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-lg font-bold">₹{product.online_price || product.sale_price || 0}</span>
                                <Button
                                    className="flex-1 h-10 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold"
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
                    <div className="col-span-full py-20 text-center text-white/40">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;

