const fs = require('fs');

const idxPath = 'src/types/index.ts';
let idxContent = fs.readFileSync(idxPath, 'utf8');

idxContent = idxContent.replace(
  '  university: string;',
  `  university?: string;
  affiliatedUniversities?: string[];
  joinPolicy?: 'OPEN' | 'APPROVAL_REQUIRED' | 'VERIFIED_STUDENTS_ONLY';`
);

fs.writeFileSync(idxPath, idxContent, 'utf8');

const apiTypesPath = 'src/services/api/types.ts';
let apiContent = fs.readFileSync(apiTypesPath, 'utf8');

apiContent = apiContent.replace(
  '  university: string;',
  `  university?: string;
  affiliatedUniversities?: string[];
  joinPolicy?: 'OPEN' | 'APPROVAL_REQUIRED' | 'VERIFIED_STUDENTS_ONLY';`
);

fs.writeFileSync(apiTypesPath, apiContent, 'utf8');
console.log('Types patched!');
