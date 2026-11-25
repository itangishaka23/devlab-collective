export const SITE = {
  name: 'DevLab Collective',
  short: 'DevLab',
  tagline: 'Software Engineering Lab',
  email: 'devlabcollective@gmail.com',
  phone: '+250 793 573 566', // shown on the page
  phoneHref: '+250793573566', // used by tel: links
  address: 'Masaka, Kigali, Rwanda',
  mapQuery: 'Masaka, Kigali, Rwanda',
  year: 2026,
};

// Main navigation: `hash` links scroll to a section on the home page; `to` links open a page.
export const NAV_ITEMS = [
  { label: 'Home', hash: 'home' },
  { label: 'About', hash: 'about' },
  { label: 'Projects', hash: 'projects' },
  { label: 'Events', to: '/events' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', hash: 'contact' },
];

export const FOOTER_LINKS = [
  { label: 'About the Lab', hash: 'about' },
  { label: 'Projects', hash: 'projects' },
  { label: 'Hosted Projects', to: '/hosted' },
  { label: 'Events', to: '/events' },
  { label: 'Our Team', hash: 'team' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Join the Lab', to: '/join' },
  { label: 'Contact', hash: 'contact' },
];

export const FOOTER_TRACKS = [
  'Web Development',
  'DevOps & CI/CD',
  'Software Testing',
  'Mobile Apps',
  'Data & Analytics',
  'Open Source',
];
