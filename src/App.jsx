import React, { useState } from 'react';
import { TripProvider } from './context/TripContext';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { CalendarView } from './components/CalendarView';
import { AgendaView } from './components/AgendaView';
import { TravelDetailsView } from './components/TravelDetailsView';
import { ActivityDrawer } from './components/ActivityDrawer';
import { ActivityModal } from './components/Modals/ActivityModal';
import { TripDatesModal } from './components/Modals/TripDatesModal';
import { ShareModal } from './components/Modals/ShareModal';
import { TravelModal } from './components/Modals/TravelModal';
import { UserProfileModal } from './components/Modals/UserProfileModal';
import { NewTripModal } from './components/Modals/NewTripModal';
import { SyncModal } from './components/Modals/SyncModal';

function VacationApp() {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'agenda' | 'travel' | 'pool'
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isDatesModalOpen, setIsDatesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const [editingActivity, setEditingActivity] = useState(null);
  const [editingTravelDetail, setEditingTravelDetail] = useState(null);

  const handleOpenCreateActivity = () => {
    setEditingActivity(null);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (activity) => {
    setEditingActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleOpenCreateTravelDetail = () => {
    setEditingTravelDetail(null);
    setIsTravelModalOpen(true);
  };

  const handleOpenEditTravelDetail = (travelItem) => {
    setEditingTravelDetail(travelItem);
    setIsTravelModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-800 font-sans flex flex-col antialiased">
      
      {/* Top Header */}
      <Header
        onOpenActivityModal={handleOpenCreateActivity}
        onOpenDatesModal={() => setIsDatesModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Dynamic Workspace */}
        <div className="flex-1 w-full">
          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Calendar Grid (3 columns on desktop) */}
              <div className="lg:col-span-3 h-full">
                <CalendarView 
                  onEditActivity={handleOpenEditActivity}
                  onEditTravelDetail={handleOpenEditTravelDetail}
                />
              </div>
              
              {/* Unscheduled Ideas Pool (1 column on desktop) */}
              <div className="hidden lg:block lg:col-span-1 h-full">
                <ActivityDrawer 
                  onOpenActivityModal={handleOpenCreateActivity}
                  onEditActivity={handleOpenEditActivity}
                />
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-3">
                <AgendaView 
                  onEditActivity={handleOpenEditActivity}
                  onEditTravelDetail={handleOpenEditTravelDetail}
                />
              </div>
              <div className="hidden lg:block lg:col-span-1">
                <ActivityDrawer 
                  onOpenActivityModal={handleOpenCreateActivity}
                  onEditActivity={handleOpenEditActivity}
                />
              </div>
            </div>
          )}

          {activeTab === 'travel' && (
            <TravelDetailsView 
              onOpenTravelModal={handleOpenCreateTravelDetail}
              onEditTravelDetail={handleOpenEditTravelDetail}
            />
          )}

          {activeTab === 'pool' && (
            <div className="max-w-2xl mx-auto">
              <ActivityDrawer 
                onOpenActivityModal={handleOpenCreateActivity}
                onEditActivity={handleOpenEditActivity}
              />
            </div>
          )}
        </div>

      </main>

      {/* Modals */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        editingActivity={editingActivity}
      />

      <TravelModal
        isOpen={isTravelModalOpen}
        onClose={() => setIsTravelModalOpen(false)}
        editingTravelDetail={editingTravelDetail}
      />

      <TripDatesModal
        isOpen={isDatesModalOpen}
        onClose={() => setIsDatesModalOpen(false)}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <TripProvider>
      <VacationApp />
    </TripProvider>
  );
}
