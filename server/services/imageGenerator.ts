export function generateArticleImage(title: string, hashtag: string): string {
  // Remove # from hashtag
  const cleanHashtag = hashtag.replace('#', '');
  
  // Generate a color based on hashtag
  const colors = [
    { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
    { bg: '#10B981', text: '#FFFFFF' }, // Green
    { bg: '#F59E0B', text: '#FFFFFF' }, // Amber
    { bg: '#EF4444', text: '#FFFFFF' }, // Red
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
    { bg: '#06B6D4', text: '#FFFFFF' }, // Cyan
    { bg: '#F97316', text: '#FFFFFF' }, // Orange
    { bg: '#84CC16', text: '#FFFFFF' }, // Lime
  ];
  
  const colorIndex = cleanHashtag.length % colors.length;
  const color = colors[colorIndex];
  
  // Truncate title if too long
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  
  // Create SVG
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.bg}CC;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="600" height="400" fill="url(#bgGrad)"/>
      
      <!-- Decorative elements -->
      <circle cx="550" cy="50" r="30" fill="${color.text}" opacity="0.1"/>
      <circle cx="50" cy="350" r="40" fill="${color.text}" opacity="0.1"/>
      <rect x="450" y="300" width="120" height="80" rx="10" fill="${color.text}" opacity="0.05"/>
      
      <!-- Logo/News Icon -->
      <circle cx="100" cy="100" r="35" fill="${color.text}" opacity="0.2"/>
      <text x="100" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${color.text}">📰</text>
      
      <!-- Hashtag -->
      <text x="50" y="180" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="${color.text}" opacity="0.8">${hashtag}</text>
      
      <!-- Title -->
      <foreignObject x="50" y="200" width="500" height="120">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: ${color.text}; line-height: 1.3; word-wrap: break-word;">
          ${displayTitle}
        </div>
      </foreignObject>
      
      <!-- Footer -->
      <text x="50" y="370" font-family="Arial, sans-serif" font-size="14" fill="${color.text}" opacity="0.7">TrendNews • Notícias em Tempo Real</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function generateDefaultImage(hashtag: string): string {
  const cleanHashtag = hashtag.replace('#', '');
  
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="400" height="300" fill="url(#defaultGrad)"/>
      
      <circle cx="200" cy="120" r="30" fill="white" opacity="0.2"/>
      <text x="200" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white">📰</text>
      
      <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="white" opacity="0.9">${hashtag}</text>
      
      <text x="200" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white" opacity="0.7">TrendNews</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}