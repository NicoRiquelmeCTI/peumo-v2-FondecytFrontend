export async function runPromptBatch({ prompt, models, params, context, correlationId }) {
  const apiBase = process.env.VUE_APP_API_URL || "http://localhost:8000";
  const url = `${apiBase}/api/llm/run-batch`;
  const body = {
    prompt,
    models,
    params: {
      temperature: params?.temperature ?? 0.7,
      maxTokens: params?.maxTokens ?? 1024,
    },
    context, // structured context object
    correlationId: correlationId || undefined,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM run-batch failed: ${res.status} ${res.statusText} ${text}`);
  }
  return await res.json();
}


