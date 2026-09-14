import React, { useState } from 'react';
import { City } from '../../types';
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Car,
  Compass,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Utensils,
  RefreshCw,
  Plus,
  Minus,
} from 'lucide-react';

interface MobileTripPlannerWizardProps {
  cities: City[];
  selectedCityId: number | null;
  setSelectedCityId: (id: number) => void;
  citySearch: string;
  setCitySearch: (q: string) => void;
  budgetTarget: number;
  setBudgetTarget: (b: number) => void;
  customBudget: string;
  setCustomBudget: (b: string) => void;
  daysCount: number;
  setDaysCount: (d: number) => void;
  adultsCount: number;
  setAdultsCount: (a: number) => void;
  childrenCount: number;
  setChildrenCount: (c: number) => void;
  transportMode: string;
  setTransportMode: (m: string) => void;
  selectedInterests: string[] | string;
  toggleInterest: (i: string) => void;
  travellerType: string;
  setTravellerType: (t: string) => void;
  foodPreference: 'veg' | 'non_veg' | 'both';
  setFoodPreference: (f: 'veg' | 'non_veg' | 'both') => void;
  isGenerating: boolean;
  genPhase: string;
  onGenerate: () => void;
}

const BUDGET_PRESETS = [
  { label: '₹5,000', value: 5000, desc: 'Budget backpacker' },
  { label: '₹10,000', value: 10000, desc: 'Comfortable explorer' },
  { label: '₹25,000', value: 25000, desc: 'Standard holiday' },
  { label: '₹50,000', value: 50000, desc: 'Premium experiential' },
  { label: '₹1,00,000+', value: 100000, desc: 'Royal luxury tour' },
];

const DAYS_PRESETS = [1, 2, 3, 4, 5, 7, 10];

const TRANSPORT_OPTIONS = [
  { name: 'Own Car', icon: '🚗', desc: 'Highway routes, tolls & fuel advice' },
  { name: 'Bike', icon: '🏍️', desc: 'Two-wheeler scenic mountain/coastal ride' },
  { name: 'Bus', icon: '🚌', desc: 'Intercity AC Volvo & state bus' },
  { name: 'Train', icon: '🚆', desc: 'Indian Railways superfast express' },
  { name: 'Flight', icon: '✈️', desc: 'Airport transfers & flights' },
  { name: 'Taxi', icon: '🚕', desc: 'Private sightseeing & cab' },
  { name: 'Local Transport', icon: '🛺', desc: 'Metro, auto & e-rickshaws' },
];

const INTERESTS = [
  { name: 'History', icon: '🏰' },
  { name: 'Spiritual', icon: '🛕' },
  { name: 'Nature', icon: '🌿' },
  { name: 'Beach', icon: '🏖️' },
  { name: 'Adventure', icon: '🧗‍♂️' },
  { name: 'Food', icon: '🍛' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Culture', icon: '🎭' },
  { name: 'Photography', icon: '📷' },
  { name: 'Wildlife', icon: '🐅' },
];

const TRAVELLER_TYPES = [
  { type: 'Solo', icon: '🎒', desc: 'Safe & budget-friendly' },
  { type: 'Couple', icon: '💑', desc: 'Romantic & fine dining' },
  { type: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Kid-friendly pacing' },
  { type: 'Friends', icon: '👥', desc: 'Adventure & cafes' },
];

export const MobileTripPlannerWizard: React.FC<MobileTripPlannerWizardProps> = ({
  cities,
  selectedCityId,
  setSelectedCityId,
  citySearch,
  setCitySearch,
  budgetTarget,
  setBudgetTarget,
  customBudget,
  setCustomBudget,
  daysCount,
  setDaysCount,
  adultsCount,
  setAdultsCount,
  childrenCount,
  setChildrenCount,
  transportMode,
  setTransportMode,
  selectedInterests,
  toggleInterest,
  travellerType,
  setTravellerType,
  foodPreference,
  setFoodPreference,
  isGenerating,
  genPhase,
  onGenerate,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const interestsArray = Array.isArray(selectedInterests)
    ? selectedInterests
    : typeof selectedInterests === 'string'
    ? (selectedInterests as string).split(',').map((s) => s.trim())
    : [];

  const selectedCity = cities.find((c) => c.id === selectedCityId);

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    (c.state_name && c.state_name.toLowerCase().includes(citySearch.toLowerCase()))
  );

  const handleNext = () => {
    if (step === 1 && !selectedCityId) {
      alert('Please select your destination city first.');
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onGenerate();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generation loading overlay
  if (isGenerating) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#0F766E]/20 border-t-[#FF6B35] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            🧭
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
            Crafting Your Indian Itinerary
          </h2>
          <p className="text-xs text-[#0F766E] dark:text-[#2DD4BF] font-semibold animate-pulse">
            {genPhase}
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Computing route distance, verified monument hours, pure veg dining and rupee budget.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
      {/* ================= STEP PROGRESS BAR ================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#FF6B35] uppercase tracking-wider">
            Step {step} of {totalSteps}
          </span>
          <span className="text-slate-500 font-semibold">
            {step === 1 && 'Destination'}
            {step === 2 && 'Budget'}
            {step === 3 && 'Duration'}
            {step === 4 && 'Travellers'}
            {step === 5 && 'Transport'}
            {step === 6 && 'Interests'}
            {step === 7 && 'Trip Style'}
            {step === 8 && 'Food Preference'}
          </span>
        </div>

        {/* Progress Fill Indicator */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0F766E] via-[#2DD4BF] to-[#FF6B35] transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ================= STEP 1: DESTINATION ================= */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              Where do you want to go?
            </h2>
            <p className="text-xs text-slate-500">
              Select one of India's iconic cities or search your preferred destination.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search Jaipur, Goa, Varanasi, Agra..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B192C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          {/* Selected City Chip */}
          {selectedCity && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#0F766E]/30 border border-emerald-300 dark:border-[#2DD4BF]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1B5E20] dark:text-[#2DD4BF]" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedCity.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {selectedCity.state_name}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#1B5E20] dark:text-[#2DD4BF] bg-white dark:bg-[#07101C] px-2 py-0.5 rounded-md">
                Selected
              </span>
            </div>
          )}

          {/* City Grid Cards (touch-friendly) */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {filteredCities.slice(0, 12).map((city) => {
              const isSelected = selectedCityId === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setSelectedCityId(city.id)}
                  className={`relative p-2.5 rounded-2xl border text-left flex flex-col justify-between min-h-[76px] transition active:scale-98 ${
                    isSelected
                      ? 'border-[#0F766E] bg-emerald-50/80 dark:bg-[#0F766E]/40 ring-2 ring-[#2DD4BF]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {city.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {city.state_name || 'India'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 2: BUDGET ================= */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              What is your total budget?
            </h2>
            <p className="text-xs text-slate-500">
              Covers stays, food, entry tickets, and intra-city travel.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#115E59] text-white text-center space-y-1">
            <span className="text-xs font-semibold text-emerald-200">Selected Target</span>
            <p className="text-3xl font-extrabold font-heading">₹{budgetTarget.toLocaleString('en-IN')}</p>
          </div>

          {/* Preset Touch Cards */}
          <div className="space-y-2">
            {BUDGET_PRESETS.map((preset) => {
              const isSelected = budgetTarget === preset.value && !customBudget;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setBudgetTarget(preset.value);
                    setCustomBudget('');
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between min-h-[52px] active:scale-98 transition ${
                    isSelected
                      ? 'border-[#0F766E] bg-emerald-50 dark:bg-[#0F766E]/40 text-[#0F766E] dark:text-white ring-2 ring-[#2DD4BF]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold block">{preset.label}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{preset.desc}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-[#0F766E] dark:text-[#2DD4BF]" />}
                </button>
              );
            })}
          </div>

          {/* Custom Budget Input */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Or Enter Custom Amount (₹)
            </label>
            <input
              type="number"
              value={customBudget}
              onChange={(e) => {
                setCustomBudget(e.target.value);
                const val = Number(e.target.value);
                if (val > 0) setBudgetTarget(val);
              }}
              placeholder="e.g. 35000"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B192C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>
      )}

      {/* ================= STEP 3: DURATION (DAYS) ================= */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              How many days will you travel?
            </h2>
            <p className="text-xs text-slate-500">
              Choose the length of your itinerary.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <p className="text-4xl font-extrabold text-[#0F766E] dark:text-[#2DD4BF] font-heading">
              {daysCount} {daysCount === 1 ? 'Day' : 'Days'}
            </p>
            <p className="text-xs text-slate-500">
              {daysCount <= 2 ? 'Quick weekend getaway' : daysCount <= 5 ? 'Standard city exploration' : 'Comprehensive heritage holiday'}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {DAYS_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDaysCount(d)}
                className={`py-3 rounded-2xl font-bold text-sm min-h-[48px] border transition active:scale-95 ${
                  daysCount === d
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-md shadow-teal-500/20'
                    : 'bg-white dark:bg-[#0B192C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                {d} {d === 1 ? 'Day' : 'Days'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 4: TRAVELLERS ================= */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              Who is travelling with you?
            </h2>
            <p className="text-xs text-slate-500">
              Helps calculate hotel room requirements and vehicle sizing.
            </p>
          </div>

          {/* Adults Counter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Adults</p>
              <p className="text-xs text-slate-500">Ages 12 and above</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 min-w-[40px] min-h-[40px]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-base text-slate-900 dark:text-white w-6 text-center">
                {adultsCount}
              </span>
              <button
                type="button"
                onClick={() => setAdultsCount(Math.min(10, adultsCount + 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 min-w-[40px] min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Children Counter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Children</p>
              <p className="text-xs text-slate-500">Ages 2 to 11</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 min-w-[40px] min-h-[40px]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-base text-slate-900 dark:text-white w-6 text-center">
                {childrenCount}
              </span>
              <button
                type="button"
                onClick={() => setChildrenCount(Math.min(6, childrenCount + 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 min-w-[40px] min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 5: TRANSPORTATION ================= */}
      {step === 5 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              Preferred Transportation
            </h2>
            <p className="text-xs text-slate-500">
              Select how you plan to commute between attractions.
            </p>
          </div>

          <div className="space-y-2">
            {TRANSPORT_OPTIONS.map((opt) => {
              const isSelected = transportMode === opt.name;
              return (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setTransportMode(opt.name)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between min-h-[54px] active:scale-98 transition ${
                    isSelected
                      ? 'border-[#0F766E] bg-emerald-50 dark:bg-[#0F766E]/40 text-[#0F766E] dark:text-white ring-2 ring-[#2DD4BF]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <span className="text-xs font-bold block">{opt.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-[#0F766E] dark:text-[#2DD4BF]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 6: INTERESTS ================= */}
      {step === 6 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              What are your travel interests?
            </h2>
            <p className="text-xs text-slate-500">
              Select one or more categories for personalized attractions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {INTERESTS.map((item) => {
              const isSelected = interestsArray.includes(item.name);
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => toggleInterest(item.name)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between min-h-[48px] active:scale-95 transition ${
                    isSelected
                      ? 'border-[#0F766E] bg-emerald-50 dark:bg-[#0F766E]/40 text-[#0F766E] dark:text-white font-bold ring-2 ring-[#2DD4BF]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs">{item.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 7: TRAVEL STYLE ================= */}
      {step === 7 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              What is your travel style?
            </h2>
            <p className="text-xs text-slate-500">
              Tunes activity pacing and suggestions for your party.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TRAVELLER_TYPES.map((t) => {
              const isSelected = travellerType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setTravellerType(t.type)}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[90px] active:scale-95 transition ${
                    isSelected
                      ? 'border-[#0F766E] bg-emerald-50 dark:bg-[#0F766E]/40 text-[#0F766E] dark:text-white font-bold ring-2 ring-[#2DD4BF]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-3xl mb-1.5">{t.icon}</span>
                  <span className="text-xs font-bold block">{t.type}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 8: FOOD PREFERENCE ================= */}
      {step === 8 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              Food & Dietary Preference
            </h2>
            <p className="text-xs text-slate-500">
              Crucial: If Vegetarian is selected, only pure-veg dining is recommended.
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Vegetarian */}
            <button
              type="button"
              onClick={() => setFoodPreference('veg')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between min-h-[64px] active:scale-98 transition ${
                foodPreference === 'veg'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥬</span>
                <div>
                  <span className="text-sm font-bold block">Vegetarian (Pure Veg)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Exclusively vegetarian restaurants in itinerary
                  </span>
                </div>
              </div>
              {foodPreference === 'veg' && <Check className="w-5 h-5 text-emerald-600" />}
            </button>

            {/* Non-Vegetarian */}
            <button
              type="button"
              onClick={() => setFoodPreference('non_veg')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between min-h-[64px] active:scale-98 transition ${
                foodPreference === 'non_veg'
                  ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 ring-2 ring-amber-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍗</span>
                <div>
                  <span className="text-sm font-bold block">Non-Vegetarian</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Includes kebabs, biryanis & meat specialties
                  </span>
                </div>
              </div>
              {foodPreference === 'non_veg' && <Check className="w-5 h-5 text-amber-600" />}
            </button>

            {/* Both */}
            <button
              type="button"
              onClick={() => setFoodPreference('both')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between min-h-[64px] active:scale-98 transition ${
                foodPreference === 'both'
                  ? 'border-[#0F766E] bg-teal-50 dark:bg-[#0F766E]/40 text-teal-900 dark:text-teal-100 ring-2 ring-[#2DD4BF]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍽️</span>
                <div>
                  <span className="text-sm font-bold block">Both (Flexible)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Balanced mix of all iconic local dining
                  </span>
                </div>
              </div>
              {foodPreference === 'both' && <Check className="w-5 h-5 text-[#0F766E]" />}
            </button>
          </div>
        </div>
      )}

      {/* ================= BOTTOM ACTION CONTROLS ================= */}
      <div className="pt-4 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B192C] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 min-h-[44px] active:scale-95 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleNext}
          className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 min-h-[44px] active:scale-98 ${
            step === totalSteps
              ? 'bg-gradient-to-r from-[#FF6B35] to-[#EA580C] hover:brightness-110 text-white shadow-orange-500/25'
              : 'bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white hover:brightness-110 shadow-teal-500/20'
          }`}
        >
          <span>{step === totalSteps ? 'Generate My Trip' : 'Continue'}</span>
          {step === totalSteps ? <Sparkles className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
