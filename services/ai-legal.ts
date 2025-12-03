import { generateAIResponse } from '../lib/gemini';

export interface ContractDetails {
    clientName: string;
    influencerName: string;
    feeAmount: string;
    paymentTerms: string;
    campaignScope: string;
    startDate: string;
    usageTerm: string;
    terminationClause: string;
}

const CONTRACT_TEMPLATE = `
**INFLUENCER MARKETING AGREEMENT (Brand-Influencer Direct)**

This Influencer Marketing Agreement (“Agreement”) is entered into on **[START_DATE]**, by and between:

**[CLIENT_NAME]** (the “Brand”), having its principal place of business at [Brand Address],

**and**

**[INFLUENCER_NAME]** (the “Influencer”), having its principal place of business at [Influencer Address].

***

### **1. Scope of Work**

The Influencer agrees to provide the following Marketing Services to the Brand:
* Content creation and promotion primarily focused on the [Niche/Category] vertical.
* Delivering content placements on [Platforms].
* **The exact deliverables:** [CAMPAIGN_SCOPE]

### **2. Payment Terms**

* **Total compensation for services:** [FEE_AMOUNT]
* **Payment Schedule:** [PAYMENT_TERMS]
* All payments shall be made via [Bank Transfer/PayPal/Wise].

### **3. Approval Process**

* The Influencer will share drafts/content for Brand approval before posting.
* The Brand must provide feedback/approval within 48 hours of draft submission.

### **4. Content Usage Rights**

* The Brand is granted a non-exclusive license to use content organically on its own social media channels for **[USAGE_TERM]**.
* For paid advertising rights (whitelisting, boosting), a separate fee will apply and must be agreed separately.
* The Brand is not allowed to edit or modify content without prior written consent.

### **5. Exclusivity**

* During the campaign, the Influencer will not promote direct competitors in the same product/service category.

### **6. Termination**

* This Agreement may be terminated with written notice in accordance with **[TERMINATION_CLAUSE]**.

### **7. Governing Law**

* This Agreement shall be governed by and construed in accordance with the laws of [Governing Jurisdiction].
`;

export async function generateContract(details: ContractDetails): Promise<string> {
    const prompt = `
You are a professional, meticulous legal drafting assistant specializing in influencer and client agreements. Your task is to process the provided contract template and accurately replace all placeholders with the specific data provided in the DETAILS section.

**INSTRUCTIONS:**
1.  **Strictly adhere** to the legal tone, structure, and language of the provided **CONTRACT TEMPLATE**.
2.  Do **NOT** add any commentary, introductory text, or extraneous information. Output **only** the final, completed contract text.
3.  Format the final output cleanly using **Markdown** for professional presentation (use bolding for section headings, lists, etc.).
4.  If a placeholder like [Brand Address] or [Influencer Address] is not provided in the details, leave it as a placeholder for the user to fill later, or use "TBD" if appropriate.

---
### 📄 CONTRACT TEMPLATE
${CONTRACT_TEMPLATE}
---

### 📥 DETAILS TO INSERT
* **CLIENT_NAME:** ${details.clientName}
* **INFLUENCER_NAME:** ${details.influencerName}
* **FEE_AMOUNT:** ${details.feeAmount}
* **PAYMENT_TERMS:** ${details.paymentTerms}
* **CAMPAIGN_SCOPE:** ${details.campaignScope}
* **START_DATE:** ${details.startDate}
* **USAGE_TERM:** ${details.usageTerm}
* **TERMINATION_CLAUSE:** ${details.terminationClause}

---
**GO:** Process the template now using the details provided above, and output the finalized contract.
`;

    return generateAIResponse(prompt, {
        modelType: 'pro', // Use Pro model for better reasoning/formatting
        temperature: 0.1, // Low temperature for strict adherence
    });
}
