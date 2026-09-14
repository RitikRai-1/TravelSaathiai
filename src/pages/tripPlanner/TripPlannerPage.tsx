import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { City } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { PreTripBudgetChart } from '../../components/budget/PreTripBudgetChart';
import { MobileTripPlannerWizard } from './MobileTripPlannerWizard';
import { SafeImage } from '../../components/common/SafeImage';

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
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const BUDGET_PRESETS = [
  { label: '₹5,000', value: 5000, desc: 'Budget backpacker' },
  { label: '₹10,000', value: 10000, desc: 'Comfortable explorer' },
  { label: '₹25,000', value: 25000, desc: 'Standard holiday' },
  { label: '₹50,000', value: 50000, desc: 'Premium experiential' },
  { label: '₹1,00,000+', value: 100000, desc: 'Royal luxury tour' },
];

const DAYS_PRESETS = [1, 2, 3, 4, 5, 7, 10];

const TRANSPORT_MODES = [
  { name: 'Own Car', icon: '🚗', desc: 'Personal or rental car road trip with highway routes, tolls & fuel advice' },
  { name: 'Bike', icon: '🏍️', desc: 'Two-wheeler motorcycle adventure through scenic mountain or coastal roads' },
  { name: 'Bus', icon: '🚌', desc: 'Intercity AC Volvo and state tourism bus connectivity' },
  { name: 'Train', icon: '🚆', desc: 'Indian Railways superfast & express connected travel' },
  { name: 'Flight', icon: '✈️', desc: 'Airport transfers and express air travel' },
  { name: 'Taxi', icon: '🚕', desc: 'Pre-calculated local cab fares and private sightseeing' },
  { name: 'Local Transport', icon: '🛺', desc: 'Metro, auto rickshaws, and e-rickshaws for authentic city exploration' },
  { name: 'Self / Own Vehicle', icon: '🚙', desc: 'Personal vehicle road trip with highway routes & parking tips' },
];

const INTERESTS_LIST = [
  { name: 'History', icon: '🏰' },
  { name: 'Spiritual', icon: '🛕' },
  { name: 'Nature', icon: '🌿' },
  { name: 'Beach', icon: '🏖️' },
  { name: 'Adventure', icon: '🧗‍♂️' },
  { name: 'Food', icon: '🍛' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Culture', icon: '🎭' },
  { name: 'Nightlife', icon: '🎉' },
  { name: 'Photography', icon: '📷' },
  { name: 'Wildlife', icon: '🐅' },
];

const TRAVEL_WITH_LIST = [
  { type: 'Solo', icon: '🎒', desc: 'Safe, budget-friendly solo exploration' },
  { type: 'Couple', icon: '💑', desc: 'Romantic sunsets, fine dining & havelis' },
  { type: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Kid-friendly, relaxed pacing & safety' },
  { type: 'Friends', icon: '👥', desc: 'Adventure, nightlife, cafes & road trips' },
];

export const TripPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const stateCityId = (location.state as any)?.defaultCityId;
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    searchParams.get('city')
      ? Number(searchParams.get('city'))
      : stateCityId
      ? Number(stateCityId)
      : null
  );
  const [citySearch, setCitySearch] = useState('');
  const [budgetTarget, setBudgetTarget] = useState<number>(25000);
  const [customBudget, setCustomBudget] = useState<string>('');
  const [daysCount, setDaysCount] = useState<number>(3);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [transportMode, setTransportMode] = useState<string>('Self / Own Vehicle');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['History', 'Food', 'Culture']);
  const [travellerType, setTravellerType] = useState<string>('Couple');
  const [foodPreference, setFoodPreference] = useState<'veg' | 'non_veg' | 'both'>('veg');
  const [stepError, setStepError] = useState<string>('');

  // Generating State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState('Analyzing verified Indian tourist places...');

  useEffect(() => {
    api.getCities()
      .then((res) => {
        if (res.success) setCities(res.data);
      })
      .finally(() => setLoadingCities(false));
  }, []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCityId) {
      alert('Please select a destination city.');
      setCurrentStep(1);
      return;
    }

    setIsGenerating(true);

    const phases = [
      'Querying database for published attractions in selected city...',
      'Evaluating entry fees, opening hours, and ratings...',
      'Calculating distance and optimal routes to avoid backtracking...',
      'Computing hotel and food costs for budget compatibility...',
      'Generating your personalized day-by-day itinerary...',
    ];

    let pIdx = 0;
    const interval = setInterval(() => {
      pIdx++;
      if (pIdx < phases.length) {
        setGenPhase(phases[pIdx]);
      }
    }, 600);

    try {
      const finalBudget = customBudget ? Number(customBudget) : budgetTarget;
      const res = await api.generateTrip({
        cityId: selectedCityId,
        budgetTarget: finalBudget,
        daysCount,
        travellersCount: adultsCount + childrenCount,
        adultsCount,
        childrenCount,
        transportMode,
        interests: selectedInterests,
        travellerType,
        foodPreference,
      });

      clearInterval(interval);

      if (res.success && res.trip) {
        sessionStorage.setItem('lastGeneratedTrip', JSON.stringify(res.trip));
        navigate('/trip/preview');
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      alert(err.message || 'Failed to generate trip');
    }
  };

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.state_name?.toLowerCase().includes(citySearch.toLowerCase())
  );

  const selectedCityObj = cities.find((c) => c.id === selectedCityId);

  return (
    <>
      {/* Dedicated Smartphone Mobile Wizard (<= 767px) */}
      <div className="block md:hidden">
        <MobileTripPlannerWizard
          cities={cities}
          selectedCityId={selectedCityId}
          setSelectedCityId={setSelectedCityId}
          citySearch={citySearch}
          setCitySearch={setCitySearch}
          budgetTarget={budgetTarget}
          setBudgetTarget={setBudgetTarget}
          customBudget={customBudget}
          setCustomBudget={setCustomBudget}
          daysCount={daysCount}
          setDaysCount={setDaysCount}
          adultsCount={adultsCount}
          setAdultsCount={setAdultsCount}
          childrenCount={childrenCount}
          setChildrenCount={setChildrenCount}
          transportMode={transportMode}
          setTransportMode={setTransportMode}
          selectedInterests={selectedInterests}
          toggleInterest={toggleInterest}
          travellerType={travellerType}
          setTravellerType={setTravellerType}
          foodPreference={foodPreference}
          setFoodPreference={setFoodPreference}
          isGenerating={isGenerating}
          genPhase={genPhase}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Existing Desktop & Tablet Form (>= 768px) - 100% untouched */}
      <div className="hidden md:block max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Planner Card */}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Wizard Header */}
        <div className="bg-gradient-to-r from-[#0B192C] via-[#0F766E] to-[#0B192C] p-6 sm:p-8 text-white relative">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-2 backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>{t('aiAssistant', 'AI Assistant')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading">{t('plannerTitle', 'Plan Your Trip')}</h1>
          <p className="text-[#FAF9F6]/80 text-xs sm:text-sm mt-1">
            {t('plannerSubtitle', 'Personalized routes, verified attractions, and real budget optimization.')}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center space-x-2 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === currentStep
                    ? 'w-8 bg-[#FF6B35]'
                    : s < currentStep
                    ? 'w-4 bg-[#2DD4BF]'
                    : 'w-2 bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Body Content */}
        <div className="p-6 sm:p-8">
          {isGenerating ? (
            <div className="py-16 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
                <Sparkles className="w-8 h-8 text-[#FF6B35] absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-[#0B192C] font-heading">{t('buildingOdysseyTitle', 'Building Your Indian Odyssey')}</h3>
                <p className="text-xs font-medium text-[#0F766E] h-6 transition-all duration-200">{genPhase}</p>
                <p className="text-[11px] text-slate-400">Balancing tourist places, meal stops, hidden gems & transport...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STEP 1: DESTINATION */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B192C] font-heading">{t('chooseDestination', 'Where do you want to travel?')}</h3>
                    <p className="text-xs text-slate-500">{t('chooseDestinationSub', "Search or choose from India's top tourist cities.")}</p>
                  </div>

                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#0F766E]" />
                    <input
                      type="text"
                      placeholder={t('searchDestinationPlaceholder', 'Search destination city (e.g. Delhi, Jaipur, Goa, Manali, Varanasi)...')}
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                    {filteredCities.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCityId(c.id)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          selectedCityId === c.id
                            ? 'bg-[#0F766E]/10 border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-[#2DD4BF] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{c.state_name}</span>
                          {selectedCityId === c.id && <Check className="w-3.5 h-3.5 text-[#0F766E]" />}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 font-heading mt-1">{c.name}</h4>
                        <span className="text-[10px] text-[#0F766E] mt-1 font-semibold">{c.categories?.slice(0, 2).join(', ')}</span>
                      </button>
                    ))}
                  </div>

                  {selectedCityObj && (
                    <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#2DD4BF]/30 flex items-center space-x-3">
                      <SafeImage src={selectedCityObj.cover_image} alt={selectedCityObj.name} className="w-12 h-12 rounded-xl object-cover" category="city" />
                      <div>
                        <span className="text-xs text-[#0F766E] font-bold">{t('selectedDestinationLabel', 'Selected Destination:')}</span>
                        <h5 className="text-sm font-bold text-slate-900">{selectedCityObj.name}, {selectedCityObj.state_name}</h5>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: BUDGET */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B192C] font-heading">{t('tripBudgetTitle', 'What is your total trip budget?')}</h3>
                    <p className="text-xs text-slate-500">{t('tripBudgetSub', 'Includes stay, meals, local transport/taxi, and entry fees.')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUDGET_PRESETS.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => {
                          setBudgetTarget(b.value);
                          setCustomBudget('');
                        }}
                        className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                          budgetTarget === b.value && !customBudget
                            ? 'bg-[#0F766E]/10 border-[#0F766E] ring-2 ring-[#0F766E]/20'
                            : 'bg-white border-slate-200 hover:border-[#2DD4BF]'
                        }`}
                      >
                        <div>
                          <span className="text-lg font-bold text-slate-900 font-heading">{b.label}</span>
                          <p className="text-xs text-slate-500">{b.desc}</p>
                        </div>
                        {budgetTarget === b.value && !customBudget && <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('enterCustomBudget', 'Or Enter Custom Budget (₹ INR)')}</label>
                    <input
                      type="number"
                      placeholder="e.g. 35000"
                      value={customBudget}
                      onChange={(e) => {
                        setCustomBudget(e.target.value);
                        setBudgetTarget(Number(e.target.value) || 25000);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-hidden focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
                    />
                  </div>

                  {/* Live Compact Budget Chart Preview */}
                  <div className="pt-2">
                    <PreTripBudgetChart
                      budgetTarget={customBudget ? Number(customBudget) : budgetTarget}
                      daysCount={daysCount}
                      travellersCount={adultsCount + childrenCount}
                      transportMode={transportMode}
                      compact={true}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: DAYS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B192C] font-heading">{t('durationTitle', 'How many days will you travel?')}</h3>
                    <p className="text-xs text-slate-500">{t('durationSub', 'Choose itinerary duration.')}</p>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                    {DAYS_PRESETS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDaysCount(d)}
                        className={`py-4 rounded-2xl border text-center transition ${
                          daysCount === d
                            ? 'bg-[#0F766E] text-white font-bold border-[#0F766E] shadow-md shadow-[#0F766E]/25'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-[#2DD4BF] font-bold'
                        }`}
                      >
                        <span className="text-xl block">{d}</span>
                        <span className="text-[10px] block uppercase">{d === 1 ? t('dayUnit', 'Day') : t('daysUnit', 'Days')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: TRAVELLERS */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B192C] font-heading">{t('whoTravellingTitle', 'Who is travelling?')}</h3>
                    <p className="text-xs text-slate-500">{t('whoTravellingSub', 'Help us calculate hotel rooms and passenger transport capacity.')}</p>
                  </div>

                  <div className="space-y-4 max-w-sm">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{t('adultsLabel', 'Adults (Age 12+)')}</h4>
                        <span className="text-xs text-slate-400">{t('adultsSub', 'Regular fare & room occupancy')}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="text-base font-bold text-slate-900 w-4 text-center">{adultsCount}</span>
                        <button
                          type="button"
                          onClick={() => setAdultsCount(adultsCount + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{t('childrenLabel', 'Children (Age 0-11)')}</h4>
                        <span className="text-xs text-slate-400">{t('childrenSub', 'Discounted / free attraction entry')}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="text-base font-bold text-slate-900 w-4 text-center">{childrenCount}</span>
                        <button
                          type="button"
                          onClick={() => setChildrenCount(childrenCount + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 font-semibold pt-1">
                      {t('totalTravellersLabel', 'Total Travellers:')} <span className="text-[#0F766E] font-bold">{adultsCount + childrenCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: TRANSPORT MODE */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B192C] font-heading">{t('transportTitle', 'Preferred Mode of Transport')}</h3>
                    <p className="text-xs text-slate-500">{t('transportSub', 'We optimize transit timing, parking advice, and fuel estimates accordingly.')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRANSPORT_MODES.map((tMode) => (
                      <button
                        key={tMode.name}
                        type="button"
                        onClick={() => setTransportMode(tMode.name)}
                        className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3 ${
                          transportMode === tMode.name
                            ? 'bg-[#0F766E]/10 border-[#0F766E] ring-2 ring-[#0F766E]/20'
                            : 'bg-white border-slate-200 hover:border-[#2DD4BF]'
                        }`}
                      >
                        <span className="text-2xl">{tMode.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{tMode.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{tMode.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: INTERESTS */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B192C] font-heading">{t('interestsTitle', 'What are you interested in experiencing?')}</h3>
                    <p className="text-xs text-slate-500">{t('interestsSub', 'Select all that apply to guide AI destination matching.')}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {INTERESTS_LIST.map((int) => {
                      const isSelected = selectedInterests.includes(int.name);
                      return (
                        <button
                          key={int.name}
                          type="button"
                          onClick={() => toggleInterest(int.name)}
                          className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#0F766E]/10 border-[#0F766E] ring-2 ring-[#0F766E]/20 font-bold text-[#0B192C]'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-[#2DD4BF]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{int.icon}</span>
                            <span className="text-xs font-semibold">{int.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#0F766E] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 7: TRAVEL WITH */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B192C] font-heading">{t('travelWithTitle', 'Who are you travelling with?')}</h3>
                    <p className="text-xs text-slate-500">{t('travelWithSub', 'Determines attraction compatibility scoring and hotel styles.')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRAVEL_WITH_LIST.map((grp) => (
                      <button
                        key={grp.type}
                        type="button"
                        onClick={() => setTravellerType(grp.type)}
                        className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3 ${
                          travellerType === grp.type
                            ? 'bg-[#0F766E]/10 border-[#0F766E] ring-2 ring-[#0F766E]/20'
                            : 'bg-white border-slate-200 hover:border-[#2DD4BF]'
                        }`}
                      >
                        <span className="text-2xl">{grp.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 font-heading">{grp.type}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{grp.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: FOOD PREFERENCE */}
              {currentStep === 8 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B192C] font-heading">{t('foodPreferenceTitle', "What's your food preference?")}</h3>
                    <p className="text-xs text-slate-500">{t('foodPreferenceSub', 'We will customize restaurant recommendations and itinerary meal stops to your diet.')}</p>
                  </div>

                  {/* Three Clear Options: 🥬 VEGETARIAN / 🍗 NON-VEGETARIAN / 🥬🍗 BOTH */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStepError('');
                        setFoodPreference('veg');
                      }}
                      className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between relative group ${
                        foodPreference === 'veg'
                          ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/30 shadow-md'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl shadow-xs">
                          🥬
                        </div>
                        {foodPreference === 'veg' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <h4 className="text-base font-bold text-emerald-950 font-heading flex items-center space-x-1.5">
                          <span>VEGETARIAN</span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Pure veg restaurants, Sattvic/Jain thalis, and veg-friendly culinary gems. Strictly excludes meat & poultry.
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-emerald-100 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                        <span>✓ Pure Veg & Veg-Friendly Stops</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStepError('');
                        setFoodPreference('non_veg');
                      }}
                      className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between relative group ${
                        foodPreference === 'non_veg'
                          ? 'bg-amber-50/70 border-amber-600 ring-2 ring-amber-600/30 shadow-md'
                          : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-xs">
                          🍗
                        </div>
                        {foodPreference === 'non_veg' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <h4 className="text-base font-bold text-amber-950 font-heading flex items-center space-x-1.5">
                          <span>NON-VEGETARIAN</span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Authentic Mughlai, coastal curries, succulent kebabs, regional non-veg specialties and multi-cuisine hubs.
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-amber-100 text-[11px] font-semibold text-amber-700 flex items-center space-x-1">
                        <span>✓ Meat, Poultry, Seafood & Multi-Cuisine</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStepError('');
                        setFoodPreference('both');
                      }}
                      className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between relative group ${
                        foodPreference === 'both'
                          ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-600/30 shadow-md'
                          : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-teal-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-2xl shadow-xs">
                          🥬🍗
                        </div>
                        {foodPreference === 'both' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <h4 className="text-base font-bold text-teal-950 font-heading flex items-center space-x-1.5">
                          <span>BOTH</span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Complete flexibility: pure vegetarian specialties alongside famous regional non-veg dining spots.
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-teal-100 text-[11px] font-semibold text-teal-700 flex items-center space-x-1">
                        <span>✓ Full Culinary Diversity</span>
                      </div>
                    </button>
                  </div>

                  {/* Trip Specifications Summary */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 mt-4">
                    <span className="font-bold text-[#0B192C] uppercase tracking-wider text-[10px]">{t('tripSpecifications', 'Trip Specifications:')}</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-slate-600">
                      <div>{t('destinationLabel', 'Destination:')} <span className="font-bold text-[#0B192C]">{selectedCityObj?.name}</span></div>
                      <div>{t('durationLabel', 'Duration:')} <span className="font-bold text-[#0B192C]">{daysCount} {daysCount === 1 ? t('dayUnit', 'Day') : t('daysUnit', 'Days')}</span></div>
                      <div>{t('targetBudgetLabel', 'Budget Target:')} <span className="font-bold text-[#0F766E]">₹{budgetTarget.toLocaleString('en-IN')}</span></div>
                      <div>{t('transportModeLabel', 'Mode:')} <span className="font-bold text-[#0B192C]">{transportMode}</span></div>
                      <div>Diet: <span className="font-bold text-[#0F766E]">{foodPreference === 'veg' ? '🥬 Vegetarian' : foodPreference === 'both' ? '🥬🍗 Veg & Non-Veg' : '🍗 Non-Veg'}</span></div>
                    </div>
                  </div>

                  {/* Full Interactive Pre-Trip Budget Chart before generating */}
                  <div className="mt-4">
                    <PreTripBudgetChart
                      budgetTarget={customBudget ? Number(customBudget) : budgetTarget}
                      daysCount={daysCount}
                      travellersCount={adultsCount + childrenCount}
                      transportMode={transportMode}
                      compact={false}
                    />
                  </div>
                </div>
              )}

              {/* Step Error Banner */}
              {stepError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{stepError}</span>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStepError('');
                      setCurrentStep(currentStep - 1);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t('backBtn', 'Back')}</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 8 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStepError('');
                      if (currentStep === 1 && !selectedCityId) {
                        setStepError('Please select a destination city to continue.');
                        return;
                      }
                      if (currentStep === 2) {
                        const finalBudget = customBudget ? Number(customBudget) : budgetTarget;
                        if (!finalBudget || isNaN(finalBudget) || finalBudget < 1000) {
                          setStepError('Please select or enter a valid trip budget (minimum ₹1,000).');
                          return;
                        }
                      }
                      if (currentStep === 3 && (!daysCount || daysCount < 1)) {
                        setStepError('Please select at least 1 travel day.');
                        return;
                      }
                      if (currentStep === 4 && adultsCount < 1) {
                        setStepError('At least 1 adult traveller is required.');
                        return;
                      }
                      if (currentStep === 5 && !transportMode) {
                        setStepError('Please select your preferred transportation mode.');
                        return;
                      }
                      if (currentStep === 6 && selectedInterests.length === 0) {
                        setStepError('Please select at least 1 travel interest.');
                        return;
                      }
                      if (currentStep === 7 && !travellerType) {
                        setStepError('Please select who you are travelling with.');
                        return;
                      }
                      setCurrentStep(currentStep + 1);
                    }}
                    className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D5E57] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                  >
                    <span>{t('nextBtn', 'Next Step')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStepError('');
                      if (!foodPreference) {
                        setStepError('Please select your food preference (Vegetarian or Non-Vegetarian).');
                        return;
                      }
                      handleGenerate();
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#E85D26] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B35]/25 transition flex items-center space-x-2 transform hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{t('generateTripBtn', 'GENERATE MY TRIP')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indian Monuments Skyline Accent */}
      <div className="mt-8 bg-white/60 rounded-2xl p-4 border border-teal-100/80 shadow-xs">
        <IndianMonumentsSkyline className="w-full text-[#0F766E]/20" tagline="Bharat Ki Khoj Ab Aur Aasaan • Designed for India" />
      </div>
    </div>
    </>
  );
};

