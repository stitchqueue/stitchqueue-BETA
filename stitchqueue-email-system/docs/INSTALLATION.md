# EMAIL SYSTEM INSTALLATION GUIDE

## 📦 What's Included

This email system adds the ability for PRO tier quilters to send estimates and invoices to clients via email, with client approval tracking for estimates.

### New Files Created:
```
app/
├── lib/email/
│   ├── shared-styles.ts          (Brand colors & reusable email styles)
│   ├── estimate-template.ts      (HTML email for estimates)
│   ├── invoice-template.ts       (HTML email for invoices)
│   ├── pdf-generator.ts          (PDF attachment generation)
│   └── index.ts                  (Barrel export)
├── api/
│   ├── send-estimate/route.ts    (Send estimate email API)
│   ├── send-invoice/route.ts     (Send invoice email API)
│   └── approve-estimate/route.ts (Handle client approvals API)
└── approve/[projectId]/
    └── page.tsx                  (Public approval page for clients)
```

### Files to Update:
```
app/types/index.ts                (Add email tracking types)
app/project/[id]/page.tsx         (Add send email buttons) - NOT INCLUDED YET
```

---

## 🛠️ Installation Steps

### Step 1: Navigate to Your Project
```bash
cd /workspaces/StitchQueue-BETA
```

### Step 2: Create New Directories
```bash
# Create email library directory
mkdir -p app/lib/email

# Create API directories
mkdir -p app/api/send-estimate
mkdir -p app/api/send-invoice
mkdir -p app/api/approve-estimate

# Create approval page directory
mkdir -p app/approve/[projectId]
```

### Step 3: Verify Directories Were Created
```bash
ls -la app/lib/
ls -la app/api/
ls -la app/approve/
```

You should see the new directories listed.

### Step 4: Copy Files
You'll copy the downloaded files into these directories. I'll give you exact commands after you download the files.

---

## 🔧 Environment Variables

Make sure these are set in your `.env.local` file:

```bash
RESEND_API_KEY=re_your_key_here
NEXT_PUBLIC_APP_URL=https://beta.stitchqueue.com
```

The `RESEND_API_KEY` should already be set from your feedback system.
The `NEXT_PUBLIC_APP_URL` is needed for generating approval links.

### Check Current Environment Variables:
```bash
cat .env.local | grep RESEND
cat .env.local | grep NEXT_PUBLIC_APP_URL
```

If `NEXT_PUBLIC_APP_URL` is missing, add it:
```bash
echo "NEXT_PUBLIC_APP_URL=https://beta.stitchqueue.com" >> .env.local
```

---

## 📝 Type Updates Required

You need to manually add these fields to your `app/types/index.ts` file.

Open `app/types/index.ts` and find the `Project` interface. Add these three optional fields:

```typescript
export interface Project {
  // ... existing fields ...
  
  // NEW: Email tracking
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
  
  // NEW: Client approval
  estimateApproval?: {
    status: 'approve' | 'approve_with_changes' | 'decline';
    comment?: string;
    timestamp: string;
  };
  
  // ... rest of existing fields ...
}
```

---

## 🧪 Testing the Installation

### Step 1: Build the Project
```bash
pnpm run build
```

If the build succeeds, the new files are properly integrated!

### Step 2: Check for Errors
Look for any TypeScript errors. Common issues:
- Missing imports in the email templates
- Type mismatches in the API routes

### Step 3: Start Development Server
```bash
pnpm run dev
```

### Step 4: Test the Approval Page
Visit: `http://localhost:3000/approve/test-123?response=approve`

You should see the approval form (it won't work without a real project ID, but the page should load).

---

## ⚠️ Important Notes

### 1. Supabase RLS Policies
The approval endpoint needs to work WITHOUT authentication (it's public). You may need to add a Supabase policy:

```sql
-- Allow public reads on projects table for approval lookups
CREATE POLICY "Allow public read for approvals"
ON projects
FOR SELECT
TO anon
USING (true);
```

**IMPORTANT**: This is a TEMPORARY policy for testing. In production, you'd want to add a security token or rate limiting.

### 2. PDF Attachments
The current PDF generator creates simple text files. For production, you might want to:
- Use a library like `jspdf` for proper PDF formatting
- Or use Puppeteer to render HTML as PDF
- Or keep the simple text format (it works fine!)

### 3. Resend Email Domain
Emails come from `no-reply@stitchqueue.com`. This can be changed in:
- `app/api/send-estimate/route.ts` (line ~110)
- `app/api/send-invoice/route.ts` (line ~110)

Just change the `from:` field to any verified domain in Resend.

---

## 🐛 Troubleshooting

### Build Errors
If you get "Cannot find module" errors:
```bash
# Reinstall dependencies
pnpm install
```

### Email Not Sending
Check Resend logs:
1. Go to resend.com dashboard
2. Check "Emails" tab
3. Look for error messages

### Approval Page Not Loading
Check browser console for errors. Make sure:
- Route is properly created at `app/approve/[projectId]/page.tsx`
- No TypeScript errors in the file

---

## 📞 Next Steps

After installation, you'll need to:
1. Update the project detail page to add "Send Estimate" and "Send Invoice" buttons
2. Test with real project data
3. Verify emails arrive correctly
4. Test the approval flow end-to-end

I'll create those UI components in the next step!
