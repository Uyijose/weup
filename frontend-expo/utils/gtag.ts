export const GA_MEASUREMENT_ID = "G-2Z2P3BC1JD";

type AnalyticsEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
};

export const pageview = (url: string): void => {
  console.log("[ANALYTICS PAGEVIEW]", {
    measurementId: GA_MEASUREMENT_ID,
    url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: AnalyticsEvent): void => {
  console.log("[ANALYTICS EVENT]", {
    measurementId: GA_MEASUREMENT_ID,
    action,
    category,
    label,
    value,
  });
};