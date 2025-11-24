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


