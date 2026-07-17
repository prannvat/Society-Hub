const fs = require('fs');
const path = 'src/screens/SocietyProfileScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "fetchSocietyProfile(route.params!.societyId).catch(() => null),",
  "fetchSocietyProfile(route.params!.societyId!).catch(() => null),"
);
content = content.replace(
  "fetchEvents(route.params!.societyId).catch(() => [])",
  "fetchEvents(route.params!.societyId!).catch(() => [])"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed TS 2');
