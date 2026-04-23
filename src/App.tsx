import React, { useState, useEffect, useMemo } from 'react';
import { 
  Linkedin,
  Facebook,
  Github,
  Search, 
  Briefcase, 
  Globe, 
  Clock, 
  ExternalLink, 
  LayoutGrid, 
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  Rss,
  Eye,
  X,
  Menu,
  Sun,
  Moon,
  Bell,
  BellOff,
  Heart,
  Share2,
  Trash2,
  Copy,
  Check,
  LogIn,
  LogOut,
  User as UserIcon,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Building2,
  Plus,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Users,
  MessageCircle,
  Send,
  Minimize2,
  Database,
  CreditCard,
  ArrowLeft
} from 'lucide-react';

import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from 'react-markdown';

import { 
  createJobAlert, 
  saveJob, 
  unsaveJob, 
  getSavedJobs, 
  getAlertsByEmail, 
  deleteAlert, 
  onAuthStateChanged, 
  signInWithGoogle, 
  signOutUser,
  auth,
  User,
  createJobPosting,
  getJobPostings,
  updateJobPosting,
  deleteJobPosting,
  JobPosting,
  trackJobActivity,
  getJobAnalytics,
  JobAnalytics,
  submitVibeCheck,
  getCompanyVibe,
  submitSupportTicket,
  UserProfile,
  getUserProfile,
  updateUserProfile
} from './lib/firebase';

interface Job {
  id: string;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  jobIndustry: string;
  jobType: string[] | string;
  jobGeo: string;
  jobLevel?: string;
  pubDate: string;
  jobExcerpt: string;
  jobDescription: string;
  jobCategory: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  isFeatured?: boolean;
}


// --- BRANDING & CONFIG ---
const BRAND_CONFIG = {
  name: "PassionWork",
  tagline: "Turn your passion into a job.",
  description: "The premier platform for high-vibe remote specialists.",
  supportEmail: "hello@passionwork.io",
  socials: {
    linkedin: "https://www.linkedin.com/company/passionwork/",
    facebook: "https://web.facebook.com/profile.php?id=61566100725535",
    github: "https://github.com/farisidon/PassionWork"
  }
};

const INTERESTS = [
  { id: 'all', label: 'All Opportunities', icon: <LayoutGrid size={16} /> },
  { id: 'design', label: 'Creative & Design', category: 'design', icon: '🎨' },
  { id: 'programming', label: 'Tech & Engineering', category: 'programming', icon: '💻' },
  { id: 'marketing', label: 'Marketing & Growth', category: 'marketing', icon: '📈' },
  { id: 'copywriting', label: 'Content & Copy', category: 'copywriting', icon: '✍️' },
  { id: 'support', label: 'Support & Success', category: 'customer-support', icon: '🎧' },
  { id: 'finance', label: 'Finance & Accounting', category: 'accounting-finance', icon: '💰' },
  { id: 'business', label: 'Business & Ops', category: 'business', icon: '💼' },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: `Hey! I'm your ${BRAND_CONFIG.name} Career Advisor. How can I help you today?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMsg = inputValue.trim();
    setMsgs(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await response.json();
      setMsgs(prev => [...prev, { role: 'bot', text: data.text || "I couldn't process that. Try again?" }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMsgs(prev => [...prev, { role: 'bot', text: "Connection error. Try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, y: 50, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-2.5rem)] bg-surface border border-border rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[750px] max-h-[calc(100vh-6rem)]"
          >
            <div className="p-6 bg-primary text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-x-10 -translate-y-16 blur-3xl" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight leading-none mb-1">Career Advisor</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-2xl transition-colors relative z-10"
              >
                <Minimize2 size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-bg/20">
              {msgs.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-[1.25rem] text-sm leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none font-semibold' 
                      : 'bg-surface border border-border text-text rounded-tl-none font-medium'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border p-4 rounded-[1.25rem] rounded-tl-none flex gap-1 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-surface border-t border-border">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..." 
                  className="w-full bg-bg border border-border rounded-[1.25rem] px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pr-14 font-medium"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-1.5 p-3.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all active:scale-90 disabled:opacity-20 shadow-lg shadow-primary/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-[0_15px_40px_rgba(var(--primary-rgb),0.3)] transition-all active:scale-90 relative group ${
          isOpen ? 'bg-surface text-primary border border-border rotate-90 shadow-xl' : 'bg-primary text-white hover:scale-105 hover:rotate-3'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <>
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 border-[3px] border-white dark:border-bg rounded-full flex items-center justify-center animate-bounce shadow-lg">
               <Sparkles size={10} className="text-white fill-white" />
            </div>
            <div className="absolute inset-0 rounded-[1.25rem] border-[3px] border-primary animate-ping opacity-20 pointer-events-none" />
          </>
        )}
        <div className="absolute right-16 bg-surface border border-border px-4 py-2 rounded-xl text-[10px] font-black text-text invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all shadow-xl whitespace-nowrap translate-x-3 group-hover:translate-x-0 border-b-[3px] border-b-primary/10 tracking-tight uppercase">
           Career Advisor
        </div>
      </button>
    </div>
  );
};

const Logo = ({ className = "text-xl" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-9 h-9 md:w-11 md:h-11 bg-primary rounded-[1.25rem] flex items-center justify-center transform group-hover:rotate-[12deg] transition-all duration-500 shadow-xl shadow-primary/20 hover:shadow-primary/40">
      <Briefcase className="text-white" size={22} />
    </div>
    <span className="font-bold tracking-tighter text-text">{BRAND_CONFIG.name}</span>
  </div>
);

const HireGraphic = () => (
  <div className="w-full aspect-[16/9] bg-gradient-to-br from-indigo-600 to-primary rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-2xl relative overflow-hidden p-8 border-4 border-white/10">
    <div className="absolute top-0 right-0 p-6 opacity-10">
      <Zap size={200} fill="currentColor" />
    </div>
    <div className="relative z-10 text-center">
      <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block border border-white/20">
        Featured Placement
      </div>
      <h1 className="text-7xl font-black tracking-tighter mb-2 drop-shadow-2xl">HIRE</h1>
      <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Global Talent Network</p>
    </div>
    <div className="absolute bottom-6 left-6 flex items-center gap-2">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Merchant</span>
    </div>
  </div>
);

const CompanyLogo = ({ name, className = "w-12 h-12 rounded-xl" }: { name: string, className?: string, src?: string, category?: string }) => {
  const seed = name ? encodeURIComponent(name.toLowerCase().trim().replace(/\s+/g, '-')) : 'company';
  
  // High-fidelity background colors based on name strings to ensure consistency
  const colors = [
    'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'bg-pink-500/10 text-pink-600 border-pink-500/20',
    'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'bg-teal-500/10 text-teal-600 border-teal-500/20',
    'bg-sky-500/10 text-sky-600 border-sky-500/20'
  ];
  
  const colorIndex = Math.abs(seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div className={`flex items-center justify-center border shrink-0 font-black tracking-tighter ${colorClass} ${className} relative overflow-hidden group shadow-sm`}>
      <span className="relative z-10 transition-transform group-hover:scale-110 duration-500 text-lg">
        {name ? name.charAt(0).toUpperCase() : '?'}
      </span>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-current via-transparent to-transparent" />
    </div>
  );
};

const ActivityTicker = () => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const activities = [
    { name: "Someone in Berlin", action: "just applied to", target: "Lead Designer at Buffer", icon: <Target size={14} className="text-primary" /> },
    { name: "A user in Tokyo", action: "saved", target: "Senior Engineer at Vercel", icon: <Heart size={14} className="text-red-500" /> },
    { name: "New hire in London", action: "joined", target: "Marketing Team at Stripe", icon: <Users size={14} className="text-blue-500" /> },
    { name: "Someone in NYC", action: "just viewed", target: "Staff Developer at GitHub", icon: <Eye size={14} className="text-green-500" /> },
    { name: "Pro member", action: "set an alert for", target: "Product Manager roles", icon: <Bell size={14} className="text-amber-500" /> },
  ];

  useEffect(() => {
    const showNext = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setIndex(prev => (prev + 1) % activities.length);
      }, 6000); // Show for 6s
    };

    // Initial show after 4s
    const startTimer = setTimeout(showNext, 4000);
    
    // Cycle every 35s (generous silent period)
    const cycle = setInterval(showNext, 35000);
    
    return () => {
      clearTimeout(startTimer);
      clearInterval(cycle);
    };
  }, [activities.length]);

  return (
    <div className="fixed top-24 right-6 z-[80] hidden lg:block pointer-events-none transition-opacity">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
            className="bg-surface border border-border px-3 py-2 rounded-2xl shadow-lg flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-lg bg-bg flex items-center justify-center shrink-0 border border-border/40">
              {activities[index].icon}
            </div>
            <div className="text-[9px] font-bold tracking-tight">
              <span className="text-text inline-block mr-1">{activities[index].name}</span>
              <span className="text-text-muted font-normal">{activities[index].action} </span>
              <span className="text-primary">{activities[index].target}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmployerPostStats = ({ job, stats, loading }: { job: Job | null, stats: JobAnalytics | null, loading: boolean }) => {
  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
       <Loader2 size={48} className="text-primary animate-spin mb-4" />
       <h2 className="text-xl font-bold tracking-tight">Loading performance data...</h2>
    </div>
  );

  if (!job) return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
       <XCircle size={48} className="text-red-500 mb-4" />
       <h2 className="text-xl font-bold tracking-tight">Job not found</h2>
       <p className="text-text-muted mt-2">The metrics link you followed appears to be invalid or expired.</p>
    </div>
  );

  const conversionRate = stats && stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) : '0';

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">
             <TrendingUp size={16} /> Performance Insights
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text mb-4">
             {job.jobTitle}
          </h1>
          <div className="flex items-center gap-3">
             <CompanyLogo src={job.companyLogo} name={job.companyName} category={job.jobIndustry} className="w-10 h-10 rounded-xl" />
             <p className="text-lg font-bold text-text-muted">{job.companyName}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-xl shadow-bg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <Eye size={80} />
            </div>
            <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Quick Views</p>
            <p className="text-5xl font-black tracking-tight text-text">{stats?.views || 0}</p>
            <p className="text-[10px] font-bold text-text-muted mt-4">Total modal impressions</p>
          </div>
          <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-xl shadow-bg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <ExternalLink size={80} />
            </div>
            <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Apply Clicks</p>
            <p className="text-5xl font-black tracking-tight text-primary">{stats?.clicks || 0}</p>
            <p className="text-[10px] font-bold text-text-muted mt-4">"Apply for this role" intent</p>
          </div>
          <div className="bg-primary text-white p-8 rounded-[2rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
               <Target size={80} fill="currentColor" />
            </div>
            <p className="text-xs font-black opacity-60 uppercase tracking-widest mb-4">Conversion</p>
            <p className="text-5xl font-black tracking-tight">{conversionRate}%</p>
            <p className="text-[10px] font-bold opacity-60 mt-4">Clicks per unique view</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-surface border border-border p-8 rounded-[2rem]">
              <h3 className="text-sm font-black uppercase tracking-widest text-text mb-6">Traffic Analysis</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide">
                       <span>Visibility Score</span>
                       <span className="text-primary">{(stats?.views || 0) > 100 ? 'High' : 'Market Normal'}</span>
                    </div>
                    <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stats?.views || 0) / 5, 100)}%` }}
                        className="h-full bg-primary" 
                       />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide">
                       <span>Engagement Intent</span>
                       <span className="text-amber-500">{parseFloat(conversionRate) > 10 ? 'Exceptional' : 'Standard'}</span>
                    </div>
                    <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(parseFloat(conversionRate) * 5, 100)}%` }}
                        className="h-full bg-amber-500" 
                       />
                    </div>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border">
                 <p className="text-xs text-text-muted leading-relaxed italic">
                   💡 PassionWork Tip: If your conversion is below 5%, consider shortening your job summary or highlighting key remote benefits first.
                 </p>
              </div>
           </div>

           <div className="bg-bg border border-border p-8 rounded-[2rem] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                 <Briefcase size={32} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text mb-2">Live Listing</h3>
              <p className="text-xs text-text-muted mb-6 leading-relaxed">This listing is currently active and receiving real-time interest from the global PassionWork community.</p>
              <div className="flex gap-4">
                 <a 
                  href={`?jobId=${job.id}`}
                  className="px-6 py-2 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all"
                 >
                   View Live
                 </a>
                 <button 
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-bg border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all"
                 >
                   Export PDF
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const DailyPulse = ({ data, loading, onSelectJob, userBio }: any) => {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
           <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
           <div className="relative bg-surface border border-primary/20 rounded-full w-full h-full flex items-center justify-center">
              <Sparkles className="text-primary animate-pulse" size={32} />
           </div>
        </div>
        <h2 className="text-2xl font-black text-text mb-2">Syncing your Daily Pulse...</h2>
        <p className="text-text-muted text-sm max-w-xs mx-auto italic">Our AI is analyzing the global remote market against your unique passion profile.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">Live Pulse</div>
          <span className="text-xs font-bold text-text-muted">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <h1 className="text-5xl lg:text-8xl font-black text-text tracking-tighter mb-8 leading-[0.85]">
          <span className="font-bold block lg:inline mr-4">Hello,</span>
          {data.greeting}
        </h1>
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-accent/50 to-bg border border-primary/5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <TrendingUp size={120} />
          </div>
          <p className="text-lg lg:text-xl font-bold text-primary leading-relaxed relative z-10">
            "{data.recommendation}"
          </p>
        </div>
      </header>

      <section className="mb-12">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-8 flex items-center gap-2">
          <Star size={16} className="text-amber-500" /> Today's Gold Medal Matches
        </h3>
        <div className="grid gap-4">
          {data.topJobs.map((job: any) => (
            <div 
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="group bg-surface border border-border p-6 rounded-3xl hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer flex items-center gap-6"
            >
              <CompanyLogo src={job.companyLogo} name={job.companyName} category={job.jobIndustry} className="w-16 h-16 rounded-2xl" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xl font-black text-text group-hover:text-primary transition-all truncate">{job.jobTitle}</h4>
                <div className="flex items-center gap-3 text-sm font-bold text-text-muted">
                  <span>{job.companyName}</span>
                  <span className="w-1 h-1 bg-text-muted rounded-full opacity-30 px-0" />
                  <span className="text-primary">{job.jobGeo}</span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-2">
                 <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">AI Match</div>
                 <ArrowRight size={20} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {!userBio && (
        <div className="bg-surface border border-border p-8 rounded-[2rem] text-center border-dashed">
          <p className="text-sm font-bold text-text-muted mb-4">Want even better daily matches?</p>
          <button 
            className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
          >
            Update Your Passion Profile →
          </button>
        </div>
      )}
    </div>
  );
};

const VibeCheckModal = ({ company, scores, setScores, onSubmit, onClose, loading }: any) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-text/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden p-8 lg:p-12"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
              <TrendingUp size={14} /> Culture Verification
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-text">Vibe-Check: {company}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-xl text-text-muted transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-black text-text italic">Async Maturity</label>
                <span className="text-xs font-bold text-primary bg-accent px-2 py-0.5 rounded-full">{scores.asyncScore}/5</span>
              </div>
              <p className="text-[10px] text-text-muted mb-4 leading-relaxed">Does the team favor written docs over "quick calls" and Slack pings?</p>
              <input 
                type="range" min="1" max="5" step="1" 
                value={scores.asyncScore}
                onChange={(e) => setScores({ ...scores, asyncScore: parseInt(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-bg rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-black text-text italic">Meeting Density</label>
                <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">{scores.meetingScore}/5</span>
              </div>
              <p className="text-[10px] text-text-muted mb-4 leading-relaxed">Scale: 1 = Calendar is a graveyard. 5 = Deep work is respected above all.</p>
              <input 
                type="range" min="1" max="5" step="1" 
                value={scores.meetingScore}
                onChange={(e) => setScores({ ...scores, meetingScore: parseInt(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-bg rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-black text-text italic">Borderless Hiring</label>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{scores.borderlessScore}/5</span>
              </div>
              <p className="text-[10px] text-text-muted mb-4 leading-relaxed">Do they hire "anywhere" or just in restricted, timezone-locked hubs?</p>
              <input 
                type="range" min="1" max="5" step="1" 
                value={scores.borderlessScore}
                onChange={(e) => setScores({ ...scores, borderlessScore: parseInt(e.target.value) })}
                className="w-full accent-green-600 h-1.5 bg-bg rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Submit Vibe-Check</>}
            </button>
            <p className="text-[10px] text-center text-text-muted mt-4 opacity-60">Your rating is anonymous and helps thousands of other remote hunters.</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

const AuthModal = ({ isOpen, onClose, onSignIn }: AuthModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-bg/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface border border-border w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Zap size={140} />
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-bg rounded-xl text-text-muted transition-colors">
          <X size={20} />
        </button>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <UserIcon size={32} />
          </div>
          <h2 className="text-3xl font-black text-text mb-2 tracking-tight">Welcome to PassionWork</h2>
          <p className="text-sm text-text-muted mb-10 leading-relaxed font-medium">
            Join 12,000+ remote specialists. One single account for saved jobs, pulse alerts, and your public passion profile.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => {
                onSignIn();
                onClose();
              }}
              className="w-full py-4 bg-text text-bg font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
            >
              <LogIn size={20} />
              Continue with Google
            </button>
            
            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-border flex-1 opacity-50" />
              <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Secure Auth</span>
              <div className="h-px bg-border flex-1 opacity-50" />
            </div>

            <p className="text-[10px] text-text-muted font-bold leading-relaxed px-4">
              By continuing, you're creating a PassionWork identity. We'll use Gmail to securely verify your profile and sync your activity across devices.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  user: User | null;
  userProfile: UserProfile | null;
  handleSignIn: () => void;
  signOutUser: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setDebouncedSearchTerm: (term: string) => void;
  isCopying: boolean;
  handleCopyLink: () => void;
  savedJobIdsCount: number;
  setShowSavedModal: (show: boolean) => void;
  isAdmin: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
}

const Navbar = ({ 
  currentView, 
  setCurrentView, 
  user, 
  userProfile,
  handleSignIn, 
  signOutUser, 
  isDarkMode, 
  setIsDarkMode,
  searchTerm,
  setSearchTerm,
  setDebouncedSearchTerm,
  isCopying,
  handleCopyLink,
  savedJobIdsCount,
  setShowSavedModal,
  isAdmin,
  setIsSidebarOpen,
  isSidebarOpen 
}: NavbarProps) => (
  <nav className="h-20 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-xl border-b border-border z-[100] shrink-0 sticky top-0">
    <div className="flex items-center gap-4 lg:gap-12">
      {(currentView === 'dashboard' || currentView === 'pulse') && (
        <button 
          className="lg:hidden p-2 hover:bg-bg rounded-xl text-text-muted transition-colors"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={20} />
        </button>
      )}
      
      <button onClick={() => setCurrentView('landing')} className="group transition-all flex items-center gap-2">
        <Logo className="text-xl md:text-2xl font-bold tracking-tighter" />
      </button>

      <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
        <button 
          onClick={() => setCurrentView('dashboard')} 
          className={`hover:text-primary transition-all px-1 py-1 relative group ${currentView === 'dashboard' ? 'text-text' : ''}`}
        >
          Jobs
          {currentView === 'dashboard' && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
        <button 
          onClick={() => setCurrentView('employer')} 
          className={`hover:text-primary transition-all px-1 py-1 relative ${currentView === 'employer' ? 'text-text' : ''}`}
        >
          Employers
          {currentView === 'employer' && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
        <button 
          onClick={() => setCurrentView('pro')} 
          className={`hover:text-amber-500 transition-all px-1 py-1 relative flex items-center gap-2 ${currentView === 'pro' ? 'text-amber-500' : ''}`}
        >
          <Sparkles size={14} className="fill-amber-500/10" />
          Pulse Pro
          {currentView === 'pro' && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />}
        </button>
        {isAdmin && (
          <button 
            onClick={() => setCurrentView('admin')} 
            className={`hover:text-primary transition-all px-1 py-1 relative ${currentView === 'admin' ? 'text-primary font-black' : ''}`}
          >
            <ShieldCheck size={14} />
            Admin
          </button>
        )}
      </div>
    </div>

    {currentView === 'dashboard' && (
      <div className="hidden lg:block relative w-80 xl:w-[450px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/60" size={15} />
        <input 
          type="text" 
          placeholder="Search roles, tech, or vibe..." 
          className="w-full pl-11 pr-4 py-3 bg-bg/50 border border-border/60 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-text font-medium placeholder:text-text-muted/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setCurrentView('dashboard');
              setDebouncedSearchTerm(searchTerm);
            }
          }}
        />
      </div>
    )}

    {currentView === 'landing' && (
      <div className="hidden lg:block relative w-64 xl:w-80 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-colors" size={14} />
        <input 
          type="text" 
          placeholder="Quick search..." 
          className="w-full pl-10 pr-4 py-2.5 bg-bg/40 border border-border/60 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-text font-medium placeholder:text-text-muted/40"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setCurrentView('dashboard');
              setDebouncedSearchTerm(searchTerm);
            }
          }}
        />
      </div>
    )}

    <div className="flex items-center gap-2 md:gap-5">
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="p-2.5 hover:bg-bg rounded-xl text-text-muted transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {currentView === 'dashboard' && (
           <div className="flex items-center">
             <button 
                onClick={handleCopyLink}
                className="p-2.5 hover:bg-bg rounded-xl text-text-muted hover:text-primary transition-all relative"
              >
                {isCopying ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
              </button>
              <button 
                onClick={() => setShowSavedModal(true)}
                className="p-2.5 hover:bg-bg rounded-xl text-text-muted hover:text-primary transition-all relative"
              >
                <Heart size={20} className={savedJobIdsCount > 0 ? 'fill-red-500 text-red-500' : ''} />
                {savedJobIdsCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-surface rounded-full" />
                )}
              </button>
           </div>
        )}
      </div>

      <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />

      {user ? (
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex flex-col items-end leading-tight">
            <span className="text-[11px] font-bold text-text truncate max-w-[120px] tracking-tight">{user.displayName}</span>
            {userProfile?.isPro ? (
              <div className="flex items-center gap-1">
                <Sparkles size={8} className="text-amber-500 fill-amber-500" />
                <span className="text-[9px] text-amber-500 font-black uppercase tracking-[0.1em]">Pro Member</span>
              </div>
            ) : (
              <span className="text-[9px] text-text-muted font-black uppercase tracking-[0.1em] opacity-40">Free Plan</span>
            )}
          </div>
          <button 
            onClick={signOutUser}
            className="p-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-xl text-text-muted transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        <button 
          onClick={handleSignIn} 
          className="px-6 py-3 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Sign In
        </button>
      )}
    </div>
  </nav>
);

const DashboardContent = ({
  isSidebarOpen,
  setIsSidebarOpen,
  currentView,
  setCurrentView,
  hasSeenPulseToday,
  INTERESTS,
  activeInterest,
  setActiveInterest,
  region,
  setRegion,
  selectedCurrency,
  setSelectedCurrency,
  selectedPeriod,
  setSelectedPeriod,
  minSalary,
  setMinSalary,
  maxSalary,
  setMaxSalary,
  count,
  setCount,
  daysFilter,
  setDaysFilter,
  jobTypes,
  toggleJobType,
  rssUrl,
  setShowAlertModal,
  setShowManageModal,
  pulseData,
  isGeneratingPulse,
  handleSelectJob,
  userBio,
  filteredJobs,
  lastSync,
  handleRefresh,
  loading,
  activeFiltersCount,
  handleClearFilters,
  error,
  savedJobIds,
  handleToggleSaveJob,
  setSearchTerm,
  trackJobActivity,
  CompanyLogo,
  setJobTypes,
  user,
  userProfile,
  savedJobs,
  sortOrder,
  setSortOrder
}: any) => {
  const dashScrollRef = React.useRef<HTMLDivElement>(null);
  const pulseScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dashScrollRef.current) {
      dashScrollRef.current.scrollTo(0, 0);
    }
  }, [activeInterest]);

  useEffect(() => {
    if (pulseScrollRef.current) {
      pulseScrollRef.current.scrollTo(0, 0);
    }
  }, [currentView]);

  return (
    <div className="flex flex-1 overflow-hidden relative">
    {isSidebarOpen && (
      <div 
        onClick={() => setIsSidebarOpen(false)}
        className="fixed inset-0 bg-text/40 z-40 lg:hidden backdrop-blur-sm"
      />
    )}

    <aside className={`
      fixed inset-y-0 left-0 w-72 border-r border-border bg-surface/50 backdrop-blur-sm p-7 flex flex-col gap-10 overflow-y-auto z-50 transition-transform duration-300 transform lg:relative lg:translate-x-0 shrink-0
      ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `}>
      <section>
        <h3 className="text-[10px] uppercase font-black text-text-muted/50 tracking-[0.25em] mb-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-border/60" />
          Explore
        </h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setCurrentView('pulse')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] transition-all cursor-pointer relative group ${
              currentView === 'pulse' 
              ? 'bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20 active:scale-95' 
              : 'text-text-muted hover:bg-bg hover:text-amber-500 active:scale-98'
            }`}
          >
            <Sparkles size={16} className={currentView === 'pulse' ? 'fill-white/20' : 'group-hover:animate-pulse'} />
            <span className="tracking-tight">Daily Pulse</span>
            {!hasSeenPulseToday && <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full ring-2 ring-surface animate-pulse" />}
          </button>
          
          <div className="h-2" />
          
          {INTERESTS.map((interest: any) => (
            <button
              key={interest.id}
              onClick={() => { setActiveInterest(interest.id); setCurrentView('dashboard'); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] transition-all cursor-pointer group active:scale-98 ${
                activeInterest === interest.id && currentView !== 'pulse'
                ? 'bg-primary text-white font-bold shadow-lg shadow-primary/10' 
                : 'text-text-muted/80 hover:bg-bg hover:text-primary'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                 activeInterest === interest.id && currentView !== 'pulse' ? 'bg-white/20' : 'bg-bg group-hover:bg-accent'
              }`}>
                {typeof interest.icon === 'string' ? <span className="text-sm">{interest.icon}</span> : interest.icon || <span>✨</span>}
              </div>
              <span className="tracking-tight">{interest.label}</span>
              {activeInterest === interest.id && currentView !== 'pulse' && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[10px] uppercase font-black text-text-muted/50 tracking-[0.25em] mb-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-border/60" />
          Region
        </h3>
        <div className="relative group">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-50 pointer-events-none group-focus-within:text-primary transition-colors" size={14} />
          <select 
            className="w-full bg-bg border border-border/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-text appearance-none"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="all">Everywhere</option>
            <option value="usa">United States</option>
            <option value="canada">Canada</option>
            <option value="uk">United Kingdom</option>
            <option value="europe">Europe</option>
            <option value="latam">LATAM</option>
            <option value="asia">Asia</option>
            <option value="worldwide">Open Worldwide</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronRight className="rotate-90 text-text-muted/40" size={14} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] uppercase font-black text-text-muted/50 tracking-[0.25em] mb-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-border/60" />
          Compensation
        </h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <select 
                className="w-full bg-bg border border-border rounded-2xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-text appearance-none"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
            <div className="relative flex-1">
              <select 
                className="w-full bg-bg border border-border rounded-2xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-text appearance-none"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="year">Yearly</option>
                <option value="month">Monthly</option>
                <option value="week">Weekly</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <input 
                type="number" 
                placeholder="Min" 
                className="w-full bg-bg border border-border rounded-2xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-text placeholder:opacity-30"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
            </div>
            <div className="relative flex-1 group">
              <input 
                type="number" 
                placeholder="Max" 
                className="w-full bg-bg border border-border rounded-2xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-text placeholder:opacity-30"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] uppercase font-black text-text-muted/50 tracking-[0.25em] mb-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-border/60" />
          Updates & Tools
        </h3>
        <div className="flex flex-col gap-1.5">
          {user && (
            <>
              <button 
                onClick={() => setCurrentView('saved-jobs')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold transition-all group group-active:scale-95 ${currentView === 'saved-jobs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted/80 hover:bg-bg hover:text-primary'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentView === 'saved-jobs' ? 'bg-white/20' : 'bg-red-50 dark:bg-red-500/10'}`}>
                  <Heart size={15} className={currentView === 'saved-jobs' ? 'text-white' : 'text-red-500'} />
                </div>
                <span>Saved Jobs</span>
                <div className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${currentView === 'saved-jobs' ? 'bg-white/20 text-white' : 'bg-accent text-primary'}`}>
                  {savedJobs.length}
                </div>
              </button>

              <button 
                onClick={() => setCurrentView('employer-hub')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold transition-all group group-active:scale-95 ${currentView === 'employer-hub' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted/80 hover:bg-bg hover:text-primary'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentView === 'employer-hub' ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
                  <Building2 size={15} className={currentView === 'employer-hub' ? 'text-white' : 'text-blue-500'} />
                </div>
                <span>My Postings</span>
                <ChevronRight size={12} className="ml-auto opacity-30" />
              </button>
            </>
          )}

          <a 
            href={rssUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold text-text-muted/80 hover:bg-bg hover:text-primary transition-all group group-active:scale-95"
            title="Subscribe to this filtered job feed"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <Rss size={15} className="text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <span>RSS Feed</span>
            <ExternalLink size={12} className="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
          </a>

          <button 
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold text-text-muted/80 hover:bg-bg hover:text-primary transition-all group group-active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Bell size={15} className="text-blue-500 group-hover:animate-bounce" />
            </div>
            <span>Email Alerts</span>
            <ChevronRight size={12} className="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </section>

      <div className="mt-auto pt-8 border-t border-border/60 space-y-5">
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setCurrentView('pro')}
          className="bg-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
        >
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <Sparkles size={120} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <h3 className="font-black text-xs mb-1 flex items-center gap-2 tracking-wide uppercase">
              Go Pro
              <div className="px-1.5 py-0.5 rounded-full bg-white/20 text-[8px]">ACTIVE</div>
            </h3>
            <p className="text-[10px] opacity-70 leading-relaxed mb-4">No ads. Priority sync. Real-time passion tracking.</p>
            <div className="bg-white text-indigo-600 py-3 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg active:scale-95">
              Unlock Everything
            </div>
          </div>
        </motion.div>

        <div className="p-5 rounded-3xl bg-accent/40 border border-primary/5">
          <p className="text-[10px] text-text-muted leading-relaxed font-medium">
             Listings delayed 6hrs to verify Remote Vibe™. 
             <a href="https://jobicy.com" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold ml-1">Credits: Jobicy</a>
          </p>
        </div>
      </div>
    </aside>

    <main className="flex-1 p-8 overflow-hidden flex flex-col gap-6 font-sans">
      {currentView === 'pulse' ? (
        <div ref={pulseScrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <DailyPulse data={pulseData} loading={isGeneratingPulse} onSelectJob={handleSelectJob} userBio={userBio} />
        </div>
      ) : (
        <>
          <header className="flex flex-col md:flex-row md:items-end justify-between shrink-0 gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-text flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full hidden md:block" />
                {activeInterest === 'all' ? 'All Roles' : `${INTERESTS.find((i: any) => i.id === activeInterest)?.label} Roles`}
              </h1>
              <p className="text-sm text-text-muted font-medium mt-1">
                We found <span className="text-text font-bold">{filteredJobs.length}</span> high-vibe remote roles for you
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="bg-surface border border-border px-4 py-2.5 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="flex flex-col">
                  <p className="text-[9px] text-text-muted uppercase font-black tracking-widest leading-none mb-1">Status</p>
                  <div className="flex items-center gap-1.5 font-black text-[10px] text-primary uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live Sync
                  </div>
                </div>
                <div className="w-px h-6 bg-border" />
                <button 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-1 hover:bg-bg rounded-lg text-text-muted hover:text-primary transition-all disabled:opacity-50"
                  title="Force Refresh Data"
                >
                  <Rss size={18} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {activeFiltersCount > 0 && (
                <button 
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all border border-red-200 dark:border-red-500/10 active:scale-95 shadow-sm"
                >
                  <Trash2 size={14} />
                  Reset
                </button>
              )}
              
              <button 
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'trending' : 'newest')}
                className="bg-bg border border-border/60 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold text-text hover:border-primary/40 transition-all active:scale-95 group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Filter size={14} className={sortOrder === 'trending' ? 'text-primary' : 'text-text-muted'} />
                  <span>{sortOrder === 'newest' ? 'Showing: Newest' : 'Showing: Trending'}</span>
                  <div className="h-4 w-px bg-border/60 mx-1" />
                  <span className="text-primary group-hover:underline">{sortOrder === 'newest' ? 'Switch to Trending' : 'Switch to Newest'}</span>
                </div>
              </button>
            </div>
          </header>

          <div ref={dashScrollRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-surface border border-border rounded-[2rem] p-7 animate-pulse shadow-sm">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 bg-bg rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-4">
                        <div className="h-5 bg-bg rounded-lg w-3/4" />
                        <div className="h-4 bg-bg rounded-lg w-1/4" />
                        <div className="flex gap-3 pt-2">
                          <div className="h-3 bg-bg rounded-md w-20" />
                          <div className="h-3 bg-bg rounded-md w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-red-500 bg-red-50/10 dark:bg-red-500/5 rounded-[3rem] border border-red-100 dark:border-red-500/10 p-12 text-center max-w-lg mx-auto shadow-xl">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                   <XCircle size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight mb-2">Sync Interrupted</h3>
                  <p className="text-sm opacity-60 leading-relaxed font-medium">{error}</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-red-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                >
                  Reconnect
                </button>
              </div>
            ) : (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20"
              >
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job: any) => (
                    <motion.div
                      key={job.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ y: -4 }}
                      onClick={() => handleSelectJob(job)}
                      className={`group bg-surface border ${job.isFeatured ? 'border-primary ring-4 ring-primary/5' : 'border-border'} rounded-[2.5rem] p-7 flex flex-col justify-between hover:border-primary shadow-sm hover:shadow-premium transition-all relative cursor-pointer active:scale-[0.99] overflow-hidden`}
                    >
                      {job.isFeatured && (
                        <div className="absolute top-0 right-0 p-5">
                          <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full flex gap-2 items-center shadow-lg shadow-primary/20">
                            <Zap size={10} fill="currentColor" />
                            Featured
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-6">
                        <CompanyLogo src={job.companyLogo} name={job.companyName} category={job.jobIndustry} className="w-16 h-16 rounded-2xl shadow-sm border border-border/50 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h2 className="text-lg font-black text-text line-clamp-1 group-hover:text-primary transition-colors leading-tight tracking-tight pr-12" title={job.jobExcerpt}>
                              {job.jobTitle}
                            </h2>
                          </div>
                          <div className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                             {job.companyName}
                             <div className="w-1 h-1 bg-border rounded-full" />
                             <span className="text-text-muted/60 text-[10px] uppercase tracking-widest">{job.jobIndustry}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-text-muted/80">
                            <span className={`flex items-center gap-2 ${String(job.jobGeo || '').toLowerCase() === 'worldwide' ? 'text-green-600' : ''}`}>
                              <Globe size={14} className="opacity-50" /> {job.jobGeo}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock size={14} className="opacity-50" /> 
                              {job.pubDate}
                            </span>
                            <span className="flex items-center gap-2 capitalize">
                              <Briefcase size={14} className="opacity-50" /> 
                              {Array.isArray(job.jobType) ? job.jobType[0] : job.jobType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleSaveJob(job); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all font-bold text-xs ${
                              savedJobIds.has(job.id) 
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/10' 
                              : 'bg-bg text-text-muted hover:text-red-500 border border-transparent'
                            }`}
                          >
                            <Heart 
                              size={16} 
                              className={savedJobIds.has(job.id) ? 'fill-red-500' : ''} 
                            />
                            {savedJobIds.has(job.id) ? 'Saved' : 'Save'}
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                           <button 
                            onClick={(e) => { e.stopPropagation(); handleSelectJob(job); }}
                            className="p-3 bg-bg text-text-muted hover:text-primary rounded-2xl transition-all shadow-sm active:scale-90"
                            title="Quick View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => { e.stopPropagation(); trackJobActivity(job.id, 'click'); }}
                            className="bg-text text-surface px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 shadow-xl shadow-text/5 active:scale-95"
                          >
                            Apply <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full border-2 border-dashed border-border/80 rounded-[4rem] flex flex-col items-center justify-center py-32 text-center px-10 bg-accent/20">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0] 
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-24 h-24 bg-surface rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-border/50"
                    >
                      <Search size={40} className="text-primary opacity-20" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-text mb-4 tracking-tight">No matches... for now!</h3>
                    <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed font-medium">
                      Remote work is booming, but your specific passion needs a quick refresh. 
                      Try expanding your filters or search "Future Tech".
                    </p>
                    <button 
                      onClick={() => { setSearchTerm(''); setActiveInterest('all'); setJobTypes(['full-time', 'contract', 'freelance']); }}
                      className="mt-10 px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                      Reset Everything
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </>
      )}
    </main>
  </div>
  );
};

export default function App() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeInterest, setActiveInterest] = useState('all');
  const [region, setRegion] = useState('all');
  const [count, setCount] = useState(30);
  const [jobTypes, setJobTypes] = useState<string[]>(['full-time', 'contract', 'freelance']);
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('year');
  const [sortOrder, setSortOrder] = useState<'newest' | 'trending'>('newest');
  const [daysFilter, setDaysFilter] = useState<string>('all'); // Default all days
  const [cache, setCache] = useState<Record<string, Job[]>>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertStatus, setAlertStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [myAlerts, setMyAlerts] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [manageEmail, setManageEmail] = useState('');
  const [manageLoading, setManageLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [postingStatus, setPostingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [strategy, setStrategy] = useState<string | null>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [userBio, setUserBio] = useState('');
  const [matchResult, setMatchResult] = useState<{ score: number, gap: string } | null>(null);
  const [isCalculatingMatch, setIsCalculatingMatch] = useState(false);
  const [statsJob, setStatsJob] = useState<Job | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showVibeModal, setShowVibeModal] = useState(false);
  const [vibeCompany, setVibeCompany] = useState<string | null>(null);
  const [vibeScores, setVibeScores] = useState({ asyncScore: 3, meetingScore: 3, borderlessScore: 3 });
  const [isSubmittingVibe, setIsSubmittingVibe] = useState(false);
  const [companyVibeData, setCompanyVibeData] = useState<any>(null);
  const [pulseData, setPulseData] = useState<{ greeting: string, recommendation: string, topJobs: Job[] } | null>(null);
  const [isGeneratingPulse, setIsGeneratingPulse] = useState(false);
  const [hasSeenPulseToday, setHasSeenPulseToday] = useState(() => {
    const lastSeen = localStorage.getItem('last_pulse_seen');
    if (!lastSeen) return false;
    const today = new Date().toDateString();
    return lastSeen === today;
  });
  const [myPostings, setMyPostings] = useState<JobPosting[]>([]);
  const [isPostingsLoading, setIsPostingsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const userId = user?.uid || 'anonymous';

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'employer' | 'checkout-success' | 'checkout-cancel' | 'admin' | 'pro' | 'pro-success' | 'pitch' | 'employer-stats' | 'pulse' | 'privacy' | 'terms' | 'saved-jobs' | 'employer-hub' | 'support'>('landing');

  // Scroll to top on view changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentView]);

  // Fetch employer's own postings
  useEffect(() => {
    if (user && (currentView === 'employer-hub' || currentView === 'employer-stats')) {
      const fetchMyPostings = async () => {
        setIsPostingsLoading(true);
        try {
          const postings = await getJobPostings(true); // Get all, then filter
          const userPostings = postings.filter(p => p.employerId === user.uid);
          setMyPostings(userPostings);
        } catch (e) {
          console.error("Error fetching my postings:", e);
        } finally {
          setIsPostingsLoading(false);
        }
      };
      fetchMyPostings();
    }
  }, [user, currentView]);

  const isAdmin = user?.email === 'farisidon@gmail.com';

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Initialize from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) setSearchTerm(params.get('q') || '');
    if (params.has('geo')) setRegion(params.get('geo') || 'all');
    if (params.has('cat')) setActiveInterest(params.get('cat') || 'all');
    if (params.has('count')) setCount(parseInt(params.get('count') || '30'));
    if (params.has('types')) setJobTypes(params.get('types')?.split(',') || []);
    if (params.has('min_sal')) setMinSalary(params.get('min_sal') || '');
    if (params.has('max_sal')) setMaxSalary(params.get('max_sal') || '');
    if (params.has('cur')) setSelectedCurrency(params.get('cur') || 'USD');
    if (params.has('jobId')) {
      setPendingJobId(params.get('jobId'));
      setCurrentView('dashboard'); // Switch to dashboard to show context behind modal
    }
    if (params.has('view')) {
      const v = params.get('view');
      const validViews = ['checkout-success', 'checkout-cancel', 'dashboard', 'employer', 'landing', 'admin', 'pro', 'pro-success', 'pitch', 'employer-stats', 'pulse', 'privacy', 'terms'];
      if (validViews.includes(v as any)) {
        setCurrentView(v as any);
      }
    }
  }, []);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
    if (region !== 'all') params.append('geo', region);
    if (activeInterest !== 'all') params.append('cat', activeInterest);
    if (count !== 30) params.append('count', count.toString());
    if (daysFilter !== '7') params.append('days', daysFilter);
    if (jobTypes.length > 0) params.append('types', jobTypes.join(','));
    if (minSalary) params.append('min_sal', minSalary);
    if (maxSalary) params.append('max_sal', maxSalary);
    if (selectedCurrency !== 'USD') params.append('cur', selectedCurrency);
    if (selectedPeriod !== 'year') params.append('per', selectedPeriod);
    if (selectedJob) params.append('jobId', selectedJob.id);
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [debouncedSearchTerm, region, activeInterest, count, daysFilter, jobTypes, minSalary, maxSalary, selectedCurrency, selectedPeriod, selectedJob]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAlertEmail(currentUser.email || '');
        // Fetch or create profile
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else if (currentUser.email) {
            // Only create if we have an email to avoid validation failures
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              createdAt: new Date().toISOString()
            };
            await updateUserProfile(currentUser.uid, newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.error("Error syncing profile:", e);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Resolve pendingJobId from URL
  useEffect(() => {
    if (pendingJobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === pendingJobId);
      if (job) {
        handleSelectJob(job);
        setPendingJobId(null);
      }
    }
  }, [pendingJobId, jobs]);

  // Fetch employer stats if in stats view
  useEffect(() => {
    if (currentView === 'employer-stats') {
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get('jobId');
      if (jobId) {
        const fetchStats = async () => {
          setStatsLoading(true);
          try {
            const [analytics, allJobs] = await Promise.all([
              getJobAnalytics(jobId),
              jobs.length > 0 ? jobs : getJobPostings(true) // Get from current jobs or refetch if direct link
            ]);
            
            setStatsData(analytics);
            
            // Find job details for display
            if (Array.isArray(allJobs)) {
               const job = allJobs.find((j: any) => j.id === jobId);
               if (job) setStatsJob(job as Job);
            }
          } catch (e) {
            console.error("Error fetching stats:", e);
          } finally {
            setStatsLoading(false);
          }
        };
        fetchStats();
      }
    }
  }, [currentView, jobs]);

  // Generate Pulse automatically if view is pulse
  useEffect(() => {
    if (currentView === 'pulse' && !pulseData && jobs.length > 0) {
      handleGeneratePulse();
    }
  }, [currentView, jobs, pulseData]);

  // Dynamic Page Title for SEO
  useEffect(() => {
    let title = `${BRAND_CONFIG.name} | Elite Remote Opportunities`;
    if (selectedJob) {
      title = `${selectedJob.jobTitle} at ${selectedJob.companyName} | ${BRAND_CONFIG.name}`;
    } else if (currentView === 'employer') {
      title = `Post a Job | ${BRAND_CONFIG.name}`;
    } else if (currentView === 'pro') {
      title = `${BRAND_CONFIG.name} Pro | Early Access`;
    } else if (activeInterest !== 'all') {
      const label = INTERESTS.find(i => i.id === activeInterest)?.label || "";
      title = `${label} Jobs | ${BRAND_CONFIG.name}`;
    } else if (debouncedSearchTerm) {
      title = `"${debouncedSearchTerm}" Remote Roles | ${BRAND_CONFIG.name}`;
    }
    document.title = title;
  }, [currentView, activeInterest, debouncedSearchTerm, selectedJob]);

  // Fetch saved jobs on user change
  useEffect(() => {
    if (!user) {
      setSavedJobs([]);
      setSavedJobIds(new Set());
      return;
    }

    const fetchSaved = async () => {
      try {
        const saved = await getSavedJobs(user.uid);
        setSavedJobs(saved);
        setSavedJobIds(new Set(saved.map(j => j.jobId)));
      } catch (e) {
        console.error("Error fetching saved jobs:", e);
      }
    };
    fetchSaved();
  }, [user]);

  // Handle alert submission
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail) return;
    if (!user) {
      alert("Please sign in to create alerts!");
      return;
    }

    setAlertStatus('loading');
    try {
      const interestObj = INTERESTS.find(i => i.id === activeInterest);
      await createJobAlert({
        email: alertEmail,
        keywords: searchTerm,
        category: activeInterest !== 'all' ? interestObj?.category : undefined,
        region: region !== 'all' ? region : undefined,
        jobTypes: jobTypes,
        userId: user.uid
      });
      setAlertStatus('success');
      setAlertEmail(user.email || '');
      setTimeout(() => {
        setShowAlertModal(false);
        setAlertStatus('idle');
      }, 3000);
    } catch (err) {
      setAlertStatus('error');
    }
  };

  const handleToggleSaveJob = async (job: Job) => {
    if (!user) {
      alert("Please sign in to save jobs!");
      return;
    }
    const isSaved = savedJobIds.has(job.id);
    try {
      if (isSaved) {
        await unsaveJob(user.uid, job.id);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
        setSavedJobs(prev => prev.filter(j => j.jobId !== job.id));
      } else {
        await saveJob({
          jobId: job.id,
          userId: user.uid,
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          companyLogo: job.companyLogo,
          url: job.url,
          category: job.jobIndustry || job.jobCategory
        });
        setSavedJobIds(prev => new Set(prev).add(job.id));
        setSavedJobs(prev => [{
          jobId: job.id,
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          companyLogo: job.companyLogo,
          url: job.url,
          category: job.jobIndustry || job.jobCategory
        }, ...prev]);
      }
    } catch (e) {
      console.error("Error toggling saved job:", e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleSignIn = async () => {
    setShowAuthModal(true);
  };

  const handleActualSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        // Silently ignore
      } else {
        console.error("Sign-in error:", e);
        setError("Failed to sign in. Please try again.");
      }
    }
  };

  const handleManageAlerts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageEmail) return;
    setManageLoading(true);
    try {
      const alerts = await getAlertsByEmail(manageEmail);
      setMyAlerts(alerts);
    } catch (e) {
      console.error("Error fetching alerts:", e);
    } finally {
      setManageLoading(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await deleteAlert(id);
      setMyAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Error deleting alert:", e);
    }
  };

  const handleGetStrategy = async (job: Job) => {
    if (isGeneratingStrategy) return;
    setIsGeneratingStrategy(true);
    setStrategy(null);
    try {
      const response = await fetch('/api/ai/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setStrategy(data.text || "Failed to generate strategy. Please try again.");
    } catch (error) {
      console.error("Strategy Error:", error);
      setStrategy("Error connecting to AI. Please try again later.");
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleCloseJobModal = () => {
    setSelectedJob(null);
    setMatchResult(null);
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    trackJobActivity(job.id, 'view');
    fetchCompanyVibe(job.companyName);
  };

  const fetchCompanyVibe = async (companyName: string) => {
    try {
      const data = await getCompanyVibe(companyName);
      setCompanyVibeData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVibeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !vibeCompany) return;
    setIsSubmittingVibe(true);
    try {
      await submitVibeCheck({
        companyName: vibeCompany,
        ...vibeScores,
        userId: user.uid
      });
      setShowVibeModal(false);
      fetchCompanyVibe(vibeCompany);
    } catch (e) {
      alert("Failed to submit vibe check.");
    } finally {
      setIsSubmittingVibe(false);
    }
  };

  const handleCalculateMatch = async (job: Job) => {
    if (!userBio.trim() || isCalculatingMatch) return;
    setIsCalculatingMatch(true);
    setMatchResult(null);
    try {
      const response = await fetch('/api/ai/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      
      const cleanJson = data.text?.replace(/```json|```/g, '').trim();
      if (cleanJson) {
        const result = JSON.parse(cleanJson);
        setMatchResult(result);
      }
    } catch (error) {
      console.error("Match Error:", error);
    } finally {
      setIsCalculatingMatch(false);
    }
  };

  const handleGeneratePulse = async () => {
    if (isGeneratingPulse || !jobs.length) return;
    setIsGeneratingPulse(true);
    try {
      const response = await fetch('/api/ai/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      
      // Clean up potential markdown code blocks from AI response
      let cleanText = data.text || "{}";
      if (cleanText.includes('```json')) cleanText = cleanText.split('```json')[1].split('```')[0].trim();
      else if (cleanText.includes('```')) cleanText = cleanText.split('```')[1].split('```')[0].trim();
      
      const parsed = JSON.parse(cleanText);
      const topRoles = (parsed.topJobIndices || [0, 1, 2]).map((idx: number) => jobs[idx] || jobs[0]).filter(Boolean);
      
      setPulseData({
        greeting: parsed.greeting || "Your Passion Pulse is Ready",
        recommendation: parsed.recommendation || "Stay focused on high-impact roles today.",
        topJobs: topRoles
      });
      
      localStorage.setItem('last_pulse_seen', new Date().toDateString());
      setHasSeenPulseToday(true);
    } catch (error) {
      console.error("Pulse Error:", error);
      setPulseData({
        greeting: "The Pulse is Racing",
        recommendation: "Focus on your saved jobs today! The API is currently at capacity.",
        topJobs: jobs.slice(0, 3)
      });
    } finally {
      setIsGeneratingPulse(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRegion('all');
    setActiveInterest('all');
    setJobTypes(['full-time', 'contract', 'freelance']);
    setMinSalary('');
    setMaxSalary('');
    setSelectedCurrency('USD');
    setSelectedPeriod('year');
    setDaysFilter('7');
    setCount(30);
  };

  const SavedJobsHub = () => {
    return (
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                <Heart size={14} className="text-red-500" /> Member Benefits
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-text italic">Your Saved Opportunities</h1>
              <p className="text-text-muted mt-2 font-medium">Opportunities you've bookmarked for later review.</p>
            </div>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="px-6 py-3 bg-bg border border-border rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-surface transition-all flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Back to Marketplace
            </button>
          </header>

          {savedJobs.length === 0 ? (
            <div className="bg-surface border border-border rounded-[2.5rem] p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-bg rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-border/50">
                <Search size={32} className="text-primary opacity-20" />
              </div>
              <h3 className="text-xl font-black text-text mb-2">Nothing saved yet!</h3>
              <p className="text-text-muted max-w-sm mx-auto mb-8 font-medium">Explore the marketplace and click the heart icon to save jobs you're interested in.</p>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-surface border border-border rounded-[2rem] p-6 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group shadow-sm hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <CompanyLogo src={job.companyLogo} name={job.companyName} category={job.category} className="w-14 h-14 rounded-2xl p-2" />
                    <div>
                      <h3 className="text-lg font-black text-text group-hover:text-primary transition-colors">{job.jobTitle}</h3>
                      <p className="text-sm font-bold text-text-muted mb-1">{job.companyName}</p>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted/60 font-medium uppercase tracking-widest">
                        <span>{job.category || 'Remote'}</span>
                        <span>•</span>
                        <span>Saved {formatTimeAgo(job.savedAt?.toDate ? job.savedAt.toDate() : job.savedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => {
                        const targetId = job.jobId;
                        const realJob = jobs.find(j => j.id === targetId);
                        if (realJob) {
                          handleSelectJob(realJob);
                        } else {
                          // Handle job no longer in list? just go to url
                          window.open(job.url, '_blank', 'no-referrer');
                        }
                      }}
                      className="flex-1 md:flex-none px-6 py-3 bg-bg border border-border rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleToggleSaveJob({ id: job.jobId } as Job)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Remove from saved"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const EmployerHub = () => {
    return (
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                <Building2 size={14} /> Employer Command Center
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-text">My Job Postings</h1>
              <p className="text-text-muted mt-2 font-medium">Manage your active listings and real-time performance metrics.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCurrentView('employer')}
                className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
              >
                <Zap size={14} /> Post New Job
              </button>
            </div>
          </header>

          {isPostingsLoading ? (
            <div className="py-24 text-center">
              <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
              <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Synchronizing data...</p>
            </div>
          ) : myPostings.length === 0 ? (
            <div className="bg-surface border border-border rounded-[2.5rem] p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-bg rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-border/50">
                <Zap size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-black text-text mb-2">No active postings</h3>
              <p className="text-text-muted max-w-sm mx-auto mb-8 font-medium">Tap into our audience of 120k+ high-intent remote seekers today.</p>
              <button 
                onClick={() => setCurrentView('employer')}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface border border-border p-6 rounded-[2rem] shadow-sm">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Active Posts</p>
                  <p className="text-3xl font-black text-text">{myPostings.length}</p>
                </div>
                <div className="bg-surface border border-border p-6 rounded-[2rem] shadow-sm">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Elite Status</p>
                  <p className="text-xl font-black text-green-600 flex items-center gap-2">
                    <ShieldCheck size={20} /> Verified
                  </p>
                </div>
                <div className="bg-surface border border-border p-6 rounded-[2rem] shadow-sm">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Expiring Soon</p>
                  <p className="text-3xl font-black text-text">0</p>
                </div>
              </div>

              <div className="grid gap-4">
                {myPostings.map((post) => (
                  <div 
                    key={post.id}
                    className="bg-surface border border-border rounded-[2rem] p-8 hover:border-primary/30 transition-all flex flex-col lg:flex-row items-center justify-between gap-8 group shadow-sm"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      <CompanyLogo src={post.companyLogo} name={post.companyName} category={post.jobCategory} className="w-16 h-16 rounded-2xl p-2" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-text">{post.jobTitle}</h3>
                          {post.isFeatured && (
                            <span className="px-2 py-0.5 bg-accent text-primary text-[9px] font-black uppercase rounded-full border border-primary/10">Featured</span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-text-muted mb-3">{post.companyName}</p>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-muted/60 font-black uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Globe size={12} /> {post.jobGeo}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} /> Posted {formatTimeAgo(post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt)}</span>
                          <span className="flex items-center gap-1.5"><Briefcase size={12} /> {post.jobType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
                      <button 
                        onClick={() => {
                          const url = new URL(window.location.origin);
                          url.searchParams.set('view', 'employer-stats');
                          url.searchParams.set('jobId', post.id!);
                          window.location.href = url.toString();
                        }}
                        className="flex-1 lg:flex-none px-6 py-4 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        <TrendingUp size={16} /> Stats
                      </button>
                      <button 
                        onClick={() => window.open(post.url, '_blank')}
                        className="p-4 bg-bg border border-border rounded-xl text-text-muted hover:text-primary transition-all shadow-sm"
                        title="View Live Listing"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const LandingPage = () => {
    const featuredJobs = useMemo(() => {
      const realFeatured = jobs.filter(j => j.isFeatured);
      const others = jobs.filter(j => !j.isFeatured);
      return [...realFeatured, ...others].slice(0, 6);
    }, [jobs]);
    
    return (
      <div className="flex flex-col min-h-screen bg-bg selection:bg-primary/10 overflow-x-hidden">
        {/* Floating Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div 
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[15%] left-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              x: [0, -40, 0],
              y: [0, 60, 0],
              rotate: [0, -15, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[50%] left-[40%] w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]"
          />
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-44 overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-6 relative text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-surface border border-border/60 rounded-full text-text font-black text-[10px] uppercase tracking-[0.2em] mb-12 shadow-sm"
            >
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
              Vetted Remote Work Economy
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[10rem] font-black text-text tracking-tighter leading-[0.85] mb-10"
            >
              Passion <br />
              <motion.span 
                animate={{ color: ["var(--color-primary)", "#3b82f6", "var(--color-primary)"] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="text-primary italic"
              >
                Work.
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-3xl text-text-muted max-w-3xl mx-auto mb-16 font-medium leading-[1.4] tracking-tight"
            >
              The premier platform for high-vibe remote specialists. Directly connect with teams at <span className="text-text font-bold">Linear</span>, <span className="text-text font-bold">Vercel</span>, and <span className="text-text font-bold">Stripe</span>.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('dashboard')}
                className="w-full sm:w-auto px-12 py-6 bg-primary text-white text-lg font-black rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(var(--primary-rgb),0.5)] hover:bg-primary-hover transition-all flex items-center justify-center gap-4 group"
              >
                <span>Explore Roles</span>
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('employer')}
                className="w-full sm:w-auto px-12 py-6 bg-surface border border-border text-text text-lg font-bold rounded-[2rem] hover:bg-bg transition-all flex items-center justify-center gap-4 shadow-sm"
              >
                <Building2 size={22} />
                <span>Hire Experts</span>
              </motion.button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-28 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto border-t border-border/60 pt-16"
            >
              {[
                { label: 'Verified Roles', val: '32K+', icon: <TrendingUp size={18} /> },
                { label: 'Global Reach', val: 'Worldwide', icon: <Globe size={18} /> },
                { label: 'High Yield', val: '$140K+', icon: <Zap size={18} /> },
                { label: 'Direct Apply', val: '100%', icon: <ShieldCheck size={18} /> },
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.label} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + (idx * 0.1) }}
                  className="text-center group"
                >
                  <div className="text-3xl font-black text-text mb-1.5 tracking-tighter group-hover:text-primary transition-colors">{stat.val}</div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    {stat.icon}
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Opportunities Preview */}
        <section className="py-32 bg-white dark:bg-bg overflow-hidden relative border-t border-border/40 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16"
            >
              <div className="max-w-xl">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Vetted & Live</div>
                <h2 className="text-4xl md:text-7xl font-black text-text tracking-tighter leading-none italic uppercase">Latest signals</h2>
                <p className="text-lg text-text-muted font-medium mt-6">Hand-picked remote roles from deep-tech and high-vibe companies. No noise, just focus.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('dashboard')}
                className="px-8 py-4 bg-accent text-primary font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-3 active:scale-95 border border-primary/10 shadow-xl shadow-primary/5"
              >
                View All Roles <ArrowRight size={18} />
              </motion.button>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredJobs.map((job: any, idx: number) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  whileHover={{ 
                    y: -12, 
                    boxShadow: "0 25px 50px -12px rgba(var(--primary-rgb), 0.1)" 
                  }}
                  onClick={() => { setSelectedJob(job); setCurrentView('dashboard'); }}
                  className="bg-bg border border-border/80 rounded-[2.5rem] p-8 hover:border-primary/40 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <CompanyLogo src={job.companyLogo} name={job.companyName} category={job.jobIndustry} className="w-14 h-14 rounded-2xl p-1.5" />
                      <div className="p-2.5 bg-accent rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2 transition-colors group-hover:text-primary leading-tight line-clamp-1">{job.jobTitle}</h3>
                    <p className="text-sm font-bold text-primary mb-6">{job.companyName}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-text-muted/60">
                      <span className="flex items-center gap-1.5"><Globe size={14} /> {job.jobGeo}</span>
                      <div className="w-1 h-1 bg-border rounded-full" />
                      <span className="flex items-center gap-1.5 capitalize"><Briefcase size={14} /> {Array.isArray(job.jobType) ? job.jobType[0] : job.jobType}</span>
                    </div>
                  </div>
                  {/* Hover background pulse */}
                  <motion.div 
                    className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" 
                    initial={false}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Marquee Section with Motion */}
        <section className="py-16 bg-surface border-y border-border overflow-hidden relative z-10">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent z-10" />
          
          <div className="flex whitespace-nowrap">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 40, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="flex items-center gap-16 pr-16"
            >
              {[
                "GitLab", "Zapier", "Buffer", "Doist", "Automattic", "Basecamp", "Trello", "Shopify", 
                "GitHub", "Notion", "Linear", "Vercel", "Render", "Stripe", "Postmark",
                "GitLab", "Zapier", "Buffer", "Doist", "Automattic", "Basecamp", "Trello", "Shopify", 
                "GitHub", "Notion", "Linear", "Vercel", "Render", "Stripe", "Postmark"
              ].map((company, i) => (
                <span key={`${company}-${i}`} className="text-2xl md:text-4xl font-black text-text-muted/20 uppercase tracking-[0.4em] italic hover:text-primary/30 transition-colors cursor-default">
                  {company}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Floating Feature cards */}
        <section className="py-32 relative overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
               <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4"
               >
                 Core Infrastructure
               </motion.div>
               <h2 className="text-4xl md:text-7xl font-black text-text tracking-tighter italic">Engineered for focus</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { 
                  title: 'Deep Filters', 
                  desc: 'Search by salary, tech stack, and timezone flexibility.',
                  icon: Filter,
                  color: "text-blue-500",
                  delay: 0.1
                },
                { 
                  title: 'Live Sync', 
                  desc: 'Our real-time platform updates within seconds of a new post.',
                  icon: Zap,
                  color: "text-amber-500",
                  delay: 0.2
                },
                { 
                  title: 'Vibe Checks', 
                  desc: 'Verified culture ratings from actual remote employees.',
                  icon: ShieldCheck,
                  color: "text-green-500",
                  delay: 0.3
                }
              ].map((feat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: feat.delay, duration: 0.7 }}
                  className="p-10 bg-surface/50 border border-border/80 rounded-[3rem] backdrop-blur-xl hover:bg-surface transition-all group"
                >
                  <div className="w-14 h-14 bg-bg rounded-[1.5rem] flex items-center justify-center mb-8 border border-border/80 shadow-inner group-hover:scale-110 transition-transform">
                    <feat.icon size={28} className={feat.color} />
                  </div>
                  <h3 className="text-2xl font-black text-text mb-4 italic uppercase">{feat.title}</h3>
                  <p className="text-text-muted font-medium leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-surface border-y border-border/60 z-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-12"
            >
              Social Proof
            </motion.div>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  text: `${BRAND_CONFIG.name} solved our specialist hiring bottleneck. We found our Lead Designer in 48 hours.`, 
                  author: "Sarah Chen", 
                  role: "Founder at FlowState",
                  img: "https://picsum.photos/seed/sarah/100/100"
                },
                { 
                  text: "The high-density UI is a dream. Finally, a board that respects a developer's time.", 
                  author: "Marcus Aurelius", 
                  role: "Senior Eng @ Linear",
                  img: "https://picsum.photos/seed/marcus/100/100"
                },
                { 
                  text: "The Pulse feature keeps me updated on niche roles I actually care about.", 
                  author: "Elena Joy", 
                  role: "Product Lead",
                  img: "https://picsum.photos/seed/elena/100/100"
                }
              ].map((t, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.15 }}
                  whileHover={{ y: -10 }}
                  className="p-10 bg-bg rounded-[3rem] border border-border/60 text-left shadow-sm group hover:border-primary/40 transition-all"
                >
                  <div className="text-xl font-medium text-text mb-8 leading-relaxed italic">"{t.text}"</div>
                  <div className="flex items-center gap-4">
                    <img src={t.img} alt={t.author} className="w-12 h-12 rounded-full border-2 border-border group-hover:border-primary/40 transition-all object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-sm font-black text-text">{t.author}</div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Pulse Section */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-primary text-white rounded-[4rem] p-12 md:p-24 overflow-hidden relative shadow-[0_60px_120px_-20px_rgba(var(--primary-rgb),0.3)]"
            >
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute top-0 right-0 w-[600px] h-[600px] border-[60px] border-white rounded-full translate-x-1/3 -translate-y-1/3" 
                />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                   transition={{ duration: 12, repeat: Infinity }}
                  className="absolute bottom-0 left-0 w-[400px] h-[400px] border-[40px] border-white rounded-full -translate-x-1/3 translate-y-1/3" 
                />
              </div>
              
              <div className="grid lg:grid-cols-2 items-center gap-16 relative z-10">
                <div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md"
                  >
                    <Bell size={12} className="animate-bounce" /> Live Pulse
                  </motion.div>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 italic">
                    Freshness <br />
                    <span className="text-white/40">Guaranteed.</span>
                  </h2>
                  <p className="text-lg md:text-2xl text-white/80 font-medium mb-12 max-w-md leading-relaxed">
                    We send one high-signal email every Sunday. No spam, just pure remote opportunities.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAlertModal(true)}
                      className="px-10 py-5 bg-white text-primary font-black rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3"
                    >
                      Set My Pulse Alert <Bell size={20} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="hidden lg:block">
                  <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 shadow-3xl transform rotate-3">
                     <div className="space-y-6">
                        {[
                          { label: 'Engineering', val: 'New Signals', color: 'bg-green-400' },
                          { label: 'Product Design', val: '2h ago', color: 'bg-blue-400' },
                          { label: 'Marketing', val: 'Vetted', color: 'bg-amber-400' }
                        ].map((stat, i) => (
                          <motion.div 
                            key={stat.label} 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10"
                          >
                             <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${stat.color} animate-pulse`} />
                               <span className="font-bold text-lg">{stat.label}</span>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/20 rounded-full">
                               {stat.val}
                             </span>
                          </motion.div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Global Footer */}
        <GlobalFooter />
      </div>
    );
  };
  const EmployerPortal = () => {
    const [formData, setFormData] = useState({
      title: '',
      company: '',
      logo: '',
      description: '',
      geo: 'worldwide',
      type: 'full-time',
      category: 'programming',
      minSalary: '',
      maxSalary: '',
      currency: 'USD',
      period: 'year',
      url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
        alert("Please sign in to post a job!");
        return;
      }
      setPostingStatus('loading');
      try {
        // We create a Stripe Checkout Session via our new API
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            company: formData.company,
            geo: formData.geo,
            type: formData.type,
            category: formData.category,
            url: formData.url,
            employerId: user.uid
          })
        });

        const session = await response.json();
        
        if (session.url) {
          // Store form data temporarily in localStorage so we can save it to Firestore after payment success
          // In a real app, you'd use a pending_postings collection + webhooks
          localStorage.setItem('pending_posting', JSON.stringify({
            ...formData,
            employerId: user.uid,
            createdAt: new Date().toISOString()
          }));
          
          window.location.href = session.url;
        } else {
          throw new Error(session.error || 'Failed to create checkout session');
        }
      } catch (e: any) {
        alert(e.message || "An error occurred. Check if Stripe is configured on the server.");
        setPostingStatus('error');
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-6 py-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-full md:w-1/2">
             <HireGraphic />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter leading-none mb-4">Hire Top <br /> <span className="text-primary italic">Niche</span> Talent.</h1>
            <p className="text-lg text-text-muted font-medium">Join 2,400+ remote-first companies building their dream teams on PassionWork.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 pb-20">
          <div className="md:col-span-2">
            <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <div className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Verified Merchant</div>
              </div>
              <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                <Zap size={20} className="text-primary fill-primary/20" />
                Featured Listing ($99 / 30 Days)
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Job Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Senior Product Designer"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Company Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Your Awesome Company"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Apply URL</label>
                  <input 
                    required
                    type="url" 
                    placeholder="https://company.com/careers/job-123"
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Description (Markdown Supported)</label>
                  <textarea 
                    required
                    rows={6}
                    placeholder="Describe the role, impact, and requirements..."
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Category</label>
                    <select 
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {INTERESTS.filter(i => i.id !== 'all').map(i => (
                        <option key={i.id} value={i.category}>{i.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Region</label>
                    <select 
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.geo}
                      onChange={e => setFormData({...formData, geo: e.target.value})}
                    >
                      <option value="worldwide">Worldwide</option>
                      <option value="usa">USA</option>
                      <option value="europe">Europe</option>
                      <option value="latam">LATAM</option>
                      <option value="asia">Asia</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Job Type</label>
                    <select 
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={postingStatus === 'loading'}
                    className={`w-full py-4 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg ${
                      postingStatus === 'success' ? 'bg-green-500' : 'bg-primary hover:bg-primary-hover shadow-primary/20'
                    }`}
                  >
                    {postingStatus === 'loading' ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : postingStatus === 'success' ? (
                      <>
                        <CheckCircle2 size={24} />
                        <span>Posted Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        <span>Post Featured Job — $99</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-text-muted mt-4 font-bold uppercase tracking-widest">Featured jobs stay highlighted at the top for 30 days.</p>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-8 sticky top-24">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={120} />
              </div>
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Sparkles size={18} />
                Employer Perks
              </h3>
              <ul className="space-y-4 text-sm font-medium relative z-10">
                <li className="flex gap-3">
                  <Check size={16} className="shrink-0 mt-0.5 opacity-60" />
                  <span>30-Day "Featured" placement at the top of the feed.</span>
                </li>
                <li className="flex gap-3">
                  <Check size={16} className="shrink-0 mt-0.5 opacity-60" />
                  <span>Automatic distribution to our 120k+ pulse subscribers.</span>
                </li>
                <li className="flex gap-3">
                  <Check size={16} className="shrink-0 mt-0.5 opacity-60" />
                  <span>Verified Merchant status for higher trust scores.</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-tighter mb-4">
                <Target size={14} />
                <span>Audience Intelligence</span>
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Avg. Views', val: '4,102/mo', icon: <Eye size={12} /> },
                  { label: 'CTR', val: '8.4%', icon: <Zap size={12} /> },
                  { label: 'Conversion', val: '12%', icon: <TrendingUp size={12} /> }
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                      {stat.icon}
                      {stat.label}
                    </span>
                    <span className="text-sm font-black text-text">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-border/50 py-12 bg-surface/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
               <Logo className="text-lg opacity-50 grayscale hover:grayscale-0 transition-all" />
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">© 2026 PassionWork Platform. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
               <button onClick={() => setCurrentView('pitch')} className="hover:text-primary transition-colors flex items-center gap-2">
                 <Sparkles size={12} className="text-primary" /> Investor Pitch Deck
               </button>
               <button onClick={() => setCurrentView('employer')} className="hover:text-primary transition-colors">Post a Job</button>
               <button onClick={() => setCurrentView('pro')} className="hover:text-primary transition-colors">Go Pro</button>
               <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors">Browse Marketplace</button>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  const CheckoutSuccess = () => {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [newJobId, setNewJobId] = useState<string | null>(null);

    useEffect(() => {
      const finalizePost = async () => {
        const pending = localStorage.getItem('pending_posting');
        if (!pending) {
          setStatus('success'); // Already processed or nothing to process
          return;
        }

        try {
          const data = JSON.parse(pending);
          const jobId = await createJobPosting({
            jobTitle: data.title,
            companyName: data.company,
            companyLogo: data.logo,
            jobDescription: data.description,
            jobGeo: data.geo,
            jobType: data.type,
            jobCategory: data.category,
            salaryMin: data.minSalary ? parseInt(data.minSalary) : undefined,
            salaryMax: data.maxSalary ? parseInt(data.maxSalary) : undefined,
            salaryCurrency: data.currency,
            salaryPeriod: data.period,
            url: data.url,
            employerId: data.employerId
          });
          
          setNewJobId(jobId);
          localStorage.removeItem('pending_posting');
          setStatus('success');
          setCache({});
        } catch (e) {
          console.error(e);
          setStatus('error');
        }
      };

      finalizePost();
    }, []);

    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-text mb-4 tracking-tight">Payment Successful!</h1>
        <p className="text-lg text-text-muted mb-12 leading-relaxed">
          {status === 'processing' 
            ? "We're finalizing your featured job listing. One moment..." 
            : "Your featured job is now live! It will appear at the absolute top of the feed for the next 30 days."}
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all"
          >
            View My Job in the Feed
          </button>
          {newJobId && (
             <button 
              onClick={() => {
                const url = new URL(window.location.origin);
                url.searchParams.set('view', 'employer-stats');
                url.searchParams.set('jobId', newJobId);
                window.location.href = url.toString();
              }}
              className="w-full py-4 bg-accent text-primary font-black rounded-2xl border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} /> View Performance Dashboard
            </button>
          )}
          <button 
            onClick={() => setCurrentView('employer')}
            className="text-sm font-bold text-text-muted hover:text-text transition-colors"
          >
            Back to Employer Hub
          </button>
        </div>
      </div>
    );
  };

  const CheckoutCancel = () => (
    <div className="max-w-xl mx-auto py-24 px-6 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8">
        <X size={48} />
      </div>
      <h1 className="text-4xl font-black text-text mb-4 tracking-tight">Payment Cancelled</h1>
      <p className="text-lg text-text-muted mb-12 leading-relaxed">
        Don't worry, your job draft is still safe. You can resume the process whenever you're ready.
      </p>
      <button 
        onClick={() => setCurrentView('employer')}
        className="w-full py-4 bg-surface border border-border text-text font-black rounded-2xl hover:bg-bg transition-all"
      >
        Return to Employer Hub
      </button>
    </div>
  );

  const AdminDashboard = () => {
    const [pendingJobs, setPendingJobs] = useState<JobPosting[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
      const fetchJobs = async () => {
        try {
          const allPostings = await getJobPostings(true); // Fetch all including unapproved
          setPendingJobs(allPostings);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingPosts(false);
        }
      };
      if (isAdmin) fetchJobs();
    }, [isAdmin]);

    const handleApprove = async (id: string) => {
      try {
        await updateJobPosting(id, { isApproved: true });
        setPendingJobs(prev => prev.map(p => p.id === id ? { ...p, isApproved: true } : p));
      } catch (e) {
        alert("Approval failed");
      }
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
      try {
        await updateJobPosting(id, { isFeatured: !currentStatus });
        setPendingJobs(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !currentStatus } : p));
      } catch (e) {
        alert("Update failed");
      }
    };

    const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this listing?")) return;
      try {
        await deleteJobPosting(id);
        setPendingJobs(prev => prev.filter(p => p.id !== id));
      } catch (e) {
        alert("Delete failed");
      }
    };

    if (!isAdmin) return <div className="p-20 text-center font-bold text-red-500">Access Denied</div>;

    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-4xl font-black text-text tracking-tight">Admin Console</h1>
              <button 
                onClick={() => setCurrentView('pitch')}
                className="px-4 py-1.5 bg-accent text-primary text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-all flex items-center gap-1.5"
              >
                <Sparkles size={10} /> Pitch Deck
              </button>
            </div>
            <p className="text-text-muted font-medium">Moderate and manage platform inventory.</p>
          </div>
          <div className="flex gap-4">
             <div className="p-4 bg-surface border border-border rounded-2xl text-center min-w-[140px] shadow-sm">
                <div className="text-3xl font-black text-primary">{pendingJobs.filter(j => !j.isApproved).length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">Pending Approval</div>
             </div>
             <div className="p-4 bg-surface border border-border rounded-2xl text-center min-w-[140px] shadow-sm">
                <div className="text-3xl font-black text-green-600">{pendingJobs.filter(j => j.isApproved).length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">Directly Published</div>
             </div>
          </div>
        </div>

        {loadingPosts ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingJobs.map(job => (
              <div key={job.id} className="bg-surface border border-border rounded-[2rem] p-8 flex flex-col lg:flex-row justify-between items-center gap-8 group hover:border-primary transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <div className="flex gap-6 items-center flex-1 min-w-0">
                  <CompanyLogo src={job.companyLogo} name={job.companyName} category={job.jobCategory} className="w-16 h-16 rounded-2xl shadow-inner bg-bg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <h3 className="text-xl font-bold tracking-tight truncate">{job.jobTitle}</h3>
                       {job.isApproved ? (
                         <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Live</span>
                       ) : (
                         <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Draft</span>
                       )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-bold text-lg">{job.companyName}</span>
                      <span className="w-1 h-1 bg-text-muted rounded-full opacity-30 px-0" />
                      <span className="text-text-muted font-medium">{job.jobGeo}</span>
                      {job.salaryMin && (
                        <span className="text-green-600 font-bold ml-2 text-sm">
                          {job.salaryCurrency}{job.salaryMin.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-2 opacity-60 font-medium">Employer ID: {job.employerId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <button 
                    onClick={() => {
                        const url = new URL(window.location.origin);
                        url.searchParams.set('view', 'employer-stats');
                        url.searchParams.set('jobId', job.id!);
                        window.history.pushState({}, '', url.toString());
                        setCurrentView('employer-stats');
                    }}
                    className="p-3 bg-bg text-text-muted hover:text-primary rounded-xl transition-all border border-border"
                    title="View Performance Stats"
                  >
                    <TrendingUp size={20} />
                  </button>
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-bg text-text-muted hover:text-primary rounded-xl transition-all border border-border"
                    title="Preview External"
                  >
                    <ExternalLink size={20} />
                  </a>
                  <button 
                    onClick={() => handleToggleFeatured(job.id!, !!job.isFeatured)}
                    className={`p-3 rounded-xl transition-all border ${
                      job.isFeatured 
                        ? 'bg-amber-50 text-amber-600 border-amber-200' 
                        : 'bg-bg text-text-muted border-border hover:text-amber-500'
                    }`}
                    title={job.isFeatured ? 'Remove Featured Status' : 'Mark as Featured'}
                  >
                    <Zap size={20} fill={job.isFeatured ? "currentColor" : "none"} />
                  </button>
                  {!job.isApproved && (
                    <button 
                      onClick={() => handleApprove(job.id!)}
                      className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
                    >
                      <ShieldCheck size={18} /> Approve
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(job.id!)}
                    className="p-3 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Delete Permanently"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {pendingJobs.length === 0 && (
               <div className="text-center py-32 border-2 border-dashed border-border rounded-[3rem] bg-surface/50">
                  <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase size={32} className="text-text-muted opacity-30" />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-2">Clean Slate!</h3>
                  <p className="text-text-muted max-w-xs mx-auto text-sm">No job postings in the moderation queue at the moment.</p>
               </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const ProSubscriber = () => {
    const [loadingPro, setLoadingPro] = useState(false);

    const handleSubscribe = async () => {
      if (!user) {
        handleSignIn();
        return;
      }
      setLoadingPro(true);
      try {
        const response = await fetch('/api/create-subscription-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            userId: user.uid
          })
        });
        const session = await response.json();
        if (session.url) {
          window.location.href = session.url;
        } else {
          throw new Error(session.error || 'Failed to start subscription');
        }
      } catch (err: any) {
        alert(err.message || "An error occurred starting subscription.");
      } finally {
        setLoadingPro(false);
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles size={12} />
            The Ultimate Job Search Edge
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-text tracking-tighter mb-6 leading-none">
            Scale your career <br /> 
            <span className="text-primary italic underline decoration-primary/20">faster</span> than ever.
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto font-medium">
            Pro users get notified 6 hours before anyone else. In a market this fast, that's the difference between an interview and a "closed" sign.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { 
              title: 'Instant Alerts', 
              desc: 'Our bots scan Jobicy and featured posts every 5 minutes. You get a push the millisecond a match hits.',
              icon: <Zap size={24} className="text-primary" />
            },
            { 
              title: 'Priority Support', 
              desc: 'Get direct access to our hiring specialists for job description feedback and resume reviews.',
              icon: <ShieldCheck size={24} className="text-primary" />
            },
            { 
              title: 'Ad-Free Feed', 
              desc: 'A clinical, high-density interface focused entirely on your next opportunity. No distractions.',
              icon: <LayoutGrid size={24} className="text-primary" />
            }
          ].map(feature => (
            <div key={feature.title} className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-surface border border-border rounded-[3rem] p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Globe size={120} />
          </div>
          
          {userProfile?.isPro ? (
            <div className="relative z-10">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-text mb-2 tracking-tight">Membership Active</h2>
              <p className="text-sm text-text-muted mb-10 font-medium">You are currently enjoying all PassionWork Pro benefits.</p>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="w-full py-5 bg-text text-bg text-lg font-black rounded-3xl shadow-xl hover:scale-[1.02] transition-all active:scale-95"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="text-4xl font-black text-text mb-2 tracking-tight">$19<span className="text-lg opacity-50 font-medium">/mo</span></div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-8">No long-term contracts. Cancel anytime.</div>
              
              <button 
                onClick={handleSubscribe}
                disabled={loadingPro}
                className="w-full py-5 bg-primary text-white text-lg font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {loadingPro ? <Loader2 size={24} className="animate-spin" /> : <><Sparkles size={20} /> <span>Get Instant Access</span></>}
              </button>
              
              <p className="text-[10px] text-text-muted mt-6 font-bold uppercase tracking-widest">Trusted by 12,000+ top-tier remote specialists worldwide.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PitchPage = () => {
    return (
      <div className="min-h-screen bg-bg text-text">
        <div className="max-w-7xl mx-auto px-6 py-24">
          {/* Hero Slide */}
          <div className="text-center mb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-8">
              Strategic Investment Deck
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-12">
              PASSION <br /> <span className="text-primary italic underline decoration-primary/20">WORK</span>.
            </h1>
            <p className="text-2xl md:text-3xl text-text-muted max-w-4xl mx-auto font-medium leading-tight">
              The future of niche talent acquisition. Curated. AI-Powered. Revenue-First.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-32">
            {/* Slide: The Problem */}
            <div className="bg-surface border border-border p-12 rounded-[3.5rem] shadow-sm">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-8">The Problem</h2>
              <h3 className="text-3xl font-bold mb-6 tracking-tight leading-tight italic">"Remote work is saturated with noise."</h3>
              <ul className="space-y-6 text-lg text-text-muted font-medium">
                <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-2.5 " /> Generic boards are overwhelmed with spam.</li>
                <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-2.5" /> High-tier specialists spend hours filtering bad info.</li>
                <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-2.5" /> Employers are fatigue from 1000+ unqualified bots.</li>
              </ul>
            </div>

            {/* Slide: The Solution */}
            <div className="bg-primary text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={160} />
              </div>
              <h2 className="text-sm font-black text-white/50 uppercase tracking-[0.3em] mb-8">The Solution</h2>
              <h3 className="text-3xl font-bold mb-6 tracking-tight leading-tight italic">"A curated, niche-first ecosystem."</h3>
              <ul className="space-y-6 text-lg text-white/80 font-medium relative z-10">
                <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2.5 " /> Targeted groups for Design, Tech, Marketing & more.</li>
                <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2.5" /> Search intent based on "Passions" not keywords.</li>
                <li className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2.5" /> Hybrid Parallel Fetch ensures zero loading delays.</li>
              </ul>
            </div>
          </div>

          {/* Business Model Slide */}
          <div className="bg-surface border border-border p-12 md:p-20 rounded-[4rem] mb-32 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-20" />
             <div className="grid lg:grid-cols-2 items-center gap-16 relative z-10">
               <div>
                 <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-8">Business Model</h2>
                 <h3 className="text-4xl md:text-5xl font-black mb-8 leading-none tracking-tighter">Monetized from <br /> <span className="italic text-primary">Day One</span>.</h3>
                 <div className="space-y-8">
                   <div className="flex gap-6 items-start">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><Zap className="text-primary" /></div>
                     <div>
                       <h4 className="font-bold text-xl mb-1">Featured Posts ($99)</h4>
                       <p className="text-text-muted font-medium">30 days of top placement and newsletter exposure for companies.</p>
                     </div>
                   </div>
                   <div className="flex gap-6 items-start">
                     <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0"><Briefcase className="text-green-600" /></div>
                     <div>
                       <h4 className="font-bold text-xl mb-1">Pro Subscriptions ($19/mo)</h4>
                       <p className="text-text-muted font-medium">Recurring SaaS revenue for 6-hour early access and instant alerts.</p>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-8 bg-bg rounded-[2.5rem] border border-border text-center">
                    <div className="text-4xl font-black mb-1">98%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Net Margin</div>
                 </div>
                 <div className="p-8 bg-bg rounded-[2.5rem] border border-border text-center">
                    <div className="text-4xl font-black mb-1">100%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Automated</div>
                 </div>
                 <div className="p-8 bg-bg rounded-[2.5rem] border border-border text-center col-span-2">
                    <div className="text-4xl font-black mb-1">Scale Limitless</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Handles 30k+ active listings</div>
                 </div>
               </div>
             </div>
          </div>

          {/* Technology Slide */}
          <div className="text-center mb-32">
             <h2 className="text-sm font-black text-text-muted uppercase tracking-[0.4em] mb-12">The Intellectual Advantage</h2>
             <div className="grid md:grid-cols-4 gap-4">
                {[
                  { title: "Gemini AI", desc: "Live Career Advisor", icon: <MessageCircle /> },
                  { title: "Firebase", desc: "Real-time Persistence", icon: <Database /> },
                  { title: "Stripe", desc: "Global Payment Engine", icon: <CreditCard /> },
                  { title: "Jobicy", desc: "Real-time API Ingestion", icon: <Globe /> }
                ].map(t => (
                  <div key={t.title} className="p-8 bg-surface border border-border rounded-[2rem] hover:border-primary transition-colors">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">{t.icon}</div>
                    <div className="font-bold mb-1">{t.title}</div>
                    <div className="text-xs text-text-muted font-medium">{t.desc}</div>
                  </div>
                ))}
             </div>
          </div>

          {/* Footer Slide */}
          <div className="text-center border-t border-border pt-32">
             <h2 className="text-4xl md:text-6xl font-black mb-12 tracking-tighter italic">"The definitive home for <br /> <span className="text-primary italic underline decoration-primary/20">remote specialists</span>."</h2>
             <p className="text-text-muted font-bold mb-12">Building PassionWork | {user?.email || 'Farisidon@gmail.com'}</p>
             <button 
              onClick={() => setCurrentView('landing')}
              className="px-12 py-5 bg-text text-bg rounded-3xl font-black text-lg hover:scale-105 transition-transform"
             >
               Explore Live Platform
             </button>
          </div>
        </div>
      </div>
    );
  }

  const ProSuccess = () => {
    useEffect(() => {
      const upgrade = async () => {
        if (user) {
          try {
            await updateUserProfile(user.uid, { isPro: true });
            const profile = await getUserProfile(user.uid);
            if (profile) setUserProfile(profile);
          } catch (e) {
            console.error("Error upgrading to pro:", e);
          }
        }
      };
      upgrade();
    }, []);

    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-8 animate-bounce shadow-2xl shadow-primary/40">
          <Sparkles size={48} />
        </div>
        <h1 className="text-4xl font-black text-text mb-4 tracking-tight">You're Pro!</h1>
        <p className="text-lg text-text-muted mb-12 leading-relaxed font-medium">
          Your account has been upgraded. You now have instant alerts and a cleaner, ad-free interface.
        </p>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="w-full py-5 bg-primary text-white font-black rounded-[2rem] shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
        >
          Go to Dashboard <ArrowRight size={18} />
        </button>
      </div>
    );
  };

  const SupportPage = () => {
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
      name: user?.displayName || '',
      email: user?.email || '',
      subject: '',
      message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;
      setSubmitting(true);
      try {
        await submitSupportTicket({
          ...formData,
          userId: user?.uid
        });
        setStatus('success');
      } catch (err) {
        setStatus('error');
      } finally {
        setSubmitting(false);
      }
    };

    if (status === 'success') {
      return (
        <div className="max-w-xl mx-auto py-32 px-6 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-green-500/20">
            <Check size={40} />
          </div>
          <h1 className="text-4xl font-black text-text mb-4 tracking-tight">Message Received</h1>
          <p className="text-lg text-text-muted mb-12 font-medium">
            We've caught your signal. A support specialist will review your request and get back to you via email within 24 hours.
          </p>
          <button 
            onClick={() => setCurrentView('landing')}
            className="px-12 py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all"
          >
            Back to Mission Control
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-20">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-8">
              Protocol: Support
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none mb-8">
              DIRECT <br /> <span className="text-primary italic underline decoration-primary/20">SIGNAL</span>.
            </h1>
            <p className="text-xl text-text-muted font-medium leading-relaxed mb-12">
              Facing a glitch? Need custom hiring advice? Or just want to share some high-vibe feedback? 
              Fill the fields and our human team will take it from here.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center shrink-0 shadow-sm"><Zap className="text-primary" size={20} /></div>
                <div>
                  <h4 className="font-bold text-lg mb-1 tracking-tight">Fast Response</h4>
                  <p className="text-sm text-text-muted font-medium">Average reply time: <span className="text-text font-black underline decoration-primary/20">140 minutes</span> for Pro members.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center shrink-0 shadow-sm"><MessageCircle className="text-primary" size={20} /></div>
                <div>
                  <h4 className="font-bold text-lg mb-1 tracking-tight">Real Humans</h4>
                  <p className="text-sm text-text-muted font-medium">No bots. No circular FAQ links. Just dedicated career specialists.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border p-10 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Send size={120} />
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Your Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter name"
                    className="w-full bg-bg border border-border rounded-2xl px-5 py-4 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@email.com"
                    className="w-full bg-bg border border-border rounded-2xl px-5 py-4 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking_widest text-text-muted mb-2 ml-1">Subject</label>
                <input 
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="What's on your mind?"
                  className="w-full bg-bg border border-border rounded-2xl px-5 py-4 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking_widest text-text-muted mb-2 ml-1">Message</label>
                <textarea 
                  rows={5}
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="How can we help you crush it today?"
                  className="w-full bg-bg border border-border rounded-2xl px-5 py-4 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 italic">
                  Transmission failed. Please check your connection and try again.
                </div>
              )}

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={24} className="animate-spin" /> : <><span>Transmit Message</span> <ArrowRight size={20} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const PrivacyPolicy = () => (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-5xl font-black tracking-tighter mb-8 leading-none">Privacy Policy</h1>
        <p className="text-xl text-text-muted mb-12 italic font-medium leading-relaxed underline decoration-primary/10">Last Updated: April 21, 2026</p>
        
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div className="p-8 bg-surface border border-border rounded-[2.5rem]">
            <h3 className="text-lg font-black mb-4">What we collect</h3>
            <p className="text-sm text-text-muted leading-relaxed">We gather your email for alerts, and job search preferences to tune the Pulse. We also handle authentication through Google.</p>
          </div>
          <div className="p-8 bg-surface border border-border rounded-[2.5rem]">
            <h3 className="text-lg font-black mb-4">How we use it</h3>
            <p className="text-sm text-text-muted leading-relaxed">Your data purely fuels the job-matching engine. We never sell your data to recruiters—it's between you and the platform.</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">1. Information Integrity</h2>
        <p>At {BRAND_CONFIG.name}, we believe your data should be as high-vibe as your career. We only process what is strictly necessary for service delivery.</p>
        
        <h2 className="text-3xl font-bold mt-12 mb-6">2. Third-Party Partners</h2>
        <p>We use Firebase for data persistence and Stripe for secure payments. These partners are SOC2 compliant and share our commitment to privacy.</p>
        
        <button onClick={() => setCurrentView('landing')} className="mt-16 px-12 py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">Return to Mission Control</button>
      </div>
    </div>
  );

  const TermsOfService = () => (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-5xl font-black tracking-tighter mb-8 leading-none">Terms of Service</h1>
        <p className="text-xl text-text-muted mb-12 italic font-medium leading-relaxed underline decoration-primary/10">Last Updated: April 21, 2026</p>
        
        <p className="text-lg">Welcome to {BRAND_CONFIG.name}. By accessing our marketplace, you agree to build a better remote world.</p>

        <h2 className="text-3xl font-bold mt-12 mb-6">1. Acceptable Use</h2>
        <p>This platform is for high-tier specialists and employers. Spam, automated scraping for non-personal use, or impersonation of high-vibe brands will result in immediate banning.</p>
        
        <h2 className="text-3xl font-bold mt-12 mb-6">2. Payments & Refunding</h2>
        <p>Featured jobs and Pro subscriptions are digital products. While we don't offer blanket refunds, our support specialists are available if a listing doesn't perform up to your standards.</p>
        
        <h2 className="text-3xl font-bold mt-12 mb-6">3. Platform Liability</h2>
        <p>We curate roles from Jobicy and featured submissions but do not guarantee employment results. The final vibe-check is always your responsibility.</p>
        
        <button onClick={() => setCurrentView('landing')} className="mt-16 px-12 py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">Agree & Return Home</button>
      </div>
    </div>
  );

  const GlobalFooter = () => (
    <footer className="border-t border-border/60 bg-surface/30 backdrop-blur-md py-20 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-6 scale-110 origin-left" />
            <p className="text-sm text-text-muted max-w-sm leading-relaxed font-medium mb-8">
              {BRAND_CONFIG.tagline} {BRAND_CONFIG.description}
            </p>
            <div className="flex gap-4">
               {[
                 { icon: <Linkedin size={18} />, url: BRAND_CONFIG.socials.linkedin },
                 { icon: <Facebook size={18} />, url: BRAND_CONFIG.socials.facebook },
                 { icon: <Github size={18} />, url: BRAND_CONFIG.socials.github }
               ].map((s, i) => (
                 <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-bg border border-border flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm">
                   {s.icon}
                 </a>
               ))}
            </div>
          </div>
          <div>
            <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-text mb-10">Ecosystem</h4>
            <ul className="space-y-6 text-sm font-bold text-text-muted/80">
              <li><button onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors cursor-pointer">Career Marketplace</button></li>
              <li><button onClick={() => setCurrentView('employer')} className="hover:text-primary transition-colors cursor-pointer">Talent Acquisition</button></li>
              <li><button onClick={() => setCurrentView('pro')} className="hover:text-primary transition-colors cursor-pointer">Pro Edges</button></li>
              <li><button onClick={() => setCurrentView('pulse')} className="hover:text-primary transition-colors cursor-pointer">Daily Pulse</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-text mb-10">Governance</h4>
            <ul className="space-y-6 text-sm font-bold text-text-muted/80">
              <li><button onClick={() => setCurrentView('privacy')} className="hover:text-primary transition-colors cursor-pointer">Privacy Charter</button></li>
              <li><button onClick={() => setCurrentView('terms')} className="hover:text-primary transition-colors cursor-pointer">Operating Terms</button></li>
              <li><button onClick={() => setCurrentView('pitch')} className="hover:text-primary transition-colors cursor-pointer">Investment Deck</button></li>
              <li><button onClick={() => setCurrentView('support')} className="hover:text-primary transition-colors cursor-pointer text-left">Direct Support</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none">
            © 2026 {BRAND_CONFIG.name} Economy. Built for Specialists.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-text uppercase tracking-widest opacity-60">
            <ShieldCheck size={14} className="text-primary" /> Verified High-Density Pipeline
          </div>
        </div>
      </div>
    </footer>
  );

  const handleRefresh = async () => {
    // Force bypass cache for the current params
    const params = new URLSearchParams();
    params.append('count', count.toString());
    if (region !== 'all') params.append('geo', region);
    const interestObj = INTERESTS.find(i => i.id === activeInterest);
    if (activeInterest !== 'all' && interestObj?.category) {
      params.append('industry', interestObj.category);
    }
    if (debouncedSearchTerm) {
      params.append('tag', debouncedSearchTerm);
    }
    const cacheKey = params.toString();
    
    // Clear cache for this key then re-trigger effect (by dependency if needed, but here we can just call the fetch logic if we expose it)
    // Actually, we can just clear the whole cache to be safe
    setCache({});
    setRefreshKey(prev => prev + 1);
  };

  // Helper for human-readable dates
  const formatTimeAgo = (dateStr: string) => {
    try {
      const pubDate = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - pubDate.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHrs < 1) return 'Just now';
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch (e) {
      return dateStr.split(' ')[0];
    }
  };

  // Handle search debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('count', count.toString());
        
        if (region !== 'all') params.append('geo', region);
        
        const interestObj = INTERESTS.find(i => i.id === activeInterest);
        if (activeInterest !== 'all' && interestObj?.category) {
          params.append('industry', interestObj.category);
        }

        if (debouncedSearchTerm) {
          params.append('tag', debouncedSearchTerm);
        }

        const cacheKey = params.toString();
        if (cache[cacheKey]) {
          setJobs(cache[cacheKey]);
          setLoading(false);
          return;
        }

        const MOCK_JOBS: Job[] = [
          {
            id: 'mock-1',
            jobTitle: 'Senior Full Stack Engineer',
            companyName: 'VibeTech',
            jobIndustry: 'programming',
            jobType: 'Full-time',
            jobGeo: 'Worldwide',
            pubDate: new Date().toISOString(),
            jobExcerpt: 'Build the future of decentralized collaboration with our high-vibe engineering team.',
            jobDescription: 'Build the future of decentralized collaboration with our high-vibe engineering team.',
            jobCategory: 'programming',
            url: 'https://linear.app/careers',
            companyLogo: '',
            isFeatured: true
          },
          {
            id: 'mock-2',
            jobTitle: 'Product Designer (UX/UI)',
            companyName: 'FlowStudio',
            jobIndustry: 'design',
            jobType: 'Contract',
            jobGeo: 'Europe/US',
            pubDate: new Date().toISOString(),
            jobExcerpt: 'Help us craft breathtaking interfaces for the next generation of creative tools.',
            jobDescription: 'Help us craft breathtaking interfaces for the next generation of creative tools.',
            jobCategory: 'design',
            url: 'https://www.stripe.com/jobs',
            companyLogo: '',
            isFeatured: true
          },
          {
            id: 'mock-3',
            jobTitle: 'Growth Marketing Manager',
            companyName: 'ScaleUp',
            jobIndustry: 'marketing',
            jobType: 'Full-time',
            jobGeo: 'Worldwide',
            pubDate: new Date().toISOString(),
            jobExcerpt: 'Lead our growth experiments and help us reach the next level of community engagement.',
            jobDescription: 'Lead our growth experiments and help us reach the next level of community engagement.',
            jobCategory: 'marketing',
            url: 'https://vercel.com/careers',
            companyLogo: '',
            isFeatured: false
          },
          {
            id: 'mock-4',
            jobTitle: 'Customer Success lead',
            companyName: 'HappyPath',
            jobIndustry: 'customer-support',
            jobType: 'Full-time',
            jobGeo: 'Americas',
            pubDate: new Date().toISOString(),
            jobExcerpt: 'Ensure our users are getting the most out of our platform with high-energy support.',
            jobDescription: 'Ensure our users are getting the most out of our platform with high-energy support.',
            jobCategory: 'customer-support',
            url: 'https://zapier.com/jobs',
            companyLogo: '',
            isFeatured: false
          },
          {
            id: 'mock-5',
            jobTitle: 'Technical Writer',
            companyName: 'DocFlow',
            jobIndustry: 'copywriting',
            jobType: 'Freelance',
            jobGeo: 'Worldwide',
            pubDate: new Date().toISOString(),
            jobExcerpt: 'Translate complex technical concepts into clear, engaging documentation.',
            jobDescription: 'Translate complex technical concepts into clear, engaging documentation.',
            jobCategory: 'copywriting',
            url: 'https://basecamp.com/about/jobs',
            companyLogo: '',
            isFeatured: false
          }
        ];

        // Fetch Featured jobs from Firebase
        let featuredFormatted: Job[] = [];
        try {
          const featuredJobs = await getJobPostings();
          if (featuredJobs.length > 0) {
            featuredFormatted = featuredJobs.map(f => {
              // Ensure we have a valid absolute URL for Apply button
              const url = f.url && f.url !== '#' && f.url !== '/' ? f.url : `https://www.google.com/search?q=${encodeURIComponent(`${f.jobTitle} ${f.companyName} careers`)}`;
              
              return {
                ...f,
                id: f.id || Math.random().toString(),
                url, // Normalized URL
                jobIndustry: f.jobCategory || 'Other',
                pubDate: f.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                jobExcerpt: f.jobDescription?.substring(0, 160) + '...' || '',
                isFeatured: true
              } as Job;
            });
          }
        } catch (firebaseErr) {
          console.error('Firebase featured jobs fetch failed:', firebaseErr);
        }

        // Fetch Jobicy jobs via our server-side proxy to avoid CORS and timeout issues
        let jobicyJobs: Job[] = [];
        try {
          const proxyRes = await fetch(`/api/jobs?${params.toString()}`);
          
          if (proxyRes.ok) {
            const data = await proxyRes.json();
            if (data && data.jobs) {
              jobicyJobs = data.jobs.map((job: any) => {
                // Handle different possible URL keys from API
                const url = (job.url || job.jobUrl || job.link || '#');
                const safeUrl = url !== '#' && url !== '/' ? url : `https://jobicy.com/jobs/${job.id}`;

                const rawIndustry = job.jobIndustry;
                let jobIndustry = 'other';
                if (Array.isArray(rawIndustry) && rawIndustry.length > 0) {
                  jobIndustry = String(rawIndustry[0]).toLowerCase();
                } else if (typeof rawIndustry === 'string') {
                  jobIndustry = rawIndustry.toLowerCase();
                }

                return {
                  ...job,
                  id: job.id?.toString() || `jobicy-${Math.random()}`,
                  url: safeUrl,
                  jobTitle: (job.jobTitle || '').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#039;/gi, "'"),
                  companyName: (job.companyName || '').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#039;/gi, "'"),
                  jobExcerpt: (job.jobExcerpt || '').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#039;/gi, "'"),
                  jobIndustry,
                  jobType: job.jobType || 'Full-time',
                  pubDate: job.pubDate || new Date().toISOString()
                };
              });
            }
          }
        } catch (jobicyErr) {
          // Silent fail for background ingestion
        }

        // If both failed or returned 0, use mock data as fallback to ensure something shows up
        let mergedJobs = [...featuredFormatted, ...jobicyJobs];
        if (mergedJobs.length === 0) {
          mergedJobs = MOCK_JOBS;
        }

        setJobs(mergedJobs);
        setCache(prev => ({ ...prev, [cacheKey]: mergedJobs }));
        setLastSync(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [activeInterest, region, count, debouncedSearchTerm, refreshKey]);

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter(job => {
      const matchesType = jobTypes.length === 0 || (() => {
        const types = Array.isArray(job.jobType) ? job.jobType : [job.jobType];
        return types.some(type => {
          if (!type) return false;
          const normalizedType = type.toString().toLowerCase().replace(/\s+/g, '-');
          return jobTypes.some(jt => normalizedType.includes(jt.toLowerCase()));
        });
      })();

      const minS = minSalary ? parseInt(minSalary) : 0;
      const maxS = maxSalary ? parseInt(maxSalary) : Infinity;

      const salaryMatches = (() => {
        if (!minSalary && !maxSalary) return true;
        
        if (job.salaryMin === undefined) return false;

        const currencyMatches = !selectedCurrency || job.salaryCurrency === selectedCurrency;
        const periodMatches = !selectedPeriod || job.salaryPeriod === selectedPeriod;
        const inRange = job.salaryMin >= minS && (job.salaryMax ? job.salaryMax : job.salaryMin) <= maxS;
        
        return currencyMatches && periodMatches && inRange;
      })();

      const freshnessMatches = (() => {
        if (daysFilter === 'all') return true;
        try {
          if (!job.pubDate) return true;
          // Handle various date formats (strings, numbers, dates)
          const pubDate = new Date(job.pubDate);
          if (isNaN(pubDate.getTime())) return true; // If invalid date, show it anyway
          
          const limit = new Date();
          limit.setDate(limit.getDate() - parseInt(daysFilter));
          return pubDate >= limit;
        } catch (e) {
          return true;
        }
      })();

      return matchesType && salaryMatches && freshnessMatches;
    });

    if (sortOrder === 'trending') {
      return [...filtered].sort((a, b) => {
        // High-vibe simulation of Trending: Weighted by a predictable seed from the ID
        const seedA = a.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const seedB = b.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return (seedB % 79) - (seedA % 79);
      });
    }

    return filtered;
  }, [jobs, jobTypes, minSalary, maxSalary, selectedCurrency, selectedPeriod, daysFilter, sortOrder]);

  const rssUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (region !== 'all') params.append('search_region', region);
    
    const interestObj = INTERESTS.find(i => i.id === activeInterest);
    if (activeInterest !== 'all' && interestObj?.category) {
      params.append('job_categories', interestObj.category);
    }

    if (debouncedSearchTerm) {
      params.append('search_keywords', debouncedSearchTerm);
    }

    if (jobTypes.length > 0) {
      params.append('job_types', jobTypes.join(','));
    }

    const queryString = params.toString();
    return `https://jobicy.com/feed/job_feed${queryString ? `?${queryString}` : ''}`;
  }, [activeInterest, region, debouncedSearchTerm, jobTypes]);

  const toggleJobType = (type: string) => {
    setJobTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

    const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (region !== 'all') count++;
    if (activeInterest !== 'all') count++;
    if (minSalary || maxSalary) count++;
    if (jobTypes.length !== 3) count++; // Default is 3
    return count;
  }, [searchTerm, region, activeInterest, minSalary, maxSalary, jobTypes]);

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkMode ? 'dark bg-bg' : 'bg-bg'}`}>
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        userProfile={userProfile}
        handleSignIn={handleSignIn}
        signOutUser={signOutUser}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setDebouncedSearchTerm={setDebouncedSearchTerm}
        isCopying={isCopying}
        handleCopyLink={handleCopyLink}
        savedJobIdsCount={savedJobIds.size}
        setShowSavedModal={setShowSavedModal}
        isAdmin={isAdmin}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
      />

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <XCircle className="text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2">Oops! Something went wrong</h1>
          <p className="text-text-muted mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (currentView === 'dashboard' || currentView === 'pulse') ? (
        <DashboardContent 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
          hasSeenPulseToday={hasSeenPulseToday}
          INTERESTS={INTERESTS}
          activeInterest={activeInterest}
          setActiveInterest={setActiveInterest}
          region={region}
          setRegion={setRegion}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          minSalary={minSalary}
          setMinSalary={setMinSalary}
          maxSalary={maxSalary}
          setMaxSalary={setMaxSalary}
          count={count}
          setCount={setCount}
          daysFilter={daysFilter}
          setDaysFilter={setDaysFilter}
          jobTypes={jobTypes}
          toggleJobType={toggleJobType}
          rssUrl={rssUrl}
          setShowAlertModal={setShowAlertModal}
          setShowManageModal={setShowManageModal}
          pulseData={pulseData}
          isGeneratingPulse={isGeneratingPulse}
          handleSelectJob={handleSelectJob}
          userBio={userBio}
          filteredJobs={filteredJobs}
          lastSync={lastSync}
          handleRefresh={handleRefresh}
          loading={loading}
          activeFiltersCount={activeFiltersCount}
          handleClearFilters={handleClearFilters}
          error={error}
          savedJobIds={savedJobIds}
          handleToggleSaveJob={handleToggleSaveJob}
          setSearchTerm={setSearchTerm}
          trackJobActivity={trackJobActivity}
          CompanyLogo={CompanyLogo}
          setJobTypes={setJobTypes}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          user={user}
          userProfile={userProfile}
          savedJobs={savedJobs}
        />
      ) : (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <main className="min-h-screen bg-bg relative">
            {currentView === 'landing' ? <LandingPage /> :
             currentView === 'employer' ? <EmployerPortal /> :
             currentView === 'checkout-success' ? <CheckoutSuccess /> :
             currentView === 'admin' ? <AdminDashboard /> :
             currentView === 'pro' ? <ProSubscriber /> :
             currentView === 'pro-success' ? <ProSuccess /> :
             currentView === 'pitch' ? <PitchPage /> :
             currentView === 'privacy' ? <PrivacyPolicy /> :
             currentView === 'terms' ? <TermsOfService /> :
             currentView === 'support' ? <SupportPage /> :
             currentView === 'saved-jobs' ? <SavedJobsHub /> :
             currentView === 'employer-hub' ? <EmployerHub /> :
             currentView === 'employer-stats' ? (
               <EmployerPostStats job={statsJob} stats={statsData} loading={statsLoading} />
             ) : (
               <CheckoutCancel />
             )}
          </main>
          <GlobalFooter />
        </div>
      )}


      {/* Quick View Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <div 
            onClick={handleCloseJobModal}
            className="absolute inset-0 bg-text/60 backdrop-blur-md"
          />
          <div 
            className="relative w-full max-w-4xl bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full"
          >
            <div className="p-6 border-b border-border flex justify-between items-start gap-4 shrink-0">
              <div className="flex gap-5 flex-1 min-w-0">
                <CompanyLogo src={selectedJob.companyLogo} name={selectedJob.companyName} category={selectedJob.jobIndustry} className="w-16 h-16 rounded-2xl p-2" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-extrabold tracking-tight mb-1 truncate">{selectedJob.jobTitle}</h2>
                  <p className="text-lg font-semibold text-primary mb-2 line-clamp-1">{selectedJob.companyName}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-text-muted font-medium">
                    <span className="flex items-center gap-1.5"><Globe size={14} className="text-primary" /> {selectedJob.jobGeo}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {formatTimeAgo(selectedJob.pubDate)}</span>
                    <span className="flex items-center gap-1.5 capitalize"><Briefcase size={14} className="text-primary" /> {Array.isArray(selectedJob.jobType) ? selectedJob.jobType.join(', ') : selectedJob.jobType}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => handleToggleSaveJob(selectedJob)}
                  className="p-3 hover:bg-bg rounded-2xl border border-border text-text-muted hover:text-red-500 transition-all"
                  title="Save Job"
                >
                  <Heart 
                    size={22} 
                    className={savedJobIds.has(selectedJob.id) ? 'fill-red-500 text-red-500' : ''} 
                  />
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="p-3 hover:bg-bg rounded-2xl border border-border text-text-muted hover:text-primary transition-all relative"
                  title="Share Search"
                >
                  {isCopying ? <Check size={22} className="text-green-500" /> : <Share2 size={22} />}
                </button>
                <button 
                  onClick={handleCloseJobModal}
                  className="p-3 hover:bg-bg rounded-2xl border border-border text-text-muted hover:text-text transition-all"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
              <div className="mb-12">
                <h3 className="text-sm uppercase font-bold text-text-muted tracking-[0.2em] mb-6">Position Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl bg-bg border border-border hover:border-primary/20 transition-colors">
                    <p className="text-[10px] uppercase font-bold text-text-muted mb-2 flex items-center gap-1.5">
                      <LayoutGrid size={10} /> Industry
                    </p>
                    <p className="text-sm font-extrabold truncate text-text">{selectedJob.jobIndustry || selectedJob.jobCategory}</p>
                  </div>
                  <div className="p-5 rounded-3xl bg-bg border border-border hover:border-primary/20 transition-colors">
                    <p className="text-[10px] uppercase font-bold text-text-muted mb-2 flex items-center gap-1.5">
                      <Filter size={10} /> Seniority
                    </p>
                    <p className="text-sm font-extrabold truncate text-text">{selectedJob.jobLevel || 'Not specified'}</p>
                  </div>
                  {selectedJob.salaryMin && (
                    <div className="col-span-2 p-5 rounded-3xl bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors">
                      <p className="text-[10px] uppercase font-bold text-green-600 mb-2 flex items-center gap-1.5">
                        <Check size={10} /> Estimated Compensation
                      </p>
                      <p className="text-sm font-black text-green-700">
                         {selectedJob.salaryCurrency} {selectedJob.salaryMin.toLocaleString()} {selectedJob.salaryMax ? `- ${selectedJob.salaryMax.toLocaleString()}` : ''} <span className="text-[10px] font-bold opacity-60 uppercase">/ {selectedJob.salaryPeriod}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Matcher Section */}
              <div className="mb-12 p-8 rounded-[2rem] bg-accent border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Target size={120} />
                </div>
                
                <h3 className="text-sm uppercase font-bold text-primary tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Sparkles size={16} /> AI Resume Matcher
                </h3>
                
                <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Paste your LinkedIn Bio or Experience</label>
                    <textarea 
                      value={userBio}
                      onChange={(e) => setUserBio(e.target.value)}
                      placeholder="e.g. 5+ years of Senior Product Design... Expert in Figma, React, and Framer..."
                      className="w-full h-32 bg-surface border border-border rounded-2xl p-4 text-xs focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none font-medium"
                    />
                    <button 
                      onClick={() => handleCalculateMatch(selectedJob)}
                      disabled={isCalculatingMatch || !userBio.trim()}
                      className="mt-4 w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                      {isCalculatingMatch ? <><Loader2 size={18} className="animate-spin" /> Analyzing Match...</> : <><Check size={18} /> Check My Fit</>}
                    </button>
                  </div>
                  
                  <div className="min-h-[160px] flex items-center justify-center relative">
                    {matchResult ? (
                      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-end gap-4 mb-6">
                           <div className="text-6xl font-black text-primary tracking-tighter tabular-nums leading-none">{matchResult.score}%</div>
                           <div className="text-xs font-bold text-text-muted uppercase tracking-widest pb-1.5">Match Score</div>
                        </div>
                        <div className="p-4 bg-surface/50 border border-border rounded-xl">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Gap Analysis</h4>
                          <div className="prose prose-xs dark:prose-invert">
                            <Markdown>{matchResult.gap}</Markdown>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center opacity-40">
                         <Target size={48} className="mx-auto mb-4" />
                         <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Enter your experience<br/>to find your match</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vibe-Check Section */}
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm uppercase font-bold text-text-muted tracking-[0.2em]">Remote Vibe-Check</h3>
                  {companyVibeData && (
                    <div className="text-[10px] font-black uppercase text-primary bg-accent px-3 py-1 rounded-full">
                      Verified Score: {companyVibeData.overall.toFixed(1)}/5
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2rem] bg-bg border border-border">
                    <div className="space-y-6">
                      {companyVibeData ? (
                        <>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-[11px] font-black text-text italic">Async Maturity</span>
                              <span className="text-xs font-bold text-primary">{companyVibeData.avgAsync.toFixed(1)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(companyVibeData.avgAsync / 5) * 100}%` }} className="h-full bg-primary" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-[11px] font-black text-text italic">Deep Work / Meeting Density</span>
                              <span className="text-xs font-bold text-amber-500">{companyVibeData.avgMeeting.toFixed(1)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-amber-50 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(companyVibeData.avgMeeting / 5) * 100}%` }} className="h-full bg-amber-500" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-[11px] font-black text-text italic">Borderless Hiring</span>
                              <span className="text-xs font-bold text-green-600">{companyVibeData.avgBorderless.toFixed(1)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-green-50 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(companyVibeData.avgBorderless / 5) * 100}%` }} className="h-full bg-green-600" />
                            </div>
                          </div>
                          <p className="text-[10px] text-text-muted mt-4 text-center">Based on {companyVibeData.count} verified user submissions.</p>
                        </>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm font-bold text-text-muted mb-2">No vibe data yet.</p>
                          <p className="text-[10px] text-text-muted opacity-60">Be the first to verify this company's remote culture.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                    <TrendingUp size={32} className="text-primary mb-4 opacity-40" />
                    <h4 className="text-sm font-black text-text mb-2 tracking-tight">Work here before?</h4>
                    <p className="text-[10px] text-text-muted leading-relaxed mb-6">Your anonymous Vibe-Check helps the community filter for true remote-first cultures.</p>
                    <button 
                      onClick={() => {
                        if (!user) { handleSignIn(); return; }
                        setVibeCompany(selectedJob.companyName);
                        setShowVibeModal(true);
                      }}
                      className="px-6 py-2 bg-text text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-all active:scale-95"
                    >
                      Rate Culture
                    </button>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-strong:text-text prose-p:text-text/80 leading-relaxed">
                <div 
                  className="job-description-html"
                  dangerouslySetInnerHTML={{ __html: selectedJob.jobDescription }} 
                />
              </div>
            </div>

            <div className="p-6 border-t border-border bg-bg/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-xs text-text-muted italic">Found this passionate opportunity? It only takes 2 minutes to apply.</p>
              <div className="flex gap-4 w-full sm:w-auto">
                 <button 
                  onClick={() => handleGetStrategy(selectedJob)}
                  disabled={isGeneratingStrategy}
                  className="hidden md:flex flex-1 sm:flex-none px-6 py-3 bg-accent text-primary font-bold rounded-2xl border border-primary/20 hover:bg-primary hover:text-white transition-all items-center justify-center gap-2 relative group overflow-hidden"
                 >
                   {isGeneratingStrategy ? (
                     <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                   ) : (
                     <>
                       <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/20 group-hover:bg-white/40" />
                       <Sparkles size={18} /> <span>Get AI Strategy</span>
                     </>
                   )}
                 </button>
                 <button 
                  onClick={handleCloseJobModal}
                  className="flex-1 sm:flex-none px-6 py-3 font-bold text-text-muted hover:text-text"
                 >
                   Maybe later
                 </button>
                 <a 
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                 >
                   Apply for this role <ExternalLink size={18} />
                 </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            onClick={() => { if (alertStatus !== 'loading') setShowAlertModal(false); }}
            className="absolute inset-0 bg-text/60 backdrop-blur-md"
          />
          <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bell size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Email Alerts</h2>
              </div>
              <button 
                onClick={() => setShowAlertModal(false)}
                className="p-1 hover:bg-bg rounded-full text-text-muted"
                disabled={alertStatus === 'loading'}
              >
                <X size={20} />
              </button>
            </div>

            {alertStatus === 'success' ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2">Alert Activated!</h3>
                <p className="text-sm text-text-muted">We'll email you as soon as new passionate roles are found.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAlert} className="space-y-6">
                <p className="text-sm text-text-muted">
                  Get notified when new <strong>{activeInterest === 'all' ? 'Remote' : INTERESTS.find(i => i.id === activeInterest)?.label}</strong> jobs appear in <strong>{region === 'all' ? 'Anywhere' : region.toUpperCase()}</strong>.
                </p>
                
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Work Email</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                  />
                  {alertStatus === 'error' && (
                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <XCircle size={12} /> Something went wrong. Please try again.
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={alertStatus === 'loading'}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {alertStatus === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Activating...
                    </>
                  ) : (
                    'Activate Job Alerts'
                  )}
                </button>
                
                <p className="text-[10px] text-center text-text-muted px-4">
                  By activating, you agree to receive job notifications. You can unsubscribe at any time from the alert email.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manage Alerts Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowManageModal(false)}
            className="absolute inset-0 bg-text/60 backdrop-blur-md"
          />
          <div className="relative w-full max-w-xl bg-surface rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Trash2 size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Manage My Alerts</h2>
              </div>
              <button onClick={() => setShowManageModal(false)} className="p-1 hover:bg-bg rounded-full text-text-muted"><X size={20} /></button>
            </div>

            <form onSubmit={handleManageAlerts} className="mb-8 shrink-0">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Enter your alert email</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="you@company.com"
                  className="flex-1 px-4 py-3 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-text transition-all"
                  value={manageEmail}
                  onChange={(e) => setManageEmail(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={manageLoading}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {manageLoading ? <Loader2 size={18} className="animate-spin" /> : 'Find Alerts'}
                </button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {manageLoading ? (
                <div className="py-20 text-center text-text-muted">
                  <Loader2 size={32} className="mx-auto animate-spin mb-4" />
                  <p className="text-sm">Fetching your active subscriptions...</p>
                </div>
              ) : myAlerts.length > 0 ? (
                myAlerts.map(alert => (
                  <div key={alert.id} className="p-4 rounded-2xl border border-border bg-bg/50 flex justify-between items-center group hover:border-primary/30 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="font-bold text-sm text-text truncate">
                          {alert.category ? INTERESTS.find(i => i.category === alert.category)?.label.split(' ')[1] : alert.keywords || 'General Alert'}
                        </p>
                      </div>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-tight">
                        {alert.region || 'Anywhere'} • {alert.jobTypes?.join(', ') || 'All Types'} {alert.keywords && `• "${alert.keywords}"`}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove Alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : manageEmail && (
                <div className="text-center py-12 text-text-muted">
                   <BellOff size={40} className="mx-auto opacity-20 mb-4" />
                   <p>No active alerts found for this email.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Jobs Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowSavedModal(false)}
            className="absolute inset-0 bg-text/60 backdrop-blur-md"
          />
          <div className="relative w-full max-w-2xl bg-surface rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <Heart size={20} className="fill-red-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Saved Opportunities</h2>
              </div>
              <button onClick={() => setShowSavedModal(false)} className="p-1 hover:bg-bg rounded-full text-text-muted"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {savedJobs.length > 0 ? (
                savedJobs.map(job => (
                  <div key={job.jobId} className="p-4 rounded-2xl border border-border bg-bg hover:border-primary transition-all flex items-center gap-4 group">
                    <CompanyLogo src={job.companyLogo} name={job.companyName} category={job.category} className="w-12 h-12 rounded-lg p-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{job.jobTitle}</h4>
                      <p className="text-xs text-primary font-semibold">{job.companyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 text-text-muted hover:text-primary hover:bg-accent rounded-lg"
                        title="Open Link"
                       >
                         <ExternalLink size={16} />
                       </a>
                       <button 
                        onClick={() => handleToggleSaveJob({ id: job.jobId } as any)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Remove"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 px-8 text-text-muted border-2 border-dashed border-border rounded-3xl">
                  <Heart size={48} className="mx-auto opacity-10 mb-6" />
                  <p className="font-extrabold text-lg text-text mb-2 tracking-tight">Your stash is empty</p>
                  <p className="text-sm max-w-[280px] mx-auto leading-relaxed">
                    Tap the heart icon on any job card to keep it here for later. We'll remember your choices even after you close the tab.
                  </p>
                  <button 
                    onClick={() => setShowSavedModal(false)}
                    className="mt-8 text-primary font-bold text-sm hover:underline"
                  >
                    Start exploring roles
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job Strategy Modal */}
      {strategy && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            onClick={() => setStrategy(null)}
            className="absolute inset-0 bg-text/60 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 bg-gradient-to-br from-primary to-indigo-700 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
                 <Sparkles size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                    <Target size={24} />
                  </div>
                  <button onClick={() => setStrategy(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <h3 className="text-2xl font-black tracking-tight leading-none mb-2">Application Strategist</h3>
                <p className="text-sm opacity-80 font-medium">3 tactical tips for your {selectedJob?.companyName} application.</p>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-bg/50">
               <div className="prose prose-sm dark:prose-invert max-w-none text-text prose-p:leading-relaxed prose-li:font-medium prose-strong:text-primary">
                  <Markdown>{strategy}</Markdown>
               </div>
               
               <div className="mt-8 pt-8 border-t border-border flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                     <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                       <Check size={16} />
                     </div>
                     <p className="text-[11px] font-bold text-green-700 leading-tight">
                        Strategy active. These tips focus on your specific category: {selectedJob?.jobIndustry || selectedJob?.jobCategory}.
                     </p>
                  </div>
                  <button 
                    onClick={() => setStrategy(null)}
                    className="w-full py-4 bg-surface border border-border text-text font-bold rounded-2xl hover:bg-bg transition-all"
                  >
                    Got it, thanks!
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Vibe-Check Modal */}
      <AnimatePresence>
        {showVibeModal && (
          <VibeCheckModal 
            company={vibeCompany}
            scores={vibeScores}
            setScores={setVibeScores}
            onSubmit={handleVibeSubmit}
            onClose={() => setShowVibeModal(false)}
            loading={isSubmittingVibe}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSignIn={handleActualSignIn}
          />
        )}
      </AnimatePresence>

      {/* Global Components */}
      <ActivityTicker />
      <Chatbot />
    </div>
  );
}
