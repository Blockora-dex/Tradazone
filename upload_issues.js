/* global process */
import fs from 'fs';
import { execSync } from 'child_process';

const content = fs.readFileSync('C:/Users/3D ROYAL/.gemini/antigravity/brain/409c47cd-1513-48b1-bd3c-1846cb687188/tradazone_audit_issues.md', 'utf-8');

const blocks = content.split('---').filter(b => b.trim().includes('### Issue #'));
console.log(`Found ${blocks.length} issues to upload.`);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeShellArg(arg) {
    if (process.platform === 'win32') {
        // Simple escape for powershell/cmd string interpolation
        return `"${arg.replace(/"/g, '""')}"`;
    }
    return `'${arg.replace(/'/g, "'\\''")}'`;
}

async function uploadIssues() {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        
        // Parsing using basic string matching
        const titleMatch = block.match(/### Issue #\d+: (.+)/);
        if (!titleMatch) continue;
        
        // Remove the Issue # header to keep the body clean
        let body = block.replace(/### Issue #\d+: (.+)\n+/, '').trim();
        
        let title = titleMatch[1].trim();
        // Determine labels from category
        const catMatch = block.match(/\*\*Category:\*\* (.+)/);
        let labels = [];
        if (catMatch) {
            labels.push(catMatch[1].trim());
        }
        
        const priorityMatch = block.match(/\*\*Priority:\*\* (.+)/);
        if (priorityMatch) {
            labels.push(`Priority: ${priorityMatch[1].trim()}`);
        }

        const areaMatch = block.match(/\*\*Affected Area:\*\* (.+)/);
        if (areaMatch) {
            labels.push(`Area: ${areaMatch[1].trim()}`);
        }

        const labelsArg = labels.map(l => `--label "${l}"`).join(' ');
        
        // Escape body for shell
        const safeTitle = escapeShellArg(title);
        // Writing body to a temporary file since passing long strings with newlines through exec Sync can break
        fs.writeFileSync('temp_issue_body.md', body);
        
        console.log(`Uploading issue ${i + 1}/${blocks.length}: ${title}`);
        
        try {
            // Using Github CLI to create issue
            const cmd = `gh issue create --title ${safeTitle} --body-file temp_issue_body.md ${labelsArg}`;
            execSync(cmd, { stdio: 'inherit' });
            
            // Wait 5 seconds to avoid rate limiting
            await sleep(5000);
        } catch (error) {
            console.error(`Failed to upload issue ${i + 1}.`, error.message);
            // Optionally sleep longer on failure
            await sleep(10000);
        }
    }
    
    if (fs.existsSync('temp_issue_body.md')) {
        fs.unlinkSync('temp_issue_body.md');
    }
    console.log("Finished uploading all issues.");
}

uploadIssues();
