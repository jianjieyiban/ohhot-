import React, { forwardRef } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import './ScrollAnimation.css';

/**
 * 滚动动画组件
 */
const ScrollAnimation = forwardRef(({
  children,
  animationType = 'fadeIn',
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  delay = 0,
  stagger = 0,
  className = '',
  style = {},
  as: Component = 'div',
  index = 0,
  ...props
}, ref) => {
  const {
    ref: animationRef,
    isVisible,
    getAnimationStyle,
    animationClass
  } = useScrollAnimation({
    animationType,
    threshold,
    rootMargin,
    once,
    delay,
    stagger
  });

  // 合并 ref
  const combinedRef = (node) => {
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
    animationRef.current = node;
  };

  const animationStyle = getAnimationStyle(index);
  const combinedStyle = { ...style, ...animationStyle };

  return (
    <Component
      ref={combinedRef}
      className={`scroll-animation ${animationClass} ${className}`.trim()}
      style={combinedStyle}
      data-animation-type={animationType}
      data-animation-visible={isVisible}
      {...props}
    >
      {children}
    </Component>
  );
});

ScrollAnimation.displayName = 'ScrollAnimation';

export default ScrollAnimation;