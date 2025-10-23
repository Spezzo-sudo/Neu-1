import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { View } from '@/types';

export interface NavLinkProps {
  view: View;
  label: string;
  icon: string;
}

/**
 * Navigationsdefinition, die sowohl von der Desktop-Sidebar als auch der mobilen Navigation verwendet wird.
 */
export const NAV_LINKS: NavLinkProps[] = [
  { view: View.Uebersicht, label: 'Übersicht', icon: '🪐' },
  { view: View.Gebaeude, label: 'Gebäude', icon: '🏭' },
  { view: View.Forschung, label: 'Forschung', icon: '🔬' },
  { view: View.Werft, label: 'Werft', icon: '🚀' },
  { view: View.Galaxie, label: 'Galaxie', icon: '🌌' },
  { view: View.Bande, label: 'Bande', icon: '🤝' },
];

/**
 * Desktop-Navigationsleiste auf der linken Seite. Auf kleineren Screens wird sie ausgeblendet
 * und durch die mobile Navigation ersetzt.
 */
const LeftNav: React.FC = () => {
  const activeView = useGameStore((state) => state.activeView);
  const setView = useGameStore((state) => state.setView);

  return (
    <nav className="hidden h-full w-64 shrink-0 flex-col gap-6 rounded-xl bg-black/30 p-5 shadow-lg backdrop-blur-xl lg:flex">
      <div className="text-center">
        <h1 className="text-[clamp(1.5rem,2vw+1rem,2.6rem)] font-cinzel font-bold text-yellow-400">CHRONOS</h1>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-600">Industries</p>
      </div>
      <ul className="space-y-2">
        {NAV_LINKS.map(({ view, label, icon }) => (
          <li key={view}>
            <button
              type="button"
              onClick={() => setView(view)}
              className={`w-full rounded-md px-4 py-3 text-left font-cinzel transition-colors duration-200 ${
                activeView === view
                  ? 'bg-yellow-800/40 text-yellow-200 shadow-inner'
                  : 'text-gray-300 hover:bg-yellow-800/10 hover:text-white'
              }`}
            >
              <span className="mr-3 text-xl" aria-hidden>
                {icon}
              </span>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto text-center text-xs text-gray-500">
        <p>Version 0.1.0-mvp</p>
      </div>
    </nav>
  );
};

export default LeftNav;
