const industry = [
    {
        label: "Sales",
        items: [
            {
                label: "CRM & Sales Analytics",
                value: "crm-sales-analytics"
            },
            {
                label: "Sales Acceleration",
                value: "sales-acceleration"
            }
        ]
    },
    {
        label: "Marketing",
        items: [
            {
                label: "Marketing Automation & Analytics",
                value: "marketing-automation-analytics"
            },
            {
                label: "Social Media & Content Marketing",
                value: "social-media-content-marketing"
            }
        ]
    },
    {
        label: "B2B Marketplaces",
        items: [
            {
                label: "On-demand Services",
                value: "on-demand-services"
            },
            {
                label: "Merchant Marketing",
                value: "merchant-marketing"
            }
        ]
    },
    {
        label: "Commerce",
        items: [
            {
                label: "E-commerce Platform Solutions",
                value: "ecommerce-platform-solutions"
            },
            {
                label: "Payment & Point-of-Sale Solutions",
                value: "payment-point-of-sale-solutions"
            }
        ]
    }
]

export default defineEventHandler(async () => industry);
