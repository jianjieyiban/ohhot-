import React from 'react';
import { useScrollProgress } from '../../hooks/useScrollAnimation';
import './ScrollProgress.css';

/**
 * 滚动进度指示器组件
 */
const ScrollProgress = ({
  position = 'top',
  height = '4px',
  color = '#007bff',
  gradient = false,
  showPercentage = false,
  className = '',
  style = {},
  target = null,
  offsetStart = 0,
  offsetEnd = 0
}) => {
  const { progress, percentage, isScrolling } = useScrollProgress({
    target,
    offsetStart,
    offsetEnd
  });

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: 0, left: 0, right: 0 };
      case 'bottom':
        return { bottom: 0, left: 0, right: 0 };
      case 'left':
        return { top: 0, left: 0, bottom: 0, width: height };
      case 'right':
        return { top: 0, right: 0, bottom: 0, width: height };
      default:
        return { top: 0, left: 0, right: 0 };
    }
  };

  const getProgressStyle = () => {
    const baseStyle = {
      height: ['left', 'right'].includes(position) ? '100%' : height,
      width: ['left', 'right'].includes(position) ? height : `${progress * 100}%`,
      backgroundColor: color
    };

    if (gradient) {
      baseStyle.background = `linear-gradient(90deg, ${color} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`;
    }

    return baseStyle;
  };

  const positionStyle = getPositionStyle();
  const progressStyle = getProgressStyle();

  return (
    <div
      className={`scroll-progress ${isScrolling ? 'scrolling' : ''} ${className}`.trim()}
      style={{
        position: 'fixed',
        zIndex: 9999,
        ...positionStyle,
        ...style
      }}
      data-position={position}
      data-progress={progress}
      data-percentage={percentage}
    >
      <div
        className="scroll-progress-bar"
        style={progressStyle}
      />
      
      {showPercentage && (
        <div
          className="scroll-progress-percentage"
          style={{
            position: 'absolute',
            ...(position === 'top' ? { top: '8px', right: '10px' } : {}),
            ...(position === 'bottom' ? { bottom: '8px', right: '10px' } : {}),
            ...(position === 'left' ? { top: '10px', left: '8px' } : {}),
            ...(position === 'right' ? { top: '10px', right: '8px' } : {})
          }}
        >
          {percentage}%
        </div>
      )}
    </div>
  );
};

export default ScrollProgress;