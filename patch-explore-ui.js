const fs = require('fs');

const path = 'src/screens/ExploreSocietiesScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const { allSocieties, mySocietyIds, joinSociety, exploreEvents, loadExploreEvents, loadSocieties, announcements } = useLocalAppState();',
  'const { allSocieties, mySocietyIds, joinSociety, exploreEvents, loadExploreEvents, loadSocieties, announcements, profile } = useLocalAppState();'
);

const sortLogic = `
  const discoverableSocieties = [...allSocieties]
    .filter(s => !mySocietyIds.includes(s.id))
    .sort((a, b) => {
      const u = profile.university?.toLowerCase() || '';
      const aUnis = [a.university?.toLowerCase(), ...(a.affiliatedUniversities || []).map(x => x.toLowerCase())].filter(Boolean);
      const bUnis = [b.university?.toLowerCase(), ...(b.affiliatedUniversities || []).map(x => x.toLowerCase())].filter(Boolean);
      
      const aMatchesUni = u && aUnis.includes(u);
      const bMatchesUni = u && bUnis.includes(u);
      
      if (aMatchesUni && !bMatchesUni) return -1;
      if (!aMatchesUni && bMatchesUni) return 1;
      
      return 0; // fallback to default order
    });
`;

content = content.replace(
  '  const discoverableSocieties = allSocieties.filter(s => !mySocietyIds.includes(s.id));',
  sortLogic
);

fs.writeFileSync(path, content, 'utf8');
console.log('Explore Societies UI sorting patched!');
