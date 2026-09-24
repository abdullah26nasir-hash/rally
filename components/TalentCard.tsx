
import React from 'react';
import { Talent } from '../types';
import { MULTIPLIER_TIERS } from '../constants';
import { Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TalentCardProps {
  talent: Talent;
  variant?: 'compact' | 'full';
  onClick: () => void;
}

export const TalentCard: React.FC<TalentCardProps> = ({ talent, variant = 'full', onClick }) => {
  // Calculate current multiplier tier
  const tier = MULTIPLIER_TIERS.find(t => talent.followerCount < t.maxFollowers) || MULTIPLIER_TIERS[MULTIPLIER_TIERS.length - 1];
  const nextTier = MULTIPLIER_TIERS.find(t => t.maxFollowers > talent.followerCount);
  
  // Calculate progress to next tier drop (inverse because more followers = worse multiplier)
  const prevMax = MULTIPLIER_TIERS[MULTIPLIER_TIERS.indexOf(tier) - 1]?.maxFollowers || 0;
  const range = tier.maxFollowers - prevMax;
  const currentInTier = talent.followerCount - prevMax;
  const progressPercent = Math.min(100, Math.max(0, (currentInTier / range) * 100));

  if (variant === 'compact') {
    return (
      <div 
        onClick={onClick}
        className="flex-shrink-0 w-[160px] relative group cursor-pointer transition-all active:scale-95 duration-200"
      >
        {/* Shadow layer for depth */}
        <div className="absolute inset-0 bg-black/20 blur-xl rounded-[28px] translate-y-2 scale-90 group-hover:scale-100 transition-transform duration-300" />
        
        <div className="h-[240px] w-full relative rounded-[28px] overflow-hidden bg-rally-dark ring-1 ring-white/10">
            <img src={talent.image} alt={talent.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-lg">
                 <span className="text-white text-[10px] font-bold flex items-center gap-1">
                    {tier.icon} {tier.multiplier}x
                 </span>
            </div>

            <div className="absolute bottom-4 left-3 right-3">
                <p className="text-white font-bold text-base tracking-tight truncate leading-tight shadow-black drop-shadow-md">{talent.name}</p>
                <div className="flex items-center gap-1 text-white/80 text-[10px] mb-2 font-medium mt-1">
                    <Zap size={10} className="text-orange-400 fill-orange-400" />
                    <span>{talent.heatScore} Heat</span>
                </div>
                
                {/* Mini Progress Bar */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 shadow-[0_0_10px_rgba(255,165,0,0.5)]" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div 
        onClick={onClick}
        className="w-full relative group cursor-pointer transition-all active:scale-[0.98] duration-200 mb-6"
    >
        {/* Glow Effect Background */}
        <div className="absolute inset-4 bg-orange-500/10 blur-2xl rounded-[32px] translate-y-4 scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-black/30 blur-xl rounded-[32px] translate-y-3 scale-[0.98]" />

        <div className="h-[320px] w-full relative rounded-[32px] overflow-hidden bg-rally-dark ring-1 ring-white/10 shadow-2xl">
             <img src={talent.image} alt={talent.name} className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
             
             {/* Heat Score Badge */}
             <div className="absolute top-5 right-5 bg-black/20 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg group-hover:bg-black/40 transition-colors">
                <Zap size={14} className="text-orange-400 fill-orange-400 animate-pulse" />
                <span className="text-white font-bold text-xs tracking-wide">{talent.heatScore} Heat</span>
             </div>

             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1 drop-shadow-md">{talent.category} • {talent.subcategory}</p>
                        <h3 className="text-white font-bold text-3xl tracking-tighter leading-none drop-shadow-lg">{talent.name}</h3>
                    </div>
                    <div className="text-right flex flex-col items-end">
                         <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl font-bold text-xl shadow-lg flex items-center gap-1.5 border border-white/10 mb-1">
                            <span>{tier.icon}</span>
                            <span>{tier.multiplier}x</span>
                         </div>
                    </div>
                </div>
                
                {/* Follower / Tier Progress */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors">
                    <div className="flex justify-between text-[11px] text-white/90 font-medium mb-2 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5"><Users size={12} className="text-white/60" /> {talent.followerCount.toLocaleString()} Followers</span>
                        {nextTier ? (
                            <span className="text-orange-300">Next drop at {tier.maxFollowers.toLocaleString()}</span>
                        ) : (
                            <span>Max Tier Reached</span>
                        )}
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden relative shadow-inner">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-300 relative"
                         >
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]" />
                         </motion.div>
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
};
