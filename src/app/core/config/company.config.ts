export const COMPANY = {
  name: 'Western Hardware Mart',
  tagline: 'Your Trusted Hydraulic Solutions Partner',
  email: 'whm027@gmail.com',
  phoneDisplay: '+91 98746 36636',
  phoneE164: '+919874636636',
  whatsappNumber: '919874636636',
  partners: ['M. Maimoon', 'H. Lokhandwala'],
  address: {
    lines: ['Shop No. 8, Basundra Tower', '22, Netaji Subhas Road', 'Kolkata - 700001', 'West Bengal, India'],
    city: 'Kolkata',
    region: 'West Bengal',
    postalCode: '700001',
    country: 'IN',
  },
  hours: [
    { days: 'Monday – Friday', time: '10:00 AM – 6:00 PM' },
    { days: 'Saturday', time: '10:00 AM – 5:00 PM' },
    { days: 'Sunday', time: 'Closed' },
  ],
  /** Map search for the street address — no invented coordinates. */
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Basundra Tower, 22 Netaji Subhas Road, Kolkata 700001'),
  /** Placeholder until the live domain is confirmed. */
  siteUrl: 'https://westernhardwaremart.com',
  /** Add profile URLs here to show them in the footer. */
  social: [] as { label: string; url: string }[],
} as const;
