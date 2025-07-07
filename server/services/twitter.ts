import { getBrazilianTrendingTopics } from "./brazilian-trends";

interface TwitterTrendingTopic {
  name: string;
  tweet_volume: number | null;
  url: string;
}

interface TwitterTrendsResponse {
  trends: TwitterTrendingTopic[];
  as_of: string;
  created_at: string;
  locations: Array<{ name: string; woeid: number }>;
}

export async function fetchTrendingTopics(): Promise<Array<{
  hashtag: string;
  posts: number;
  rank: number;
}>> {
  try {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    console.log('Bearer Token Status:', bearerToken ? 'PRESENTE' : 'AUSENTE');
    console.log('Bearer Token Length:', bearerToken ? bearerToken.length : 0);
    
    if (!bearerToken) {
      console.log('Usando trending topics brasileiros inteligentes - Token não encontrado');
      return getBrazilianTrendingTopics();
    }

    console.log('Fazendo requisição para Twitter API v2...');
    
    // Twitter API v2 endpoint for recent search with Brazil geographic filter
    const response = await fetch('https://api.twitter.com/2/tweets/search/recent?query=lang:pt place_country:BR -is:retweet&tweet.fields=public_metrics&max_results=100', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Twitter API Error Response:', errorText);
      throw new Error(`Twitter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Twitter API v2 Response:', JSON.stringify(data, null, 2));
    
    if (!data || !data.data) {
      console.log('No tweets found in response');
      throw new Error("No tweets found from Twitter API v2");
    }

    console.log('Raw tweets count:', data.data.length);

    // Extract hashtags from tweets and count frequency
    const hashtagCounts = {};
    
    data.data.forEach(tweet => {
      const hashtags = tweet.text.match(/#\w+/g) || [];
      hashtags.forEach(hashtag => {
        const normalizedHashtag = hashtag.toLowerCase();
        if (!hashtagCounts[normalizedHashtag]) {
          hashtagCounts[normalizedHashtag] = {
            hashtag: hashtag,
            count: 0,
            engagement: 0
          };
        }
        hashtagCounts[normalizedHashtag].count++;
        if (tweet.public_metrics) {
          hashtagCounts[normalizedHashtag].engagement += 
            (tweet.public_metrics.like_count || 0) + 
            (tweet.public_metrics.retweet_count || 0);
        }
      });
    });

    // Convert to array and sort by count + engagement
    const trends = Object.values(hashtagCounts)
      .sort((a, b) => (b.count + b.engagement/10) - (a.count + a.engagement/10))
      .slice(0, 15)
      .map((trend, index) => ({
        hashtag: trend.hashtag,
        posts: trend.count * 100, // Simulate post volume
        rank: index + 1,
      }));

    console.log('Extracted trends count:', trends.length);
    console.log('Final trends:', trends);

    return trends;

  } catch (error) {
    console.error("Error fetching trending topics:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    
    // Dados de fallback inteligentes para o Brasil
    console.log('API falhou, usando trending topics brasileiros inteligentes');
    return getBrazilianTrendingTopics();
  }
}

export async function searchTweetsByHashtag(hashtag: string, count = 10): Promise<Array<{
  id: string;
  text: string;
  created_at: string;
  author_id: string;
}>> {
  try {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!bearerToken) {
      return []; // Return empty array if no API key
    }

    const query = encodeURIComponent(hashtag);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=${count}&tweet.fields=created_at,author_id`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];

  } catch (error) {
    console.error("Error searching tweets:", error);
    return [];
  }
}
