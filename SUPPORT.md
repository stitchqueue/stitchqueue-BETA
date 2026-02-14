# Support Processes — StitchQueue

## Contact

- **Email:** support@stitchqueue.com
- **Response time goal:** Within 24 hours on business days

## Common User Issues

### "I can't log in"
1. Verify email address is correct
2. Check if they completed email verification
3. Try "Forgot Password" flow
4. Check Supabase Auth > Users for their account status

### "My projects disappeared"
1. Check if they're logged into the correct account
2. Verify their organization exists in Supabase (profiles + organizations tables)
3. Check if projects exist in the database with their organization_id
4. Check for RLS policy issues in Supabase logs

### "Stripe charged me / trial didn't work"
1. Check Stripe Dashboard > Customers for their account
2. Verify subscription status and trial dates
3. Check subscriptions table in Supabase
4. If incorrect charge, process refund in Stripe Dashboard

### "Calculator numbers look wrong"
1. Have them check their pricing rates in Settings > Pricing Rates
2. Verify batting options are configured correctly
3. Check for any extra charges applied

### "BOC won't unlock after purchase"
1. Check boc_purchases table in Supabase for their user_id
2. Check Stripe Dashboard for payment status
3. Verify webhook was received (Stripe > Webhooks > Recent deliveries)
4. If webhook failed, manually insert into boc_purchases

### "Intake form not working"
1. Verify form is enabled in Settings > Client Intake Form
2. Check that the URL slug is set
3. Test the public URL directly
4. Check for RLS issues on the organizations table (intake columns)

## Debugging Access

### Supabase Dashboard
- **Users:** Auth > Users (email, created date, last sign in)
- **Organizations:** Table Editor > organizations
- **Projects:** Table Editor > projects (filter by organization_id)
- **Subscriptions:** Table Editor > subscriptions (filter by user_id)
- **BOC Purchases:** Table Editor > boc_purchases (filter by user_id)
- **Logs:** Database > Logs (recent queries and errors)

### Stripe Dashboard
- **Customers:** Search by email
- **Subscriptions:** Check status, trial end, payment method
- **Payments:** Check invoice history
- **Webhooks:** Developers > Webhooks > Recent deliveries

### Vercel Dashboard
- **Deployments:** Check for build failures
- **Logs:** Runtime logs for API errors
- **Analytics:** Page views and performance

## Refund Policy

- **During trial:** No charge, cancel anytime in billing portal
- **After trial:** Refund within 7 days if unsatisfied (process via Stripe)
- **BOC purchase:** Refund within 7 days if unused (process via Stripe)
- **Process:** Stripe Dashboard > Payments > Find payment > Refund

## Beta Tester Feedback

- Collect via support@stitchqueue.com
- Track in a spreadsheet or issue tracker
- Prioritize by frequency and severity
- Acknowledge all feedback within 24 hours
