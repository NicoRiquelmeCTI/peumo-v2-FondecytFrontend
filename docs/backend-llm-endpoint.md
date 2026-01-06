# Backend LLM Orchestrator - API Contract (propuesta)

Objetivo: endpoint de orquestación que ejecute un mismo prompt en múltiples modelos de IA en paralelo, usando contexto del análisis que la app frontend tiene en Vuex.

## Endpoints

1) POST `/api/llm/run-batch`

- Request (JSON):
```json
{
  "prompt": "string - prompt base",
  "models": ["gpt-4.1", "claude-3.5-sonnet"],
  "params": {
    "temperature": 0.7,
    "maxTokens": 1024
  },
  "context": {
    "statistics": {...},          // opcional (objeto libre)
    "editorText": "string",       // opcional
    "sections": {                 // opcional - HTML bruto por sección
      "gerundios": "<p>...</p>",
      "oraciones": "<p>...</p>",
      "parrafos": "<p>...</p>",
      "persona": "<p>...</p>",
      "vozPasiva": "<p>...</p>",
      "conectores": "<p>...</p>",
      "complejidad": "<p>...</p>",
      "lecturabilidad": "<p>...</p>",
      "proposito": "<p>...</p>"
    }
  },
  "correlationId": "opcional - string para trazabilidad"
}
```

- Response (JSON):
```json
{
  "results": {
    "gpt-4.1": {
      "content": "string - respuesta en texto/markdown",
      "usage": { "inputTokens": 0, "outputTokens": 0 }
    },
    "claude-3.5-sonnet": {
      "content": "string",
      "usage": { "inputTokens": 0, "outputTokens": 0 }
    }
  },
  "errors": {
    "some-model": { "code": "UpstreamError", "message": "detalle" }
  },
  "meta": {
    "durationMs": 1234,
    "correlationId": "..."
  }
}
```

### Reglas y consideraciones
- Debe ejecutar los modelos en paralelo y consolidar resultados parciales sin bloquear a los demás ante un fallo (best-effort).
- Sanitizar HTML de `context.sections` si el proveedor no acepta HTML (convertir a texto plano).
- Debe manejar timeouts por modelo (e.g., 30-60 s).
- Autenticación: header `Authorization: Bearer <token>` (si aplica).
- Rate limiting y logging por `correlationId`.
- Errores:
  - HTTP 200 con `errors` por modelo si fallan parcialmente.
  - HTTP 4xx/5xx solo ante fallos globales del orquestador.

## Futuro
- GET `/api/llm/models` → lista de modelos habilitados (con metadatos).
- Webhooks / SSE para streaming de tokens.

## Notas de seguridad
- Nunca exponer API keys de terceros al cliente; el backend debe firmar/encapsular las llamadas.
- Validar tamaño de `prompt` y `context` (límite en KB).

## Integración frontend
- Archivo `src/api/llm.js` llama al endpoint `POST /api/llm/run-batch`.
- Vista `PromptingLab.vue` arma el payload y hace fallback a mocks si el backend no responde.

## Proveedor: OpenRouter (guía rápida)

OpenRouter ofrece un único endpoint compatible con OpenAI para acceder a múltiples modelos (OpenAI, Anthropic, Google, Mistral, etc.) con una sola API key. Ideal para prototipado con créditos/promos.

- Base URL: `https://openrouter.ai/api/v1`
- Endpoint chat: `POST /chat/completions` (esquema OpenAI)
- Headers:
  - `Authorization: Bearer <OPENROUTER_API_KEY>`
  - `HTTP-Referer: https://peumo.org` (o tu dominio) — recomendado por su política
  - `X-Title: PEUMO` — opcional, para analítica

### Mapeo de modelos (ejemplos)
- `gpt-4o-mini` → `openai/gpt-4o-mini`
- `claude-3.5-sonnet` → `anthropic/claude-3.5-sonnet`
- `gemini-2.0-flash` → `google/gemini-2.0-flash`
- `llama-3.1-70b` → `meta-llama/llama-3.1-70b-instruct` (o el id disponible en catálogo)

Consulta el catálogo y los IDs actualizados en: `https://openrouter.ai/models`

### Ejemplo de request (cURL)
```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://peumo.org" \
  -H "X-Title: PEUMO" \
  -d '{
    "model": "anthropic/claude-3.5-sonnet",
    "messages": [
      { "role": "system", "content": "Eres un asistente experto en escritura académica." },
      { "role": "user", "content": "Resume el siguiente texto y sugiere 3 mejoras: ..."}
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }'
```

### Esqueleto del orquestador (Node/TypeScript)
Pseudo‑implementación del `POST /api/llm/run-batch` con fan‑out a OpenRouter:

```ts
import fetch from "node-fetch";

const OPENROUTER_BASE = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

function mapModelToOpenRouter(id: string): string {
  const map: Record<string, string> = {
    "gpt-4o-mini": "openai/gpt-4o-mini",
    "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
    "llama-3.1-70b": "meta-llama/llama-3.1-70b-instruct",
  };
  return map[id] || id; // fallback: ya viene en formato catálogo
}

function buildMessages(prompt: string, context: any) {
  const parts: string[] = [];
  if (context?.statistics) parts.push("ESTADISTICAS:\n" + JSON.stringify(context.statistics));
  if (context?.editorText) parts.push("TEXTO EDITOR:\n" + context.editorText);
  if (context?.sections) {
    // Opcional: convertir HTML a texto o truncar
    parts.push("SECCIONES:\n" + Object.keys(context.sections).join(", "));
  }
  const ctx = parts.join("\n\n");
  return [
    { role: "system", content: "Eres un asistente experto en escritura académica." },
    { role: "user", content: ctx ? `${prompt}\n\n---\nContexto:\n${ctx}` : prompt },
  ];
}

export async function runBatch(req, res) {
  const { prompt, models = [], params = {}, context = {}, correlationId } = req.body || {};
  const results: Record<string, any> = {};
  const errors: Record<string, any> = {};

  await Promise.all(models.map(async (m: string) => {
    const model = mapModelToOpenRouter(m);
    try {
      const r = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": "https://peumo.org",
          "X-Title": "PEUMO"
        },
        body: JSON.stringify({
          model,
          messages: buildMessages(prompt, context),
          temperature: params.temperature ?? 0.7,
          max_tokens: params.maxTokens ?? 1024
        }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`${r.status} ${r.statusText} ${t}`);
      }
      const data = await r.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      results[m] = { content, usage: data?.usage ?? null };
    } catch (e: any) {
      errors[m] = { code: "UpstreamError", message: String(e?.message ?? e) };
    }
  }));

  res.json({
    results,
    errors,
    meta: { durationMs: 0, correlationId: correlationId || null }
  });
}
```

### Seguridad y límites
- Guarda `OPENROUTER_API_KEY` en el gestor de secretos (no en el cliente).
- Rechaza prompts/contexto excesivos (p. ej., > 50 KB).
- Loggea `correlationId` y errores por modelo; no loggear texto sensible en producción.


