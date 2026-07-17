const fs = require('fs');
let content = fs.readFileSync('src/navigation/AppNavigator.tsx', 'utf8');

const impOld = `import { CreateSocietyScreen } from '@/screens/CreateSocietyScreen';`;
const impNew = `import { CreateSocietyScreen } from '@/screens/CreateSocietyScreen';
import { EditSocietyProfileScreen } from '@/screens/EditSocietyProfileScreen';`;
content = content.replace(impOld, impNew);

const stackOld = `<Stack.Screen name="CreateSociety" component={CreateSocietyScreen} />`;
const stackNew = `<Stack.Screen name="CreateSociety" component={CreateSocietyScreen} />
        <Stack.Screen name="EditSocietyProfile" component={EditSocietyProfileScreen} />`;
content = content.replace(stackOld, stackNew);

fs.writeFileSync('src/navigation/AppNavigator.tsx', content);
