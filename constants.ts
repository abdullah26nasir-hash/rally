
import { Talent, Backing, Post, UserProfile, Notification, MultiplierTier, Comment } from './types';

export const MULTIPLIER_TIERS: MultiplierTier[] = [
  { name: "Seed",     icon: "🌱", multiplier: 20, maxFollowers: 1000,    maxBacking: 100 },
  { name: "Sprout",   icon: "🌿", multiplier: 12, maxFollowers: 5000,    maxBacking: 200 },
  { name: "Rising",   icon: "🌳", multiplier: 8,  maxFollowers: 20000,   maxBacking: 300 },
  { name: "Breaking", icon: "⭐", multiplier: 5,  maxFollowers: 100000,  maxBacking: 400 },
  { name: "Hot",      icon: "🔥", multiplier: 3,  maxFollowers: 500000,  maxBacking: 500 },
  { name: "Star",     icon: "💫", multiplier: 2,  maxFollowers: 2000000, maxBacking: 500 },
  { name: "Icon",     icon: "👑", multiplier: 1,  maxFollowers: Infinity, maxBacking: 500 },
];

const generateHistory = (start: number, baseGrowth: number) => {
    const data = [];
    let current = start;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < months.length; i++) {
        // Add volatility: Random swing between -5% and +15% on top of base growth
        const volatility = (Math.random() * 0.20) - 0.05; 
        
        // Occasional viral spike (10% chance)
        const viralSpike = Math.random() > 0.9 ? 0.4 : 0;
        
        const growthFactor = 1 + baseGrowth + volatility + viralSpike;
        current = Math.max(start * 0.5, current * growthFactor); // Prevent dropping too low
        
        data.push({ date: months[i], count: Math.floor(current) });
    }
    return data;
};

const generateComments = (count: number): Comment[] => {
    const authors = ["Mike T.", "Sarah J.", "Alex R.", "Davon L.", "Elena G.", "Tom B.", "Lisa P.", "James H."];
    const texts = [
        "This is absolutely insane! 🚀",
        "Been following since day 1.",
        "Underrated.",
        "The heat score on this is going to skyrocket.",
        "Just locked in my backing. LFG!",
        "Can't wait for the next drop.",
        "Does anyone know when the next match is?",
        "Multiplier is dropping fast, get in now.",
        "Quality content as always.",
        "Huge potential here."
    ];
    
    return Array.from({ length: count }).map((_, i) => ({
        id: `c-${Date.now()}-${i}`,
        author: authors[i % authors.length],
        text: texts[i % texts.length],
        timestamp: `${Math.floor(Math.random() * 12) + 1}h ago`
    }));
};

export const MOCK_TALENT: Talent[] = [
  {
    id: "1",
    name: "Marcus Aris",
    category: "Athlete",
    subcategory: "Basketball",
    followerCount: 95000, 
    followerHistory: generateHistory(45000, 0.06),
    primaryPlatform: "Instagram",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    videoPitch: "https://assets.mixkit.co/videos/preview/mixkit-basketball-player-dribbling-in-a-court-43954-large.mp4",
    description: "Point guard dominating the Euro league with NBA draft buzz. Known for explosive playmaking.",
    backers: 1240,
    heatScore: 94,
    drops: [
        { id: "d1", title: "Courtside Meet & Greet", type: "access", description: "Meet Marcus after the summer league final.", thresholdRank: 10, claimed: false },
        { id: "d2", title: "Signed Jersey", type: "physical", description: "Game worn jersey from the finals.", thresholdRank: 50, claimed: false },
        { id: "d1a", title: "Training Camp Vlog", type: "content", description: "Exclusive behind the scenes footage.", thresholdRank: 100, claimed: false }
    ]
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    category: "Creator",
    subcategory: "Tech Reviews",
    followerCount: 4200, 
    followerHistory: generateHistory(1200, 0.12),
    primaryPlatform: "YouTube",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    videoPitch: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-online-at-her-home-office-42589-large.mp4",
    description: "Simplifying complex tech. Scaling rapidly with high engagement rates.",
    backers: 850,
    heatScore: 88,
    drops: [
        { id: "d3", title: "Early Review Access", type: "content", description: "Watch reviews 24h before public release.", thresholdRank: 100, claimed: false },
        { id: "d3a", title: "1:1 Tech Consult", type: "access", description: "30 min call to setup your desk.", thresholdRank: 5, claimed: false }
    ]
  },
  {
    id: "3",
    name: "Elara Vox",
    category: "Musician",
    subcategory: "Indie Pop",
    followerCount: 800, 
    followerHistory: generateHistory(150, 0.15),
    primaryPlatform: "TikTok",
    image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&w=800&q=80",
    videoPitch: "https://assets.mixkit.co/videos/preview/mixkit-guitarist-playing-acoustic-guitar-in-nature-41671-large.mp4",
    description: "Haunting vocals meeting synth-pop rhythms. Just starting to blow up.",
    backers: 2100,
    heatScore: 98,
    drops: [
        { id: "d4", title: "Studio Session Facetime", type: "access", description: "Join a live session via video call.", thresholdRank: 25, claimed: true },
        { id: "d5", title: "Demo Tapes", type: "content", description: "Access to unreleased demos.", thresholdRank: 200, claimed: false }
    ]
  },
  {
    id: "4",
    name: "Davon Lewis",
    category: "Athlete",
    subcategory: "Track & Field",
    followerCount: 18500, 
    followerHistory: generateHistory(11000, 0.04),
    primaryPlatform: "Instagram",
    image: "https://images.unsplash.com/photo-1552674605-5d226a5be380?auto=format&fit=crop&w=800&q=80",
    videoPitch: "https://assets.mixkit.co/videos/preview/mixkit-athlete-getting-ready-to-run-41662-large.mp4",
    description: "Olympic hopeful shattering college records in the 200m.",
    backers: 430,
    heatScore: 91,
    drops: [
        { id: "d6", title: "Training Plan PDF", type: "content", description: "Davon's actual weekly sprint workout.", thresholdRank: 500, claimed: false },
        { id: "d6a", title: "Signed Spikes", type: "physical", description: "Race worn spikes from regionals.", thresholdRank: 3, claimed: false }
    ]
  },
  {
    id: "5",
    name: "Kai Tanaka",
    category: "Creator",
    subcategory: "Digital Art",
    followerCount: 250000, 
    followerHistory: generateHistory(210000, 0.02),
    primaryPlatform: "Twitter",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    description: "Creating immersive 3D worlds. Featured in major digital galleries.",
    backers: 210,
    heatScore: 76,
    drops: [
        { id: "d7", title: "High-Res Wallpaper Pack", type: "content", description: "4K renders of latest pieces.", thresholdRank: 1000, claimed: false },
        { id: "d8", title: "Signed Print", type: "physical", description: "Limited edition archive print.", thresholdRank: 50, claimed: false }
    ]
  },
  {
    id: "6",
    name: "Nina Rodriguez",
    category: "Musician",
    subcategory: "Jazz Fusion",
    followerCount: 12000, 
    followerHistory: generateHistory(9000, 0.05),
    primaryPlatform: "Spotify",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    description: "Reinventing the saxophone for the modern era.",
    backers: 670,
    heatScore: 82,
    drops: [
        { id: "d9", title: "Backstage Pass", type: "access", description: "VIP access at next tour stop.", thresholdRank: 10, claimed: false },
        { id: "d10", title: "Vinyl Test Pressing", type: "physical", description: "Rare test pressing of debut album.", thresholdRank: 5, claimed: false }
    ]
  },
  {
    id: "7",
    name: "Jaxon Reed",
    category: "Athlete",
    subcategory: "Skateboarding",
    followerCount: 2200, 
    followerHistory: generateHistory(1800, 0.03),
    primaryPlatform: "TikTok",
    image: "https://images.unsplash.com/photo-1563823267-347e3355523d?auto=format&fit=crop&w=800&q=80",
    description: "Street skater with a unique flow. Working on first full-length part.",
    backers: 410,
    heatScore: 89,
    drops: [
        { id: "d11", title: "Broken Deck Art", type: "physical", description: "Signed piece of a broken board.", thresholdRank: 20, claimed: false }
    ]
  },
  {
    id: "8",
    name: "Mira Sol",
    category: "Creator",
    subcategory: "Sustainable Fashion",
    followerCount: 890, 
    followerHistory: generateHistory(400, 0.08),
    primaryPlatform: "Instagram",
    image: "https://images.unsplash.com/photo-1664575602554-208c70e090dd?auto=format&fit=crop&w=800&q=80",
    description: "Upcycling vintage finds into high fashion. Zero waste philosophy.",
    backers: 120,
    heatScore: 85,
    drops: [
        { id: "d12", title: "Custom Piece", type: "physical", description: "A 1-of-1 upcycled jacket.", thresholdRank: 1, claimed: false },
        { id: "d13", title: "Thrift Guide", type: "content", description: "PDF guide to finding gems.", thresholdRank: 50, claimed: false }
    ]
  },
  {
    id: "9",
    name: "Leo V",
    category: "Musician",
    subcategory: "Bedroom Pop",
    followerCount: 1500, 
    followerHistory: generateHistory(800, 0.06),
    primaryPlatform: "SoundCloud",
    image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80",
    description: "Writing, producing, and mastering everything from a dorm room.",
    backers: 330,
    heatScore: 78,
    drops: [
        { id: "d14", title: "Producer Pack", type: "content", description: "Sample pack of Leo's drum sounds.", thresholdRank: 100, claimed: false }
    ]
  },
  {
    id: "10",
    name: "Tyrell Jones",
    category: "Athlete",
    subcategory: "American Football",
    followerCount: 45000,
    followerHistory: generateHistory(30000, 0.04),
    primaryPlatform: "Instagram",
    image: "https://images.unsplash.com/photo-1611329533379-37332c86e00a?auto=format&fit=crop&w=800&q=80",
    description: "Top WR prospect with insane catch radius. 5-star recruit.",
    backers: 1540,
    heatScore: 96,
    drops: []
  },
  {
    id: "11",
    name: "Sophie Chen",
    category: "Creator",
    subcategory: "Culinary",
    followerCount: 8200,
    followerHistory: generateHistory(5000, 0.05),
    primaryPlatform: "TikTok",
    image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=800&q=80",
    description: "Fusion recipes in 60 seconds. High production value meets authentic taste.",
    backers: 310,
    heatScore: 92,
    drops: []
  },
  {
    id: "12",
    name: "K-R0C",
    category: "Musician",
    subcategory: "Hip Hop",
    followerCount: 3500,
    followerHistory: generateHistory(2800, 0.03),
    primaryPlatform: "SoundCloud",
    image: "https://images.unsplash.com/photo-1520342868574-5fa3804e551c?auto=format&fit=crop&w=800&q=80",
    description: "Underground lyricist with flow that reminds people of the 90s golden era.",
    backers: 560,
    heatScore: 84,
    drops: []
  },
  {
    id: "13",
    name: "Jordan Chase",
    category: "Athlete",
    subcategory: "Basketball",
    followerCount: 200,
    followerHistory: generateHistory(100, 0.08),
    primaryPlatform: "Instagram",
    image: "https://images.unsplash.com/photo-1519766304800-c9519df91ea5?auto=format&fit=crop&w=800&q=80",
    description: "High school phenom averaging 30ppg.",
    backers: 150,
    heatScore: 88,
    drops: []
  },
  {
    id: "14",
    name: "Maya Beats",
    category: "Musician",
    subcategory: "Lo-Fi",
    followerCount: 4000,
    followerHistory: generateHistory(3000, 0.04),
    primaryPlatform: "Spotify",
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c81d?auto=format&fit=crop&w=800&q=80",
    description: "Study beats that are taking over playlists.",
    backers: 800,
    heatScore: 79,
    drops: []
  },
  {
    id: "15",
    name: "TechWiz",
    category: "Creator",
    subcategory: "Tech Reviews",
    followerCount: 15000,
    followerHistory: generateHistory(11000, 0.05),
    primaryPlatform: "YouTube",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80",
    description: "Deep dive reviews into vintage tech.",
    backers: 900,
    heatScore: 81,
    drops: []
  }
];

export const MOCK_BACKERS_AVATARS = [
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/86.jpg",
    "https://randomuser.me/api/portraits/women/29.jpg",
    "https://randomuser.me/api/portraits/men/4.jpg"
];

export const MOCK_FULL_BACKERS_LIST = [
    { id: 1, name: "Jessica K.", avatar: "https://randomuser.me/api/portraits/women/44.jpg", tier: "Seed", points: 2500, rank: 1 },
    { id: 2, name: "David M.", avatar: "https://randomuser.me/api/portraits/men/32.jpg", tier: "Seed", points: 1800, rank: 2 },
    { id: 3, name: "Alex R.", avatar: "https://randomuser.me/api/portraits/men/86.jpg", tier: "Sprout", points: 1200, rank: 3 },
    { id: 4, name: "Sarah W.", avatar: "https://randomuser.me/api/portraits/women/29.jpg", tier: "Sprout", points: 960, rank: 4 },
    { id: 5, name: "Mike T.", avatar: "https://randomuser.me/api/portraits/men/4.jpg", tier: "Rising", points: 450, rank: 5 },
    { id: 6, name: "Elena G.", avatar: "https://randomuser.me/api/portraits/women/68.jpg", tier: "Rising", points: 400, rank: 6 },
    { id: 7, name: "Tom B.", avatar: "https://randomuser.me/api/portraits/men/12.jpg", tier: "Rising", points: 320, rank: 7 },
    { id: 8, name: "Lisa P.", avatar: "https://randomuser.me/api/portraits/women/90.jpg", tier: "Breaking", points: 250, rank: 8 },
    { id: 9, name: "James H.", avatar: "https://randomuser.me/api/portraits/men/45.jpg", tier: "Breaking", points: 100, rank: 9 },
    { id: 10, name: "Ryan C.", avatar: "https://randomuser.me/api/portraits/men/22.jpg", tier: "Breaking", points: 50, rank: 10 },
];

export const MOCK_CONTENT_IMAGES = [
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe4384d4?auto=format&fit=crop&w=400&q=80"
];

export const INITIAL_BACKINGS: Backing[] = [
    {
        id: "b1",
        talentId: "3",
        talentName: "Elara Vox",
        talentImage: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&w=800&q=80",
        amount: 50,
        multiplier: 20,
        tierName: "Seed",
        cloutPoints: 1000,
        rank: 14,
        date: "2023-10-15"
    }
];

export const MOCK_USER: UserProfile = {
  name: "Alex Rivera",
  handle: "@arivera",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
  balance: 1250.00,
  totalClout: 1000,
  badges: ["Early Believer", "Top 100"],
  joinedDate: "Sept 2023"
};

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    author: "Davon Lewis",
    authorAvatar: "https://images.unsplash.com/photo-1552674605-5d226a5be380?auto=format&fit=crop&w=800&q=80",
    content: "New training PR! Dropping a training plan for my top 500 backers tomorrow. Check your drops tab! 🏃‍♂️💨",
    likes: 245,
    comments: 42,
    talentId: "4",
    timestamp: "2h ago",
    commentsList: generateComments(8)
  },
  {
    id: "p2",
    author: "Jessica M.",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Locked in that 12x multiplier on Marcus Aris before he crossed 5k followers. The FOMO is real! 🔥",
    likes: 89,
    comments: 15,
    timestamp: "5h ago",
    commentsList: generateComments(6)
  },
  {
    id: "p3",
    author: "CryptoKing",
    authorAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    content: "Just scouted Nina Rodriguez. The jazz fusion angle is unique. Heat score 82 but feels like 99. Buying in.",
    likes: 156,
    comments: 23,
    timestamp: "8h ago",
    commentsList: generateComments(12)
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "n1",
        type: "rank",
        title: "Rank Up! 🏆",
        message: "You moved to #14 on Elara Vox's leaderboard.",
        timestamp: "2h ago",
        read: false
    },
    {
        id: "n2",
        type: "drop",
        title: "Drop Unlocked 🎁",
        message: "You qualify for the 'Studio Session' drop from Elara Vox!",
        timestamp: "5h ago",
        read: false
    },
    {
        id: "n3",
        type: "multiplier",
        title: "Multiplier Alert ⚡",
        message: "Davon Lewis is 500 followers away from dropping to 5x. Lock in 8x now!",
        timestamp: "1d ago",
        read: true
    }
];
