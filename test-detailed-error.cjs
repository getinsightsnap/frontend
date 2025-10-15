// Test with detailed error logging
process.env.PERPLEXITY_API_KEY = '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';

const axios = require('axios');

async function testPerplexityAPI() {
  console.log('🧪 Testing Perplexity API directly...');
  
  const apiKey = process.env.PERPLEXITY_API_KEY;
  const baseUrl = 'https://api.perplexity.ai';
  
  try {
    console.log('📡 Making API call to Perplexity...');
    
    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model: 'llama-3.1-sonar-large-128k-chat',
      messages: [
        {
          role: 'user',
          content: 'Generate 3 focus areas for "Bigg boss" social media research. Return only JSON array format: [{"title": "Focus", "description": "Description", "expandedQuery": "search terms", "category": "category"}]'
        }
      ],
      max_tokens: 400,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ API Response received!');
    console.log('📝 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Error Details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Error Message:', error.message);
  }
}

testPerplexityAPI();
