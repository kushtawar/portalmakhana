export interface PolicyContent {
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

export const policies: Record<string, PolicyContent> = {
  "shipping-returns": {
    title: "Shipping & Returns",
    summary:
      "Placeholder shipping and returns information. Final wording is pending confirmation with the business team.",
    sections: [
      {
        heading: "Shipping",
        body: "Orders are typically dispatched within 1-2 business days. Exact shipping rates, serviceable PIN codes and free-shipping thresholds will be confirmed here once finalised.",
      },
      {
        heading: "Returns",
        body: "As a food product, returns are generally accepted only for quality issues reported soon after delivery. Full policy details are pending final business review.",
      },
    ],
  },
  refunds: {
    title: "Cancellation & Refunds",
    summary:
      "Placeholder cancellation and refund policy. Final wording is pending confirmation with the business team.",
    sections: [
      {
        heading: "Order cancellation",
        body: "Orders can typically be cancelled before they are shipped. Exact cancellation windows will be confirmed here once finalised.",
      },
      {
        heading: "Refunds",
        body: "Approved refunds are processed to the original payment method. Processing timelines will be confirmed once payment integration is live.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    summary:
      "Placeholder privacy policy. Final legal wording is pending confirmation with the business team.",
    sections: [
      {
        heading: "Information we collect",
        body: "We collect only the information needed to process orders and enquiries, such as name, contact details and shipping address.",
      },
      {
        heading: "How we use it",
        body: "Your information is used to fulfil orders, respond to enquiries, and for legally required record-keeping such as GST invoicing.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    summary:
      "Placeholder terms and conditions. Final legal wording is pending confirmation with the business team.",
    sections: [
      {
        heading: "Orders",
        body: "By placing an order, you agree to provide accurate contact and shipping information. Product prices and availability are subject to change without notice.",
      },
      {
        heading: "Pricing",
        body: "Prices shown are in Indian Rupees and are inclusive of applicable GST unless stated otherwise.",
      },
    ],
  },
};
