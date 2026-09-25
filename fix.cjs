const fs = require('fs');
const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/Registrations.tsx',
  'src/pages/Events.tsx',
  'src/pages/Posts.tsx',
  'src/pages/Messages.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let data = fs.readFileSync(f, 'utf8');
    data = data.split('\\`').join('`');
    data = data.split('\\$').join('$');
    fs.writeFileSync(f, data);
    console.log(f + ' fixed');
  }
});
