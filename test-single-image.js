// Test script to verify the new image generation system
import { generateArticle } from './server/services/grok.js';

async function testSingleArticle() {
    console.log('🧪 Testing new image generation system...');
    
    try {
        // Generate a single article to test the new system
        const result = await generateArticle({
            hashtag: '#TestImageGeneration',
            length: 'short',
            style: 'informative',
            language: 'pt'
        });
        
        console.log('✅ Article generated successfully!');
        console.log('📄 Title:', result.title);
        console.log('🖼️ Banner Image:', result.bannerImageUrl);
        console.log('🖼️ Content Image:', result.contentImageUrl);
        
        // Check if images are PNG files (not SVG data URLs)
        const isBannerPNG = result.bannerImageUrl && result.bannerImageUrl.startsWith('/images/') && result.bannerImageUrl.endsWith('.png');
        const isContentPNG = result.contentImageUrl && result.contentImageUrl.startsWith('/images/') && result.contentImageUrl.endsWith('.png');
        
        console.log('\n📊 IMAGE GENERATION TEST RESULTS:');
        console.log('='.repeat(50));
        console.log('✅ Banner Image is PNG:', isBannerPNG ? 'YES' : 'NO');
        console.log('✅ Content Image is PNG:', isContentPNG ? 'YES' : 'NO');
        console.log('✅ No SVG fallbacks used:', !result.bannerImageUrl?.includes('data:image/svg') ? 'YES' : 'NO');
        
        if (isBannerPNG && isContentPNG) {
            console.log('\n🎉 SUCCESS: New image generation system is working correctly!');
            console.log('Images are being generated as PNG files and saved to /images/ directory.');
        } else {
            console.log('\n❌ Issue detected: Some images are still using SVG fallbacks.');
            console.log('Banner URL:', result.bannerImageUrl);
            console.log('Content URL:', result.contentImageUrl);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSingleArticle().then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
});