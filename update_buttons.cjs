const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.tsx');

let changedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Remove Import Button entirely
    content = content.replace(/<DropdownMenuItem onClick=\{handleImportCSV\}>[\s\S]*?<\/DropdownMenuItem>/g, '');
    content = content.replace(/<Button[^>]*onClick=\{\(\) => navigate\([^)]+import[^)]+\)\}[^>]*>[\s\S]*?<\/Button>/g, '');
    content = content.replace(/<Button[^>]*>[\s\S]*?Upload[\s\S]*?Import[\s\S]*?<\/Button>/g, '');
    content = content.replace(/<Button[^>]*>[\s\S]*?import[\s\S]*?<\/Button>/gi, (match) => match.toLowerCase().includes('export') ? match : '');

    // 2. Remove Export from headerActions:
    content = content.replace(/<DropdownMenu>[\s\S]*?<DropdownMenuTrigger[\s\S]*?<Download[\s\S]*?Export[\s\S]*?<\/DropdownMenu>/gi, '');
    content = content.replace(/<Button[^>]*>[\s\S]*?<Download[\s\S]*?Export[\s\S]*?<\/Button>/gi, match => {
        // Keep if it is already in floatingActions
        return '';
    });

    // Since we deleted the Export button, we must add it to floatingActions.
    if (content.includes('handleExportCSV') || content.match(/handleExport/)) {
        const exportFuncMatch = content.match(/handleExport(?:CSV)?/);
        if (exportFuncMatch) {
            const exportFn = exportFuncMatch[0];

            const exportBtnCode = `
            <Button variant="ghost" size="sm" className="h-9 hover:bg-white/10 dark:hover:bg-muted text-white dark:text-foreground border border-white/10 dark:border-transparent rounded-full px-4" onClick={${exportFn}}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
            </Button>
         `;

            // Extract existing floatingActions
            if (content.match(/const floatingActions = \(\s*<>/)) {
                if (!content.includes('onClick={' + exportFn + '}')) {
                    content = content.replace(/(const floatingActions = \(\s*<>)/, `$1\n${exportBtnCode}`);
                }
            } else if (content.includes('floatingActions={')) {
                // Harder to inject automatically if there isn't a const floatingActions = (<>...
            }
        }
    }

    // Also remove empty headerActions fragments:
    content = content.replace(/const headerActions = \(\s*<>\s*(?:\{\/\*.*?\*\/\}\s*)*<\/>\s*\);/g, '');
    // Remove reference in ListingLayout props if headerActions is removed
    if (!content.match(/const headerActions =/)) {
        content = content.replace(/headerActions=\{headerActions\}/g, '');
    }

    // Fix Add button color via ListingLayout styling. Wait, I'll globally do that in ListingLayout component directly!
    // No need to touch Add buttons in individual lists.

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        changedCount++;
    }
}
console.log(`Updated ${changedCount} files.`);
