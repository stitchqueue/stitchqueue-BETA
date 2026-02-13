#!/bin/bash
# StitchQueue Email System - Simple Installation
# Run this script from your project root directory

set -e  # Exit on any error

echo "================================================"
echo "StitchQueue Email System Installation"
echo "================================================"
echo ""

# Check we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found"
    echo "Please run this script from your project root: /workspaces/StitchQueue-BETA"
    exit 1
fi

echo "✓ Found package.json"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "📦 Installing from: $SCRIPT_DIR"
echo ""

# Create directories
echo "📁 Creating directory structure..."
mkdir -p app/lib/email
mkdir -p app/api/send-estimate
mkdir -p app/api/send-invoice
mkdir -p app/api/approve-estimate
mkdir -p "app/approve/[projectId]"
echo "✓ Directories created"
echo ""

# Copy email library files
echo "📧 Installing email library..."
cp "$SCRIPT_DIR/email-library/shared-styles.ts" app/lib/email/
cp "$SCRIPT_DIR/email-library/estimate-template.ts" app/lib/email/
cp "$SCRIPT_DIR/email-library/invoice-template.ts" app/lib/email/
cp "$SCRIPT_DIR/email-library/pdf-generator.ts" app/lib/email/
cp "$SCRIPT_DIR/email-library/index.ts" app/lib/email/
echo "✓ Email library installed (5 files)"
echo ""

# Copy API routes
echo "🔌 Installing API routes..."
cp "$SCRIPT_DIR/api-routes/send-estimate/route.ts" app/api/send-estimate/
cp "$SCRIPT_DIR/api-routes/send-invoice/route.ts" app/api/send-invoice/
cp "$SCRIPT_DIR/api-routes/approve-estimate/route.ts" app/api/approve-estimate/
echo "✓ API routes installed (3 files)"
echo ""

# Copy approval page
echo "📄 Installing approval page..."
cp "$SCRIPT_DIR/approval-page/page.tsx" "app/approve/[projectId]/"
echo "✓ Approval page installed (1 file)"
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
if grep -q "RESEND_API_KEY" .env.local 2>/dev/null; then
    echo "✓ RESEND_API_KEY found"
else
    echo "⚠️  RESEND_API_KEY not found in .env.local"
    echo "   You'll need to add this manually"
fi

if grep -q "NEXT_PUBLIC_APP_URL" .env.local 2>/dev/null; then
    echo "✓ NEXT_PUBLIC_APP_URL found"
else
    echo "➕ Adding NEXT_PUBLIC_APP_URL..."
    echo "NEXT_PUBLIC_APP_URL=https://beta.stitchqueue.com" >> .env.local
    echo "✓ NEXT_PUBLIC_APP_URL added"
fi
echo ""

# Backup types file
echo "💾 Backing up types file..."
if [ -f "app/types/index.ts" ]; then
    cp app/types/index.ts app/types/index.ts.backup
    echo "✓ Backup created: app/types/index.ts.backup"
else
    echo "⚠️  app/types/index.ts not found - skipping backup"
fi
echo ""

# Summary
echo "================================================"
echo "✅ Installation Complete!"
echo "================================================"
echo ""
echo "📊 Installed:"
echo "   - 5 email library files"
echo "   - 3 API routes"
echo "   - 1 approval page"
echo "   - Environment variable configured"
echo ""
echo "⚠️  MANUAL STEPS REQUIRED:"
echo ""
echo "1. Update app/types/index.ts"
echo "   Open: $SCRIPT_DIR/docs/TYPE_UPDATES.ts"
echo "   Add the three fields to your Project interface"
echo ""
echo "2. Test the build:"
echo "   pnpm install"
echo "   pnpm run build"
echo ""
echo "3. If build succeeds, commit:"
echo "   git add app/lib/email app/api/send-* app/api/approve-* app/approve app/types/index.ts .env.local"
echo "   git commit -m \"feat: add email system for estimates and invoices\""
echo "   git push origin dev"
echo ""
echo "📚 Documentation:"
echo "   README:        $SCRIPT_DIR/docs/README.md"
echo "   Installation:  $SCRIPT_DIR/docs/INSTALLATION.md"
echo "   Architecture:  $SCRIPT_DIR/docs/ARCHITECTURE.md"
echo "   Type Updates:  $SCRIPT_DIR/docs/TYPE_UPDATES.ts"
echo ""
echo "================================================"
