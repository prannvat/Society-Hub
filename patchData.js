const fs = require('fs');
const content = `import { SocietyItem } from '@/types';

export const societies: SocietyItem[] = [
  {
    id: 'manc-sikh',
    name: 'Manchester Sikh Society',
    shortName: 'MancSS',
    university: 'University of Manchester',
    primaryColor: '#003DA5',
    secondaryColor: '#FFD700',
    description: 'The official Sikh Society for UoM. We host langar, kirtan, socials, and networking events for Sikh students across Manchester.',
    instagramLink: 'https://instagram.com/manchestersikhsoc',
    whatsappLink: 'https://chat.whatsapp.com/samplelink1',
    logoUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'manc-tech',
    name: 'Manchester Tech Society',
    shortName: 'MTech',
    university: 'University of Manchester',
    primaryColor: '#0F766E',
    secondaryColor: '#34D399',
    description: 'The largest technology community on campus! Hackathons, career fairs, tech talks, and project collaborations. We code to create.',
    instagramLink: 'https://instagram.com/mantechsoc',
    logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'manc-debate',
    name: 'Manchester Debate Union',
    shortName: 'MDU',
    university: 'University of Manchester',
    primaryColor: '#9A3412',
    secondaryColor: '#FDBA74',
    description: 'A platform to develop your public speaking and logical reasoning. Weekly debate sessions, socials, and national competitions.',
    whatsappLink: 'https://chat.whatsapp.com/samplelink2'
  }
];
`;
fs.writeFileSync('src/data/societies.ts', content);
