const fs = require('fs');
let content = fs.readFileSync('src/hooks/useLocalAppState.tsx', 'utf8');

const oldProfileType = `type LocalProfile = {
  fullName: string;
  email: string;
  university: string;
  course: string;
  year: string;
  bio: string;
};`;

const newProfileType = `type LocalProfile = {
  fullName: string;
  email: string;
  university: string;
  course: string;
  year: string;
  bio: string;
  instagramLink?: string;
  linkedinLink?: string;
  websiteLink?: string;
  avatarUrl?: string;
};`;

const contextValueOld = `  createSociety: (society: Omit<SocietyItem, 'id'>) => Promise<string>;`;
const contextValueNew = `  createSociety: (society: Omit<SocietyItem, 'id'>) => Promise<string>;
  updateSocietyProfile: (societyId: string, updates: Partial<SocietyItem>) => Promise<void>;`;

content = content.replace(oldProfileType, newProfileType);
content = content.replace(contextValueOld, contextValueNew);

const oldJoinSociety = `  const joinSociety = async (societyId: string) => {`;
const newUpdateSociety = `  const updateSocietyProfile = async (societyId: string, updates: Partial<SocietyItem>) => {
    setAllSocieties((prev) =>
      prev.map((soc) => (soc.id === societyId ? { ...soc, ...updates } : soc))
    );
  };

  const joinSociety = async (societyId: string) => {`;
content = content.replace(oldJoinSociety, newUpdateSociety);

const oldProviderValue = `      createSociety,
      joinSociety,`;
const newProviderValue = `      createSociety,
      updateSocietyProfile,
      joinSociety,`;
content = content.replace(oldProviderValue, newProviderValue);

fs.writeFileSync('src/hooks/useLocalAppState.tsx', content);
