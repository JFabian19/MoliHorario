/**
 * Utility for sending custom event tracking data to Google Analytics (GA4)
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, params);
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};
