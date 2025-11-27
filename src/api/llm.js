/**
 * Formatea el contexto como texto para incluir en el prompt
 * @param {object} context - Objeto de contexto
 * @returns {string} - Contexto formateado como texto
 */
function formatContextForPrompt(context) {
  if (!context || typeof context !== 'object') {
    return '';
  }
  
  const parts = [];
  
  // Editor Text
  if (context.editorText) {
    parts.push('=== TEXTO DEL EDITOR ===');
    parts.push(context.editorText);
    parts.push('');
  }
  
  // Section Feedback
  if (context.sectionFeedback && typeof context.sectionFeedback === 'object') {
    parts.push('=== RETROALIMENTACIÓN DE SECCIONES ===');
    
    Object.keys(context.sectionFeedback).forEach(sectionKey => {
      const section = context.sectionFeedback[sectionKey];
      if (!section || typeof section !== 'object') return;
      
      parts.push(`\n## Sección: ${sectionKey}`);
      
      Object.keys(section).forEach(feedbackTypeKey => {
        const feedbackType = section[feedbackTypeKey];
        if (!feedbackType || typeof feedbackType !== 'object') return;
        
        parts.push(`\n### Tipo de Retroalimentación: ${feedbackTypeKey}`);
        
        if (feedbackType.feedbackTitle) {
          parts.push(`Título: ${feedbackType.feedbackTitle}`);
        }
        if (feedbackType.nro_errores !== undefined && feedbackType.nro_errores !== null) {
          parts.push(`Número de errores: ${feedbackType.nro_errores}`);
        }
        if (feedbackType.feedbackComment) {
          parts.push(`Comentario: ${feedbackType.feedbackComment}`);
        }
        if (feedbackType.negativeFeedback) {
          parts.push(`Feedback negativo: ${feedbackType.negativeFeedback}`);
        }
        if (feedbackType.errorExample) {
          parts.push(`Ejemplo de error: ${feedbackType.errorExample}`);
        }
        if (feedbackType.errorCorrection) {
          parts.push(`Corrección sugerida: ${feedbackType.errorCorrection}`);
        }
        if (feedbackType.errorComment) {
          parts.push(`Comentario del error: ${feedbackType.errorComment}`);
        }
        
        // Extractos HTML de errores
        if (Array.isArray(feedbackType.errorExtracts) && feedbackType.errorExtracts.length > 0) {
          parts.push(`\nExtractos HTML con errores (${feedbackType.errorExtracts.length} encontrados):`);
          feedbackType.errorExtracts.forEach((extract, index) => {
            // Remover tags HTML para hacerlo más legible, pero mantener la estructura
            const cleanExtract = extract
              .replace(/<b><u><b><u>/g, '**')
              .replace(/<\/u><\/b><\/u><\/b>/g, '**')
              .replace(/<b><u>/g, '**')
              .replace(/<\/u><\/b>/g, '**')
              .replace(/<span[^>]*>/g, '')
              .replace(/<\/span>/g, '')
              .replace(/<p[^>]*>/g, '\n')
              .replace(/<\/p>/g, '')
              .replace(/<strong>/g, '**')
              .replace(/<\/strong>/g, '**')
              .replace(/<u>/g, '')
              .replace(/<\/u>/g, '')
              .trim();
            
            parts.push(`\nExtracto ${index + 1}:`);
            parts.push(cleanExtract);
          });
        }
        
        parts.push('');
      });
    });
  }
  
  return parts.join('\n');
}

export async function runPromptBatch({ prompt, models, params, context, correlationId }) {
  const apiBase = process.env.VUE_APP_API_URL || "http://localhost:8000";
  const url = `${apiBase}/api/llm/run-batch`;
  
  // Formatear el contexto como texto
  const contextText = formatContextForPrompt(context);
  
  // Construir el prompt completo con el contexto incluido
  let fullPrompt = prompt;
  if (contextText) {
    fullPrompt = `${contextText}\n\n=== INSTRUCCIONES ===\n${prompt}`;
  }
  
  const body = {
    prompt: fullPrompt,
    models,
    params: {
      temperature: params?.temperature ?? 0.7,
      maxTokens: params?.maxTokens ?? 1024,
    },
    correlationId: correlationId || undefined,
  };
  
  // Validación: asegurar que el contexto se esté pasando
  if (!context || typeof context !== 'object') {
    console.error("[LLM API] ERROR: context is missing or invalid:", context);
  }
  
  // Log del payload completo que se envía
  const bodyString = JSON.stringify(body, null, 2);
  console.log("[LLM API] Request payload:", {
    url,
    hasContext: !!context,
    contextType: context ? typeof context : 'undefined',
    contextKeys: context ? Object.keys(context) : [],
    contextSize: context ? JSON.stringify(context).length : 0,
    contextSchemaVersion: context?.schemaVersion || 'missing',
    hasEditorText: !!context?.editorText,
    hasSectionFeedback: !!context?.sectionFeedback,
    sectionFeedbackKeys: context?.sectionFeedback ? Object.keys(context.sectionFeedback) : [],
    contextTextLength: contextText.length,
    fullPromptLength: fullPrompt.length,
    originalPromptLength: prompt.length,
    fullBodySize: bodyString.length,
  });
  
  // Log del prompt completo para debugging
  console.log("[LLM API] Full prompt with context:", fullPrompt.substring(0, 2000) + (fullPrompt.length > 2000 ? '...' : ''));
  
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


