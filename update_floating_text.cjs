const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.tsx');
let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // We want to replace <span className="hidden sm:inline"> with <span> inside floatingActions
  // A simple hack is just replacing all `<span className="hidden sm:inline">` that refer to Export, Edit, Delete

  content = content.replace(/<span className="hidden sm:inline">(Export|Edit|Delete)<\/span>/g, '<span>$1</span>');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changedCount++;
  }
}
console.log(`Updated ${changedCount} files.`);
