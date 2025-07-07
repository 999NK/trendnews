import cron from 'node-cron';
import { storage } from '../storage';
import { fetchTrendingTopics } from './twitter';
import { generateArticle } from './grok';

let scheduledTask: cron.ScheduledTask | null = null;

export async function initializeScheduler() {
  const settings = await storage.getSettings();
  const automationEnabled = settings.find(s => s.key === 'automation_enabled')?.value === 'true';
  const runTime = settings.find(s => s.key === 'run_time')?.value || '12:00';
  
  if (automationEnabled) {
    await scheduleAutomatedRun(runTime);
  }
}

export async function scheduleAutomatedRun(time: string) {
  // Stop existing task if running
  if (scheduledTask) {
    scheduledTask.destroy();
  }

  // Parse time (format: HH:MM)
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create cron expression for daily execution
  const cronExpression = `${minutes} ${hours} * * *`;
  
  await storage.createSystemLog({
    message: `Automated task scheduled for ${time} daily`,
    type: 'info',
    details: { cronExpression, time }
  });

  scheduledTask = cron.schedule(cronExpression, async () => {
    await runAutomatedGeneration();
  });

  return scheduledTask;
}

export async function runAutomatedGeneration() {
  await storage.createSystemLog({
    message: 'Starting automated article generation',
    type: 'info',
    details: { timestamp: new Date().toISOString() }
  });

  try {
    // Fetch trending topics from Twitter
    const trends = await fetchTrendingTopics();
    
    await storage.createSystemLog({
      message: `Fetched ${trends.length} trending topics from X API`,
      type: 'info',
      details: { count: trends.length }
    });

    // Clear existing trending topics and add new ones
    await storage.clearTrendingTopics();
    
    for (const trend of trends) {
      await storage.createTrendingTopic({
        hashtag: trend.hashtag,
        posts: trend.posts,
        rank: trend.rank,
        status: 'queued'
      });
    }

    // Get settings for article generation
    const settings = await storage.getSettings();
    const maxArticles = parseInt(settings.find(s => s.key === 'max_articles')?.value || '10');
    const articleLength = settings.find(s => s.key === 'article_length')?.value || 'medium';
    const writingStyle = settings.find(s => s.key === 'writing_style')?.value || 'informative';
    const language = settings.find(s => s.key === 'language')?.value || 'pt';

    // Generate articles for trending topics
    const topicsToProcess = trends.slice(0, maxArticles);
    
    for (const topic of topicsToProcess) {
      try {
        // Update topic status to processing
        const topicRecord = await storage.getTrendingTopics();
        const topicToUpdate = topicRecord.find(t => t.hashtag === topic.hashtag);
        
        if (topicToUpdate) {
          await storage.updateTrendingTopic(topicToUpdate.id, { status: 'processing' });
        }

        // Generate article using Grok AI
        const article = await generateArticle({
          hashtag: topic.hashtag,
          length: articleLength as 'short' | 'medium' | 'long',
          style: writingStyle as 'informative' | 'casual' | 'formal' | 'engaging',
          language: language as 'pt' | 'en' | 'es'
        });

        // Save article to storage
        await storage.createArticle({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          hashtag: topic.hashtag,
          status: 'published'
        });

        // Update topic status to completed
        if (topicToUpdate) {
          await storage.updateTrendingTopic(topicToUpdate.id, { status: 'completed' });
        }

        await storage.createSystemLog({
          message: `Successfully generated article for ${topic.hashtag}`,
          type: 'success',
          details: { hashtag: topic.hashtag, title: article.title }
        });

      } catch (error) {
        // Update topic status to failed
        const topicRecord = await storage.getTrendingTopics();
        const topicToUpdate = topicRecord.find(t => t.hashtag === topic.hashtag);
        
        if (topicToUpdate) {
          await storage.updateTrendingTopic(topicToUpdate.id, { status: 'failed' });
        }

        await storage.createSystemLog({
          message: `Failed to generate article for ${topic.hashtag}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
          details: { hashtag: topic.hashtag, error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }

    await storage.createSystemLog({
      message: 'Automated article generation completed',
      type: 'success',
      details: { processedTopics: topicsToProcess.length }
    });

  } catch (error) {
    await storage.createSystemLog({
      message: `Automated generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
}

export async function stopScheduledTask() {
  if (scheduledTask) {
    scheduledTask.destroy();
    scheduledTask = null;
    
    await storage.createSystemLog({
      message: 'Automated task stopped',
      type: 'info',
      details: {}
    });
  }
}

export function getScheduledTaskStatus() {
  return {
    running: scheduledTask !== null,
    nextRun: scheduledTask ? 'Next scheduled run based on cron' : null
  };
}
