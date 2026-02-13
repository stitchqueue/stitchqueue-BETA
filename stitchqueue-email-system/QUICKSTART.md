# 🚀 QUICK START - Install from ZIP

## Step 1: Download & Extract

1. Download: `stitchqueue-email-system.tar.gz`
2. Save it to your Downloads folder

## Step 2: Upload to Codespaces

### Option A: Drag & Drop (Easiest)
1. Open VS Code in Codespaces
2. In the Explorer sidebar, navigate to: `/workspaces/StitchQueue-BETA`
3. Drag the downloaded file into the Explorer
4. Wait for upload to complete

### Option B: Terminal Upload
1. In Codespaces, open Terminal
2. Run:
```bash
cd /workspaces/StitchQueue-BETA
```
3. Use the upload feature in VS Code (File > Upload Files)

## Step 3: Extract the ZIP

```bash
cd /workspaces/StitchQueue-BETA
tar -xzf stitchqueue-email-system.tar.gz
ls stitchqueue-email-system/
```

**Expected output:** Should show folders: `email-library`, `api-routes`, `approval-page`, `docs`, and `install.sh`

## Step 4: Run the Installation Script

```bash
cd /workspaces/StitchQueue-BETA
bash stitchqueue-email-system/install.sh
```

The script will:
- ✅ Create all needed directories
- ✅ Copy all files to correct locations
- ✅ Check environment variables
- ✅ Backup your types file
- ✅ Show you what's next

## Step 5: Update TypeScript Types (Manual)

Open this file in VS Code:
```
app/types/index.ts
```

Find the `Project` interface and add these three fields:

```typescript
export interface Project {
  // ... existing fields ...
  
  // NEW: Add these three fields
  estimateEmailSent?: {
    timestamp: string;
    recipientEmail: string;
    resendId?: string;
  };
  
  invoiceEmailSent?: {
    timestamp: string;
    recipientEmail: string;
    resendId?: string;
  };
  
  estimateApproval?: {
    status: 'approve' | 'approve_with_changes' | 'decline';
    comment?: string;
    timestamp: string;
  };
  
  // ... rest of existing fields ...
}
```

The complete example is in: `stitchqueue-email-system/docs/TYPE_UPDATES.ts`

## Step 6: Test the Build

```bash
pnpm install
pnpm run build
```

**Expected output:** Build completes with no errors

If you see errors, paste them to me and I'll help!

## Step 7: Commit Changes

```bash
git add app/lib/email app/api/send-estimate app/api/send-invoice app/api/approve-estimate "app/approve/[projectId]" app/types/index.ts .env.local

git commit -m "feat: add email system for estimates and invoices

- Add email templates with brand colors
- Add send-estimate and send-invoice API routes
- Add client approval system for estimates
- Add public approval page at /approve/[projectId]
- Add email tracking fields to Project type"

git push origin dev
```

## Step 8: Verify Everything Worked

```bash
# Check all files are in place
ls app/lib/email/
ls app/api/send-estimate/
ls app/api/send-invoice/
ls app/api/approve-estimate/
ls "app/approve/[projectId]/"

# Start dev server
pnpm run dev
```

Visit: `http://localhost:3000/approve/test-123?response=approve`

You should see the approval form!

## 🎉 You're Done!

The email system is installed. Next step: I'll create the UI buttons for the project detail page.

## 📚 Need Help?

Read the docs in the `stitchqueue-email-system/docs/` folder:
- `README.md` - Overview
- `INSTALLATION.md` - Detailed setup
- `ARCHITECTURE.md` - How it works
- `TYPE_UPDATES.ts` - Type changes needed

## ⚠️ Troubleshooting

**"No such file or directory" when extracting:**
- Make sure you're in `/workspaces/StitchQueue-BETA`
- Check the filename matches exactly

**"Permission denied" running install.sh:**
- Run: `chmod +x stitchqueue-email-system/install.sh`
- Then try again

**Build fails with TypeScript errors:**
- Double-check you added all three fields to `Project` interface
- Make sure syntax is correct (commas, brackets, semicolons)
- Compare with the example in `TYPE_UPDATES.ts`

**Module not found errors:**
- Run: `pnpm install`
- This installs any missing dependencies
