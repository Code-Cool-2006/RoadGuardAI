async function analyzePhoto(photoUrl) {
  const imgResponse = await fetch(photoUrl);
  const arrayBuffer = await imgResponse.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  const mediaType = imgResponse.headers.get('content-type') || 'image/jpeg';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.LLM_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
          {
            type: 'text',
            text: `Analyze this photo submitted as a civic infrastructure complaint. Respond ONLY with JSON, no other text, in this exact shape:
{"is_likely_genuine": boolean, "issue_type": string, "suggested_department": "roads"|"water"|"telecom"|"gas", "confidence": number}`,
          },
        ],
      }],
    }),
  });

  const data = await response.json();
  const textBlock = data.content?.find(c => c.type === 'text');

  try {
    return JSON.parse(textBlock.text.replace(/```json|```/g, '').trim());
  } catch {
    return { is_likely_genuine: null, issue_type: 'unknown', suggested_department: null, confidence: 0 };
  }
}

module.exports = { analyzePhoto };