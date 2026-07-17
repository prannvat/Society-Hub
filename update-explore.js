const fs = require('fs');
const path = 'src/screens/ExploreSocietiesScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

content = content.replace(
  "const { allSocieties, mySocietyIds, joinSociety, events, announcements } = useLocalAppState();",
  "const { allSocieties, mySocietyIds, joinSociety, exploreEvents, loadExploreEvents, announcements } = useLocalAppState();\n\n  useEffect(() => {\n    loadExploreEvents();\n  }, [loadExploreEvents]);"
);

content = content.replace(
  "const filteredEvents = events.filter(e =>",
  "const filteredEvents = exploreEvents.filter(e =>"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Explore done!');
