<template>
  <div id="PromptingLab" class="plab">
    <header class="plab-header">
      <div class="header-row">
        <div class="header-left">
          <img src="@/assets/imag/v1/logos/logo_main.svg" alt="PEUMO" class="header-logo">
          <span class="brand-name">PEUMO</span>
        </div>
        <div class="header-right">
          <router-link to="/dashboard" class="back-btn">Volver al editor</router-link>
        </div>
      </div>
      <h1 class="title">Prompting Lab</h1>
      <p class="subtitle">Prueba prompts en paralelo con distintos modelos usando el análisis actual como contexto</p>
    </header>

    <div class="plab-layout">
      <!-- Sidebar -->
      <aside class="plab-sidebar">
        <div class="section">
          <h3 class="section-title">Modelos</h3>
          <label class="checkbox"><input type="checkbox" v-model="selectedModels" value="openai/gpt-oss-20b:free" /> openai/gpt-oss-20b (free)</label>
          <label class="checkbox"><input type="checkbox" v-model="selectedModels" value="x-ai/grok-4.1-fast:free" /> x-ai/grok-4.1-fast (free)</label>
          <div class="custom-models">
            <input
              class="custom-input"
              v-model="customModelInput"
              placeholder="vendor/model-id[:tier]"
            />
            <button class="custom-add" @click="addCustomModel">Agregar</button>
          </div>
          <div v-if="customModels.length" class="custom-list">
            <div class="custom-title">Modelos personalizados</div>
            <label class="checkbox" v-for="cm in customModels" :key="cm">
              <input type="checkbox" v-model="selectedModels" :value="cm" />
              {{ cm }}
            </label>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Contexto a adjuntar</h3>
          <label class="checkbox"><input type="checkbox" v-model="ctx.includeEditorText" /> Texto del editor</label>
          
          <div class="subsection-title">Secciones a incluir</div>
          <div class="settings-matrix">
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.gerundios" /> Gerundios</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.oraciones" /> Oraciones</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.parrafos" /> Párrafos</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.persona" /> Persona</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.vozPasiva" /> Voz Pasiva</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.conectores" /> Conectores</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.complejidad" /> Complejidad</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.lecturabilidad" /> Lecturabilidad</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachSections.proposito" /> Propósito</label>
          </div>
          
          <div class="subsection-title">Campos de tipos de retroalimentación</div>
          <div class="settings-matrix">
            <label class="checkbox-item"><input type="checkbox" v-model="attachTipoFields.feedbackTitle" /> feedbackTitle</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachTipoFields.feedbackComment" /> feedbackComment</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachTipoFields.negativeFeedback" /> negativeFeedback</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachTipoFields.errorExample" /> errorExample</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachTipoFields.errorCorrection" /> errorCorrection</label>
            <label class="checkbox-item"><input type="checkbox" v-model="attachTipoFields.errorComment" /> errorComment</label>
          </div>
          <p class="context-note">Nota: Solo se incluirán tipos de retroalimentación con errores detectados (nro_errores > 0). Los extractos HTML de errores se incluyen automáticamente.</p>
        </div>

        <div class="section">
          <h3 class="section-title">Parámetros</h3>
          <label class="field">
            <span>Temperatura</span>
            <input type="number" min="0" max="2" step="0.1" v-model.number="params.temperature" />
          </label>
          <label class="field">
            <span>Max tokens</span>
            <input type="number" min="64" max="4096" step="32" v-model.number="params.maxTokens" />
          </label>
        </div>
      </aside>

      <!-- Main -->
      <main class="plab-main">
        <section class="section">
          <h3 class="section-title">Prompt</h3>
          <textarea
            v-model="prompt"
            class="prompt-input"
            placeholder="Escribe aquí tu prompt. Ej: Resume el siguiente texto y genera 3 preguntas..."
          ></textarea>
          <div class="actions">
            <button class="run-btn" :disabled="!canRun" @click="runAll">Ejecutar en modelos seleccionados</button>
            <button class="copy-btn" :disabled="!prompt" @click="copyPrompt">Copiar prompt</button>
          </div>
          <details class="context-preview" v-if="hasAnyContext">
            <summary>Vista previa del contexto que se adjuntará</summary>
            <pre class="context-block">{{ contextPreview }}</pre>
            <div class="subsection-title">Payload JSON</div>
            <pre class="context-block">{{ contextPayloadJson }}</pre>
          </details>
        </section>

        <section class="section">
          <h3 class="section-title">Resultados</h3>
          <div class="results-grid">
            <div class="result-card" v-for="m in selectedModels" :key="m">
              <div class="result-header">
                <span class="model-chip">{{ m }}</span>
                <span class="status-chip" :class="statusClass(runStatus[m])">
                  {{ statusLabel(runStatus[m]) }}
                </span>
              </div>
              <div class="result-body">
                <div v-if="runStatus[m] === 'running'" class="loading">Generando respuesta...</div>
                <div v-else-if="results[m]" class="answer" v-html="results[m]"></div>
                <div v-else-if="runStatus[m] === 'error'" class="error">Ocurrió un error generando la respuesta.</div>
                <div v-else class="placeholder">Selecciona Ejecutar para correr este modelo.</div>
              </div>
              <div class="result-actions">
                <button class="small" :disabled="!results[m]" @click="copyResult(m)">Copiar</button>
                <button class="small" :disabled="!results[m]" @click="downloadResult(m)">Descargar (.txt)</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { runPromptBatch } from "@/api/llm.js";
export default {
  name: "PromptingLab",
  data() {
    return {
      prompt: "",
      selectedModels: [],
      params: {
        temperature: 0.7,
        maxTokens: 1024
      },
      ctx: {
        includeEditorText: false
      },
      runStatus: {}, // model -> 'idle' | 'running' | 'done' | 'error'
      results: {}, // model -> html
      customModelInput: "",
      customModels: JSON.parse(localStorage.getItem('peumo.plab.customModels') || "[]"),
      attachSections: {
        gerundios: true,
        oraciones: true,
        parrafos: true,
        persona: true,
        vozPasiva: true,
        conectores: true,
        complejidad: true,
        lecturabilidad: true,
        proposito: true,
      },
      attachTipoFields: {
        feedbackTitle: false,
        feedbackComment: false,
        negativeFeedback: false,
        errorExample: false,
        errorCorrection: false,
        errorComment: false,
        nro_errores: false,
      }
    };
  },
  computed: {
    canRun() {
      return this.prompt && this.prompt.trim().length > 0 && this.selectedModels.length > 0;
    },
    hasAnyContext() {
      // Verificar si hay secciones seleccionadas o texto del editor
      const hasSections = Object.values(this.attachSections).some(Boolean);
      return hasSections || this.ctx.includeEditorText;
    },
    contextPreview() {
      const s = this.$store.state || {};
      const parts = [];
      
      // Texto del editor
      if (this.ctx.includeEditorText && s.textoEditor) {
        const editorText = String(s.textoEditor).replace(/<[^>]+>/g, '');
        const preview = editorText.slice(0, 1500) + (editorText.length > 1500 ? '…' : '');
        parts.push(`# Texto del editor\n${preview}`);
      }
      
      // Secciones de feedback (solo las seleccionadas)
      const sections = [
        { key: 'gerundios', name: 'Gerundios', data: s.gerundios },
        { key: 'oraciones', name: 'Oraciones', data: s.oraciones },
        { key: 'parrafos', name: 'Párrafos', data: s.parrafos },
        { key: 'persona', name: 'Persona', data: s.persona },
        { key: 'vozPasiva', name: 'Voz Pasiva', data: s.vozPasiva },
        { key: 'conectores', name: 'Conectores', data: s.conectores },
        { key: 'complejidad', name: 'Complejidad', data: s.complejidad },
        { key: 'lecturabilidad', name: 'Lecturabilidad', data: s.lecturabilidad },
        { key: 'proposito', name: 'Propósito', data: s.proposito }
      ];
      
      const sectionBlocks = [];
      sections.forEach(({ key, name, data }) => {
        if (!this.attachSections[key] || !data) return;
        
        const tiposRetroalimentacion = data.tiposRetroalimentacion;
        if (!tiposRetroalimentacion || typeof tiposRetroalimentacion !== 'object') return;
        
        const feedbackBlocks = [];
        Object.keys(tiposRetroalimentacion).forEach(ruleKey => {
          const feedbackType = tiposRetroalimentacion[ruleKey];
          if (!feedbackType) return;
          
          // Solo mostrar si hay errores
          const nroErrores = feedbackType.nro_errores;
          const hasErrors = nroErrores !== null && nroErrores !== undefined && nroErrores > 0;
          if (!hasErrors) return;
          
          const lines = [];
          if (feedbackType.feedbackTitle) {
            lines.push(`**${feedbackType.feedbackTitle}**`);
          }
          if (feedbackType.nro_errores) {
            lines.push(`Errores detectados: ${feedbackType.nro_errores}`);
          }
          if (feedbackType.negativeFeedback) {
            lines.push(`Feedback: ${feedbackType.negativeFeedback.slice(0, 200)}${feedbackType.negativeFeedback.length > 200 ? '…' : ''}`);
          }
          
          if (lines.length > 0) {
            feedbackBlocks.push(`### ${ruleKey}\n${lines.join('\n')}`);
          }
        });
        
        if (feedbackBlocks.length > 0) {
          sectionBlocks.push(`## ${name}\n${feedbackBlocks.join('\n\n')}`);
        }
      });
      
      if (sectionBlocks.length > 0) {
        parts.push(`# Section Feedback\n${sectionBlocks.join('\n\n')}`);
      }
      
      return parts.join('\n\n') || 'Sin contexto seleccionado.';
    },
    contextPayloadJson() {
      try {
        return JSON.stringify(this.buildContextPayload(), null, 2);
      } catch (e) {
        return "(error construyendo payload)";
      }
    }
  },
  methods: {
    copyPrompt() {
      navigator.clipboard.writeText(this.prompt).catch(() => {});
    },
    addCustomModel() {
      const val = (this.customModelInput || "").trim();
      if (!val) return;
      if (!this.customModels.includes(val)) {
        this.customModels.push(val);
        try {
          localStorage.setItem('peumo.plab.customModels', JSON.stringify(this.customModels));
        } catch (e) { void 0; }
      }
      if (!this.selectedModels.includes(val)) {
        this.selectedModels.push(val);
      }
      this.customModelInput = "";
    },
    statusClass(st) {
      return {
        idle: st === 'idle',
        running: st === 'running',
        done: st === 'done',
        error: st === 'error'
      };
    },
    statusLabel(st) {
      switch (st) {
        case 'running': return 'Ejecutando';
        case 'done': return 'Listo';
        case 'error': return 'Error';
        default: return 'En espera';
      }
    },
    buildContextPreview() {
      // Construye vista previa como string
      return this.contextPreview;
    },
    sectionErrorCount(name, section) {
      try {
        switch (name) {
          case "Gerundios":
            return section?.tiposRetroalimentacion?.gerundiosExcesivos?.nro_errores ?? null;
          case "Oraciones":
            return (section?.tiposRetroalimentacion?.oracionesExtensas?.nro_errores ?? 0)
              + (section?.tiposRetroalimentacion?.oracionesBreves?.nro_errores ?? 0);
          case "Párrafos":
            return (section?.tiposRetroalimentacion?.parrafosExtensos?.nro_errores ?? 0)
              + (section?.tiposRetroalimentacion?.parrafosBreves?.nro_errores ?? 0);
          case "Persona":
            return (section?.tiposRetroalimentacion?.primeraPersonaSingular?.nro_errores ?? 0)
              + (section?.tiposRetroalimentacion?.segundaPersonaSingular?.nro_errores ?? 0);
          case "Voz Pasiva":
            return section?.tiposRetroalimentacion?.vozPasiva?.nro_errores ?? null;
          case "Conectores":
            return (section?.tiposRetroalimentacion?.ausenciaConectores?.nro_errores ?? 0)
              + (section?.tiposRetroalimentacion?.conectoresRepetidos?.nro_errores ?? 0);
          case "Complejidad":
            return section?.tiposRetroalimentacion?.complejidad?.nro_errores ?? null;
          case "Lecturabilidad":
            // sumatoria de categorías si existieran
            return (section?.tiposRetroalimentacion?.dificil?.nro_errores ?? 0)
              + (section?.tiposRetroalimentacion?.algoDificil?.nro_errores ?? 0)
              + (section?.tiposRetroalimentacion?.normal?.nro_errores ?? 0)
              + (section?.tiposRetroalimentacion?.algoFacil?.nro_errores ?? 0)
              + (section?.tiposRetroalimentacion?.facil?.nro_errores ?? 0);
          case "Propósito":
            return null; // opcional según tus datos
          default:
            return null;
        }
      } catch {
        return null;
      }
    },
    /**
     * Extrae los párrafos/oraciones que contienen errores destacados del HTML
     * @param {string} html - HTML de la sección
     * @returns {Array<string>} - Array de extractos HTML con errores
     */
    extractErrorHtml(html) {
      if (!html || typeof html !== 'string') {
        console.log('[PromptingLab] extractErrorHtml: No HTML provided');
        return [];
      }
      
      try {
        // Crear un elemento temporal para parsear el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const extracts = [];
        const seen = new Set(); // Para evitar duplicados
        
        // ESTRATEGIA 1: Buscar spans con background-color en style (formato del backend)
        // Ejemplo: <span style="background-color:#FFAFAF;">...</span>
        const errorSpans = tempDiv.querySelectorAll('span[style*="background-color"]');
        console.log(`[PromptingLab] extractErrorHtml: Found ${errorSpans.length} spans with background-color`);
        
        errorSpans.forEach(span => {
          // Obtener el párrafo padre que contiene el error
          const parentParagraph = span.closest('p');
          if (parentParagraph) {
            const paragraphHtml = parentParagraph.outerHTML;
            // Usar un hash más completo para evitar duplicados
            const htmlHash = paragraphHtml.substring(0, 300);
            if (!seen.has(htmlHash)) {
              seen.add(htmlHash);
              extracts.push(paragraphHtml);
            }
          } else {
            // Si el span no está dentro de un párrafo, incluir el span completo
            // pero intentar encontrar el párrafo más cercano
            let currentElement = span.parentElement;
            while (currentElement && currentElement.tagName !== 'P' && currentElement !== tempDiv) {
              currentElement = currentElement.parentElement;
            }
            if (currentElement && currentElement.tagName === 'P') {
              const paragraphHtml = currentElement.outerHTML;
              const htmlHash = paragraphHtml.substring(0, 300);
              if (!seen.has(htmlHash)) {
                seen.add(htmlHash);
                extracts.push(paragraphHtml);
              }
            } else {
              // Si no hay párrafo padre, incluir el span completo con contexto
              const spanHtml = span.outerHTML;
              const htmlHash = spanHtml.substring(0, 300);
              if (!seen.has(htmlHash)) {
                seen.add(htmlHash);
                extracts.push(spanHtml);
              }
            }
          }
        });
        
        // ESTRATEGIA 2: Buscar párrafos que contengan elementos destacados (b, u, strong)
        // cuando están dentro de spans con background-color
        if (extracts.length === 0) {
          const paragraphs = tempDiv.querySelectorAll('p');
          console.log(`[PromptingLab] extractErrorHtml: Checking ${paragraphs.length} paragraphs for highlighted content`);
          
          paragraphs.forEach(p => {
            // Buscar spans con background-color dentro del párrafo
            const hasErrorSpan = p.querySelector('span[style*="background-color"]');
            // Buscar elementos b, u, strong que puedan indicar palabras destacadas
            const hasHighlightedWords = p.querySelector('b, u, strong');
            
            if (hasErrorSpan || hasHighlightedWords) {
              const paragraphHtml = p.outerHTML;
              const htmlHash = paragraphHtml.substring(0, 300);
              if (!seen.has(htmlHash)) {
                seen.add(htmlHash);
                extracts.push(paragraphHtml);
              }
            }
          });
        }
        
        // ESTRATEGIA 3: Buscar párrafos con clases de error (formato legacy)
        const paragraphsWithClasses = tempDiv.querySelectorAll('p.bg-red, p.bg-yellow, p.bg-orange, p.bg-blue, p.bg-lightgreen, p[class*="bg-"]');
        paragraphsWithClasses.forEach(p => {
          const paragraphHtml = p.outerHTML;
          const htmlHash = paragraphHtml.substring(0, 300);
          if (!seen.has(htmlHash)) {
            seen.add(htmlHash);
            extracts.push(paragraphHtml);
          }
        });
        
        // ESTRATEGIA 4: Buscar spans con clase highlight (formato alternativo)
        const highlightSpans = tempDiv.querySelectorAll('span.highlight, span[class*="highlight"]');
        highlightSpans.forEach(span => {
          const parentParagraph = span.closest('p');
          if (parentParagraph) {
            const paragraphHtml = parentParagraph.outerHTML;
            const htmlHash = paragraphHtml.substring(0, 300);
            if (!seen.has(htmlHash)) {
              seen.add(htmlHash);
              extracts.push(paragraphHtml);
            }
          }
        });
        
        console.log(`[PromptingLab] extractErrorHtml: Final result - Found ${extracts.length} error extracts`);
        if (extracts.length > 0) {
          console.log('[PromptingLab] extractErrorHtml: Sample extract:', extracts[0].substring(0, 200));
        } else {
          console.warn('[PromptingLab] extractErrorHtml: No extracts found. HTML sample:', html.substring(0, 1000));
        }
        
        return extracts;
      } catch (error) {
        console.warn('[PromptingLab] Error extracting HTML extracts:', error);
        return [];
      }
    },
    buildContextPayload() {
      // Construye contexto estructurado para backend (Schema v3)
      const s = this.$store.state || {};
      const ctx = { 
        schemaVersion: 3  // Nueva versión del schema
      };
      
      const stripHtml = (t) => String(t || "").replace(/<[^>]+>/g, '');
      const MAX_EDITOR_CHARS = 2000;
      
      // 1. Editor Text (opcional, sanitizado)
      if (this.ctx.includeEditorText && s.textoEditor) {
        ctx.editorText = stripHtml(s.textoEditor);
        // Truncar si es muy largo
        if (ctx.editorText.length > MAX_EDITOR_CHARS) {
          ctx.editorText = ctx.editorText.slice(0, MAX_EDITOR_CHARS) + '…';
        }
      }
      
      // 2. Section Feedback (estructura principal)
      ctx.sectionFeedback = {};
      
      // Secciones disponibles
      const sections = [
        { key: 'gerundios', name: 'Gerundios', data: s.gerundios },
        { key: 'oraciones', name: 'Oraciones', data: s.oraciones },
        { key: 'parrafos', name: 'Párrafos', data: s.parrafos },
        { key: 'persona', name: 'Persona', data: s.persona },
        { key: 'vozPasiva', name: 'Voz Pasiva', data: s.vozPasiva },
        { key: 'conectores', name: 'Conectores', data: s.conectores },
        { key: 'complejidad', name: 'Complejidad', data: s.complejidad },
        { key: 'lecturabilidad', name: 'Lecturabilidad', data: s.lecturabilidad },
        { key: 'proposito', name: 'Propósito', data: s.proposito }
      ];
      
      sections.forEach(({ key, data }) => {
        // Solo procesar si la sección está seleccionada y tiene datos
        if (!this.attachSections[key] || !data) return;
        
        const tiposRetroalimentacion = data.tiposRetroalimentacion;
        if (!tiposRetroalimentacion || typeof tiposRetroalimentacion !== 'object') return;
        
        ctx.sectionFeedback[key] = {};
        
        // Iterar sobre cada tipo de retroalimentación
        Object.keys(tiposRetroalimentacion).forEach(ruleKey => {
          const feedbackType = tiposRetroalimentacion[ruleKey];
          if (!feedbackType) return;
          
          // VALIDACIÓN: Solo incluir si hay errores detectados
          const nroErrores = feedbackType.nro_errores;
          const hasErrors = nroErrores !== null && nroErrores !== undefined && nroErrores > 0;
          
          // Si no hay errores, saltar este tipo de retroalimentación
          if (!hasErrors) return;
          
          // Construir el objeto de feedback
          const feedbackObj = {};
          
          // Incluir campos según configuración
          if (this.attachTipoFields.feedbackTitle && feedbackType.feedbackTitle) {
            feedbackObj.feedbackTitle = feedbackType.feedbackTitle;
          }
          if (this.attachTipoFields.feedbackComment && feedbackType.feedbackComment) {
            feedbackObj.feedbackComment = feedbackType.feedbackComment;
          }
          if (this.attachTipoFields.negativeFeedback && feedbackType.negativeFeedback) {
            feedbackObj.negativeFeedback = feedbackType.negativeFeedback;
          }
          if (this.attachTipoFields.errorExample && feedbackType.errorExample) {
            feedbackObj.errorExample = feedbackType.errorExample;
          }
          if (this.attachTipoFields.errorCorrection && feedbackType.errorCorrection) {
            feedbackObj.errorCorrection = feedbackType.errorCorrection;
          }
          if (this.attachTipoFields.errorComment && feedbackType.errorComment) {
            feedbackObj.errorComment = feedbackType.errorComment;
          }
          
          // Siempre incluir nro_errores si está disponible (ya validamos que > 0)
          if (typeof nroErrores !== 'undefined') {
            feedbackObj.nro_errores = nroErrores;
          }
          
          // Extraer extractos HTML de errores solo si hay errores
          // Siempre incluir errorExtracts cuando hay errores, incluso si está vacío
          // para que aparezca en la previsualización
          if (data.html && nroErrores > 0) {
            const errorExtracts = this.extractErrorHtml(data.html);
            // Incluir siempre, incluso si está vacío, para debugging
            feedbackObj.errorExtracts = errorExtracts;
            console.log(`[PromptingLab] Added errorExtracts for ${key}.${ruleKey}:`, {
              count: errorExtracts.length,
              hasHtml: !!data.html,
              nroErrores: nroErrores
            });
          }
          
          // Solo agregar si el objeto tiene al menos un campo
          if (Object.keys(feedbackObj).length > 0) {
            ctx.sectionFeedback[key][ruleKey] = feedbackObj;
          }
        });
        
        // Eliminar sección si está vacía
        if (Object.keys(ctx.sectionFeedback[key]).length === 0) {
          delete ctx.sectionFeedback[key];
        }
      });
      
      return ctx;
    },
    async runAll() {
      const ctxPayload = this.buildContextPayload();
      const models = [...this.selectedModels];
      models.forEach(m => {
        this.$set(this.runStatus, m, 'running');
        this.$set(this.results, m, '');
      });
      // Logs de diagnóstico
      try {
        const approx = JSON.stringify(ctxPayload).length;
        const editorLen = (ctxPayload.editorText || "").length || 0;
        const sectionFeedbackKeys = ctxPayload.sectionFeedback ? Object.keys(ctxPayload.sectionFeedback) : [];
        
        // Contar tipos de feedback y extractos
        let totalFeedbackTypes = 0;
        let totalExtracts = 0;
        if (ctxPayload.sectionFeedback) {
          Object.values(ctxPayload.sectionFeedback).forEach(section => {
            if (section && typeof section === 'object') {
              Object.values(section).forEach(feedbackType => {
                if (feedbackType && typeof feedbackType === 'object') {
                  totalFeedbackTypes++;
                  if (Array.isArray(feedbackType.errorExtracts)) {
                    totalExtracts += feedbackType.errorExtracts.length;
                  }
                }
              });
            }
          });
        }
        
        // eslint-disable-next-line no-console
        console.log("[PromptingLab] Context payload summary", {
          schemaVersion: ctxPayload.schemaVersion,
          approxBytes: approx,
          hasEditorText: !!ctxPayload.editorText,
          editorChars: editorLen,
          hasSectionFeedback: !!ctxPayload.sectionFeedback,
          sectionFeedbackKeys,
          totalFeedbackTypes,
          totalExtracts
        });
        
        // Log del payload JSON completo que se enviará
        const payloadJson = JSON.stringify(ctxPayload, null, 2);
        // eslint-disable-next-line no-console
        console.log("[PromptingLab] Full context payload JSON:", payloadJson);
        
        // Verificación: comparar con el payload mostrado en la UI
        const uiPayloadJson = this.contextPayloadJson;
        if (payloadJson !== uiPayloadJson) {
          // eslint-disable-next-line no-console
          console.warn("[PromptingLab] WARNING: Payload JSON differs from UI preview!");
          // eslint-disable-next-line no-console
          console.log("[PromptingLab] UI payload:", uiPayloadJson);
          // eslint-disable-next-line no-console
          console.log("[PromptingLab] Actual payload:", payloadJson);
        } else {
          // eslint-disable-next-line no-console
          console.log("[PromptingLab] ✓ Payload JSON matches UI preview");
        }
        
        // Validación: asegurar que el contexto no esté vacío
        if (!ctxPayload.sectionFeedback || Object.keys(ctxPayload.sectionFeedback).length === 0) {
          // eslint-disable-next-line no-console
          console.warn("[PromptingLab] WARNING: sectionFeedback is empty! Check if sections are selected and have errors.");
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("[PromptingLab] Context log error", e);
      }
      // Intento vía backend
      try {
        // Validación: asegurar que el contexto se esté pasando
        if (!ctxPayload || (typeof ctxPayload !== 'object')) {
          console.error("[PromptingLab] ERROR: ctxPayload is invalid:", ctxPayload);
          throw new Error("Context payload is invalid");
        }
        
        // Validar que el contexto tenga al menos schemaVersion
        if (!ctxPayload.schemaVersion) {
          console.warn("[PromptingLab] WARNING: ctxPayload missing schemaVersion, adding default");
          ctxPayload.schemaVersion = 3;
        }
        
        console.log("[PromptingLab] Sending request with context:", {
          schemaVersion: ctxPayload.schemaVersion,
          hasEditorText: !!ctxPayload.editorText,
          hasSectionFeedback: !!ctxPayload.sectionFeedback,
          sectionFeedbackKeys: ctxPayload.sectionFeedback ? Object.keys(ctxPayload.sectionFeedback) : []
        });
        
        const response = await runPromptBatch({
          prompt: this.prompt,
          models,
          params: this.params,
          context: ctxPayload,
        });
        // Respuesta esperada: { results: { [model]: { content: string } }, errors?: { [model]: { message, code } } }
        const results = response?.results || {};
        const errors = response?.errors || {};
        await this.ensureMarked();
        models.forEach((model) => {
          if (results[model]?.content) {
            const html = this.renderMarkdown(results[model].content);
            this.$set(this.results, model, html);
            this.$set(this.runStatus, model, 'done');
          } else if (errors[model]) {
            const md = this.formatErrorMarkdown(model, errors[model]);
            this.$set(this.results, model, this.renderMarkdown(md));
            this.$set(this.runStatus, model, 'error');
          } else {
            this.$set(this.results, model, this.escape("Sin respuesta del backend."));
            this.$set(this.runStatus, model, 'error');
          }
        });
      } catch (err) {
        // Sin fallback mock: mostrar error para cada modelo
        models.forEach((model) => {
          this.$set(this.results, model, this.escape("Error al conectar con el backend."));
          this.$set(this.runStatus, model, 'error');
        });
      }
    },
    ensureMarked() {
      return new Promise((resolve, reject) => {
        if (window.marked && window.marked.parse) return resolve(window.marked);
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
        script.async = true;
        script.onload = () => resolve(window.marked);
        script.onerror = () => reject(new Error("No se pudo cargar marked"));
        document.head.appendChild(script);
      });
    },
    renderMarkdown(text) {
      try {
        if (window.marked && window.marked.parse) {
          return window.marked.parse(String(text || ""));
        }
      } catch (e) {
        void 0;
      }
      // Fallback mínimo
      return this.escape(String(text || "")).replace(/\n/g, "<br>");
    },
    formatErrorMarkdown(model, err) {
      const info = typeof err === "object" && err ? err : { message: String(err) };
      const lines = [
        `### Error en ${model}`,
        info.code ? `- code: ${info.code}` : null,
        info.status ? `- status: ${info.status}` : null,
        info.provider ? `- provider: ${info.provider}` : null,
        info.message ? `- message: ${info.message}` : null
      ].filter(Boolean);
      // Extrae JSON embebido en message (caso OpenRouter)
      const embedded = this.extractJsonFromString(info.message || "");
      const raw =
        info.raw ||
        info.body ||
        info.responseBody ||
        info.text ||
        info.details ||
        (embedded ? embedded : null);
      let rawBlock = "";
      if (raw) {
        try {
          const maybeObj = typeof raw === "string" ? JSON.parse(raw) : raw;
          rawBlock = `\n\n\`\`\`json\n${JSON.stringify(maybeObj, null, 2)}\n\`\`\``;
        } catch {
          rawBlock = `\n\n\`\`\`\n${String(raw)}\n\`\`\``;
        }
      } else {
        rawBlock = `\n\n#### Detalle\n\`\`\`json\n${JSON.stringify(info, null, 2)}\n\`\`\``;
      }
      // Sugerencias si es 429 (rate limit)
      const codeNum =
        (typeof info.status === "number" && info.status) ||
        (embedded && embedded.error && embedded.error.code) ||
        null;
      const tip = (codeNum === 429 || /429/.test(String(info.message || "")))
        ? "\n\n> Sugerencia: El proveedor está rate-limited. Reintenta luego o agrega tu propia key en OpenRouter: <https://openrouter.ai/settings/integrations>"
        : "";
      return `${lines.join("\n")}${rawBlock}${tip}`;
    },
    extractJsonFromString(str) {
      try {
        if (!str || typeof str !== "string") return null;
        const start = str.indexOf("{");
        const end = str.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
          const slice = str.slice(start, end + 1);
          return JSON.parse(slice);
        }
        return null;
      } catch (e) {
        return null;
      }
    },
    copyResult(model) {
      const plain = this.results[model] ? this.results[model].replace(/<[^>]+>/g, '') : '';
      if (!plain) return;
      navigator.clipboard.writeText(plain).catch(() => {});
    },
    downloadResult(model) {
      const plain = this.results[model] ? this.results[model].replace(/<[^>]+>/g, '') : '';
      if (!plain) return;
      const blob = new Blob([plain], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${model.replace(/[^a-z0-9._-]+/gi, '-')}-result.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    escape(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>");
    }
  }
};
</script>

<style scoped>
.plab {
  min-height: 100vh;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
}
.plab-header {
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.header-logo {
  width: 28px;
  height: 28px;
}
.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}
.back-btn {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-primary);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}
.back-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}
.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}
.subtitle {
  margin: 0.25rem 0 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.plab-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  min-height: 0;
}
.plab-sidebar {
  background: var(--surface-color);
  border-right: 1px solid var(--border-color);
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
}
.plab-main {
  min-width: 0;
  padding: 1rem 1.5rem;
  overflow-y: auto;
}
.section {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1rem;
}
.section-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
  color: var(--text-primary);
  font-weight: 600;
}
.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}
.subsection-title {
  margin: 0.5rem 0 0.25rem 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
}
.context-note {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: var(--background-color);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}
.settings-matrix {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  width: 100%;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  flex-wrap: wrap;
  white-space: normal;
  word-break: break-word;
}
.custom-models {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 100%;
}
.custom-input {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-primary);
  min-width: 0; /* permite que el input en flex se encoja y no desborde */
}
.custom-add {
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  flex: 0 0 auto;
}
.custom-list {
  margin-top: 0.5rem;
}
.custom-title {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.field input {
  width: 120px;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-primary);
}
.prompt-input {
  width: 100%;
  min-height: 120px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  resize: vertical;
  background: #fff;
  color: var(--text-primary);
}
.actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}
.run-btn {
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.run-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.copy-btn {
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--text-primary);
  font-weight: 700;
  cursor: pointer;
}
.context-preview {
  margin-top: 0.75rem;
}
.context-block {
  margin: 0.5rem 0 0 0;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--text-primary);
  max-height: 280px;
  overflow: auto;
  white-space: pre-wrap;
}
.results-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.result-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-color);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.model-chip {
  font-weight: 700;
  color: var(--primary-color);
}
.status-chip {
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.status-chip.running {
  color: #fff;
  background: var(--primary-color);
  border-color: var(--primary-color);
}
.status-chip.done {
  color: #0a7f2e;
  background: #e6f6ec;
  border-color: #b7e4c7;
}
.status-chip.error {
  color: #b00020;
  background: #fdecef;
  border-color: #f3c2cb;
}
.result-body {
  flex: 1;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  overflow: auto;
}
.placeholder {
  color: var(--text-secondary);
}
.loading {
  color: var(--text-secondary);
  font-style: italic;
}
.error {
  color: #b00020;
}
.answer {
  color: var(--text-primary);
  white-space: pre-wrap;
}
.result-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}
.result-actions .small {
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--background-color);
  cursor: pointer;
  font-weight: 600;
}
@media (max-width: 1024px) {
  .plab-layout {
    grid-template-columns: 1fr;
  }
}
</style>


