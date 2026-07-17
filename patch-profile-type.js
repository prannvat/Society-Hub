const fs = require('fs');

const hookPath = 'src/hooks/useLocalAppState.tsx';
let hookContent = fs.readFileSync(hookPath, 'utf8');

hookContent = hookContent.replace(
  'type LocalProfile = {',
  `type LocalProfile = {
  isStudent?: boolean;
  location?: string;
  isVerifiedStudent?: boolean;`
);

fs.writeFileSync(hookPath, hookContent, 'utf8');
console.log('patched LocalProfile type!');
