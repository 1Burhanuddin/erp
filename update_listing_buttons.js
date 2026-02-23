const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.tsx');

let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Find Export button and its action
  // Most Export buttons are in headerActions. We want to remove Import entirely and move Export to floatingActions.

  // Since it's unstructured, regex might be tricky. Let's see if we can do something simpler.
  // Can we just remove the headerActions entirely if it only contains Export/Import?
  // Most files have: `const headerActions = ( ... )` and pass it to `<ListingLayout ... headerActions={headerActions}`
  
  // Or I can just write an AST parser... Or use regex to remove `import` and `export` blocks.
  
  // 1. Remove Import Button:
  // <Button ...><Upload .../> Import</Button>
  content = content.replace(/<DropdownMenuItem onClick=\{handleImportCSV\}>[\s\S]*?<\/DropdownMenuItem>/g, '');
  content = content.replace(/<Button[^>]*onClick=\{\(\) => navigate\([^)]+import[^)]+\)\}[^>]*>[\s\S]*?<\/Button>/g, '');
  content = content.replace(/<Button[^>]*>[\s\S]*?Upload[\s\S]*?Import[\s\S]*?<\/Button>/g, '');
  content = content.replace(/<Button[^>]*>[\s\S]*?import[\s\S]*?<\/Button>/gi, (match) => match.toLowerCase().includes('export') ? match : '');
  
  // 2. Remove Export from headerActions:
  // Most are in a <DropdownMenu> with Export as CSV inside const headerActions.
  content = content.replace(/<DropdownMenu>[\s\S]*?<DropdownMenuTrigger[\s\S]*?<Download[\s\S]*?Export[\s\S]*?<\/DropdownMenu>/gi, '');
  content = content.replace(/<Button[^>]*>[\s\S]*?<Download[\s\S]*?Export[\s\S]*?<\/Button>/gi, match => {
      // If it's already in floatingActions, it usually has size="sm" or similar, but the grep is coarse.
      return '';
  });

  // Since we deleted the Export button, we must add it to floatingActions.
  // Wait, if it has `handleExportCSV` or `exportExcel`, we should add it.
  if (content.includes('handleExportCSV') || content.includes('handleExport')) {
     const exportFuncMatch = content.match(/handleExport(?:CSV)?/);
     if (exportFuncMatch) {
         const exportFn = exportFuncMatch[0];
         
         const exportBtnCode = `
            <Button variant="ghost" size="sm" className="h-9 hover:bg-white/10 dark:hover:bg-muted text-white dark:text-foreground border border-white/10 dark:border-transparent rounded-full px-4" onClick={${exportFn}}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
            </Button>
         `;

         // If floatingActions exists:
         if (content.includes('const floatingActions = (')) {
             if (!content.includes('onClick={' + exportFn + '}')) {
                 content = content.replace(/const floatingActions = \(\s*<>/, `const floatingActions = (\n        <>\n${exportBtnCode}`);
             }
         } else {
            // Need to create floatingActions and inject before return
            // This is harder. Let's just create it if handleExportCSV exists.
         }
     }
  }

  // Also remove empty headerActions:
  // const headerActions = (\n        <>\n        </>\n    );
  // or similar.
  content = content.replace(/const headerActions = \(\s*<>\s*<\/>\s*\);/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changedCount++;
  }
}
console.log(`Updated ${changedCount} files.`);
