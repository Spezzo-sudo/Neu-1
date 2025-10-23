import React, { CSSProperties, useMemo, useState, useCallback, useEffect } from 'react';

interface VirtualListProps {
  rowCount: number;
  rowHeight: number;
  height: number;
  overscan?: number;
  renderRow: (index: number) => React.ReactNode;
  scrollToIndex?: number | null;
}

/**
 * Lightweight virtualization helper that only renders rows inside the visible viewport.
 */
const VirtualList: React.FC<VirtualListProps> = ({
  rowCount,
  rowHeight,
  height,
  overscan = 6,
  renderRow,
  scrollToIndex = null,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [startIndex, endIndex, offset] = useMemo(() => {
    const visibleStart = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleEnd = Math.min(rowCount, Math.ceil((scrollTop + height) / rowHeight) + overscan);
    return [visibleStart, visibleEnd, visibleStart * rowHeight];
  }, [height, overscan, rowCount, rowHeight, scrollTop]);

  const handleScroll = useCallback<React.UIEventHandler<HTMLDivElement>>((event) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (scrollToIndex === null || !containerRef.current) {
      return;
    }
    containerRef.current.scrollTo({ top: scrollToIndex * rowHeight, behavior: 'smooth' });
  }, [rowHeight, scrollToIndex]);

  const containerStyle: CSSProperties = {
    height,
    overflowY: 'auto',
    position: 'relative',
  };

  const innerStyle: CSSProperties = {
    height: rowCount * rowHeight,
    position: 'relative',
  };

  return (
    <div ref={containerRef} style={containerStyle} aria-live="polite" onScroll={handleScroll}>
      <div style={innerStyle}>
        <div style={{ position: 'absolute', top: offset, left: 0, right: 0 }}>
          {Array.from({ length: endIndex - startIndex }, (_, offsetIndex) => {
            const rowIndex = startIndex + offsetIndex;
            return (
              <div key={rowIndex} style={{ height: rowHeight }}>
                {renderRow(rowIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(VirtualList);
