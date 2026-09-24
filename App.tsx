
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { 
  Bell, Search, ChevronLeft, Award, Users, Check, 
  Wallet, Compass, Zap, 
  MessageSquare, Share2, Heart, Sparkles, Send, Shield, Settings, LogOut, Filter, Image as ImageIcon,
  PlayCircle, MoreHorizontal, ArrowUpRight, X, ChevronRight, Copy, Twitter, Volume2, VolumeX,
  Trophy, Flame, Lock, Timer, Box, Star, Crown, LayoutGrid, List, AlertCircle, Wand2, PenTool, BrainCircuit,
  ChevronDown, ArrowRight
} from 'lucide-react';
import { MOCK_TALENT, INITIAL_BACKINGS, MOCK_USER, MOCK_POSTS, MOCK_BACKERS_AVATARS, MOCK_CONTENT_IMAGES, MOCK_FULL_BACKERS_LIST, MOCK_NOTIFICATIONS, MULTIPLIER_TIERS } from './constants';
import { Talent, ScreenName, Backing, AppState, Post, UserProfile, ChatSession, Message, Notification, Drop, Comment } from './types';
import { TalentCard } from './components/TalentCard';
import { BottomNav } from './components/BottomNav';
import { Button } from './components/Button';

// --- SOUND UTILS ---
export const playSound = (type: 'click' | 'success' | 'tap' | 'pop') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;

    if (type === 'click') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'tap') {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'pop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(500, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      // Arpeggio
      const notes = [440, 554.37, 659.25]; // A major
      notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.05, now + (i * 0.1));
          g.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.1) + 0.4);
          o.start(now + (i * 0.1));
          o.stop(now + (i * 0.1) + 0.4);
      });
    }
  } catch (e) {
    console.error(e);
  }
  
  // Haptics
  if (navigator.vibrate) {
      if (type === 'success') navigator.vibrate([50, 50, 50]);
      else if (type === 'click') navigator.vibrate(20);
      else navigator.vibrate(5);
  }
};

// --- AI UTILS ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generate = async (prompt: string, modelName: string = 'gemini-2.5-flash') => {
    setLoading(true);
    setResult(null);
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      setResult(response.text || "");
    } catch (e) {
      console.error(e);
      setResult("AI service is currently busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setResult(null);

  return { loading, result, generate, clear };
};

// --- HELPERS ---
const getMultiplierStats = (followerCount: number) => {
    return MULTIPLIER_TIERS.find(t => followerCount < t.maxFollowers) || MULTIPLIER_TIERS[MULTIPLIER_TIERS.length - 1];
};

const formatTime = (dateStr: string) => {
  if (dateStr === 'Just now') return dateStr;
  if (dateStr.endsWith('ago')) return dateStr;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- SHARED COMPONENTS ---
const SkeletonLoader = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// CHART COMPONENT
const FollowerGrowthChart: React.FC<{ data: { date: string, count: number }[] }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxCount = Math.max(...data.map(d => d.count));
    const minCount = Math.min(...data.map(d => d.count));
    const range = maxCount - minCount;
    
    // Normalize data points for SVG path
    // Width: 100%, Height: 100px (increased)
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.count - minCount) / range) * 80; // 80% height usage to leave padding
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `0,100 ${points} 100,100`;

    // Calculate percentage growth from start
    const start = data[0].count;
    const end = data[data.length - 1].count;
    const growth = ((end - start) / start) * 100;

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mt-4 relative overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Momentum</h4>
                    <div className="text-xl font-bold text-rally-dark">{end.toLocaleString()} <span className="text-gray-400 text-sm font-medium">Followers</span></div>
                </div>
                <div className="flex items-center gap-1 text-green-500 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                    <ArrowUpRight size={16} /> +{growth.toFixed(0)}%
                </div>
            </div>
            
            <div className="h-28 w-full relative group">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                    <div className="border-t border-dashed border-gray-100 w-full" />
                    <div className="border-t border-dashed border-gray-100 w-full" />
                    <div className="border-t border-dashed border-gray-100 w-full" />
                </div>

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FB923C" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={`M${areaPath} Z`} fill="url(#chartGradient)" />
                    <polyline points={points} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    
                    {/* Dots for points */}
                    {data.map((d, i) => {
                         const x = (i / (data.length - 1)) * 100;
                         const y = 100 - ((d.count - minCount) / range) * 80;
                         return (
                             <circle key={i} cx={x} cy={y} r="0" className="group-hover:r-1 transition-all duration-300" fill="#F97316" stroke="white" strokeWidth="0.5" />
                         )
                    })}
                </svg>
            </div>
             {/* X-Axis Labels (Show start, middle, end) */}
             <div className="flex justify-between mt-3 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                <span>{data[0].date}</span>
                <span>{data[Math.floor(data.length / 2)].date}</span>
                <span>{data[data.length - 1].date}</span>
            </div>
        </div>
    );
};

// RALLY CARD COMPONENT
const RallyCard: React.FC<{ 
    image: string; 
    name: string; 
    category?: string; 
    multiplier: number; 
    points: number; 
    rank: number; 
    date: string;
    tierName: string;
    variant?: 'default' | 'small';
}> = ({ 
    image, 
    name, 
    category, 
    multiplier, 
    points, 
    rank, 
    date,
    tierName,
    variant = 'default' 
}) => {
    return (
        <div className={`relative overflow-hidden bg-rally-dark text-white shadow-2xl shadow-black/20 border border-white/10 ${variant === 'small' ? 'rounded-[20px] aspect-[3/4]' : 'rounded-[24px] aspect-[3/4] w-full max-w-sm'}`}>
            {/* Background & Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black z-0" />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500 rounded-full blur-[60px] opacity-20 z-0" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent z-0" />
            
            <div className="relative z-10 h-full flex flex-col p-4 md:p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                        <Zap size={10} className="text-orange-400 fill-orange-400" /> {multiplier}x Locked
                    </div>
                    <Crown size={variant === 'small' ? 16 : 24} className="text-yellow-400" />
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className={`rounded-full border-2 border-white/10 p-1 mb-3 ${variant === 'small' ? 'w-16 h-16' : 'w-24 h-24'}`}>
                        <img src={image} className="w-full h-full rounded-full object-cover" alt={name} />
                    </div>
                    <h3 className={`font-bold leading-tight ${variant === 'small' ? 'text-lg' : 'text-2xl'}`}>{name}</h3>
                    {category && <p className="text-white/50 text-xs mb-4">{category}</p>}
                    
                    <div className={`grid grid-cols-2 gap-2 w-full bg-white/5 rounded-xl p-3 border border-white/5 ${variant === 'small' ? 'text-xs' : ''}`}>
                        <div>
                            <p className="text-[10px] uppercase text-white/40 font-bold">Tier</p>
                            <p className={`font-bold text-orange-400 ${variant === 'small' ? 'text-sm' : 'text-xl'}`}>{tierName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-white/40 font-bold">Points</p>
                            <p className={`font-bold ${variant === 'small' ? 'text-sm' : 'text-xl'}`}>{points}</p>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] text-white/40 uppercase font-bold">Rank</p>
                        <p className={`${variant === 'small' ? 'text-sm' : 'text-lg'} font-bold`}>#{rank}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase font-bold">Backed</p>
                        <p className={`${variant === 'small' ? 'text-xs' : 'text-sm'} font-medium`}>{new Date(date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS (SCREENS) ---

// 1. SPLASH SCREEN
const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-screen w-full bg-rally-bg flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-spark rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 animate-pulse">
          <Crown size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-rally-dark">Rally</h1>
        <p className="text-sm text-gray-400 mt-2 font-medium tracking-wide">PROOF OF BELIEF</p>
      </motion.div>
    </div>
  );
};

// 2. ONBOARDING SCREEN
const OnboardingScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Spot Talent Early", desc: "Find the next big thing before the world does.", image: "🔭" },
    { title: "Back to Believe", desc: "Lock in high multipliers by backing them early. Prove you were first.", image: "⚡" },
    { title: "Climb & Earn", desc: "Get Clout Points, climb leaderboards, and unlock exclusive Drops.", image: "🎁" }
  ];

  const handleNext = () => {
      playSound('click');
      if (step < steps.length - 1) setStep(step + 1);
      else onFinish();
  }

  return (
    <div className="h-screen w-full bg-rally-bg p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode='wait'>
            <motion.div 
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="text-center"
            >
                <div className="text-8xl mb-8">{steps[step].image}</div>
                <h2 className="text-3xl font-bold text-rally-dark mb-4 tracking-tight">{steps[step].title}</h2>
                <p className="text-gray-500 text-lg leading-relaxed">{steps[step].desc}</p>
            </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-rally-dark' : 'w-2 bg-gray-200'}`} />
            ))}
        </div>
        <Button onClick={handleNext} fullWidth>
            {step === steps.length - 1 ? "Start Believing" : "Next"}
        </Button>
      </div>
    </div>
  );
};

// 3. HOME SCREEN
const HomeScreen: React.FC<{ 
    onSelectTalent: (t: Talent) => void, 
    onAvatarClick: () => void, 
    user: UserProfile, 
    onMessages: () => void, 
    onNotifications: () => void,
    unreadCount: number
}> = ({ onSelectTalent, onAvatarClick, user, onMessages, onNotifications, unreadCount }) => {
  
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  // Filter Logic
  const filteredTalents = activeFilter === 'All' 
    ? MOCK_TALENT 
    : MOCK_TALENT.filter(t => t.category.includes(activeFilter.replace('s', ''))); // 'Athletes' -> 'Athlete'

  const freshFaces = filteredTalents.filter(t => t.followerCount < 10000);
  const hotTalent = filteredTalents.filter(t => t.followerCount >= 10000);

  // Filters with mapping to internal category names if needed, but display names work with simple logic above
  const filters = ['All', 'Athletes', 'Creators', 'Musicians'];

  return (
    <div className="pb-32 pt-28 px-4 bg-rally-bg min-h-screen">
      {/* Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-rally-bg/95 backdrop-blur-xl border-b border-black/5 max-w-md mx-auto shadow-sm transition-all duration-300">
        <div className="px-4 h-16 flex items-center justify-between">
            <button onClick={() => { playSound('tap'); onAvatarClick(); }} className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-white shadow-md active:scale-95 transition-transform">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            </button>
            <h1 className="font-bold text-xl tracking-tight text-rally-dark">Discover</h1>
            <div className="flex items-center gap-3">
                <button onClick={() => { playSound('tap'); onNotifications(); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md text-gray-600 border border-white/20 hover:bg-white transition-colors relative shadow-sm active:scale-95">
                    <Bell size={20} className="text-gray-700" />
                    <div className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </button>
                <div onClick={() => { playSound('tap'); onMessages(); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-rally-dark text-white border border-gray-100 hover:bg-black transition-colors cursor-pointer relative shadow-lg shadow-black/20 active:scale-95">
                    <Send size={18} />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                            {unreadCount}
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Filter Chips */}
        <div className="px-4 pb-4 flex gap-3 overflow-x-auto no-scrollbar mask-linear-fade">
             {filters.map((f, i) => {
                 const isActive = activeFilter === f;
                 return (
                    <button 
                        key={f} 
                        onClick={() => { playSound('tap'); setActiveFilter(f); }}
                        className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 active:scale-95 shadow-sm border ${
                            isActive 
                            ? 'bg-rally-dark text-white border-transparent shadow-lg shadow-black/20 translate-y-[1px]' 
                            : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                        }`}
                    >
                        {f}
                    </button>
                 );
             })}
        </div>
      </div>

      {/* Section 1: Fresh Faces (Horizontal Scroll) */}
      <div className="mb-10 mt-8">
        <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-rally-dark tracking-tight">Fresh Faces</h2>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">20x Available</span>
            </div>
             <button className="text-orange-500 text-xs font-bold hover:text-orange-600 transition-colors">See All</button>
        </div>
        
        {freshFaces.length > 0 ? (
             // Horizontal Scroll Container with Snapping
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 -mx-4 px-6 snap-x snap-mandatory pt-4">
                {freshFaces.map((talent, index) => (
                    <div key={talent.id} className="snap-center shrink-0 first:pl-2 last:pr-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        onClick={() => { playSound('click'); onSelectTalent(talent); }}
                        className="cursor-pointer"
                    >
                        <TalentCard talent={talent} variant="compact" onClick={() => onSelectTalent(talent)} />
                    </motion.div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-gray-50 rounded-[24px] p-8 text-center border border-dashed border-gray-200 mx-1">
                <p className="text-gray-400 font-bold text-sm">No fresh faces found in this category.</p>
            </div>
        )}
      </div>

      {/* Section 2: Heat Leaders (Vertical List) */}
      <div>
        <h2 className="text-2xl font-bold text-rally-dark tracking-tight mb-5 px-1 flex items-center gap-2">
            Trending <Flame size={24} className="text-orange-500 fill-orange-500 animate-pulse" />
        </h2>
        <div className="flex flex-col gap-2 pb-4">
            {hotTalent.length > 0 ? (
                hotTalent.map((talent, index) => (
                    <motion.div
                        key={talent.id}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + (index * 0.1), type: "spring", stiffness: 100, damping: 20 }}
                    >
                        <TalentCard talent={talent} variant="full" onClick={() => { playSound('click'); onSelectTalent(talent); }} />
                    </motion.div>
                ))
            ) : (
                <div className="bg-gray-50 rounded-[24px] p-12 text-center border border-dashed border-gray-200 mx-1">
                    <p className="text-gray-400 font-bold text-sm">No trending talent in this category.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// 4. EXPLORE SCREEN
const ExploreScreen: React.FC<{ onSelectTalent: (t: Talent) => void, onOpenVeo: () => void }> = ({ onSelectTalent, onOpenVeo }) => {
    const { loading, result, generate, clear } = useAI();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Talent[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Predictive Search Logic
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const filtered = MOCK_TALENT.filter(t => 
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handleScout = () => {
        playSound('click');
        const prompt = `I am looking to back a rising talent on Rally. I have a JSON list: ${JSON.stringify(MOCK_TALENT)}. 
        Recommend one "underdog" with a high multiplier (Seed or Sprout tier) who has high potential heat. 
        Explain why in 2 sentences focusing on "Heat" and "Status". No markdown.`;
        generate(prompt, 'gemini-2.5-flash-lite');
    };
    
    // Filter by Category
    const categoryTalents = activeCategory 
        ? MOCK_TALENT.filter(t => t.category.toLowerCase().includes(activeCategory.toLowerCase().replace(/[^a-zA-Z]/g, '').replace('s', ''))) // Simple normalize
        : [];

    const categories = [
        { name: 'Basketball', icon: '🏀' },
        { name: 'Art & Design', icon: '🎨' },
        { name: 'Music', icon: '🎵' },
        { name: 'Track', icon: '🏃‍♂️' },
        { name: 'Gaming', icon: '🎮' },
        { name: 'Tech', icon: '📱' }
    ];

    return (
        <div className="pb-32 pt-20 px-4 bg-rally-bg min-h-screen relative" onClick={() => setSearchResults([])}>
            <div className="fixed top-0 left-0 right-0 z-40 bg-rally-bg/95 backdrop-blur-xl border-b border-black/5 max-w-md mx-auto p-4 transition-all duration-300">
                 <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search athletes, creators..." 
                        className="w-full bg-white border border-gray-200 rounded-[16px] pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                            {searchResults.slice(0, 5).map(result => (
                                <div 
                                    key={result.id} 
                                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                                    onClick={() => {
                                        onSelectTalent(result);
                                        setSearchQuery('');
                                    }}
                                >
                                    <img src={result.image} className="w-8 h-8 rounded-full object-cover" />
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{result.name}</div>
                                        <div className="text-xs text-gray-500">{result.category}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            </div>

            {/* AI Feature: Rally Scout */}
            <div className="mb-8 mt-4">
                <div className="bg-gradient-to-br from-indigo-900 to-black rounded-[24px] p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-yellow-400" size={20} />
                            <h3 className="font-bold text-lg">Rally AI Scout</h3>
                        </div>
                        <p className="text-white/70 text-sm mb-4">Find hidden gems with high multipliers before they blow up.</p>
                        
                        {!result && !loading && (
                            <button 
                                onClick={handleScout} 
                                className="bg-white text-indigo-900 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50 shadow-lg"
                            >
                                <Zap size={16} className="fill-current" /> Find a Gem
                            </button>
                        )}
                        
                        {loading && (
                             <div className="space-y-2">
                                <SkeletonLoader className="h-4 w-full bg-white/20" />
                                <SkeletonLoader className="h-4 w-3/4 bg-white/20" />
                             </div>
                        )}

                        {result && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <p className="text-sm leading-relaxed">{result}</p>
                                <button onClick={clear} className="text-xs text-white/50 mt-2 underline">Clear</button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Categories */}
            <h3 className="font-bold text-rally-dark mb-4">Browse</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
                {categories.map(cat => {
                    // Extract core name for comparison
                    const coreName = cat.name.split(' ')[0]; // Basic logic for demo
                    const isActive = activeCategory && activeCategory.includes(coreName);
                    
                    return (
                        <div 
                            key={cat.name} 
                            onClick={() => {
                                playSound('tap');
                                setActiveCategory(isActive ? null : coreName);
                            }}
                            className={`p-4 rounded-[16px] font-medium transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-between group ${
                                isActive 
                                ? 'bg-rally-dark text-white ring-2 ring-orange-400' 
                                : 'bg-white border border-gray-100 text-gray-700 hover:border-orange-200'
                            }`}
                        >
                            <span>{cat.icon} {cat.name}</span>
                            {isActive && <ChevronDown size={16} className="text-orange-400" />}
                        </div>
                    );
                })}
            </div>

            {/* Dynamic Result List */}
            <AnimatePresence>
                {activeCategory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-rally-dark text-lg">Top in {activeCategory}</h3>
                            <span className="text-xs text-gray-400">{categoryTalents.length} results</span>
                         </div>
                         
                         <div className="flex flex-col gap-3">
                             {categoryTalents.length > 0 ? (
                                 categoryTalents.map((t, i) => (
                                     <motion.div 
                                        key={t.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                     >
                                        <TalentCard 
                                            talent={t} 
                                            variant="full" 
                                            onClick={() => {
                                                playSound('click');
                                                onSelectTalent(t);
                                            }} 
                                        />
                                     </motion.div>
                                 ))
                             ) : (
                                 <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                     No results found for this category.
                                 </div>
                             )}
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 9. BACKING FLOW SCREEN
const BackingFlow: React.FC<{ talent: Talent, onComplete: (amt: number, tier: string) => void, onBack: () => void }> = ({ talent, onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(50);
  
  const stats = getMultiplierStats(talent.followerCount);
  const points = amount * stats.multiplier;

  const handleNext = () => {
    playSound('click');
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  useEffect(() => {
    if (step === 3) {
        playSound('success');
        const t = setTimeout(() => {
            onComplete(amount, stats.name);
        }, 8000); // Increased time to enjoy the success screen
        return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-rally-bg p-6 flex flex-col relative overflow-hidden">
        {step < 3 && (
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 -ml-2 bg-white rounded-full shadow-sm text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"><ChevronLeft size={20} /></button>
                <div className="flex gap-2">
                    {[1,2,3].map(s => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-rally-dark' : 'w-2 bg-gray-200'}`} />
                    ))}
                </div>
                <div className="w-8" />
            </div>
        )}

        <AnimatePresence mode='wait'>
            {step === 1 && (
                <motion.div key="step1" initial={{ x: 0, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col">
                    <div className="text-center mb-6">
                        <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-xs mb-2 inline-block">Current Multiplier</span>
                        <h2 className="text-4xl font-bold text-rally-dark">{stats.multiplier}x</h2>
                        <p className="text-gray-500 text-sm mt-1">Locked forever if you back now</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 relative overflow-hidden">
                        <div className="text-center mb-8">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Backing Amount</p>
                            <div className="text-5xl font-bold font-mono text-rally-dark flex items-center justify-center">
                                <span className="text-2xl text-gray-300 mr-1">$</span>{amount}
                            </div>
                            <p className="text-orange-500 font-bold text-sm mt-2">
                                Estimated Rank: Top 5% (~#{Math.floor(points / 20) + 40})
                            </p>
                        </div>

                         <div className="w-full px-2 mb-10 relative z-10">
                            <input 
                                type="range" 
                                min="10" 
                                max={stats.maxBacking} 
                                step="10"
                                value={amount}
                                onChange={(e) => setAmount(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rally-dark"
                            />
                             <div className="flex justify-between w-full text-xs text-gray-400 mt-4 font-mono">
                                <span>$10</span>
                                <span>Max ${stats.maxBacking}</span>
                            </div>
                        </div>

                        {/* Equation Visual */}
                        <div className="bg-gray-50 rounded-2xl p-4 w-full flex items-center justify-between border border-gray-100">
                             <div className="text-center">
                                 <div className="text-xs text-gray-400">Backing</div>
                                 <div className="font-bold">${amount}</div>
                             </div>
                             <div className="text-gray-300 font-bold">×</div>
                             <div className="text-center">
                                 <div className="text-xs text-gray-400">Multiplier</div>
                                 <div className="font-bold text-orange-500">{stats.multiplier}x</div>
                             </div>
                             <div className="text-gray-300 font-bold">=</div>
                             <div className="text-center">
                                 <div className="text-xs text-gray-400">Clout Points</div>
                                 <div className="font-bold text-rally-dark text-xl">{points}</div>
                             </div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <Button onClick={handleNext} fullWidth>Continue</Button>
                    </div>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold mb-6">Confirm Backing</h2>
                    
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Talent</span>
                            <span className="font-bold">{talent.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Multiplier Tier</span>
                            <span className="font-bold flex items-center gap-1">{stats.icon} {stats.name} ({stats.multiplier}x)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Clout Points</span>
                            <span className="font-bold text-rally-dark">{points}</span>
                        </div>
                        <div className="h-px bg-gray-100" />
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Backing Amount</span>
                            <span className="font-mono">${amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                            <span>Platform Fee</span>
                            <span className="font-mono">$2.50</span>
                        </div>
                        <div className="h-px bg-gray-100" />
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total Charge</span>
                            <span className="font-mono">${(amount + 2.50).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 mb-6 flex gap-2">
                        <Shield size={32} className="flex-shrink-0" />
                        <p>This is a membership backing to access drops and community perks. It is not a financial investment and offers no monetary returns.</p>
                    </div>

                    <Button onClick={handleNext} fullWidth>Confirm & Lock Multiplier</Button>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center relative z-10 w-full pb-10">
                    <div className="w-full flex justify-center mb-10 relative">
                         {/* Glow */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]" />
                         
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            transition={{ duration: 0.6, type: "spring", damping: 15 }}
                            className="w-full max-w-xs relative z-10"
                        >
                            <div className="bg-[#0A0A0A] rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/10 text-white p-6 aspect-[4/5] flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                                        <Zap size={12} className="text-orange-400 fill-orange-400" /> {stats.multiplier}X LOCKED
                                    </div>
                                    <Crown className="text-yellow-400" size={24} />
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 rounded-full p-1 border-2 border-white/10 mb-4">
                                        <img src={talent.image} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-center leading-tight mb-1">{talent.name}</h3>
                                    <p className="text-white/50 text-sm">{talent.category}</p>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-4 flex justify-between items-center mb-6">
                                    <div className="text-center">
                                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Tier</div>
                                        <div className="text-orange-500 font-bold text-lg">{stats.name}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Points</div>
                                        <div className="text-white font-bold text-lg">{points}</div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                    <div>
                                        <div className="text-[10px] text-white/40 font-bold uppercase">Rank</div>
                                        <div className="text-lg font-bold">#87</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-white/40 font-bold uppercase">Backed</div>
                                        <div className="text-sm font-medium">Nov 2025</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full text-center px-6">
                        <h2 className="text-2xl font-bold mb-2 tracking-tight text-rally-dark">Welcome to the Team!</h2>
                        <p className="text-gray-500 mb-8 font-medium">You've locked in {stats.multiplier}x forever.</p>
                        
                        <button 
                            className="w-full bg-white text-rally-dark font-bold py-4 rounded-[20px] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
                            onClick={() => { playSound('tap'); }}
                        >
                            <Share2 size={20} className="text-gray-900" /> 
                            Share Rally Card
                        </button>
                    </motion.div>

                    {/* Confetti */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 h-screen">
                        {[...Array(30)].map((_, i) => (
                             <motion.div
                                key={i}
                                initial={{ y: 0, x: Math.random() * 400 - 200, opacity: 1 }}
                                animate={{ y: -800, x: Math.random() * 600 - 300, rotate: 360, opacity: 0 }}
                                transition={{ duration: 2.5, delay: i * 0.05, ease: "easeOut" }}
                                className={`absolute bottom-0 left-1/2 w-3 h-3 rounded-full ${['bg-orange-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400'][i % 4]}`}
                             />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

// 10. TROPHY CASE SCREEN (Replaced Portfolio)
const TrophyCaseScreen: React.FC<{ backings: Backing[], user: UserProfile }> = ({ backings, user }) => {
    const [activeTab, setActiveTab] = useState<'cards' | 'drops' | 'watchlist'>('cards');
    const totalPoints = backings.reduce((acc, b) => acc + b.cloutPoints, 0);

    return (
      <div className="pb-32 pt-24 px-4 bg-rally-bg min-h-screen">
          <div className="fixed top-0 left-0 right-0 z-40 bg-rally-bg/90 backdrop-blur-xl border-b border-black/5 max-w-md mx-auto p-4 flex justify-between items-center">
              <h1 className="font-bold text-xl">Trophy Case</h1>
              <div className="bg-rally-card p-2 rounded-full border border-gray-200"><Trophy size={20} className="text-gray-600" /></div>
          </div>
  
          {/* Summary Card */}
          <div className="bg-rally-dark text-white rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-2xl shadow-black/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-20" />
              <div className="relative z-10">
                  <p className="text-white/60 text-sm font-medium mb-1">Total Clout Points</p>
                  <h2 className="text-5xl font-bold font-mono tracking-tight mb-6">{totalPoints.toLocaleString()}</h2>
                  
                  <div className="flex gap-8 border-t border-white/10 pt-4">
                      <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-bold">Talent Backed</p>
                          <p className="font-mono font-medium text-white text-lg">{backings.length}</p>
                      </div>
                      <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-bold">Drops Claimed</p>
                          <p className="font-mono font-medium text-white text-lg">3</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="bg-gray-100 p-1 rounded-[20px] flex mb-8 relative border border-gray-200">
              {['cards', 'drops', 'watchlist'].map(tab => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                        key={tab}
                        onClick={() => { playSound('pop'); setActiveTab(tab as any); }}
                        className={`flex-1 py-3 text-sm font-bold capitalize rounded-[16px] relative z-10 transition-all duration-200 ${
                            isActive ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab}
                        {isActive && (
                            <motion.div 
                                layoutId="activeTabBg" 
                                className="absolute inset-0 bg-rally-dark rounded-[16px] shadow-sm -z-10" 
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                  );
              })}
          </div>

          {activeTab === 'cards' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                  {backings.map(backing => (
                      <RallyCard 
                          key={backing.id}
                          variant="small"
                          image={backing.talentImage}
                          name={backing.talentName}
                          multiplier={backing.multiplier}
                          points={backing.cloutPoints}
                          rank={backing.rank}
                          date={backing.date}
                          tierName={backing.tierName}
                      />
                  ))}
                  {/* Empty State / Add More */}
                  <div className="aspect-[3/4] rounded-[20px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <Users size={24} className="mb-2 opacity-50" />
                      <span className="text-xs font-bold">Back More Talent</span>
                  </div>
              </motion.div>
          )}

          {activeTab === 'drops' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-[20px] p-4 flex gap-4 items-center opacity-60">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Check size={20} className="text-gray-400" />
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-900 line-through">Studio Session</h4>
                          <p className="text-xs text-gray-500">Claimed from Elara Vox</p>
                      </div>
                  </div>
                  <div className="text-center py-8 text-gray-400 text-sm">
                      Check Talent profiles for upcoming drops.
                  </div>
              </motion.div>
          )}
          
          {activeTab === 'watchlist' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-gray-400">
                  <Star size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Your watchlist is empty.</p>
              </motion.div>
          )}
      </div>
    );
};

// 12. NOTIFICATIONS SCREEN
const NotificationsScreen: React.FC<{ notifications: Notification[], onBack: () => void }> = ({ notifications, onBack }) => {
    return (
        <div className="min-h-screen bg-rally-bg pb-12">
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 max-w-md mx-auto p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <button onClick={() => { playSound('click'); onBack(); }} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={20} className="text-gray-700" />
                     </button>
                     <h1 className="font-bold text-xl tracking-tight">Activity</h1>
                 </div>
            </div>
            
            <div className="pt-24 px-4 space-y-3">
                {notifications.map((notif, i) => (
                    <motion.div 
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex gap-4 items-start relative"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notif.type === 'drop' ? 'bg-purple-100 text-purple-600' :
                            notif.type === 'rank' ? 'bg-yellow-100 text-yellow-600' :
                            notif.type === 'multiplier' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                            {notif.type === 'drop' ? <Box size={18} /> :
                             notif.type === 'rank' ? <Trophy size={18} /> :
                             notif.type === 'multiplier' ? <Zap size={18} /> : <Bell size={18} />}
                        </div>
                        
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 mb-0.5">{notif.title}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block">{notif.timestamp}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const CommunityPost: React.FC<{ post: Post, onClick: () => void }> = ({ post, onClick }) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(post.likes);

    const toggleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        playSound(liked ? 'click' : 'pop');
        setLikes(prev => liked ? prev - 1 : prev + 1);
        setLiked(!liked);
    };

    return (
        <div onClick={() => { playSound('click'); onClick(); }} className="bg-white p-0 rounded-[24px] border border-gray-100 shadow-sm mb-4 overflow-hidden active:scale-[0.99] transition-transform cursor-pointer">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={post.authorAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    <div>
                        <div className="font-bold text-sm text-rally-dark">{post.author}</div>
                        <div className="text-xs text-gray-400">{post.timestamp}</div>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-rally-dark"><MoreHorizontal size={20} /></button>
            </div>
            
            <div className="px-4 pb-3">
                <p className="text-gray-700 leading-relaxed text-[15px]">{post.content}</p>
            </div>

            <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-6">
                <button 
                    onClick={toggleLike}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Heart size={20} className={liked ? 'fill-current' : ''} />
                    <span>{likes}</span>
                </button>
                
                <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                    <MessageSquare size={20} />
                    <span>{post.comments}</span>
                </button>

                <div className="flex-1" />

                <button className="text-gray-400 hover:text-gray-600">
                    <Share2 size={20} />
                </button>
            </div>
        </div>
    )
}

const PostDetailView: React.FC<{ post: Post, onClose: () => void, onReply: (text: string) => void }> = ({ post, onClose, onReply }) => {
    const [replyText, setReplyText] = useState("");
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [post.commentsList]);

    const handleSend = () => {
        if (!replyText.trim()) return;
        playSound('pop');
        onReply(replyText);
        setReplyText("");
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
             <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100 p-4 flex items-center gap-4 z-40 shadow-sm">
                <button onClick={() => { playSound('click'); onClose(); }} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <h1 className="font-bold text-xl tracking-tight">Conversation</h1>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
                {/* Main Post */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                         <img src={post.authorAvatar} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                         <div>
                            <div className="font-bold text-base text-rally-dark">{post.author}</div>
                            <div className="text-xs text-gray-400">{post.timestamp}</div>
                        </div>
                    </div>
                    <p className="text-xl text-gray-900 leading-relaxed font-medium mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 text-gray-400 text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Heart size={18} /> {post.likes}</span>
                        <span className="flex items-center gap-1.5"><MessageSquare size={18} /> {post.comments}</span>
                    </div>
                </div>

                {/* Comments */}
                <div className="p-6 space-y-6">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Replies</h3>
                    {post.commentsList?.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 shrink-0">
                                 {comment.author[0]}
                             </div>
                             <div>
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className="font-bold text-sm text-gray-900">{comment.author}</span>
                                     <span className="text-xs text-gray-400">{comment.timestamp}</span>
                                 </div>
                                 <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                             </div>
                        </div>
                    ))}
                    <div ref={commentsEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Post your reply..."
                        className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-rally-dark border rounded-2xl px-4 py-3 text-sm focus:outline-none transition-colors"
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        autoFocus
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!replyText.trim()}
                        className="w-12 h-12 bg-rally-dark text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10 active:scale-95 transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// AI Feature: Hype Composer
const HypeComposer: React.FC<{ isOpen: boolean, onClose: () => void, onPost: (text: string, talentId?: string) => void }> = ({ isOpen, onClose, onPost }) => {
    const { loading, result, generate } = useAI();
    const [selectedTalent, setSelectedTalent] = useState<string>(MOCK_TALENT[0].id);
    const [hypeLevel, setHypeLevel] = useState(50);
    
    const handleGenerate = () => {
        playSound('click');
        const talent = MOCK_TALENT.find(t => t.id === selectedTalent);
        if (!talent) return;
        
        const tone = hypeLevel > 80 ? "UNHINGED, ALL CAPS, EXTREME HYPE, EMOJIS" : hypeLevel > 40 ? "Enthusiastic, confident, persuasive" : "Analytical, calm, insightful";
        
        const prompt = `Write a short social media post (tweet style) hyping up ${talent.name} (${talent.category}). 
        Context: I am an early backer. They have ${talent.followerCount} followers. 
        Tone: ${tone}. Max 280 chars. No hashtags.`;
        
        generate(prompt);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                         onClick={onClose}
                    />
                    <motion.div 
                         initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                         className="bg-white w-full max-w-sm rounded-[24px] p-6 relative z-10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-xl flex items-center gap-2">
                                <Wand2 className="text-orange-500" /> Hype Composer
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Talent</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-orange-500 transition-colors"
                                    value={selectedTalent}
                                    onChange={(e) => setSelectedTalent(e.target.value)}
                                >
                                    {MOCK_TALENT.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-2">
                                    <span>Chill</span>
                                    <span>Hype</span>
                                    <span>Unhinged</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" value={hypeLevel} 
                                    onChange={(e) => setHypeLevel(parseInt(e.target.value))}
                                    className="w-full accent-orange-500 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <Button onClick={handleGenerate} fullWidth disabled={loading}>
                                {loading ? "Generating Magic..." : "Generate Hype"}
                            </Button>
                        </div>

                        {result && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                                <p className="text-gray-800 font-medium">{result}</p>
                            </div>
                        )}
                        
                        {result && (
                            <Button onClick={() => { playSound('success'); onPost(result, selectedTalent); onClose(); }} fullWidth variant="secondary">
                                Post to Community
                            </Button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

const CommunityScreen: React.FC<{ onPost: (post: Post) => void }> = ({ onPost }) => {
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [activePost, setActivePost] = useState<Post | null>(null);

    // Local state for posts to handle comments updates immediately within this view
    const [localPosts, setLocalPosts] = useState(MOCK_POSTS);

    const handleReply = (text: string) => {
        if (!activePost) return;
        const newComment: Comment = {
            id: `c-${Date.now()}`,
            author: MOCK_USER.name,
            text: text,
            timestamp: 'Just now'
        };

        const updatedPost = {
            ...activePost,
            comments: activePost.comments + 1,
            commentsList: [...(activePost.commentsList || []), newComment]
        };

        setActivePost(updatedPost);
        setLocalPosts(prev => prev.map(p => p.id === activePost.id ? updatedPost : p));
    };

    return (
        <div className="pb-32 pt-24 px-4 bg-rally-bg min-h-screen relative">
             <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 max-w-md mx-auto p-4 flex justify-between items-center">
                 <h1 className="font-bold text-xl">Community</h1>
                 <button 
                    onClick={() => { playSound('click'); setIsComposerOpen(true); }}
                    className="w-8 h-8 rounded-full bg-rally-dark text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg active:scale-90"
                >
                    <PenTool size={14} />
                 </button>
            </div>
            
            <div className="mt-2">
                {localPosts.map(post => (
                    <CommunityPost key={post.id} post={post} onClick={() => setActivePost(post)} />
                ))}
            </div>

            <HypeComposer 
                isOpen={isComposerOpen} 
                onClose={() => setIsComposerOpen(false)}
                onPost={(text, talentId) => {
                    const talent = MOCK_TALENT.find(t => t.id === talentId);
                    const newPost = {
                        id: `p${Date.now()}`,
                        author: MOCK_USER.name,
                        authorAvatar: MOCK_USER.avatar,
                        content: text,
                        likes: 0,
                        comments: 0,
                        talentId,
                        timestamp: "Just now",
                        commentsList: []
                    };
                    onPost(newPost);
                    setLocalPosts([newPost, ...localPosts]);
                }}
            />

            {activePost && (
                <PostDetailView 
                    post={activePost} 
                    onClose={() => setActivePost(null)} 
                    onReply={handleReply}
                />
            )}
        </div>
    );
};

const UserProfileScreen: React.FC<{ user: UserProfile, onLogout: () => void }> = ({ user, onLogout }) => (
    <div className="pb-32 bg-rally-bg min-h-screen">
         {/* Cover */}
         <div className="h-48 bg-rally-dark relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             <div className="absolute inset-0 bg-gradient-to-t from-rally-dark to-transparent" />
         </div>
         
         <div className="px-6 relative -mt-16">
            <div className="flex justify-between items-end mb-4">
                <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-rally-bg shadow-lg object-cover" />
                <button className="bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-bold shadow-sm mb-2 hover:bg-gray-50 transition-colors">Edit Profile</button>
            </div>
            
            <h1 className="text-3xl font-bold text-rally-dark tracking-tight">{user.name}</h1>
            <p className="text-gray-500 font-medium mb-6">{user.handle}</p>

            {/* Stats Row */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Clout</div>
                    <div className="text-xl font-bold text-rally-dark">{user.totalClout.toLocaleString()}</div>
                </div>
                 <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Balance</div>
                    <div className="text-xl font-bold text-rally-dark">${user.balance.toLocaleString()}</div>
                </div>
                 <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Backing</div>
                    <div className="text-xl font-bold text-rally-dark">12</div>
                </div>
            </div>

            {/* Badges */}
            <h3 className="font-bold text-lg mb-4">Badges</h3>
            <div className="flex flex-wrap gap-2 mb-8">
                {user.badges.map(badge => (
                    <span key={badge} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-orange-100 flex items-center gap-1">
                        <Award size={14} /> {badge}
                    </span>
                ))}
                <span className="bg-gray-50 text-gray-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-100 border-dashed">
                    + Add Badge
                </span>
            </div>

            {/* Settings Menu Mock */}
            <h3 className="font-bold text-lg mb-4">Settings</h3>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
                {[
                    { icon: Wallet, label: 'Wallet & Payment Methods' },
                    { icon: Bell, label: 'Notifications' },
                    { icon: Shield, label: 'Privacy & Security' },
                    { icon: Lock, label: 'Account Data' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => playSound('click')}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <item.icon size={16} />
                            </div>
                            <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </div>
                ))}
            </div>

            <Button variant="outline" fullWidth onClick={onLogout} className="text-red-500 border-red-100 bg-red-50 hover:bg-red-100 border-transparent mb-8">
                <LogOut size={18} className="mr-2" /> Log Out
            </Button>
         </div>
    </div>
);

// 5. CHAT DETAIL SCREEN
const ChatDetailScreen: React.FC<{ 
    chat: ChatSession, 
    onBack: () => void, 
    onSendMessage: (text: string) => void,
    isTyping: boolean 
}> = ({ chat, onBack, onSendMessage, isTyping }) => {
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const { loading: aiLoading, result: aiSuggestions, generate: generateSuggestions } = useAI();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat.messages, isTyping, aiSuggestions]);

    // AI Feature: Smart Replies
    useEffect(() => {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg && lastMsg.sender === 'talent' && chat.status === 'active') {
            const prompt = `Generate 3 short, casual, and distinct 2-5 word replies to this message: "${lastMsg.text}". Return ONLY the comma separated phrases.`;
            generateSuggestions(prompt);
        }
    }, [chat.messages.length]);

    const handleSend = (text: string = inputValue) => {
        if (!text.trim()) return;
        playSound('pop');
        onSendMessage(text);
        setInputValue("");
    };

    const suggestions = aiSuggestions ? aiSuggestions.split(',').map(s => s.trim()).slice(0, 3) : [];

    return (
        <div className="h-screen bg-rally-bg flex flex-col">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100 p-4 flex items-center gap-4 z-40 shadow-sm">
                <button onClick={() => { playSound('click'); onBack(); }} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={chat.talentImage} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${chat.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{chat.talentName}</h3>
                        <p className="text-[10px] text-gray-500">
                             {chat.status === 'request_sent' ? 'Request Pending' : chat.isOnline ? 'Online' : `Last seen ${chat.lastSeen}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {chat.status === 'request_sent' && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center mb-6">
                        <Lock size={24} className="mx-auto text-orange-400 mb-2" />
                        <p className="text-xs text-orange-800 font-bold mb-1">Request Sent</p>
                        <p className="text-[10px] text-orange-600">
                            {chat.talentName} must accept your message request before they can reply.
                        </p>
                    </div>
                )}
                
                {chat.messages.map((msg) => (
                    <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.sender === 'user' 
                                ? 'bg-rally-dark text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1 px-1">{formatTime(msg.timestamp)}</span>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                         <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* AI Smart Replies */}
            {!aiLoading && suggestions.length > 0 && !inputValue && chat.status === 'active' && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(s)}
                            className="bg-white border border-purple-100 text-purple-600 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm hover:bg-purple-50 transition-colors flex items-center gap-1"
                        >
                            <Sparkles size={10} /> {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 pb-8">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        disabled={chat.status === 'request_sent'}
                        className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-rally-dark border rounded-2xl px-4 py-3 text-sm focus:outline-none transition-colors disabled:opacity-50"
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || chat.status === 'request_sent'}
                        className="w-12 h-12 bg-rally-dark text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10 active:scale-95 transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// 7. TALENT PROFILE SCREEN (ENHANCED)
const ProfileScreen: React.FC<{ talent: Talent, onBack: () => void, onBackingStart: () => void, onChatStart: () => void }> = ({ talent, onBack, onBackingStart, onChatStart }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'drops' | 'leaderboard'>('about');
  const [showScoutReport, setShowScoutReport] = useState(false);
  const { loading: scoutLoading, result: scoutResult, generate: generateScout, clear: clearScout } = useAI();
  
  const stats = getMultiplierStats(talent.followerCount);
  const nextTier = MULTIPLIER_TIERS.find(t => t.maxFollowers > talent.followerCount);
  const followersNeeded = nextTier ? nextTier.maxFollowers - talent.followerCount : 0;

  const handleScoutReport = () => {
      playSound('click');
      setShowScoutReport(true);
      if (!scoutResult) {
          const prompt = `Analyze the talent ${talent.name} who is a ${talent.category} (${talent.subcategory}). 
          Followers: ${talent.followerCount}, Heat Score: ${talent.heatScore}.
          Provide a 'Rally Scout Report' with 3 sections: 
          1. The Bull Case (Why they will blow up), 
          2. The Bear Case (Risks), 
          3. Virality Prediction (0-100 score with 1 sentence reason). 
          Keep it concise, punchy, and professional. No markdown formatting.`;
          generateScout(prompt);
      }
  };

  return (
    <div className="bg-rally-bg min-h-screen pb-32 relative">
        {/* Fixed Back Button */}
        <div className="fixed top-6 left-6 z-50 flex gap-2">
            <button 
                onClick={() => { playSound('click'); onBack(); }} 
                className="bg-black/20 backdrop-blur-md text-white p-3 rounded-full shadow-lg hover:bg-black/40 transition-all active:scale-95 border border-white/10"
            >
                <ChevronLeft size={24} />
            </button>
        </div>
        
        {/* Message Button (Top Right) */}
        <div className="fixed top-6 right-6 z-50">
             <button 
                onClick={() => { playSound('click'); onChatStart(); }}
                className="bg-black/20 backdrop-blur-md text-white p-3 rounded-full shadow-lg hover:bg-black/40 transition-all active:scale-95 border border-white/10"
            >
                <MessageSquare size={24} />
            </button>
        </div>

        {/* Hero Image */}
        <div className="h-[55vh] w-full relative overflow-hidden bg-rally-dark">
            <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                src={talent.image} 
                className="w-full h-full object-cover" 
                alt={talent.name} 
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-rally-bg via-transparent to-transparent opacity-90" />
        </div>

        {/* Content Container - Overlapping Hero */}
        <div className="relative -mt-32 px-4">
            {/* Main Info Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-xl shadow-black/5 border border-white/40 relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-1">{talent.category} • {talent.subcategory}</div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">{talent.name}</h1>
                        </div>
                        <div className="flex flex-col items-end">
                             <div className="bg-rally-dark text-white px-3 py-1.5 rounded-[12px] font-bold text-lg shadow-lg flex items-center gap-1.5">
                                <span className="text-sm">{stats.icon}</span>
                                <span>{stats.multiplier}x</span>
                             </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {nextTier ? (
                        <div className="bg-gray-100/50 rounded-xl p-3 border border-gray-200/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                    <Timer size={12} /> Until drop to {nextTier.multiplier}x
                                </span>
                                <span className="text-xs font-bold text-gray-900">{followersNeeded.toLocaleString()} left</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-orange-400 to-red-500" 
                                    style={{ width: `${(talent.followerCount / nextTier.maxFollowers) * 100}%` }} 
                                />
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-2 text-sm text-yellow-600 font-bold bg-yellow-50 rounded-xl border border-yellow-100">👑 Max Multiplier Reached</div>
                    )}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Heat Score</div>
                        <div className="text-3xl font-bold text-gray-900">{talent.heatScore}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <Flame size={20} className="fill-current" />
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Backers</div>
                        <div className="text-3xl font-bold text-gray-900">{talent.backers}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <Users size={20} />
                    </div>
                 </div>
            </div>

            {/* Chart Section */}
            <div className="mb-6">
                <FollowerGrowthChart data={talent.followerHistory} />
            </div>

            {/* AI Scout Button */}
            <div className="mb-8">
                <button 
                    onClick={handleScoutReport}
                    className="w-full group bg-indigo-900 text-white p-1 rounded-[20px] shadow-lg shadow-indigo-900/20 active:scale-[0.98] transition-all overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-indigo-950/50 rounded-[18px] py-4 flex items-center justify-center gap-2 backdrop-blur-sm">
                         <BrainCircuit size={20} className="text-indigo-300" /> 
                         <span className="font-bold">View Rally Scout Report</span>
                    </div>
                </button>
            </div>

            {/* Tabs & Content */}
            <div className="min-h-[300px]">
                <div className="flex gap-8 border-b border-gray-100 mb-6 px-2">
                    {['about', 'drops', 'leaderboard'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => { playSound('tap'); setActiveTab(tab as any); }}
                            className={`pb-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                            {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode='wait'>
                    {activeTab === 'about' && (
                        <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <p className="text-gray-600 leading-relaxed mb-8 text-sm">{talent.description}</p>
                            <h3 className="font-bold text-sm mb-4 text-gray-900">Content Preview</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {MOCK_CONTENT_IMAGES.map((img, i) => (
                                    <img key={i} src={img} className="rounded-2xl w-full h-32 object-cover border border-gray-100" />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'drops' && (
                        <motion.div key="drops" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {talent.drops.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <Box size={40} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No active drops yet.</p>
                                </div>
                            ) : (
                                talent.drops.map(drop => (
                                    <div key={drop.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-2xl text-[10px] font-bold uppercase ${drop.claimed ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-600'}`}>
                                            {drop.claimed ? 'Claimed' : 'Active'}
                                        </div>
                                        <div className="flex gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                                                {drop.type === 'access' ? <Users size={18} /> : drop.type === 'physical' ? <Box size={18} /> : <PlayCircle size={18} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{drop.title}</h4>
                                                <p className="text-xs text-gray-500">{drop.description}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-xs">
                                            <span className="font-bold text-rally-dark">Requires Top {drop.thresholdRank} Rank</span>
                                            <span className="text-gray-400">Ends in 2 days</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                             <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Rank</th>
                                            <th className="px-4 py-3">Backer</th>
                                            <th className="px-4 py-3 text-right">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MOCK_FULL_BACKERS_LIST.slice(0, 8).map((backer, idx) => (
                                            <tr key={backer.id} className="border-t border-gray-50">
                                                <td className="px-4 py-3 font-bold text-gray-400">
                                                    {idx === 0 ? <span className="text-xl">🥇</span> : 
                                                     idx === 1 ? <span className="text-xl">🥈</span> : 
                                                     idx === 2 ? <span className="text-xl">🥉</span> : 
                                                     `#${backer.rank}`}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <img src={backer.avatar} className="w-8 h-8 rounded-full border border-gray-100" />
                                                        <div>
                                                            <div className="font-bold text-gray-900">{backer.name}</div>
                                                            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{backer.tier}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-rally-dark">{backer.points.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-3 text-center border-t border-gray-50 text-xs text-gray-400 font-medium bg-gray-50">
                                    + 2,839 others believing
                                </div>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 max-w-md mx-auto z-50">
            <Button fullWidth onClick={() => { playSound('click'); onBackingStart(); }}>Back {talent.name.split(' ')[0]}</Button>
        </div>

        {/* Scout Report Modal */}
        <AnimatePresence>
            {showScoutReport && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                        onClick={() => setShowScoutReport(false)}
                    />
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
                    >
                         <div className="flex items-center gap-2 mb-6">
                            <BrainCircuit className="text-indigo-600" />
                            <h2 className="text-xl font-bold">Rally Scout Report</h2>
                         </div>

                         {scoutLoading && (
                             <div className="space-y-4">
                                <SkeletonLoader className="h-4 w-3/4" />
                                <SkeletonLoader className="h-20 w-full rounded-xl" />
                                <SkeletonLoader className="h-20 w-full rounded-xl" />
                             </div>
                         )}

                         {!scoutLoading && scoutResult && (
                             <div className="space-y-4">
                                 {scoutResult.split('\n').map((line, i) => {
                                     if (line.includes('Bull Case')) return <h4 key={i} className="font-bold text-green-600 mt-4">{line.replace('*', '')}</h4>;
                                     if (line.includes('Bear Case')) return <h4 key={i} className="font-bold text-red-600 mt-4">{line.replace('*', '')}</h4>;
                                     if (line.includes('Virality')) return <h4 key={i} className="font-bold text-purple-600 mt-4">{line.replace('*', '')}</h4>;
                                     return <p key={i} className="text-sm text-gray-600 leading-relaxed">{line.replace('*', '')}</p>
                                 })}
                             </div>
                         )}

                         <Button fullWidth className="mt-8" onClick={() => setShowScoutReport(false)}>Got it</Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};

// 4. MESSAGING SCREEN (LIST)
const MessageListScreen: React.FC<{ 
    chats: ChatSession[], 
    onBack: () => void, 
    onSelectChat: (chatId: string) => void 
}> = ({ chats, onBack, onSelectChat }) => {
    return (
        <div className="min-h-screen bg-rally-bg pb-12">
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 max-w-md mx-auto p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <button onClick={() => { playSound('click'); onBack(); }} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={20} className="text-gray-700" />
                     </button>
                     <h1 className="font-bold text-xl tracking-tight">Messages</h1>
                 </div>
            </div>

            <div className="pt-24 px-4">
                {chats.length === 0 ? (
                    <div className="text-center mt-20 opacity-50">
                        <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="font-bold text-gray-900">No Messages Yet</h3>
                        <p className="text-sm text-gray-500">Go to a talent profile to send a request.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chats.map(chat => (
                            <motion.div 
                                key={chat.id}
                                layoutId={chat.id}
                                onClick={() => { playSound('tap'); onSelectChat(chat.id); }}
                                className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex gap-4 items-center cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="relative">
                                    <img src={chat.talentImage} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                                    {chat.status === 'request_sent' && (
                                        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full p-1 border border-white" title="Request Sent">
                                            <Timer size={10} />
                                        </div>
                                    )}
                                    {chat.status === 'active' && chat.isOnline && (
                                         <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-3 h-3 border border-white" />
                                    )}
                                    {chat.unreadCount > 0 && (
                                         <div className="absolute -top-1 -right-1 bg-red-500 border border-white w-4 h-4 rounded-full" />
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="font-bold text-gray-900 truncate">{chat.talentName}</h4>
                                        <span className="text-[10px] text-gray-400">{chat.lastSeen}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {chat.status === 'request_sent' ? (
                                            <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                                                Request Pending...
                                            </span>
                                        ) : (
                                            <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                                {chat.messages[chat.messages.length - 1]?.text || 'No messages'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {chat.unreadCount > 0 && (
                                    <div className="bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                                        {chat.unreadCount}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'splash',
    selectedTalent: null,
    selectedChatId: null,
    backings: INITIAL_BACKINGS,
    user: MOCK_USER,
    posts: MOCK_POSTS,
    chats: [],
    notifications: MOCK_NOTIFICATIONS
  });

  const [isTyping, setIsTyping] = useState(false);

  // Simulation: Handle Mock Chat Responses
  useEffect(() => {
    // Check if there are chats in 'request_sent' state that should be accepted
    const pendingChats = appState.chats.filter(c => c.status === 'request_sent');
    
    if (pendingChats.length > 0) {
        pendingChats.forEach(chat => {
            // Simulate acceptance after 5 seconds
            const timer = setTimeout(() => {
                const accepted = Math.random() > 0.1; // 90% chance to accept for demo purposes
                if (accepted) {
                    setAppState(prev => ({
                        ...prev,
                        chats: prev.chats.map(c => {
                            if (c.id === chat.id) {
                                return {
                                    ...c,
                                    status: 'active',
                                    isOnline: true,
                                };
                            }
                            return c;
                        }),
                        notifications: [{
                            id: `n${Date.now()}`,
                            type: 'info',
                            title: 'Request Accepted',
                            message: `${chat.talentName} accepted your message request.`,
                            timestamp: 'Just now',
                            read: false
                        }, ...prev.notifications]
                    }));

                    // After accept, type a message
                    setTimeout(() => {
                        // Only show typing if this chat is active screen
                        if (appState.selectedChatId === chat.id) setIsTyping(true);

                        setTimeout(() => {
                            setIsTyping(false);
                            
                            const reply: Message = {
                                id: Date.now().toString(),
                                text: `Hey ${appState.user.name.split(' ')[0]}! Thanks for the support on Rally. Happy to have you on the team 🚀`,
                                sender: 'talent',
                                timestamp: new Date().toISOString(),
                                status: 'sent'
                            };

                            setAppState(prev => ({
                                ...prev,
                                chats: prev.chats.map(c => {
                                    if (c.id === chat.id) {
                                        return {
                                            ...c,
                                            messages: [...c.messages, reply],
                                            unreadCount: c.id === prev.selectedChatId ? 0 : c.unreadCount + 1,
                                            lastSeen: 'Now'
                                        };
                                    }
                                    return c;
                                })
                            }));
                        }, 2500); // Typing duration
                    }, 1000); // Delay before typing starts
                }
            }, 4000); // Time to accept

            return () => clearTimeout(timer);
        });
    }
  }, [appState.chats.length]); // Re-run when chat count changes (new request added)

  const navigate = (screen: ScreenName) => {
    setAppState(prev => ({ ...prev, currentScreen: screen }));
  };

  const handleSelectTalent = (talent: Talent) => {
    setAppState(prev => ({ ...prev, selectedTalent: talent, currentScreen: 'profile' }));
  };

  const handleStartChat = () => {
    if (!appState.selectedTalent) return;

    // Check if chat already exists
    const existingChat = appState.chats.find(c => c.talentId === appState.selectedTalent?.id);
    
    if (existingChat) {
        setAppState(prev => ({ ...prev, selectedChatId: existingChat.id, currentScreen: 'chat-detail' }));
    } else {
        // Create new chat session (Request Mode)
        const newChat: ChatSession = {
            id: `c${Date.now()}`,
            talentId: appState.selectedTalent.id,
            talentName: appState.selectedTalent.name,
            talentImage: appState.selectedTalent.image,
            status: 'request_sent', // Starts as request
            messages: [],
            lastSeen: 'Now',
            isOnline: false,
            unreadCount: 0
        };

        setAppState(prev => ({
            ...prev,
            chats: [newChat, ...prev.chats],
            selectedChatId: newChat.id,
            currentScreen: 'chat-detail'
        }));
    }
  };

  const handleSendMessage = (text: string) => {
    if (!appState.selectedChatId) return;

    const newMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date().toISOString(),
        status: 'sent'
    };

    setAppState(prev => ({
        ...prev,
        chats: prev.chats.map(c => 
            c.id === prev.selectedChatId 
            ? { ...c, messages: [...c.messages, newMessage] } 
            : c
        )
    }));
  };

  const handleBackingComplete = (amount: number, tierName: string) => {
    if (!appState.selectedTalent) return;
    
    // Calculate Multiplier
    const stats = getMultiplierStats(appState.selectedTalent.followerCount);
    const points = amount * stats.multiplier;

    const newBacking: Backing = {
        id: `b${Date.now()}`,
        talentId: appState.selectedTalent.id,
        talentName: appState.selectedTalent.name,
        talentImage: appState.selectedTalent.image,
        amount: amount,
        multiplier: stats.multiplier,
        tierName: stats.name,
        cloutPoints: points,
        rank: Math.floor(Math.random() * 100) + 1, // Mock rank
        date: new Date().toISOString()
    };

    setAppState(prev => ({
        ...prev,
        backings: [newBacking, ...prev.backings],
        currentScreen: 'trophy-case',
        user: { ...prev.user, balance: prev.user.balance - amount, totalClout: prev.user.totalClout + points },
        notifications: [{
            id: Date.now().toString(),
            type: 'rank',
            title: 'Welcome to the Leaderboard!',
            message: `You are now rank #${newBacking.rank} for ${newBacking.talentName}.`,
            timestamp: 'Just now',
            read: false
        }, ...prev.notifications]
    }));
  };

  const handleCommunityPost = (post: Post) => {
      setAppState(prev => ({
          ...prev,
          posts: [post, ...prev.posts]
      }));
  };

  // derived state
  const totalUnread = appState.chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const selectedChat = appState.chats.find(c => c.id === appState.selectedChatId);

  return (
    <div className="max-w-md mx-auto bg-rally-bg min-h-screen shadow-2xl relative overflow-hidden font-sans text-rally-dark">
      {appState.currentScreen === 'splash' && <SplashScreen onFinish={() => navigate('onboarding')} />}
      {appState.currentScreen === 'onboarding' && <OnboardingScreen onFinish={() => navigate('home')} />}

      {appState.currentScreen === 'home' && (
        <>
            <HomeScreen 
                onSelectTalent={handleSelectTalent} 
                onAvatarClick={() => navigate('profile-settings')}
                onMessages={() => navigate('messages')}
                onNotifications={() => navigate('notifications')}
                user={appState.user}
                unreadCount={totalUnread}
            />
            <BottomNav currentScreen="home" onNavigate={navigate} userAvatar={appState.user.avatar} />
        </>
      )}

      {appState.currentScreen === 'explore' && (
        <>
            <ExploreScreen onSelectTalent={handleSelectTalent} onOpenVeo={() => navigate('veo-studio')} />
            <BottomNav currentScreen="explore" onNavigate={navigate} userAvatar={appState.user.avatar} />
        </>
      )}

      {appState.currentScreen === 'profile' && appState.selectedTalent && (
        <ProfileScreen 
            talent={appState.selectedTalent} 
            onBack={() => navigate('home')} 
            onBackingStart={() => navigate('backing')}
            onChatStart={handleStartChat}
        />
      )}

      {appState.currentScreen === 'messages' && (
          <MessageListScreen 
            chats={appState.chats} 
            onBack={() => navigate('home')} 
            onSelectChat={(id) => {
                setAppState(prev => ({ 
                    ...prev, 
                    selectedChatId: id, 
                    currentScreen: 'chat-detail',
                    // Mark as read immediately when entering
                    chats: prev.chats.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
                }));
            }} 
          />
      )}

      {appState.currentScreen === 'chat-detail' && selectedChat && (
          <ChatDetailScreen 
            chat={selectedChat}
            onBack={() => navigate('messages')}
            onSendMessage={handleSendMessage}
            isTyping={isTyping && appState.selectedChatId === selectedChat.id}
          />
      )}

      {appState.currentScreen === 'backing' && appState.selectedTalent && (
        <BackingFlow 
            talent={appState.selectedTalent} 
            onBack={() => navigate('profile')}
            onComplete={handleBackingComplete}
        />
      )}

      {appState.currentScreen === 'trophy-case' && (
        <>
            <TrophyCaseScreen backings={appState.backings} user={appState.user} />
            <BottomNav currentScreen="trophy-case" onNavigate={navigate} userAvatar={appState.user.avatar} />
        </>
      )}
      
       {appState.currentScreen === 'community' && (
        <>
            <CommunityScreen onPost={handleCommunityPost} />
            <BottomNav currentScreen="community" onNavigate={navigate} userAvatar={appState.user.avatar} />
        </>
      )}

      {appState.currentScreen === 'profile-settings' && (
        <>
            <UserProfileScreen user={appState.user} onLogout={() => navigate('onboarding')} />
            <BottomNav currentScreen="profile-settings" onNavigate={navigate} userAvatar={appState.user.avatar} />
        </>
      )}

      {appState.currentScreen === 'notifications' && (
          <NotificationsScreen notifications={appState.notifications} onBack={() => navigate('home')} />
      )}
    </div>
  );
}
