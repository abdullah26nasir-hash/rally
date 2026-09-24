
export interface Drop {
  id: string;
  title: string;
  type: 'access' | 'physical' | 'content' | 'status';
  description: string;
  thresholdRank: number; // e.g., Top 50
  claimed: boolean;
  image?: string;
}

export interface Talent {
  id: string;
  name: string;
  category: 'Athlete' | 'Creator' | 'Musician';
  subcategory: string;
  image: string;
  videoPitch?: string;
  description: string;
  backers: number;
  heatScore: number; // 0-100
  followerCount: number; // Drives multiplier
  followerHistory: { date: string; count: number }[]; // For the chart
  primaryPlatform: string;
  drops: Drop[];
}

export interface MultiplierTier {
    name: string;
    icon: string;
    multiplier: number;
    maxFollowers: number;
    maxBacking: number;
}

export interface Backing {
  id: string;
  talentId: string;
  talentName: string;
  talentImage: string;
  amount: number;
  multiplier: number; // Locked at time of backing
  tierName: string;
  cloutPoints: number; // amount * multiplier
  rank: number; // Leaderboard position
  date: string;
}

export interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  likes: number;
  comments: number;
  talentId?: string;
  timestamp: string;
  commentsList?: Comment[];
}

export interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  balance: number; // Still needed for backing
  totalClout: number;
  badges: string[];
  joinedDate: string;
}

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'talent';
    timestamp: string;
    status: 'sent' | 'read';
}

export interface ChatSession {
    id: string;
    talentId: string;
    talentName: string;
    talentImage: string;
    status: 'new' | 'request_sent' | 'active';
    messages: Message[];
    lastSeen: string;
    isOnline: boolean;
    unreadCount: number;
}

export interface Notification {
    id: string;
    type: 'drop' | 'rank' | 'multiplier' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export type ScreenName = 'splash' | 'onboarding' | 'home' | 'explore' | 'profile' | 'backing' | 'trophy-case' | 'community' | 'profile-settings' | 'messages' | 'chat-detail' | 'notifications' | 'veo-studio';

export interface AppState {
  currentScreen: ScreenName;
  selectedTalent: Talent | null;
  selectedChatId: string | null;
  backings: Backing[];
  user: UserProfile;
  posts: Post[];
  chats: ChatSession[];
  notifications: Notification[];
}
