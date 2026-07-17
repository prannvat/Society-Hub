const fs = require('fs');

const path = 'src/screens/SocietyProfileScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const badges = `
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {society.affiliatedUniversities && society.affiliatedUniversities.length > 1 && (
            <BadgeChip label="Joint Society" variant="filled" />
          )}
          {society.joinPolicy === 'VERIFIED_STUDENTS_ONLY' && (
             <BadgeChip label="Verified Students Only" variant="outlined" />
          )}
          {society.joinPolicy === 'OPEN' && (
             <BadgeChip label="Open to All" variant="outlined" />
          )}
          {society.joinPolicy === 'APPROVAL_REQUIRED' && (
             <BadgeChip label="Approval Required" variant="outlined" />
          )}
          <BadgeChip label="Announcements" variant="outlined" />
          <BadgeChip label="Member Directory" variant="outlined" />
          <BadgeChip label="Committee Polls" variant="outlined" />
        </View>
`;

content = content.replace(
  /<View style=\{\{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 \}\}>\s*<BadgeChip label=\"Announcements\" variant=\"outlined\" \/>\s*<BadgeChip label=\"Member Directory\" variant=\"outlined\" \/>\s*<BadgeChip label=\"Committee Polls\" variant=\"outlined\" \/>\s*<\/View>/g,
  badges
);

fs.writeFileSync(path, content, 'utf8');
console.log('Profile Badges patched!');
