export type PricingPlan = {
  id: 'premium';
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  ctaLabel: string;
  recommended?: boolean;
};

export const premiumPlan: PricingPlan = {
  id: 'premium',
  name: 'PREMIUM',
  priceLabel: 'Rp99.000 / project',
  description: 'Untuk workflow penuh tanpa batasan paywall.',
  features: ['Unlimited download HTML', 'Continue chat revision', 'Priority support'],
  ctaLabel: 'Upgrade Now',
  recommended: true,
};

export const pricingPlans: PricingPlan[] = [premiumPlan];
