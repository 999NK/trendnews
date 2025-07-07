export function generateArticleImage(title: string, hashtag: string): string {
  // Remove # from hashtag and clean it for URL
  const cleanHashtag = hashtag.replace('#', '').replace(/[^a-zA-Z0-9]/g, '');
  
  // Create a hash from title + hashtag for consistent but varied images
  const hash = (title + hashtag).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const imageId = Math.abs(hash) % 1000 + 100; // Range 100-1099
  
  // Use Picsum Photos - reliable service with actual JPEG photos
  const imageUrls = [
    `https://picsum.photos/800/400?random=${imageId}`,
    `https://picsum.photos/800/400?random=${imageId + 1}`,
    `https://picsum.photos/800/400?random=${imageId + 2}`,
    `https://picsum.photos/800/400?random=${imageId + 3}`,
    `https://picsum.photos/800/400?random=${imageId + 4}`,
    `https://picsum.photos/800/400?random=${imageId + 5}`,
    `https://picsum.photos/800/400?random=${imageId + 6}`,
    `https://picsum.photos/800/400?random=${imageId + 7}`
  ];
  
  // Select image based on hashtag
  const imageIndex = Math.abs(hash) % imageUrls.length;
  
  return imageUrls[imageIndex];
}

export function generateDefaultImage(hashtag: string): string {
  return generateArticleImage("Trending Topic", hashtag);
}