export type PricingPlan = {
  id: 'free' | 'premium';
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  ctaLabel: string;
  recommended?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'FREE',
    priceLabel: 'Rp0',
    description: 'Untuk mencoba alur generate pertama.',
    features: ['1 project', 'Generate landing page'],
    ctaLabel: 'Current Plan',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    priceLabel: 'Rp99.000 / project',
    description: 'Untuk workflow penuh tanpa batasan paywall.',
    features: ['Unlimited download HTML', 'Continue chat revision', 'Priority support'],
    ctaLabel: 'Choose Plan',
    recommended: true,
  },
];
