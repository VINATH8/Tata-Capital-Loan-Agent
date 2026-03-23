import type { ChatMessage} from '../types/loan.ts'

export default class VerificationAgent {
  introduce(customerName: string): string {
    return `Hello ${customerName}! I'm the Verification Specialist.

For regulatory compliance and to protect your interests, I need to verify your identity through KYC (Know Your Customer) process.

I'll need you to upload the following documents:
📄 PAN Card
📄 Aadhar Card
📄 Latest Salary Slip

After document upload, I'll also need a quick selfie to verify your identity.

This entire process takes less than 2 minutes! Let's get started with the document uploads.`;
  }

  async verifyDocuments(): Promise<ChatMessage> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      id: `msg-${Date.now()}`,
      role: 'verification',
      content: `✓ Documents verified successfully!

I've checked:
✓ PAN Card - Valid and active
✓ Aadhar Card - Verified with UIDAI
✓ Salary Slip - Validated

Now proceeding with facial recognition for identity confirmation...`,
      timestamp: new Date(),
      agentName: 'Verification Agent',
    };
  }

  async verifySelfie(success: boolean): Promise<ChatMessage> {
    if (success) {
      return {
        id: `msg-${Date.now()}`,
        role: 'verification',
        content: `✓ Facial recognition successful!

Your identity has been verified. All KYC checks passed!

📋 Verification Summary:
✓ Document verification - Complete
✓ Identity verification - Complete
✓ Address verification - Complete
✓ Contact verification - Complete

You're all set! Handing over to our Underwriting team for loan approval...`,
        timestamp: new Date(),
        agentName: 'Verification Agent',
      };
    } else {
      return {
        id: `msg-${Date.now()}`,
        role: 'verification',
        content: `❌ Facial recognition failed. The photo doesn't match with your documents.

Please try again with better lighting and ensure your face is clearly visible.`,
        timestamp: new Date(),
        agentName: 'Verification Agent',
      };
    }
  }
}
