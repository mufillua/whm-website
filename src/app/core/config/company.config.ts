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
  /** Live domain — used for canonical URLs, the sitemap, robots.txt, social tags and structured data. */
  // The host serves the site on www (westernhardwaremart.com redirects there), and Google already picked www as the
  // canonical — every canonical tag, sitemap URL and structured-data URL must use this exact address.
  siteUrl: 'https://www.westernhardwaremart.com',
  /** Social media profiles shown in the footer. */
  social: [
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/company/westernhardwaremart/',
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/westernhardwaremart/',
    },
  ] as { label: string; url: string }[],
} as const;
