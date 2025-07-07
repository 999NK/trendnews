// Script para debugar variáveis de ambiente
console.log('=== DEBUG ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('XAI_API_KEY exists:', !!process.env.XAI_API_KEY);
console.log('TWITTER_BEARER_TOKEN exists:', !!process.env.TWITTER_BEARER_TOKEN);
console.log('TWITTER_BEARER_TOKEN length:', process.env.TWITTER_BEARER_TOKEN ? process.env.TWITTER_BEARER_TOKEN.length : 0);
console.log('TWITTER_BEARER_TOKEN first 10 chars:', process.env.TWITTER_BEARER_TOKEN ? process.env.TWITTER_BEARER_TOKEN.substring(0, 10) + '...' : 'undefined');

// Verificar todas as variáveis que começam com TWITTER
const twitterVars = Object.keys(process.env).filter(key => key.startsWith('TWITTER'));
console.log('All TWITTER variables:', twitterVars);

console.log('=== END DEBUG ===');