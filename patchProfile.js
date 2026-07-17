const fs = require('fs');
let content = fs.readFileSync('src/screens/ProfileScreen.tsx', 'utf8');

const s1 = `  const [profileName, setProfileName] = React.useState(profile.fullName);
  const [email, setEmail] = React.useState(profile.email);
  const [university, setUniversity] = React.useState(profile.university);
  const [course, setCourse] = React.useState(profile.course);
  const [year, setYear] = React.useState(profile.year);`;
const r1 = `  const [profileName, setProfileName] = React.useState(profile.fullName);
  const [email, setEmail] = React.useState(profile.email);
  const [university, setUniversity] = React.useState(profile.university);
  const [course, setCourse] = React.useState(profile.course);
  const [year, setYear] = React.useState(profile.year);
  const [bio, setBio] = React.useState(profile.bio || '');
  const [instagramLink, setInstagramLink] = React.useState(profile.instagramLink || '');
  const [linkedinLink, setLinkedinLink] = React.useState(profile.linkedinLink || '');
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatarUrl || '');`;
content = content.replace(s1, r1);

const s2 = `  const resetProfileDraft = () => {
    setProfileName(profile.fullName);
    setEmail(profile.email);
    setUniversity(profile.university);
    setCourse(profile.course);
    setYear(profile.year);
    setIsEditing(false);
  };`;
const r2 = `  const resetProfileDraft = () => {
    setProfileName(profile.fullName);
    setEmail(profile.email);
    setUniversity(profile.university);
    setCourse(profile.course);
    setYear(profile.year);
    setBio(profile.bio || '');
    setInstagramLink(profile.instagramLink || '');
    setLinkedinLink(profile.linkedinLink || '');
    setAvatarUrl(profile.avatarUrl || '');
    setIsEditing(false);
  };`;
content = content.replace(s2, r2);

const s3 = `  React.useEffect(() => {
    setProfileName(profile.fullName);
    setEmail(profile.email);
    setUniversity(profile.university);
    setCourse(profile.course);
    setYear(profile.year);
  }, [profile]);`;
const r3 = `  React.useEffect(() => {
    setProfileName(profile.fullName);
    setEmail(profile.email);
    setUniversity(profile.university);
    setCourse(profile.course);
    setYear(profile.year);
    setBio(profile.bio || '');
    setInstagramLink(profile.instagramLink || '');
    setLinkedinLink(profile.linkedinLink || '');
    setAvatarUrl(profile.avatarUrl || '');
  }, [profile]);`;
content = content.replace(s3, r3);

const s4 = `      await updateProfile({ ...profile, fullName: profileName, email, university, course, year });`;
const r4 = `      await updateProfile({ ...profile, fullName: profileName, email, university, course, year, bio, instagramLink, linkedinLink, avatarUrl });`;
content = content.replace(s4, r4);

fs.writeFileSync('src/screens/ProfileScreen.tsx', content);
