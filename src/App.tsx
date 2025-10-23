import React from 'react';
import { useGameTick } from '@/hooks/useGameTick';
import LeftNav from '@/components/layout/LeftNav';
import MobileNav from '@/components/layout/MobileNav';
import MainView from '@/components/layout/MainView';
import TopBar from '@/components/layout/TopBar';
import StickyTopbarShadow from '@/components/ui/StickyTopbarShadow';
import ToastViewport from '@/components/ui/ToastViewport';
import PlayerModal from '@/components/directory/PlayerModal';
import { useDirectoryStore } from '@/store/directoryStore';
import { useMessageStore } from '@/store/messageStore';
import { useAllianceStore } from '@/store/allianceStore';

/**
 * Die Hauptkomponente der Anwendung.
 * Sie initialisiert den Game-Tick und rendert das Hauptlayout,
 * das aus der linken Navigation, der oberen Leiste und der Hauptansicht besteht.
 */
const App: React.FC = () => {
  useGameTick();
  const openProfileId = useDirectoryStore((state) => state.openProfileId);
  const profiles = useDirectoryStore((state) => state.profiles);
  const closePlayerProfile = useDirectoryStore((state) => state.closePlayerProfile);
  const favoritePlanet = useDirectoryStore((state) => state.favoritePlanet);
  const ensureDirectRoom = useMessageStore((state) => state.ensureDirectRoom);
  const openRoom = useMessageStore((state) => state.openRoom);
  const addNote = useAllianceStore((state) => state.addNote);
  const profile = openProfileId ? profiles[openProfileId] : undefined;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://picsum.photos/seed/steampunkbg/1920/1080')",
          filter: 'blur(6px) brightness(0.35)',
        }}
        aria-hidden
      />
      <ToastViewport />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 bg-gradient-to-b from-black/85 to-black/30 backdrop-blur-lg">
          <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-4 px-4 pb-24 pt-4 sm:px-6 lg:pb-6">
            <TopBar />
            <StickyTopbarShadow />
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-[1320px] flex-1 gap-4 px-4 pb-24 pt-4 sm:px-6 lg:pb-6">
          <LeftNav />
          <main className="relative flex-1 overflow-visible rounded-2xl bg-black/35 px-4 pb-10 pt-6 shadow-2xl backdrop-blur-xl lg:px-8">
            <MainView />
          </main>
        </div>
      </div>
      <MobileNav />
      {profile && (
        <PlayerModal
          profile={profile}
          onClose={closePlayerProfile}
          onFavorite={(planetId) => favoritePlanet(planetId)}
          onMessage={(playerId) => {
            const roomId = ensureDirectRoom(playerId);
            openRoom(roomId);
            closePlayerProfile();
          }}
          onInvite={(playerId) => {
            addNote(`* Einladung an ${playerId} versendet`);
          }}
        />
      )}
    </div>
  );
};

export default App;
