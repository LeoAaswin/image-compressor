export function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'OptiPix',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: 'Professional image compression, conversion, and background removal tool. Runs locally in your browser for maximum privacy.',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1250',
        },
        featureList: [
            'Image Compression (JPEG, PNG, WEBP)',
            'Image Conversion (AVIF, ICO, TIFF)',
            'Background Removal AI',
            'Batch Processing',
            'Offline Capability'
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
