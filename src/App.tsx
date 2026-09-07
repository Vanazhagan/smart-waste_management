import React, { useState } from 'react';
import { StoreProvider, useStore } from './services/store';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DemoWalkthroughOverlay } from './components/common/DemoWalkthroughOverlay';

// Citizen Views
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { MyComplaintsList } from './components/citizen/MyComplaintsList';
import { NearbySmartBinsView } from './components/citizen/NearbySmartBinsView';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ComplaintsManagement } from './components/admin/ComplaintsManagement';
import { WorkerManagement } from './components/admin/WorkerManagement';
import { SmartDustbinsDashboard } from './components/admin/SmartDustbinsDashboard';
import { RouteOptimizationView } from './components/admin/RouteOptimizationView';
import { GarbageMapView } from './components/admin/GarbageMapView';
import { HotspotDetectionView } from './components/admin/HotspotDetectionView';
import { AreaWardManagement } from './components/admin/AreaWardManagement';
import { MonthlyAnalyticsView } from './components/admin/MonthlyAnalyticsView';
import { GovernmentReportView } from './components/admin/GovernmentReportView';
import { PredictiveAnalyticsView } from './components/admin/PredictiveAnalyticsView';
import { SalaryBonusView } from './components/admin/SalaryBonusView';
import { VehicleManagementView } from './components/admin/VehicleManagementView';
import { ExpenseManagementView } from './components/admin/ExpenseManagementView';
import { EnvironmentalAnalyticsView } from './components/admin/EnvironmentalAnalyticsView';
import { AIInsightsView } from './components/admin/AIInsightsView';

const MainContent: React.FC = () => {
  const { activeView, userRole } = useStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return userRole === 'CITIZEN' ? <CitizenDashboard /> : <AdminDashboard />;
      case 'myComplaints':
        return <MyComplaintsList />;
      case 'nearbyBins':
        return <NearbySmartBinsView />;
      case 'complaints':
        return <ComplaintsManagement />;
      case 'workers':
        return <WorkerManagement />;
      case 'smartDustbins':
        return <SmartDustbinsDashboard />;
      case 'routeOptimization':
        return <RouteOptimizationView />;
      case 'garbageMap':
        return <GarbageMapView />;
      case 'hotspots':
        return <HotspotDetectionView />;
      case 'areaPerformance':
        return <AreaWardManagement />;
      case 'monthlyAnalytics':
        return <MonthlyAnalyticsView />;
      case 'monthlyReports':
        return <GovernmentReportView />;
      case 'predictiveEngine':
        return <PredictiveAnalyticsView />;
      case 'salaryBonuses':
        return <SalaryBonusView />;
      case 'vehicleFleet':
        return <VehicleManagementView />;
      case 'expenses':
        return <ExpenseManagementView />;
      case 'environmental':
        return <EnvironmentalAnalyticsView />;
      case 'aiInsights':
        return <AIInsightsView />;
      default:
        return userRole === 'CITIZEN' ? <CitizenDashboard /> : <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Universal App Header */}
      <Header onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Main Body with Sidebar Navigation */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Interactive Tour Overlay */}
      <DemoWalkthroughOverlay />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
