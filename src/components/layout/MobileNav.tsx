import React from 'react';
import { NAV_LINKS } from '@/components/layout/LeftNav';
import { useGameStore } from '@/store/gameStore';

/**
 * Bottom navigation bar for small screens that mirrors the desktop navigation items.
 */
const MobileNav: React.FC = () => {
  const activeView = useGameStore((state) => state.activeView);
  const setView = useGameStore((state) => state.setView);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-black/80 py-2 shadow-2xl backdrop-blur-xl lg:hidden">
      <ul className="flex w-full max-w-md items-center justify-between px-4">
        {NAV_LINKS.map(({ view, label, icon }) => {
          const isActive = activeView === view;
          return (
            <li key={view}>
              <button
                type="button"
                onClick={() => setView(view)}
                className={`relative flex flex-col items-center rounded-md px-3 py-1 text-xs font-cinzel transition-colors ${
                  isActive ? 'text-yellow-200' : 'text-gray-300 hover:text-white'
                }`}
                aria-current={isActive}
              >
                <span className="text-lg" aria-hidden>
                  {icon}
                </span>
                <span>{label}</span>
                <span
                  className={`absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-yellow-400 transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileNav;
