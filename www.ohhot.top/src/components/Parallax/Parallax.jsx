import React, { forwardRef } from 'react';
import { useParallax } from '../../hooks/useScrollAnimation';
import './Parallax.css';

/**
 * 视差滚动组件
 */
const Parallax = forwardRef(({
  children,
  speed = 0.5,
  direction = 'vertical',
  enabled = true,
  className = '',
  style = {},
  as: Component = 'div',
  ...props
}, ref) => {
  const { getTransformStyle } = useParallax({
    speed,
    direction,
    enabled
  });

  const parallaxStyle = getTransformStyle();
  const combinedStyle = { 
    ...style, 
    ...parallaxStyle,
    transition: 'transform 0.1s linear'
  };

  return (
    <Component
      ref={ref}
      className={`parallax ${className}`.trim()}
      style={combinedStyle}
      data-parallax-speed={speed}
      data-parallax-direction={direction}
      data-parallax-enabled={enabled}
      {...props}
    >
      {children}
    </Component>
  );
});

Parallax.displayName = 'Parallax';

export default Parallax;