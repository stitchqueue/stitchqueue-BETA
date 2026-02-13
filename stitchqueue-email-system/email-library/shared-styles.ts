// app/lib/email/shared-styles.ts
// Shared email styling with StitchQueue branding

export const emailStyles = {
  // Brand colors
  plum: '#4e283a',
  gold: '#98823a',
  lightGray: '#f5f5f5',
  darkGray: '#333333',
  white: '#ffffff',

  // Container styles
  container: `
    max-width: 600px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333333;
    line-height: 1.6;
  `,

  // Header styles
  header: `
    background-color: #4e283a;
    padding: 30px 20px;
    text-align: center;
  `,

  headerTitle: `
    color: #ffffff;
    font-size: 28px;
    font-weight: bold;
    margin: 0;
  `,

  headerSubtitle: `
    color: #98823a;
    font-size: 16px;
    margin: 10px 0 0 0;
  `,

  // Content styles
  content: `
    background-color: #ffffff;
    padding: 40px 30px;
  `,

  greeting: `
    font-size: 18px;
    color: #333333;
    margin: 0 0 20px 0;
  `,

  paragraph: `
    font-size: 16px;
    color: #333333;
    margin: 0 0 15px 0;
  `,

  // Detail box styles
  detailBox: `
    background-color: #f5f5f5;
    border-left: 4px solid #98823a;
    padding: 20px;
    margin: 20px 0;
  `,

  detailLabel: `
    font-size: 14px;
    color: #666666;
    margin: 0 0 5px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,

  detailValue: `
    font-size: 16px;
    color: #333333;
    margin: 0 0 15px 0;
    font-weight: 500;
  `,

  detailValueLast: `
    font-size: 16px;
    color: #333333;
    margin: 0;
    font-weight: 500;
  `,

  // Pricing styles
  priceBox: `
    background-color: #f5f5f5;
    border: 2px solid #98823a;
    padding: 20px;
    margin: 20px 0;
  `,

  priceRow: `
    display: flex;
    justify-content: space-between;
    margin: 0 0 10px 0;
    font-size: 16px;
  `,

  priceLabel: `
    color: #333333;
  `,

  priceValue: `
    color: #333333;
    font-weight: 500;
  `,

  totalRow: `
    display: flex;
    justify-content: space-between;
    padding-top: 15px;
    margin-top: 15px;
    border-top: 2px solid #98823a;
    font-size: 20px;
    font-weight: bold;
  `,

  totalLabel: `
    color: #4e283a;
  `,

  totalValue: `
    color: #4e283a;
  `,

  // Button styles
  buttonContainer: `
    text-align: center;
    margin: 30px 0;
  `,

  buttonPrimary: `
    display: inline-block;
    background-color: #98823a;
    color: #ffffff;
    padding: 15px 40px;
    text-decoration: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    margin: 0 10px;
  `,

  buttonSuccess: `
    display: inline-block;
    background-color: #10b981;
    color: #ffffff;
    padding: 15px 40px;
    text-decoration: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    margin: 0 10px 10px 10px;
  `,

  buttonWarning: `
    display: inline-block;
    background-color: #f59e0b;
    color: #ffffff;
    padding: 15px 40px;
    text-decoration: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    margin: 0 10px 10px 10px;
  `,

  buttonDanger: `
    display: inline-block;
    background-color: #ef4444;
    color: #ffffff;
    padding: 15px 40px;
    text-decoration: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    margin: 0 10px 10px 10px;
  `,

  // Footer styles
  footer: `
    background-color: #f5f5f5;
    padding: 30px 20px;
    text-align: center;
    color: #666666;
    font-size: 14px;
  `,

  footerText: `
    margin: 0 0 10px 0;
  `,

  // Utility styles
  divider: `
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 30px 0;
  `,

  note: `
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 15px;
    margin: 20px 0;
    font-size: 14px;
    color: #92400e;
  `,
};

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
