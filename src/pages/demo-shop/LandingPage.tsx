import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStoreProducts, useStoreCategories, useStoreDetails } from "@/api/ecommerce";
import { useAppDispatch } from "@/store/hooks";
import { useState, useMemo } from "react";
import { addToCart } from "@/store/slices/cartSlice";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop", // Minimalist Store
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2670&auto=format&fit=crop", // Fashion/Boutique
    "https://plus.unsplash.com/premium_photo-1680143216873-37cebec3f1bb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGdsYXNzJTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D", // Accessories/Glass
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2670&auto=format&fit=crop", // Home/Furniture
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2670&auto=format&fit=crop", // General Retail
];

const HERO_COPY = [
    { title: <>Redefine Your <br /><span className="text-orange-400 italic font-serif">Aesthetics</span></>, desc: "Curated essentials for the modern minimalist. Sustainable materials meets timeless design in our latest drop." },
    { title: <>Style for the <br /><span className="text-orange-400 italic font-serif">Modern</span> Soul</>, desc: "Discover our latest boutique collection. Effortless elegance for every occasion, designed to make you stand out." },
    { title: <>Crystal Clear <br /><span className="text-orange-400 italic font-serif">Precision</span></>, desc: "Premium glass and mirror solutions for your space. Exceptional quality meets master craftsmanship in every piece." },
    { title: <>Transform Your <br /><span className="text-orange-400 italic font-serif">Living Space</span></>, desc: "Artisanal furniture and decor that tells a story. Elevate your home with our consciously crafted winter collection." },
    { title: <>Quality You <br /><span className="text-orange-400 italic font-serif">Can Trust</span></>, desc: "Everything you need, all in one place. Explore our most-loved products across all categories with special deals." },
];

const LandingPage = () => {
    const { slug } = useParams();
    const { data: store, isLoading: storeLoading } = useStoreDetails(slug);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data: products, isLoading } = useStoreProducts(store?.id, selectedCategory || undefined);
    const { data: categories, isLoading: isCatLoading } = useStoreCategories(store?.id);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Helper for domain-aware links
    const getLink = (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return slug ? `/s/${slug}${cleanPath}` : cleanPath;
    };

    const scrollToProducts = () => {
        const element = document.getElementById("collection-section");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Select hero theme based on store name hash
    const themeIndex = useMemo(() => {
        if (!store?.name) return 0;
        const hash = store.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return hash % HERO_IMAGES.length;
    }, [store?.name]);

    const heroImage = HERO_IMAGES[themeIndex];
    const heroCopy = HERO_COPY[themeIndex];

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
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-r-stone-900" />
            </div>
        );
    }

    // Featured products for Carousel (limit to 5)
    const featuredProducts = products?.slice(0, 5) || [];

    return (
        <div className="space-y-6 md:space-y-10 pb-20">
            {/* Hero Section */}
            <section className="relative px-4 pt-4">
                <div className="container mx-auto px-0 md:px-0">
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-stone-900 text-white min-h-[400px] md:min-h-[500px] flex items-center">
                        <img
                            src={heroImage}
                            alt="Hero"
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="relative z-10 px-6 py-20 md:px-16 lg:px-20 max-w-3xl space-y-6 md:space-y-8 animate-in slide-in-from-bottom-10 duration-700 fade-in">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium tracking-wider border border-white/10 uppercase">
                                New Collection 2026
                            </span>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]">
                                {heroCopy.title}
                            </h1>
                            <p className="text-lg md:text-xl text-stone-200 max-w-lg leading-relaxed">
                                {heroCopy.desc}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button
                                    size="lg"
                                    onClick={scrollToProducts}
                                    variant="outline"
                                    className="rounded-full border-white text-white hover:bg-white/10 h-14 px-8 text-base backdrop-blur-sm w-full sm:w-auto bg-transparent"
                                >
                                    View Lookbook
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Carousel Section */}
            {featuredProducts.length > 0 && (
                <section className="container mx-auto px-4 py-8">
                    <div className="flex items-end justify-between mb-8 px-2">
                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Featured Picks</h2>
                            <p className="text-stone-500">Premium selection for your lifestyle.</p>
                        </div>
                    </div>

                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        plugins={[
                            Autoplay({
                                delay: 4000,
                            }) as any,
                        ]}
                        className="w-full relative group"
                    >
                        <CarouselContent className="-ml-4">
                            {featuredProducts.map((product) => (
                                <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                    <div
                                        onClick={() => navigate(getLink(`/product/${product.id}`))}
                                        className="relative aspect-[16/10] rounded-[2rem] overflow-hidden cursor-pointer group/item"
                                    >
                                        <img
                                            src={product.image_url || "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=800"}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6 text-white">
                                            <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                                            <p className="text-stone-300 text-sm font-serif">₹{product.online_price || product.sale_price}</p>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="hidden md:flex gap-2 absolute -top-12 right-2">
                            <CarouselPrevious className="static translate-y-0 h-10 w-10 border-stone-200 hover:bg-stone-100" />
                            <CarouselNext className="static translate-y-0 h-10 w-10 border-stone-200 hover:bg-stone-100" />
                        </div>
                    </Carousel>
                </section>
            )}

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
                            {uniqueCategories.map((cat) => (
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
            <section id="collection-section" className="container mx-auto px-4 scroll-mt-24">
                <div className="flex flex-col items-center text-center mb-10 space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Our Collection</h2>
                    <p className="text-stone-500 max-w-md mx-auto">Explore our full range of curated online products.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white p-2 rounded-2xl shadow-sm h-full flex flex-col">
                                <div className="aspect-[4/5] rounded-xl bg-stone-100 animate-pulse mb-3" />
                                <div className="space-y-2 px-1">
                                    <div className="h-2 w-1/3 bg-stone-100 rounded-full animate-pulse" />
                                    <div className="h-4 w-3/4 bg-stone-100 rounded-full animate-pulse" />
                                    <div className="h-3 w-1/4 bg-stone-100 rounded-full animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : products && products.length > 0 ? products.map((product) => (
                        <div onClick={() => navigate(getLink(`/product/${product.id}`))} key={product.id} className="group block h-full cursor-pointer">
                            <div className="bg-white p-2 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300 h-full border border-stone-50 flex flex-col">
                                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 shrink-0">
                                    <img
                                        src={product.image_url || "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=800"}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {(product.online_price || 0) < (product.sale_price || 0) && (
                                        <span className="absolute top-2 left-2 bg-white text-stone-900 text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                            Sale
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1 pt-3 px-1 flex-1">
                                    <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold truncate">
                                        {(product as any).category?.name || 'General'}
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base leading-tight text-stone-900 line-clamp-2 h-10 md:h-12">{product.name}</h3>
                                    <div className="font-serif text-lg md:text-xl text-stone-900 pb-1">
                                        ₹{product.online_price || product.sale_price || 0}
                                    </div>

                                    <Button
                                        size="sm"
                                        className="w-full rounded-full bg-stone-900 text-white hover:bg-stone-800 font-bold h-9 md:h-10 text-xs"
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

