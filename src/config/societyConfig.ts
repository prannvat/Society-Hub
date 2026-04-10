export const societyConfig = {
  name: 'Manchester Sikh Society',
  shortName: 'MancSS',
  university: 'University of Manchester',
  description: 'Serving the Sikh community at UoM',
  founded: '2005',
  theme: {
    primary: '#000000',
    secondary: '#737373',
    accent: '#000000',
    background: '#F4F4F5',
    surface: '#FFFFFF',
    textPrimary: '#18181B',
    textSecondary: '#71717A',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    darkBackground: '#09090B',
    darkSurface: '#18181B'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    headingWeight: '700',
    bodyWeight: '400'
  },
  modules: {
    events: true,
    announcements: true,
    memberDirectory: true,
    polls: true,
    donations: true,
    religiousContent: true,
    sportsFixtures: false,
    academicResources: false,
    volunteerTracker: false,
    merchandise: false
  },
  social: {
    instagram: '@mancsikhs',
    facebook: 'manchestersikhs',
    linktree: 'mancsikhs',
    email: 'committee@mancsikhs.com'
  },
  settings: {
    membershipFee: 5.0,
    currency: 'GBP',
    requireUniversityEmail: true,
    allowGuestRSVP: false,
    maxMembersVisible: true
  }
};
