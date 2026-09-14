import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GeneratedTrip, GeneratedStop, GeneratedDay, Hotel } from '../../types';
import { SafeImage } from '../../components/common/SafeImage';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Clock,
  Car,
  Utensils,
  Hotel as HotelIcon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Share2,
  ExternalLink,
  Tag,
  Ticket,
} from 'lucide-react';

interface MobileTripDetailViewProps {
  trip: GeneratedTrip;
  selectedHotel: any | null;
  setSelectedHotel: (hotel: any) => void;
  cityHotels: Hotel[];
  workflowStage: 'hotel_selection' | 'full_itinerary';
  setWorkflowStage: (stage: 'hotel_selection' | 'full_itinerary') => void;
  isSaved: boolean;
  onSaveTrip: () => void;
  isOptimizing: boolean;
  onOptimizeTrip: () => void;
  onBookTaxi?: (pickup: string, drop: string) => void;
  appliedOptimizations?: string[];
}

export const MobileTripDetailView: React.FC<MobileTripDetailViewProps> = ({
  trip,
  selectedHotel,
  setSelectedHotel,
  cityHotels,
  workflowStage,
  setWorkflowStage,
  isSaved,
  onSaveTrip,
  isOptimizing,
  onOptimizeTrip,
  onBookTaxi,
  appliedOptimizations = [],
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [budgetExpanded, setBudgetExpanded] = useState(false);

  // Use correct budget properties from BudgetBreakdown interface
  const { budget } = trip;
  const totalBudget = budget.budgetTarget;
  const estimatedCost = budget.estimatedTotalCost;
  const remainingBudget = budget.remainingBudget;
  const isOverBudget = budget.isExceeded;

  const currentDay: GeneratedDay | undefined = trip.days?.[activeDayIndex];

  return (
    <div className="space-y-4 px-4 py-4 max-w-md mx-auto">
      {/* ================= 1. TRIP SUMMARY TOP CARD ================= */}
      <div className="bg-white dark:bg-[#0B192C] rounded-3xl p-5 border border-slate-200 dark:border-[#0F766E]/40 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF] bg-teal-50 dark:bg-[#0F766E]/30 px-2 py-0.5 rounded-full">
              {trip.foodPreference === 'veg' ? '🥬 Pure Veg Itinerary' : 'Verified Indian Tour'}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
              {trip.city?.name || 'Incredible India'}
            </h1>
          </div>

          <button
            onClick={onSaveTrip}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition min-h-[44px] ${
              isSaved
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white dark:bg-[#07101C] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#0F766E]/40 hover:text-[#0F766E]'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* 4 Metric Chips */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#07101C]/60">
            <p className="text-[10px] text-slate-400">Duration</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white font-heading">
              {trip.daysCount || trip.days?.length || 3}D
            </p>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#07101C]/60">
            <p className="text-[10px] text-slate-400">Party</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white font-heading">
              {trip.adultsCount || trip.travellersCount || 2}A{trip.childrenCount ? ` ${trip.childrenCount}C` : ''}
            </p>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#07101C]/60">
            <p className="text-[10px] text-slate-400">Target</p>
            <p className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] font-heading">
              ₹{(totalBudget / 1000).toFixed(0)}k
            </p>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#07101C]/60">
            <p className="text-[10px] text-slate-400">Estimate</p>
            <p className={`text-xs font-bold font-heading ${isOverBudget ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
              ₹{(estimatedCost / 1000).toFixed(0)}k
            </p>
          </div>
        </div>
      </div>

      {/* ================= 2. COMPACT MOBILE BUDGET DASHBOARD ================= */}
      <div className="bg-white dark:bg-[#0B192C] rounded-3xl p-4 border border-slate-200 dark:border-[#0F766E]/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-[#0F766E]/40 text-[#0F766E] dark:text-[#2DD4BF]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                Smart Budget Breakdown
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isOverBudget ? '⚠ Budget Exceeded' : '✔ Within Target Budget'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setBudgetExpanded(!budgetExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg flex items-center gap-1 text-[11px] font-bold min-h-[44px]"
          >
            <span>{budgetExpanded ? 'Collapse' : 'Details'}</span>
            {budgetExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Over Budget Alert & 1-Click Optimize */}
        {isOverBudget && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Budget Exceeded by ₹{(budget.excessAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={onOptimizeTrip}
              disabled={isOptimizing}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[44px]"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Optimizing Stays & Routes...' : 'Optimize My Trip'}</span>
            </button>
          </div>
        )}

        {/* Expandable Breakdown List */}
        {budgetExpanded && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-500">🏨 Stays & Accommodation</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{(budget.hotelCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-500">🍛 Food & Dining</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{(budget.foodCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-500">🚗 Cabs & Commute</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{(budget.transportCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-500">🎟️ Monument Entry Fees</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{(budget.entryFeesCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-500">✨ Activities & Sightseeing</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{(budget.activitiesCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-500">🚕 Taxi Rides</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{(budget.taxiCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">📦 Miscellaneous</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{(budget.miscCost || 0).toLocaleString('en-IN')}</span>
            </div>

            {/* Budget Progress Bar */}
            <div className="pt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverBudget ? 'bg-rose-500' : budget.budgetPercentageUsed > 85 ? 'bg-amber-500' : 'bg-[#0F766E]'
                  }`}
                  style={{ width: `${Math.min(100, budget.budgetPercentageUsed)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                <span>{budget.budgetPercentageUsed}% used</span>
                <span>₹{remainingBudget.toLocaleString('en-IN')} remaining</span>
              </div>
            </div>

            {/* Savings Tips */}
            {budget.savingsTips && budget.savingsTips.length > 0 && (
              <div className="pt-2 space-y-1">
                <p className="text-[10px] font-bold text-[#0F766E] dark:text-[#2DD4BF] uppercase tracking-wider">💡 Savings Tips</p>
                {budget.savingsTips.slice(0, 3).map((tip, i) => (
                  <p key={i} className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">• {tip}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= HOTEL SELECTION (STEP 1) ================= */}
      {workflowStage === 'hotel_selection' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-3xl p-4 border border-slate-200 dark:border-[#0F766E]/40 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-[#0F766E]/40 text-[#0F766E] dark:text-[#2DD4BF]">
              <HotelIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">Select Your Stay</h3>
          </div>

          <div className="space-y-2">
            {cityHotels.slice(0, 5).map((hotel) => {
              const isSelected = selectedHotel?.id === hotel.id;
              return (
                <button
                  key={hotel.id}
                  onClick={() => setSelectedHotel(hotel)}
                  className={`w-full text-left p-3 rounded-2xl border transition min-h-[44px] ${
                    isSelected
                      ? 'border-[#0F766E] bg-teal-50 dark:bg-[#0F766E]/20 ring-2 ring-[#2DD4BF]/50'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07101C] hover:border-[#0F766E]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <SafeImage
                        src={Array.isArray(hotel.photos) && hotel.photos.length > 0 ? hotel.photos[0] : ''}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        category="hotel"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{hotel.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>⭐ {hotel.rating || 4.5}</span>
                        <span>•</span>
                        <span className="font-bold text-[#0F766E] dark:text-[#2DD4BF]">₹{hotel.price_per_night?.toLocaleString('en-IN')}/night</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setWorkflowStage('full_itinerary')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:brightness-110 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>View Full Itinerary →</span>
          </button>
        </div>
      )}

      {/* ================= 3. DAY SELECTOR PILLS ================= */}
      {trip.days && trip.days.length > 0 && workflowStage === 'full_itinerary' && (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
            {trip.days.map((d, idx) => {
              const isSelected = activeDayIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap min-h-[44px] snap-start active:scale-95 transition ${
                    isSelected
                      ? 'bg-[#0F766E] text-white shadow-md shadow-teal-500/20 ring-2 ring-[#2DD4BF]'
                      : 'bg-white dark:bg-[#0B192C] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  DAY {d.dayNumber || idx + 1}
                </button>
              );
            })}
          </div>

          {/* ================= 4. VERTICAL TIMELINE STOPS ================= */}
          {currentDay && (
            <div className="space-y-3">
              <div className="px-1 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                  Day {currentDay.dayNumber || activeDayIndex + 1}: {currentDay.dayTitle || 'Sightseeing & Culinary Trails'}
                </h3>
                <span className="text-[10px] text-slate-500">
                  {currentDay.stops?.length || 0} stops
                </span>
              </div>

              {/* Day Notes */}
              {currentDay.notes && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 px-1 leading-relaxed italic">
                  {currentDay.notes}
                </p>
              )}

              {/* Vertical Timeline Card List */}
              <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-teal-200 dark:before:bg-teal-900">
                {currentDay.stops?.map((stop: GeneratedStop, sIdx: number) => {
                  const stopKey = `${activeDayIndex}-${sIdx}`;
                  const isExpanded = expandedStopId === stopKey;

                  // Icon based on stop type
                  const stopTypeIcon = stop.stopType === 'BREAKFAST' || stop.stopType === 'LUNCH' || stop.stopType === 'DINNER'
                    ? '🍽️'
                    : stop.stopType === 'HOTEL'
                    ? '🏨'
                    : stop.stopType === 'HIDDEN_GEM'
                    ? '💎'
                    : '📍';

                  return (
                    <div key={stopKey} className="relative">
                      {/* Timeline Dot Indicator */}
                      <div className={`absolute -left-6 top-3.5 w-3 h-3 rounded-full ring-4 ring-white dark:ring-[#07101C] z-10 ${
                        stop.stopType === 'HOTEL' ? 'bg-indigo-500' :
                        stop.stopType === 'BREAKFAST' || stop.stopType === 'LUNCH' || stop.stopType === 'DINNER' ? 'bg-amber-500' :
                        stop.stopType === 'HIDDEN_GEM' ? 'bg-purple-500' :
                        'bg-[#0F766E]'
                      }`} />

                      {/* Stop Card */}
                      <div className="bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-[#0F766E]/30 overflow-hidden shadow-xs">
                        <div
                          className="p-3.5 flex items-start justify-between cursor-pointer min-h-[44px]"
                          onClick={() => setExpandedStopId(isExpanded ? null : stopKey)}
                        >
                          <div className="space-y-1 pr-2">
                            {/* Time & Slot */}
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F766E] dark:text-[#2DD4BF]">
                              <Clock className="w-3 h-3" />
                              <span>{stop.startTime || stop.timeSlot || '10:00 AM'}</span>
                              <span className="text-slate-300">•</span>
                              <span className="uppercase text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#07101C] text-slate-600 dark:text-slate-300">
                                {stopTypeIcon} {stop.stopType?.replace('_', ' ') || stop.category || 'Sightseeing'}
                              </span>
                            </div>

                            {/* Attraction / Stop Name */}
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading leading-tight">
                              {stop.title}
                            </h4>

                            {/* Distance & Cost Badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                              {stop.durationHours > 0 && <span>⏱ {stop.durationHours}h</span>}
                              {stop.distanceKm > 0 && <span>📍 {stop.distanceKm} km</span>}
                              {stop.estimatedCost > 0 && (
                                <span className="font-bold text-amber-700 dark:text-amber-400">
                                  ₹{stop.estimatedCost.toLocaleString('en-IN')}
                                </span>
                              )}
                              {stop.entryFee > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <Ticket className="w-3 h-3" /> ₹{stop.entryFee}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Thumbnail / Expand trigger */}
                          <div className="flex flex-col items-end shrink-0 gap-2">
                            {stop.imageUrl ? (
                              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-xs">
                                <SafeImage
                                  src={stop.imageUrl}
                                  alt={stop.title}
                                  className="w-full h-full object-cover"
                                  category="place"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-[#07101C] text-[#0F766E] flex items-center justify-center font-bold text-xs">
                                {sIdx + 1}
                              </div>
                            )}
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                              aria-label="Toggle Details"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            {stop.description && (
                              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                                {stop.description}
                              </p>
                            )}

                            {stop.bestVisitingTime && (
                              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
                                🕐 <strong>Best Time:</strong> {stop.bestVisitingTime}
                              </div>
                            )}

                            {stop.transportNotes && (
                              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                                💡 <strong>Travel Tip:</strong> {stop.transportNotes}
                              </div>
                            )}

                            {stop.travelTimeMins > 0 && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Car className="w-3 h-3" />
                                ~{stop.travelTimeMins} min travel from previous stop
                              </p>
                            )}

                            {onBookTaxi && stop.distanceKm > 0 && (
                              <button
                                onClick={() => onBookTaxi(
                                  currentDay.stops?.[Math.max(0, sIdx - 1)]?.title || 'Hotel',
                                  stop.title
                                )}
                                className="w-full py-2 px-3 rounded-xl bg-[#0F766E]/10 text-[#0F766E] dark:text-[#2DD4BF] font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-[#0F766E]/20 transition min-h-[44px]"
                              >
                                <Car className="w-3.5 h-3.5" />
                                <span>Book Cab to {stop.title}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SHARE BUTTON ================= */}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: trip.title,
              text: `Check out my ${trip.daysCount}-day itinerary for ${trip.city.name} on TravelSaathi AI!`,
              url: window.location.href,
            }).catch(() => {});
          } else {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
        className="w-full py-3 px-4 rounded-xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition min-h-[44px]"
      >
        <Share2 className="w-4 h-4" />
        <span>Share Itinerary</span>
      </button>

      {/* ================= 5. SKYLINE ACCENT ================= */}
      <div className="pt-2">
        <IndianMonumentsSkyline className="w-full text-emerald-800/15 dark:text-[#2DD4BF]/10" tagline="Custom Day-by-Day Itinerary • India" />
      </div>
    </div>
  );
};
