/**
 * Centralized Framer Motion animation variants.
 * This ensures consistency across the app and allows for single-source updates.
 */

// Basic fade up
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// Fade up with staggered children
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// Subtle scale in for cards
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

/**
 * Returns variants modified for prefers-reduced-motion.
 * If reduced motion is true, all movements (y, scale) are stripped,
 * and duration is set to 0 to make transitions instantaneous.
 */
export function getMotionVariants(variants: any, shouldReduceMotion: boolean) {
  if (!shouldReduceMotion) return variants;

  const reducedVariants = JSON.parse(JSON.stringify(variants));
  
  if (reducedVariants.hidden) {
    if (reducedVariants.hidden.y !== undefined) reducedVariants.hidden.y = 0;
    if (reducedVariants.hidden.x !== undefined) reducedVariants.hidden.x = 0;
    if (reducedVariants.hidden.scale !== undefined) reducedVariants.hidden.scale = 1;
  }
  
  if (reducedVariants.visible) {
    if (reducedVariants.visible.y !== undefined) reducedVariants.visible.y = 0;
    if (reducedVariants.visible.x !== undefined) reducedVariants.visible.x = 0;
    if (reducedVariants.visible.scale !== undefined) reducedVariants.visible.scale = 1;
    
    if (reducedVariants.visible.transition) {
      reducedVariants.visible.transition.duration = 0;
      reducedVariants.visible.transition.staggerChildren = 0;
    }
  }

  return reducedVariants;
}
