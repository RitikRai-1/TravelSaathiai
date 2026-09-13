import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Outlet, Link } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public & Tourist Pages
import { HomePage } from './pages/home/HomePage';
import { ExplorePage } from './pages/explore/ExplorePage';
import { CityDetailPage } from './pages/explore/CityDetailPage';
import { PlaceDetailPage } from './pages/places/PlaceDetailPage';
import { HiddenGemsPage } from './pages/hiddenGems/HiddenGemsPage';
import { HotelsPage } from './pages/hotels/HotelsPage';
import { HotelDetailPage } from './pages/hotels/HotelDetailPage';
import { RestaurantsPage } from './pages/restaurants/RestaurantsPage';
import { RestaurantDetailPage } from './pages/restaurants/RestaurantDetailPage';
import { TaxisPage } from './pages/taxis/TaxisPage';
import { TaxiNearMePage } from './pages/taxis/TaxiNearMePage';
import { TripPlannerPage } from './pages/tripPlanner/TripPlannerPage';
import { TripDetailPage } from './pages/tripDetail/TripDetailPage';
import { TouristDashboardPage } from './pages/dashboard/TouristDashboardPage';
import { SavedPage } from './pages/saved/SavedPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SearchResultsPage } from './pages/search/SearchResultsPage';
import { AiAssistantWidget } from './components/chat/AiAssistantWidget';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Business Pages
import { BusinessRegisterPage } from './pages/business/BusinessRegisterPage';
import { BusinessDashboardPage } from './pages/business/BusinessDashboardPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCitiesPage } from './pages/admin/AdminCitiesPage';
import { AdminPlacesPage } from './pages/admin/AdminPlacesPage';
import { AdminHiddenGemsPage } from './pages/admin/AdminHiddenGemsPage';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminCmsPage } from './pages/admin/AdminCmsPage';
import { AdminFeaturesPage } from './pages/admin/AdminFeaturesPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';

// Scroll to top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main layout wrapper with Navbar and Footer
const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#07101C] text-slate-900 dark:text-slate-100 selection:bg-[#0F766E] selection:text-white relative transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <AiAssistantWidget />
    </div>
  );
};

// 404 Fallback
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-3xl mb-4">
        🧭
      </div>
      <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2">Destination Not Found</h1>
      <p className="text-slate-600 text-sm max-w-md mb-6">
        Looks like you wandered off the map! The requested path doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-[#1B5E20] hover:bg-[#154a19] text-white text-sm font-bold shadow-lg shadow-green-900/20 transition"
      >
        Return to Home
      </Link>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin routes with dedicated layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="cities" element={<AdminCitiesPage />} />
          <Route path="places" element={<AdminPlacesPage />} />
          <Route path="hidden-gems" element={<AdminHiddenGemsPage />} />
          <Route path="approvals" element={<AdminApprovalsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="cms" element={<AdminCmsPage />} />
          <Route path="features" element={<AdminFeaturesPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
        </Route>

        {/* Public & Customer Facing Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/city/:id" element={<CityDetailPage />} />
          <Route path="/cities/:id" element={<CityDetailPage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />
          <Route path="/place/:id" element={<PlaceDetailPage />} />
          <Route path="/hidden-gems" element={<HiddenGemsPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/hotel/:id" element={<HotelDetailPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/taxis" element={<TaxisPage />} />
          <Route path="/taxis/near-me" element={<TaxiNearMePage />} />
          <Route path="/taxi-near-me" element={<TaxiNearMePage />} />

          {/* Search */}
          <Route path="/search" element={<SearchResultsPage />} />

          {/* AI Trip Planner & Itinerary */}
          <Route path="/plan-trip" element={<TripPlannerPage />} />
          <Route path="/trip-planner" element={<TripPlannerPage />} />
          <Route path="/trip/preview" element={<TripDetailPage />} />
          <Route path="/trip/:id" element={<TripDetailPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />

          {/* User Portfolio & Dashboard */}
          <Route path="/dashboard" element={<TouristDashboardPage />} />
          <Route path="/my-trips" element={<TouristDashboardPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Business Owner Portal */}
          <Route path="/business/register" element={<BusinessRegisterPage />} />
          <Route path="/business/dashboard" element={<BusinessDashboardPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
