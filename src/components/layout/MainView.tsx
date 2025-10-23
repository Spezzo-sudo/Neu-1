import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { View } from '@/types';
import OverviewView from '@/components/views/OverviewView';
import BuildingsView from '@/components/views/BuildingsView';
import ResearchView from '@/components/views/ResearchView';
import GalaxyView from '@/components/views/GalaxyView';
import WerftView from '@/components/views/WerftView';
import AllianceView from '@/components/views/AllianceView';

/**
 * Routet den aktiven View-Zustand auf die jeweilige Bildschirmkomponente.
 */
const MainView: React.FC = () => {
  const activeView = useGameStore((state) => state.activeView);

  switch (activeView) {
    case View.Uebersicht:
      return <OverviewView />;
    case View.Gebaeude:
      return <BuildingsView />;
    case View.Forschung:
      return <ResearchView />;
    case View.Werft:
      return <WerftView />;
    case View.Galaxie:
      return <GalaxyView />;
    case View.Bande:
      return <AllianceView />;
    default:
      return <OverviewView />;
  }
};

export default MainView;
