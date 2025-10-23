import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import HexMap from '@/components/galaxy/HexMap';
import { Alliance, GalaxySystem, Player } from '@/types';

describe('HexMap', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  const unmount = () => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container?.isConnected) {
      container.remove();
    }
    root = null;
    container = null;
  };

  afterEach(() => {
    unmount();
  });

  const renderComponent = (props: Partial<React.ComponentProps<typeof HexMap>> = {}) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const defaultSystem: GalaxySystem = {
      id: 'sys-1',
      displayName: 'Testsystem',
      sectorQ: 0,
      sectorR: 0,
      sysIndex: 0,
      axial: { q: 0, r: 0 },
      planets: [],
    };
    const defaultProps: React.ComponentProps<typeof HexMap> = {
      systems: [defaultSystem],
      players: [] as Player[],
      alliances: [] as Alliance[],
      selectedSystemId: null,
      onSelect: (() => {
        /* noop */
      }) as (system: GalaxySystem) => void,
      zoom: 1,
      onZoomChange: () => {
        /* noop */
      },
    };

    act(() => {
      root.render(<HexMap {...defaultProps} {...props} />);
    });

    return container;
  };

  it('renders a placeholder svg when no systems are visible', () => {
    const target = renderComponent({ systems: [] });
    if (!target) {
      throw new Error('HexMap did not render into a container.');
    }
    const svg = target.querySelector('svg');
    expect(svg).not.toBeNull();
    const viewBox = svg!.getAttribute('viewBox');
    expect(viewBox).toBeTruthy();
    expect(viewBox).not.toContain('NaN');
    expect(viewBox).not.toContain('Infinity');
    expect(target.textContent).toContain('Keine Systeme sichtbar');
  });
});
