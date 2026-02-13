# EMAIL SYSTEM ARCHITECTURE

## 🎯 Overview

This email system enables PRO tier quilters to send professional estimates and invoices to clients via email, with client approval tracking for estimates.

---

## 🏗️ System Flow

### Sending an Estimate

```
User Action (Project Detail Page)
    ↓
Click "Send Estimate" button
    ↓
Confirmation Modal
    ↓
API Call: POST /api/send-estimate
    ↓
┌─────────────────────────────────┐
│ 1. Verify user is PRO tier      │
│ 2. Get project & settings        │
│ 3. Generate email HTML           │
│ 4. Generate PDF attachment       │
│ 5. Send via Resend               │
│ 6. Update project data           │
└─────────────────────────────────┘
    ↓
Success Toast: "Estimate sent!"
    ↓
Project updated with:
- estimateEmailSent.timestamp
- estimateEmailSent.recipientEmail
```

### Client Approval Flow

```
Client Receives Email
    ↓
Clicks "Approve" / "Approve with Changes" / "Decline"
    ↓
Lands on: /approve/[projectId]?response=approve
    ↓
Client Reviews & Adds Comments
    ↓
Submits Form
    ↓
API Call: POST /api/approve-estimate
    ↓
┌─────────────────────────────────┐
│ 1. Validate project exists      │
│ 2. Check not already responded  │
│ 3. Update project with approval │
└─────────────────────────────────┘
    ↓
Success Page: "Response Recorded"
    ↓
Project updated with:
- estimateApproval.status
- estimateApproval.comment
- estimateApproval.timestamp
```

### Sending an Invoice

```
User Action (Project Detail Page)
    ↓
Click "Send Invoice" button
    ↓
Confirmation Modal
    ↓
API Call: POST /api/send-invoice
    ↓
┌─────────────────────────────────┐
│ 1. Verify user is PRO tier      │
│ 2. Get project & settings        │
│ 3. Generate email HTML           │
│ 4. Generate PDF attachment       │
│ 5. Send via Resend               │
│ 6. Update project data           │
└─────────────────────────────────┘
    ↓
Success Toast: "Invoice sent!"
    ↓
Project updated with:
- invoiceEmailSent.timestamp
- invoiceEmailSent.recipientEmail
```

---

## 📊 Data Model

### Project Data Schema (JSONB)

```typescript
{
  // ... existing project fields ...
  
  // Email tracking
  estimateEmailSent?: {
    timestamp: "2026-02-08T10:30:00.000Z",
    recipientEmail: "client@example.com",
    resendId: "re_abc123xyz"  // Optional Resend tracking ID
  },
  
  invoiceEmailSent?: {
    timestamp: "2026-02-08T15:45:00.000Z",
    recipientEmail: "client@example.com",
    resendId: "re_xyz789abc"
  },
  
  // Client approval
  estimateApproval?: {
    status: "approve" | "approve_with_changes" | "decline",
    comment: "Optional comment from client",
    timestamp: "2026-02-08T14:30:00.000Z"
  }
}
```

### Why JSONB Storage?

1. **Co-location**: Approval data lives with the project it relates to
2. **Performance**: No joins needed, single query gets everything
3. **Flexibility**: Easy to add new fields without migrations
4. **Scalability**: PostgreSQL JSONB is indexed and performant at scale

---

## 🔐 Security Model

### Tier Gating
- **FREE users**: Buttons disabled, show "Upgrade to PRO" tooltip
- **PRO users**: Full functionality enabled

Both API routes check:
```typescript
const isPro = orgData.tier === 'pro';
if (!isPro) {
  return 403 error;
}
```

### Authentication
- **Send Estimate/Invoice**: Requires Supabase auth, user must own project
- **Approve Estimate**: NO auth required (public endpoint)

### RLS Policies
Current setup uses standard RLS policies for sending emails.

For the approval endpoint, you'll need to either:
1. Add a temporary public read policy (for testing)
2. Use Supabase service role key (bypasses RLS)
3. Add a security token system (production-ready)

---

## 🎨 Email Design

### Brand Colors
- **Plum**: `#4e283a` (Primary brand color)
- **Gold**: `#98823a` (Accent color)
- **Light Gray**: `#f5f5f5` (Backgrounds)

### Email Structure
```
┌────────────────────────────────┐
│ Header (Plum background)       │
│ - StitchQueue logo             │
│ - Business name (Gold)         │
└────────────────────────────────┘
┌────────────────────────────────┐
│ Main Content (White)           │
│ - Greeting                     │
│ - Project details box          │
│ - Pricing breakdown box        │
│ - Action buttons (conditional) │
│ - Contact info                 │
└────────────────────────────────┘
┌────────────────────────────────┐
│ Footer (Light gray)            │
│ - "Powered by StitchQueue"     │
└────────────────────────────────┘
```

### Button Colors
- **Approve**: Green (`#10b981`)
- **Approve with Changes**: Amber (`#f59e0b`)
- **Decline**: Red (`#ef4444`)
- **Primary Action**: Gold (`#98823a`)

### Mobile Responsive
All emails use responsive CSS that works on:
- Desktop (Outlook, Gmail, Apple Mail)
- Mobile (iOS Mail, Gmail app, Outlook app)
- Web clients (Gmail web, Outlook web)

---

## 📧 Email Service Integration

### Resend Configuration

**API Key**: Set in `.env.local`
```
RESEND_API_KEY=re_your_key_here
```

**Sender Address**: `no-reply@stitchqueue.com`
- This is a verified domain in Resend
- Easy to change to a different verified domain

**Reply-To**: Uses quilter's business email from Settings
- Clients reply directly to the quilter
- No need to monitor the no-reply address

### Attachments
PDFs are sent as base64-encoded text files.

Current format: Plain text (simple, works everywhere)
Future option: HTML-to-PDF using jsPDF or Puppeteer

---

## 🚦 Error Handling

### API Routes
All routes follow this pattern:
```typescript
try {
  // Validate inputs
  // Check authentication
  // Check tier access
  // Perform action
  // Update database
  // Return success
} catch (error) {
  console.error('Error details');
  return 500 error;
}
```

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Not logged in | Redirect to login |
| 403 Forbidden | Not PRO tier | Show upgrade prompt |
| 404 Not Found | Invalid project ID | Show error message |
| 500 Server Error | Resend failure, DB error | Log and retry |

### User Feedback
- **Success**: Green toast notification
- **Error**: Red toast with specific message
- **Loading**: Disable button with spinner

---

## 🔄 Future Enhancements

### Phase 1 (Current)
- ✅ Send estimate emails
- ✅ Send invoice emails
- ✅ Client approval tracking
- ✅ Approve with changes option

### Phase 2 (Planned)
- 📧 Email notifications to quilter when client responds
- 📊 Email analytics (open rate, click rate)
- 🔔 Reminder emails for unpaid invoices
- 📝 Custom email templates per quilter

### Phase 3 (Future)
- 💳 Payment links in invoice emails
- 🤖 Automated follow-up sequences
- 📅 Appointment booking from estimates
- 🌐 Multi-language support

---

## 📈 Performance Considerations

### At 2,000 Users
- **Email volume**: ~50,000 emails/month (25 per user)
- **Database impact**: Minimal (JSONB updates are fast)
- **API load**: Negligible (async email sending)

### Resend Limits
- **Free tier**: 3,000 emails/month
- **Paid tier**: 50,000 emails/month for $20
- **Current plan**: Check your Resend dashboard

### Optimization Opportunities
1. **Email queueing**: Add a job queue for high-volume periods
2. **Caching**: Cache email templates in memory
3. **Rate limiting**: Prevent abuse of public approval endpoint

---

## 🧪 Testing Checklist

### Unit Testing
- [ ] Email templates render correctly
- [ ] PDF generation produces valid content
- [ ] API routes validate inputs properly
- [ ] Approval page handles all response types

### Integration Testing
- [ ] Send estimate → Email arrives → Client approves
- [ ] Send invoice → Email arrives → Payment tracked
- [ ] Tier gating works (FREE users blocked)
- [ ] Error handling displays properly

### User Testing
- [ ] Beta tester sends estimate to real client
- [ ] Client receives email on mobile and desktop
- [ ] Approval buttons work correctly
- [ ] Quilter sees approval status in app

---

## 📞 Support & Debugging

### Check Email Logs
```bash
# View Resend logs in their dashboard
# https://resend.com/emails
```

### Check Project Data
```sql
-- View email tracking data
SELECT 
  id,
  data->'estimateEmailSent' as estimate_sent,
  data->'estimateApproval' as approval
FROM projects
WHERE id = 'project_id_here';
```

### Debug Approval Page
```bash
# Test locally
pnpm run dev

# Visit
http://localhost:3000/approve/test-id?response=approve
```

### Common Issues
1. **Email not arriving**: Check spam folder, verify Resend API key
2. **Approval not saving**: Check RLS policies in Supabase
3. **PDF blank**: Check project data has all required fields
