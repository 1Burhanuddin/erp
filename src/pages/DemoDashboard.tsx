import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Users,
    Search,
    Bell,
    Plus,
    ArrowUpRight,
    MoreHorizontal,
    Clock,
    Calendar,
    Play,
    Pause,
    StopCircle,
    Video,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { cn } from "@/lib/utils";

// Dummy Data
const analyticsData = [
    { name: 'S', value: 35 },
    { name: 'M', value: 65 },
    { name: 'T', value: 55 },
    { name: 'W', value: 85 },
    { name: 'T', value: 45 },
    { name: 'F', value: 60 },
    { name: 'S', value: 50 },
];

const progressData = [
    { name: 'Completed', value: 41 },
    { name: 'Remaining', value: 59 },
];

const teamMembers = [
    { name: "Alexandra Deff", role: "Frontend Dev", status: "Completed", image: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { name: "Edwin Adenike", role: "UX Designer", status: "In Progress", image: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Isaac Oluwatemilorun", role: "Backend Dev", status: "Pending", image: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
    { name: "David Oshodi", role: "Product Manager", status: "In Progress", image: "https://i.pravatar.cc/150?u=a04258114e29026708c" },
];

const DemoDashboard = () => {
    return (
        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Plan, prioritize, and accomplish your tasks with ease.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-[#1e4620] hover:bg-[#1e4620]/90 rounded-full h-10 px-6">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                    </Button>
                    <Button variant="outline" className="rounded-full h-10 px-6 border-slate-200">
                        Import Data
                    </Button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Projects - Feature Card */}
                <Card className="p-6 bg-[#1e4620] text-white rounded-[2rem] border-0 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-white/80 font-medium">Total Projects</span>
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <ArrowUpRight className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">24</h2>
                        <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                            <span className="bg-emerald-400/20 text-emerald-300 px-1 rounded">5+</span>
                            <span className="text-white/80">Increased from last month</span>
                        </div>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                </Card>

                {/* Ended Projects */}
                <Card className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-muted-foreground font-medium">Ended Projects</span>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <ArrowUpRight className="h-4 w-4 text-slate-600" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">10</h2>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">6+</span>
                        <span className="text-muted-foreground">Increased from last month</span>
                    </div>
                </Card>

                {/* Running Projects */}
                <Card className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-muted-foreground font-medium">Running Projects</span>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <ArrowUpRight className="h-4 w-4 text-slate-600" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">12</h2>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">2+</span>
                        <span className="text-muted-foreground">Increased from last month</span>
                    </div>
                </Card>

                {/* Pending Projects */}
                <Card className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-muted-foreground font-medium">Pending Project</span>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <ArrowUpRight className="h-4 w-4 text-slate-600" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">2</h2>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-orange-500 font-semibold">• On Discuss</span>
                    </div>
                </Card>
            </div>

            {/* Main Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column (Analytics & Collaboration) - Spans 8 cols */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Analytics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project Analytics Graph */}
                        <Card className="p-6 rounded-[2rem] border-0 shadow-sm md:col-span-2 lg:col-span-1 xl:col-span-1">
                            <h3 className="font-semibold mb-6">Project Analytics</h3>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData}>
                                        <Bar
                                            dataKey="value"
                                            radius={[50, 50, 50, 50]}
                                            barSize={32}
                                        >
                                            {analyticsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1e4620' : '#86efac'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-between mt-2 px-2 text-xs text-muted-foreground font-medium">
                                {analyticsData.map(d => <span key={d.name}>{d.name}</span>)}
                            </div>
                        </Card>

                        {/* Reminders & Project Card */}
                        <div className="space-y-6">
                            {/* Reminders */}
                            <Card className="p-6 rounded-[2rem] border-0 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold">Reminders</h3>
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-lg">Meeting with Arc Company</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Time: 02.00 pm - 04.00 pm</p>
                                    <Button className="w-full mt-4 bg-[#1e4620] hover:bg-[#1e4620]/90 rounded-xl h-12">
                                        <Video className="h-4 w-4 mr-2" />
                                        Start Meeting
                                    </Button>
                                </div>
                            </Card>

                            {/* Project Mini List */}
                            <Card className="p-6 rounded-[2rem] border-0 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold">Project</h3>
                                    <Button size="sm" variant="outline" className="h-7 text-xs rounded-full">+ New</Button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Develop API Endpoints</p>
                                            <p className="text-[10px] text-muted-foreground">Due date: Nov 26, 2024</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Onboarding Flow</p>
                                            <p className="text-[10px] text-muted-foreground">Due date: Nov 28, 2024</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Team Collaboration */}
                    <Card className="p-6 rounded-[2rem] border-0 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold">Team Collaboration</h3>
                            <Button size="sm" variant="outline" className="rounded-full">+ Add Member</Button>
                        </div>
                        <div className="space-y-4">
                            {teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarImage src={member.image} />
                                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{member.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                Working on <span className="text-primary font-medium">{member.role}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={cn(
                                        "rounded-full px-3 font-normal",
                                        member.status === "Completed" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                                            member.status === "In Progress" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                                                "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                    )}>{member.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column (Progress & Time Tracker) - Spans 4 cols */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Project Progress Donut */}
                    <Card className="p-6 rounded-[2rem] border-0 shadow-sm flex flex-col items-center justify-center relative min-h-[300px]">
                        <h3 className="font-semibold absolute top-6 left-6">Project Progress</h3>
                        <div className="h-[200px] w-[200px] mt-8 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={progressData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={180}
                                        endAngle={0}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#1e4620" />
                                        <Cell fill="#e2e8f0" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 text-center">
                                <p className="text-4xl font-bold">41%</p>
                                <p className="text-xs text-muted-foreground mt-1">Project Ended</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 w-full mt-4 text-xs font-medium md:px-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#1e4620]" />
                                <span>Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#1e4620]" />
                                <span>In Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-slate-300" />
                                <span>Pending</span>
                            </div>
                        </div>
                    </Card>

                    {/* Time Tracker */}
                    <Card className="p-6 rounded-[2rem] border-0 shadow-sm bg-[#0f2410] text-white relative overflow-hidden min-h-[200px]">
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

                        <h3 className="font-medium text-white/80 z-10 relative">Time Tracker</h3>

                        <div className="mt-8 z-10 relative">
                            <p className="text-5xl font-mono font-bold tracking-wider">01:24:08</p>
                        </div>

                        <div className="flex items-center gap-4 mt-8 z-10 relative">
                            <Button size="icon" className="h-12 w-12 rounded-full bg-white text-[#0f2410] hover:bg-white/90">
                                <Pause className="h-5 w-5 fill-current" />
                            </Button>
                            <Button size="icon" className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white border-4 border-[#0f2410]">
                                <StopCircle className="h-5 w-5 fill-current" />
                            </Button>
                        </div>

                        {/* Decorative wave/lines at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
                            <svg viewBox="0 0 1440 320" className="h-full w-full" preserveAspectRatio="none">
                                <path fill="#ffffff" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default DemoDashboard;
