// 导出所有动画组件
export { default as ScrollAnimation } from './ScrollAnimation/ScrollAnimation';
export { default as Parallax } from './Parallax/Parallax';
export { default as ScrollProgress } from './ScrollProgress/ScrollProgress';
export { default as ScrollToTop } from './ScrollToTop/ScrollToTop';
export { default as LazyImage } from './LazyImage/LazyImage';

// 导出动画配置
export { ANIMATION_TYPES, ANIMATION_PRESETS, animationUtils } from '../config/animations';

// 导出动画 Hooks
export {
  useScrollAnimation,
  useScrollProgress,
  useParallax,
  useScrollTo,
  useScrollThrottle
} from '../hooks/useScrollAnimation';