const fs = require('fs');
const path = 'src/screens/ExploreSocietiesScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const { allSocieties, mySocietyIds, joinSociety, exploreEvents, loadExploreEvents, announcements } = useLocalAppState();",
  "const { allSocieties, mySocietyIds, joinSociety, exploreEvents, loadExploreEvents, loadSocieties, announcements } = useLocalAppState();"
);

content = content.replace(
  "loadExploreEvents();",
  "loadSocieties().then(() => loadExploreEvents());"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Explore refresh done!');
