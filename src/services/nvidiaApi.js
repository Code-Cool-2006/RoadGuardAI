/**
 * Service for interacting with NVIDIA NIM / Integrated API
 */

const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY || '';
const BASE_URL = import.meta.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const DEFAULT_MODEL = import.meta.env.VITE_NVIDIA_DEFAULT_MODEL || 'meta/llama-3.3-70b-instruct';

export const AVAILABLE_MODELS = [
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (Meta)', description: 'Best overall accuracy and reasoning' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B (NVIDIA)', description: 'High precision instruct & alignment' },
  { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2', description: 'Superior multilingual & logic support' },
  { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B (Meta)', description: 'Fast responses for rapid triage' }
];

/**
 * Send a chat completion request to NVIDIA API
 * @param {Array<{role: string, content: string}>} messages 
 * @param {Object} options 
 * @returns {Promise<string>}
 */
export async function chatCompletion(messages, options = {}) {
  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.6;
  const max_tokens = options.max_tokens ?? 1024;
  const apiKey = options.apiKey || API_KEY;

  if (!apiKey) {
    throw new Error('NVIDIA API Key is missing. Please set VITE_NVIDIA_API_KEY in .env.local');
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.detail || `NVIDIA API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Analyze a civic / road safety report using NVIDIA LLM
 * @param {Object} reportData 
 * @param {string} apiKey 
 */
export async function analyzeCivicReport(reportData, apiKey = API_KEY) {
  const systemPrompt = `You are CivicGuard AI, an expert municipal safety dispatcher & hazard assessment AI powered by NVIDIA NIM. 
Analyze citizen reports regarding road hazards, traffic infrastructure damage, street light outages, accidents, or public safety issues.

Return a structured response with:
1. Risk Level (LOW, MEDIUM, HIGH, CRITICAL)
2. Severity Score (1-10)
3. Action Priority & Recommended First Responder Unit (e.g. Traffic Safety Team, Pothole Crew, Electrical Services, Emergency Services)
4. Concise Incident Summary
5. Immediate Safety Guidelines for Citizens nearby`;

  const userPrompt = `Incident Report Details:
- Title: ${reportData.title}
- Location / Address: ${reportData.location}
- Hazard Category: ${reportData.category}
- User Description: ${reportData.description}
- Urgency Tag: ${reportData.userUrgency || 'Normal'}
- Reported Impact: ${reportData.impact || 'Not specified'}`;

  return await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], { apiKey, temperature: 0.3 });
}
