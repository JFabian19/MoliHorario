/**
 * Utility for sending custom event tracking data to Google Analytics (GA4) & dataLayer
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  try {
    if (typeof window !== 'undefined') {
      // Ensure dataLayer array exists
      (window as any).dataLayer = (window as any).dataLayer || [];

      // Ensure gtag helper function exists
      if (typeof (window as any).gtag !== 'function') {
        (window as any).gtag = function () {
          (window as any).dataLayer.push(arguments);
        };
      }

      // 1. Dispatch event to GA4 via gtag
      (window as any).gtag('event', eventName, params);

      // 2. Dispatch event directly to dataLayer for GTM & GA4 listener triggers
      (window as any).dataLayer.push({
        event: eventName,
        ...params
      });

      if ((import.meta as any)?.env?.DEV) {
        console.log(`[Analytics Event Tracked]: ${eventName}`, params);
      }
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};
