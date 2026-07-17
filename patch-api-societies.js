const fs = require('fs');

const tpPath = 'src/services/api/societies.ts';
let tpContent = fs.readFileSync(tpPath, 'utf8');

tpContent = tpContent.replace(
  '  university: string;',
  `  university?: string;
  affiliatedUniversities?: string[];
  joinPolicy?: 'OPEN' | 'APPROVAL_REQUIRED' | 'VERIFIED_STUDENTS_ONLY';`
);

fs.writeFileSync(tpPath, tpContent, 'utf8');

const hookPath = 'src/hooks/useLocalAppState.tsx';
let hookContent = fs.readFileSync(hookPath, 'utf8');
hookContent = hookContent.replace('university: society.university,', 'university: society.university || "",\n      affiliatedUniversities: society.affiliatedUniversities,\n      joinPolicy: society.joinPolicy,');
fs.writeFileSync(hookPath, hookContent, 'utf8');

console.log('API and Hook patched!');
