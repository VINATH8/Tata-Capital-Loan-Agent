import type { Customer, LoanApplication } from '../types/loan';
import type { EMIBreakdown } from './loanCalculations';

export function generateSanctionLetter(
  customer: Customer,
  loanApplication: LoanApplication,
  emiBreakdown: EMIBreakdown
): string {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
    .title { font-size: 20px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; }
    .email-highlight { color: #1e40af; font-weight: bold; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f3f4f6; }
    .footer { margin-top: 40px; font-size: 12px; color: #666; }
    .signature { margin-top: 60px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">TATA CAPITAL</div>
    <p>Financial Services Limited</p>
    <p>Tower A, Peninsula Business Park, Lower Parel, Mumbai - 400013</p>
  </div>

  <div class="title">LOAN SANCTION LETTER</div>

  <p><span class="label">Date:</span> ${currentDate}</p>
  <p><span class="label">Sanction Letter No:</span> TC/${loanApplication.id.substring(0, 8).toUpperCase()}/2025</p>

  <div class="section">
    <p><span class="label">To,</span></p>
    <p><strong>${customer.name}</strong></p>
    <p class="email-highlight">Email: ${customer.email}</p>
    <p>Phone: ${customer.phone}</p>
    <p>${customer.address}</p>
  </div>

  <div class="section">
    <p>Dear ${customer.name},</p>
    <p>We are pleased to inform you that your personal loan application has been approved subject to the terms and conditions mentioned below:</p>
  </div>

  <table>
    <tr>
      <th>Particulars</th>
      <th>Details</th>
    </tr>
    <tr>
      <td>Loan Amount Sanctioned</td>
      <td>₹${loanApplication.loanAmount.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td>Tenure</td>
      <td>${loanApplication.tenure} months</td>
    </tr>
    <tr>
      <td>Interest Rate (per annum)</td>
      <td>${loanApplication.interestRate}%</td>
    </tr>
    <tr>
      <td>EMI Amount</td>
      <td>₹${emiBreakdown.emi.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td>Processing Fee (2%)</td>
      <td>₹${emiBreakdown.processingFee.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td>GST on Processing Fee (18%)</td>
      <td>₹${emiBreakdown.gst.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td>Net Disbursement Amount</td>
      <td>₹${emiBreakdown.netDisbursement.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td>Total Interest Payable</td>
      <td>₹${emiBreakdown.totalInterest.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td>Total Amount Payable</td>
      <td>₹${emiBreakdown.totalAmount.toLocaleString('en-IN')}</td>
    </tr>
  </table>

  <div class="section">
    <p><span class="label">Terms and Conditions:</span></p>
    <ol>
      <li>The loan is subject to the submission and verification of all required documents.</li>
      <li>The EMI is payable on or before the 5th of every month.</li>
      <li>Prepayment charges: 4% of the outstanding principal amount.</li>
      <li>Delayed payment charges: 2% per month on the overdue amount.</li>
      <li>The loan agreement must be signed within 15 days of this sanction letter.</li>
      <li>The company reserves the right to cancel this sanction if any information is found to be false or misleading.</li>
    </ol>
  </div>

  <div class="section">
    <p>This sanction letter is valid for 30 days from the date of issuance.</p>
    <p>We look forward to serving your financial needs.</p>
  </div>

  <div class="signature">
    <p><span class="label">Authorized Signatory</span></p>
    <p>TATA CAPITAL Financial Services Limited</p>
  </div>

  <div class="footer">
    <p>This is a system-generated letter and does not require a physical signature.</p>
    <p>For any queries, please contact our customer care at 1800-209-8800 or email support@tatacapital.com</p>
  </div>
</body>
</html>
  `.trim();
}

export function downloadSanctionLetter(html: string, applicationId: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sanction_Letter_${applicationId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
