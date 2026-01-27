import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStoreProducts, useStoreCategories } from "@/api/ecommerce";
import { useAppDispatch } from "@/store/hooks";
import { useState } from "react";
import { addToCart } from "@/store/slices/cartSlice";

const LandingPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data: products, isLoading } = useStoreProducts(selectedCategory || undefined);
    const { data: categories, isLoading: isCatLoading } = useStoreCategories();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Filter or Limit products for "Trending"
    const trendingProducts = products?.slice(0, 3) || [];

    return (
        <div className="space-y-6 md:space-y-10 pb-20">
            {/* Hero Section */}
            <section className="relative px-4 pt-4">
                <div className="container mx-auto px-0 md:px-0">
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-stone-900 text-white min-h-[400px] md:min-h-[500px] flex items-center">
                        <img
                            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop"
                            alt="Hero"
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="relative z-10 px-6 py-20 md:px-16 lg:px-20 max-w-3xl space-y-6 md:space-y-8 animate-in slide-in-from-bottom-10 duration-700 fade-in">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium tracking-wider border border-white/10 uppercase">
                                New Collection 2026
                            </span>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]">
                                Redefine Your <br />
                                <span className="text-orange-400 italic font-serif">Aesthetics</span>
                            </h1>
                            <p className="text-lg md:text-xl text-stone-200 max-w-lg leading-relaxed">
                                Curated essentials for the modern minimalist. Sustainable materials meets timeless design in our latest drop.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to={`/shop-preview/product/${products?.[0]?.id || ''}`}>
                                    <Button size="lg" className="rounded-full bg-white text-stone-900 hover:bg-stone-100 h-14 px-8 text-base shadow-xl shadow-white/10 w-full sm:w-auto">
                                        Shop Latest
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10 h-14 px-8 text-base backdrop-blur-sm w-full sm:w-auto bg-transparent">
                                    View Lookbook
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Categories - Horizontal Scroll Pills */}
            <section className="container mx-auto px-4 py-2">
                <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth snap-x items-center min-h-[80px]">
                    {isCatLoading ? (
                        [1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-24 bg-white rounded-full shadow-sm animate-pulse flex-shrink-0" />)
                    ) : (
                        <>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`flex-shrink-0 snap-start px-6 py-3 rounded-full shadow-md border border-stone-100 transition-all text-sm font-bold whitespace-nowrap ${selectedCategory === null ? 'bg-stone-900 text-white shadow-lg scale-105' : 'bg-white hover:bg-stone-100'}`}
                            >
                                All
                            </button>
                            {categories?.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex-shrink-0 snap-start px-6 py-3 rounded-full shadow-md border border-stone-100 transition-all text-sm font-bold whitespace-nowrap ${selectedCategory === cat.id ? 'bg-stone-900 text-white shadow-lg scale-105' : 'bg-white hover:bg-stone-100'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </section>

            {/* Trending Products */}
            <section className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-10 space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Trending Now</h2>
                    <p className="text-stone-500 max-w-md mx-auto">Handpicked favorites from our community.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-3 rounded-3xl shadow-sm h-full">
                                <div className="aspect-[4/5] rounded-2xl bg-stone-100 animate-pulse mb-4" />
                                <div className="space-y-2 px-2">
                                    <div className="h-3 w-1/3 bg-stone-100 rounded-full animate-pulse" />
                                    <div className="h-6 w-3/4 bg-stone-100 rounded-full animate-pulse" />
                                    <div className="h-5 w-1/4 bg-stone-100 rounded-full animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : trendingProducts.length > 0 ? trendingProducts.map((product) => (
                        <div onClick={() => navigate(`/shop-preview/product/${product.id}`)} key={product.id} className="group block h-full cursor-pointer pb-2">
                            <div className="bg-white p-3 rounded-3xl shadow-sm group-hover:shadow-lg transition-all duration-500 h-full border border-stone-50 flex flex-col">
                                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                                    <img
                                        src={product.image_url || "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=800"}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {(product.online_price || 0) < (product.sale_price || 0) && (
                                        <span className="absolute top-3 left-3 bg-white text-stone-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                            Sale
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5 pt-4 px-2 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-stone-400 uppercase tracking-widest font-semibold">{(product as any).category?.name || 'General'}</div>
                                    </div>
                                    <h3 className="font-bold text-xl leading-tight text-stone-900 truncate">{product.name}</h3>
                                    <div className="font-serif text-2xl text-stone-900 pb-2">
                                        ₹{product.online_price || product.sale_price || 0}
                                    </div>

                                    <Button
                                        className="w-full rounded-full bg-stone-900 text-white hover:bg-stone-800 font-bold h-12 shadow-lg"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(addToCart({
                                                productId: product.id,
                                                name: product.name,
                                                price: product.online_price || product.sale_price || 0,
                                                image: product.image_url || "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=800",
                                                quantity: 1,
                                                color: "Default"
                                            }));
                                        }}
                                    >
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-20 text-stone-500">
                            No products found online. Check back soon!
                        </div>
                    )}
                </div>
            </section>


        </div>
    );
};

export default LandingPage;

