import React, { useEffect, useState } from "react";
import { PlayerProfile } from "../types";
import { fetchPlayerProfile } from "../services/api";
import {
  X,
  Trophy,
  Award,
  Zap,
  Calendar,
  GraduationCap,
  Sparkles,
  Shield,
  Activity,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface PlayerModalProps {
  personId: number | null;
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ personId, onClose }) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!personId) return;
    setLoading(true);
    fetchPlayerProfile(personId).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [personId]);

  if (!personId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !profile ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
            <p className="text-sm font-semibold">Loading MLB Player Profile & Career Feeds...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 border-b border-slate-800 flex flex-wrap items-center gap-6">
              {/* Headshot */}
              <div className="relative">
                <img
                  src={profile.headshotUrl}
                  alt={profile.fullName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover bg-slate-800 border-2 border-blue-500/60 shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_400,q_auto:best/v1/people/generic/headshot/silo/current";
                  }}
                />
                {profile.primaryNumber && (
                  <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white font-black text-sm px-2.5 py-0.5 rounded-lg shadow-lg font-mono">
                    #{profile.primaryNumber}
                  </span>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  {profile.currentTeam && (
                    <img src={profile.currentTeam.logoUrl} alt="" className="w-6 h-6 object-contain" />
                  )}
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    {profile.currentTeam?.name || "MLB"}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {profile.primaryPosition?.name || "Player"}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.fullName}</h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 font-mono">
                  <span>Age: {profile.currentAge || "-"}</span>
                  <span>B/T: {profile.batSide?.code || "-"}/{profile.pitchHand?.code || "-"}</span>
                  <span>H/W: {profile.height || "-"}, {profile.weight ? `${profile.weight} lbs` : "-"}</span>
                  <span>Debut: {profile.mlbDebutDate || "-"}</span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Draft Details Card */}
              {profile.draftDetails && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" />
                    <span>Official MLB Draft Details</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 font-mono">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-sans">DRAFT YEAR</span>
                      <span className="font-bold text-white">{profile.draftDetails.year}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-sans">OVERALL PICK</span>
                      <span className="font-bold text-amber-400">#{profile.draftDetails.pickOverall}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-sans">DRAFTING TEAM</span>
                      <span className="font-bold text-slate-200">{profile.draftDetails.team.name}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-sans">COLLEGE / SCHOOL</span>
                      <span className="font-bold text-slate-200 truncate block">{profile.draftDetails.school || "High School"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Awards & Honors */}
              {profile.awards && profile.awards.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Awards & Career Honors ({profile.awards.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.awards.map((award, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-950/40 text-amber-300 border border-amber-800/60 shadow"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        {award.name} {award.season ? `('${award.season})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Career Milestones */}
              {profile.careerMilestones && profile.careerMilestones.length > 0 && (
                <div className="space-y-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Recent Career Milestones & Accomplishments</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                    {profile.careerMilestones.map((ms, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{ms}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Batting Metrics */}
              {profile.stats.currentSeasonBatting && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Batting Metrics (Current Season)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans block">BATTING AVG</span>
                      <span className="text-xl font-black text-amber-400">{profile.stats.currentSeasonBatting.avg}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans block">HOME RUNS</span>
                      <span className="text-xl font-black text-white">{profile.stats.currentSeasonBatting.hr}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans block">RBI</span>
                      <span className="text-xl font-black text-white">{profile.stats.currentSeasonBatting.rbi}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans block">OPS</span>
                      <span className="text-xl font-black text-emerald-400">{profile.stats.currentSeasonBatting.ops}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pitching Metrics (if pitcher) */}
              {profile.stats.currentSeasonPitching && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Pitching Metrics (Current Season)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans block">ERA</span>
                      <span className="text-xl font-black text-amber-400">{profile.stats.currentSeasonPitching.era}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans block">WHIP</span>
                      <span className="text-xl font-black text-white">{profile.stats.currentSeasonPitching.whip}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans block">STRIKEOUTS</span>
                      <span className="text-xl font-black text-blue-400">{profile.stats.currentSeasonPitching.so}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans block">WINS - LOSSES</span>
                      <span className="text-xl font-black text-white">
                        {profile.stats.currentSeasonPitching.wins} - {profile.stats.currentSeasonPitching.losses}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Statcast Highlights */}
              {profile.statcastHighlights && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    <span>Statcast Metrics & Analytics Profile</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                    {profile.statcastHighlights.avgExitVelocityMph && (
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-sans block">AVG EXIT VELOCITY</span>
                        <span className="font-bold text-emerald-400">{profile.statcastHighlights.avgExitVelocityMph} MPH</span>
                      </div>
                    )}
                    {profile.statcastHighlights.maxExitVelocityMph && (
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-sans block">MAX EXIT VELOCITY</span>
                        <span className="font-bold text-amber-400">{profile.statcastHighlights.maxExitVelocityMph} MPH</span>
                      </div>
                    )}
                    {profile.statcastHighlights.hardHitPct && (
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-sans block">HARD HIT %</span>
                        <span className="font-bold text-blue-400">{profile.statcastHighlights.hardHitPct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
