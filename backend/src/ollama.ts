// Thin client for a self-hosted Ollama server — the model runs on the same
// machine that hosts this app, reached over the Docker bridge network via
// OLLAMA_BASE_URL (host.docker.internal from inside the backend container;
// see docker-compose.yml's extra_hosts entry). No API key: Ollama's HTTP
// API is unauthenticated, so this is only appropriate for a trusted host.
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://host.docker.internal:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

export class OllamaError extends Error {}

interface OllamaChatResponse {
  message?: { content?: string };
}

export async function askOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });
  } catch (err) {
    throw new OllamaError(
      `Could not reach Ollama at ${OLLAMA_BASE_URL}. Confirm Ollama is running on the host and OLLAMA_BASE_URL is set correctly.`
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new OllamaError(`Ollama returned an error (${res.status}): ${body || res.statusText}`);
  }

  const data = (await res.json()) as OllamaChatResponse;
  const answer = data.message?.content?.trim();
  if (!answer) {
    throw new OllamaError("Ollama returned an empty response.");
  }
  return answer;
}
