
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, LayoutDashboard, BarChart3, Users, Building2 } from "lucide-react";

const ERPLandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span>ERP Soft</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <a href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</a>
                        <a href="#benefits" className="transition-colors hover:text-foreground/80 text-foreground/60">Benefits</a>
                        <a href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                            Login
                        </Button>
                        <Button size="sm" onClick={() => navigate("/dashboard")}>
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                    <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium">
                                The Ultimate Business OS
                            </span>
                        </motion.div>
                        <motion.h1
                            className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Manage your entire business <br className="hidden md:block" />
                            <span className="text-primary">in one place.</span>
                        </motion.h1>
                        <motion.p
                            className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Streamline operations, boost productivity, and drive growth with our all-in-one ERP solution.
                            Inventory, Sales, HR, and Accounting — unified.
                        </motion.p>
                        <motion.div
                            className="space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Button size="lg" className="h-11 px-8 rounded-full" onClick={() => navigate("/auth")}>
                                Get Started <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-11 px-8 rounded-full">
                                Book a Demo
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Video Showcase Section */}
                <section className="container pb-8 md:pb-12 lg:pb-24">
                    <div className="mx-auto max-w-[64rem] relative rounded-3xl overflow-hidden shadow-2xl border bg-slate-900 aspect-video flex items-center justify-center group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                        {/* Video Content */}
                        <div className="relative w-full h-full">
                            <img
                                src="/assets/erp-demo.webp"
                                alt="ERP Demo Walkthrough"
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                            />

                            {/* Overlay Play Button (Decorative since WebP autoplays) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                                    <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1 text-white">
                                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Caption Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-white">See it in action</h3>
                                    <p className="text-white/80">Watch how ERP Soft transforms your workflow</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="container space-y-6 bg-slate-50 dark:bg-transparent py-8 md:py-12 lg:py-24 rounded-3xl my-8">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                            Features packed for growth
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            Everything you need to run your business efficiently, from procurement to final sale.
                        </p>
                    </div>
                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                        <FeatureCard
                            icon={LayoutDashboard}
                            title="Command Center"
                            description="Real-time dashboard with actionable insights and key performance indicators."
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Analytics"
                            description="Deep dive into sales trends, expense reports, and profit margins."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Team Management"
                            description="Manage employees, track attendance, and assign tasks effortlessly."
                        />
                        <FeatureCard
                            icon={CheckCircle2}
                            title="Inventory Control"
                            description="Track stock levels, manage warehouses, and automate reordering."
                        />
                        <FeatureCard
                            icon={Building2}
                            title="Multi-Store Support"
                            description="Manage multiple branches or franchise locations from a single account."
                        />
                        <FeatureCard
                            icon={ArrowRight}
                            title="And much more..."
                            description="POS, GST Billing, CRM, and extensive reporting tools."
                        />
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container py-8 md:py-12 lg:py-24">
                    <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 md:px-12 md:py-32 text-center shadow-2xl">
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
                                Ready to transform your business?
                            </h2>
                            <p className="max-w-[42rem] text-lg text-primary-foreground/80">
                                Join thousands of businesses that trust our ERP to handle their daily operations.
                            </p>
                            <Button size="lg" variant="secondary" className="h-12 px-8 text-lg rounded-full" onClick={() => navigate("/auth")}>
                                Start Free Trial
                            </Button>
                        </div>
                        {/* Abstract Background Shapes */}
                        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    </div>
                </section>
            </main>

            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © 2026 ERP Soft. All rights reserved.
                    </p>
                    <div className="flex text-sm text-muted-foreground gap-4">
                        <a href="#" className="hover:underline">Terms</a>
                        <a href="#" className="hover:underline">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="relative overflow-hidden rounded-xl border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-lg p-6 hover:bg-muted/50 transition-colors">
                <Icon className="h-8 w-8 text-primary" />
                <div className="space-y-2">
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}

export default ERPLandingPage;
