<template>
  <div id="PanelDerecho" class="panel-derecho">
    <div class="container">
      <header class="panel-header">
        <h2 class="panel-title">Panel</h2>
        <p class="panel-subtitle">Análisis y asistente de escritura</p>
      </header>
      <!-- Analysis Tab -->
      <div class="analysis-wrap">
          <TabRetroalimentacion />
        </div>
      <!-- Legacy Chat Tab (hidden, kept for reference) -->
      <div v-show="false" class="chat">
        <div class="chat-messages" ref="messages">
          <div
            v-for="(m, idx) in messages"
            :key="idx"
            :class="['message', m.role]"
          >
            <div class="bubble" v-html="m.content"></div>
          </div>
          <div v-if="isLoading" class="typing">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        <div class="chat-input">
          <div class="input-wrap">
            <textarea
              v-model="input"
              class="input"
              placeholder="Escribe tu consulta sobre el texto…"
              @keydown.enter.exact.prevent="send"
            ></textarea>
          </div>
          <div class="controls">
            <div class="settings" :class="{ open: showSettings }">
              <button class="settings-btn" @click="showSettings = !showSettings" title="Configuración">
                ⚙️
              </button>
              <div v-if="showSettings" class="settings-popup">
                <div class="settings-section">
                  <h4 class="settings-section-title">Contexto a adjuntar</h4>
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="attachAnalysis" />
                      <span>Adjuntar resultados del análisis</span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="ctx.includeEditorText" />
                      <span>Texto del editor</span>
                    </label>
                  </div>
                  
                  <div v-if="attachAnalysis" class="subsection-title">Secciones a incluir</div>
                  <div v-if="attachAnalysis" class="settings-matrix">
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.gerundios" />
                      <span>Gerundios</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.oraciones" />
                      <span>Oraciones</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.parrafos" />
                      <span>Párrafos</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.persona" />
                      <span>Persona</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.vozPasiva" />
                      <span>Voz Pasiva</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.conectores" />
                      <span>Conectores</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.complejidad" />
                      <span>Complejidad</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.lecturabilidad" />
                      <span>Lecturabilidad</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachSections.proposito" />
                      <span>Propósito</span>
                    </label>
                  </div>
                  
                  <div v-if="attachAnalysis" class="subsection-title">Campos de tipos de retroalimentación</div>
                  <div v-if="attachAnalysis" class="settings-matrix">
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachTipoFields.feedbackTitle" />
                      <span>feedbackTitle</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachTipoFields.feedbackComment" />
                      <span>feedbackComment</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachTipoFields.negativeFeedback" />
                      <span>negativeFeedback</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachTipoFields.errorExample" />
                      <span>errorExample</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachTipoFields.errorCorrection" />
                      <span>errorCorrection</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" v-model="attachTipoFields.errorComment" />
                      <span>errorComment</span>
                    </label>
                  </div>
                  <p v-if="attachAnalysis" class="context-note">Nota: Solo se incluirán tipos de retroalimentación con errores detectados (nro_errores > 0). Los extractos HTML de errores se incluyen automáticamente.</p>
        </div>

                <div class="settings-section">
                  <h4 class="settings-section-title">Descargar resultados</h4>
                  <div class="settings-row">
                    <button class="download-btn" :disabled="!hasAnalysis" @click="downloadAnalysisJson">
                      Descargar análisis (JSON)
                    </button>
                  </div>
                  <div class="settings-row">
                    <button class="zip-btn" :disabled="!hasAnalysis" @click="downloadAnalysisZip">
                      Descargar paquete (ZIP)
                    </button>
                  </div>
                </div>
        </div>
        </div>
            <button class="send-btn" :disabled="!canSend" @click="send">
              Enviar
            </button>
          </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { runPromptBatch } from "@/api/llm.js";
import { mapGetters } from "vuex";
import TabRetroalimentacion from "@/components/TabRetroalimentacion.vue";
export default {
  name: "PanelDerecho",
  components: {
    TabRetroalimentacion
  },
  data() {
    return {
      // Legacy chat data (kept for reference, not used anymore)
      selectedTab: 'analysis',
      input: "",
      messages: [],
      showSettings: false,
      attachAnalysis: false,
      isLoading: false,
      typingTimer: null,
      selectedModel: 'openai/gpt-oss-20b:free',
      ctx: {
        includeEditorText: false
      },
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
      },
    };
  },
  computed: {
    ...mapGetters({
      retroalimentacion: "getRetroalimentacion"
    }),
    canSend() {
      return this.input && this.input.trim().length > 0;
    },
    hasAnalysis() {
      const s = this.$store && this.$store.state;
      if (!s) return false;
      return !!(s.estadisticasGenerales ||
        (s.gerundios && s.gerundios.html) ||
        (s.oraciones && s.oraciones.html) ||
        (s.parrafos && s.parrafos.html) ||
        (s.persona && s.persona.html) ||
        (s.vozPasiva && s.vozPasiva.html) ||
        (s.conectores && s.conectores.html) ||
        (s.complejidad && s.complejidad.html) ||
        (s.lecturabilidad && s.lecturabilidad.html) ||
        (s.proposito && s.proposito.html));
    },
  },
  methods: {
    /**
     * Extrae los párrafos/oraciones que contienen errores destacados del HTML
     * @param {string} html - HTML de la sección
     * @returns {Array<string>} - Array de extractos HTML con errores
     */
    extractErrorHtml(html) {
      if (!html || typeof html !== 'string') {
        console.log('[PanelDerecho] extractErrorHtml: No HTML provided');
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
        console.log(`[PanelDerecho] extractErrorHtml: Found ${errorSpans.length} spans with background-color`);
        
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
          console.log(`[PanelDerecho] extractErrorHtml: Checking ${paragraphs.length} paragraphs for highlighted content`);
          
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
        
        console.log(`[PanelDerecho] extractErrorHtml: Final result - Found ${extracts.length} error extracts`);
        if (extracts.length > 0) {
          console.log('[PanelDerecho] extractErrorHtml: Sample extract:', extracts[0].substring(0, 200));
        } else {
          console.warn('[PanelDerecho] extractErrorHtml: No extracts found. HTML sample:', html.substring(0, 1000));
        }
        
        return extracts;
      } catch (error) {
        console.warn('[PanelDerecho] Error extracting HTML extracts:', error);
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
            console.log(`[PanelDerecho] Added errorExtracts for ${key}.${ruleKey}:`, {
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
    ensureJSZip() {
      return new Promise((resolve, reject) => {
        if (window.JSZip) return resolve(window.JSZip);
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
        script.async = true;
        script.onload = () => resolve(window.JSZip);
        script.onerror = () => reject(new Error("No se pudo cargar JSZip"));
        document.head.appendChild(script);
      });
    },
    send() {
      const text = (this.input || "").trim();
      if (!text) return;
      const hasContext = (this.attachAnalysis && this.hasAnalysis) || this.ctx.includeEditorText;
      const includeNote = hasContext
        ? `<div class='note'>[Adjuntando contexto del documento]</div>`
        : "";
      this.messages.push({ role: "user", content: this.escape(text) + includeNote });
      this.input = "";
      this.$nextTick(this.scrollToBottom);
      // Intento real al backend
      // Prepara placeholder y estado de carga
      this.isLoading = true;
      this.messages.push({ role: "assistant", content: "" });
      const assistantIndex = this.messages.length - 1;
      const models = ["openai/gpt-oss-20b:free"];
      const params = { temperature: 0.7, maxTokens: 512 };
      // Construir contexto solo si hay análisis o texto del editor seleccionado
      const context = hasContext ? this.buildContextPayload() : {};
      runPromptBatch({
        prompt: text,
        models,
        params,
        context
      })
        .then((resp) => {
          // Verificar si hay errores en la respuesta
          const errors = resp?.errors || {};
          const modelError = errors[models[0]];
          
          if (modelError) {
            // Hay un error específico para este modelo
            const errorMessage = modelError.message || "Error desconocido del backend";
            const html = this.escape(`Error: ${errorMessage}`);
            this.$set(this.messages, assistantIndex, { role: "assistant", content: html });
            this.isLoading = false;
            this.$nextTick(this.scrollToBottom);
            return;
          }
          
          // Verificar si hay contenido en los resultados
          const results = resp?.results || {};
          const content = results[models[0]]?.content || "";
          
          if (!content || content.trim().length === 0) {
            // No hay contenido, pero no hay error explícito
            const html = this.escape("El backend no devolvió contenido en la respuesta.");
            this.$set(this.messages, assistantIndex, { role: "assistant", content: html });
            this.isLoading = false;
            this.$nextTick(this.scrollToBottom);
          } else {
            // Hay contenido, usar typeOut (que establecerá isLoading = false al terminar)
            this.typeOut(assistantIndex, content);
          }
        })
        .catch((error) => {
          // Error en la petición o en el procesamiento
          console.error("[PanelDerecho] Error en runPromptBatch:", error);
          const errorMessage = error?.message || "Error al conectar con el backend";
          const html = this.escape(`Error: ${errorMessage}`);
          this.$set(this.messages, assistantIndex, { role: "assistant", content: html });
          this.isLoading = false;
          this.$nextTick(this.scrollToBottom);
        });
    },
    typeOut(index, fullText) {
      // Limpia timer previo
      if (this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
      }
      const tokens = String(fullText).split(/(\s+)/); // conserva espacios
      let acc = "";
      let i = 0;
      const step = () => {
        if (i >= tokens.length) {
          this.isLoading = false;
          this.typingTimer = null;
          this.$nextTick(this.scrollToBottom);
          return;
        }
        acc += tokens[i++];
        const html = this.escape(acc).replace(/\n/g, "<br>");
        this.$set(this.messages, index, { role: "assistant", content: html });
        this.$nextTick(this.scrollToBottom);
      };
      // Velocidad: ~25ms por token; limita máximo para textos largos
      const interval = 25;
      this.typingTimer = setInterval(step, interval);
    },
    persistModel() { /* fixed model: noop */ },
    generateMock(question) {
      const q = question.length > 160 ? question.slice(0, 160) + "…" : question;
      const hasContext = (this.attachAnalysis && this.hasAnalysis) || this.ctx.includeEditorText;
      const attachInfo = hasContext
        ? "<div>He recibido también contexto del documento.</div>"
        : "";
      return `
        <div><strong>Respuesta preliminar</strong> (mock):</div>
        <div>He leído tu consulta: “${this.escape(q)}”.</div>
        ${attachInfo}
        <div>Pronto conectaré con un modelo LLM para darte una sugerencia concreta y referencias.</div>
      `;
    },
    sanitizeHtmlNoImg(html) {
      if (!html || typeof html !== "string") return html;
      // Remove <img ...> tags entirely
      return html.replace(/<img[^>]*>/gi, "");
    },
    sanitizeSectionForJson(section) {
      if (!section || typeof section !== "object") return section;
      const copy = { ...section };
      if (typeof copy.html === "string") {
        copy.html = this.sanitizeHtmlNoImg(copy.html);
      }
      if (typeof copy.html_response === "string") {
        copy.html_response = this.sanitizeHtmlNoImg(copy.html_response);
      }
      return copy;
    },
    sanitizeStringContent(str) {
      if (typeof str !== "string") return str;
      let out = str;
      // Remove <img ...> tags
      out = out.replace(/<img[^>]*>/gi, "");
      // Remove data URI images anywhere in the string
      out = out.replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, "[image-removed]");
      // Also neutralize src="data:image..." attributes if left behind
      out = out.replace(/\s*src\s*=\s*"(?:\s*data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)"/gi, "");
      return out;
    },
    deepSanitizeForJson(input) {
      if (input == null) return input;
      if (Array.isArray(input)) {
        return input.map((v) => this.deepSanitizeForJson(v));
      }
      if (typeof input === "object") {
        const out = {};
        Object.keys(input).forEach((k) => {
          const v = input[k];
          if (typeof v === "string") {
            out[k] = this.sanitizeStringContent(v);
          } else if (typeof v === "object" && v !== null) {
            out[k] = this.deepSanitizeForJson(v);
          } else {
            out[k] = v;
          }
        });
        return out;
      }
      if (typeof input === "string") {
        return this.sanitizeStringContent(input);
      }
      return input;
    },
    buildAnalysisJson() {
      const s = this.$store.state || {};
      const payload = {
        exportedAt: new Date().toISOString(),
        filename: s.filename || null,
        analysisTab: s.analysisTab || null,
        analysisGroupTab: s.analysisGroupTab || null,
        selectedTabIndex: s.selectedTabIndex || null,
        textoEditor: s.textoEditor || "",
        statistics: s.estadisticasGenerales || null,
        gerundios: this.sanitizeSectionForJson(s.gerundios) || null,
        oraciones: this.sanitizeSectionForJson(s.oraciones) || null,
        parrafos: this.sanitizeSectionForJson(s.parrafos) || null,
        persona: this.sanitizeSectionForJson(s.persona) || null,
        vozPasiva: this.sanitizeSectionForJson(s.vozPasiva) || null,
        conectores: this.sanitizeSectionForJson(s.conectores) || null,
        complejidad: this.sanitizeSectionForJson(s.complejidad) || null,
        lecturabilidad: this.sanitizeSectionForJson(s.lecturabilidad) || null,
        proposito: this.sanitizeSectionForJson(s.proposito) || null
      };
      // Final deep sanitize to remove any stray data:image URIs in nested objects
      return this.deepSanitizeForJson(payload);
    },
    downloadAnalysisJson() {
      const data = this.buildAnalysisJson();
      const content = JSON.stringify(data, null, 2);
      const blob = new Blob([content], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = (this.$store.state && this.$store.state.filename) ? this.$store.state.filename : "analisis";
      a.download = `${name}.analysis.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    buildSectionsCsv() {
      const s = this.$store.state || {};
      const sections = [
        ["gerundios", s.gerundios],
        ["oraciones", s.oraciones],
        ["parrafos", s.parrafos],
        ["persona", s.persona],
        ["vozPasiva", s.vozPasiva],
        ["conectores", s.conectores],
        ["complejidad", s.complejidad],
        ["lecturabilidad", s.lecturabilidad],
        ["proposito", s.proposito],
      ];
      let lines = ["section,error,html_chars"];
      sections.forEach(([key, val]) => {
        if (!val) return;
        const err = typeof val.error !== "undefined" ? val.error : "";
        const chars = val.html ? String(val.html).length : 0;
        lines.push(`${key},${err},${chars}`);
      });
      return lines.join("\n");
    },
    buildStatisticsCsv() {
      const stats = (this.$store.state && this.$store.state.estadisticasGenerales) || null;
      if (!stats) return "metric,value";
      const flatten = (obj, prefix = "", out = []) => {
        Object.keys(obj || {}).forEach((k) => {
          const val = obj[k];
          const name = prefix ? `${prefix}.${k}` : k;
          if (val && typeof val === "object" && !Array.isArray(val)) {
            flatten(val, name, out);
          } else {
            out.push([name, typeof val === "object" ? JSON.stringify(val) : val]);
          }
        });
        return out;
      };
      const rows = flatten(stats).map(([k, v]) => `${k},${String(v).replace(/[\r\n,]/g, " ")}`);
      return ["metric,value", ...rows].join("\n");
    },
    buildCombinedHtml() {
      const s = this.$store.state || {};
      const sections = [
        ["Gerundios", s.gerundios],
        ["Oraciones", s.oraciones],
        ["Párrafos", s.parrafos],
        ["Persona", s.persona],
        ["Voz Pasiva", s.vozPasiva],
        ["Conectores", s.conectores],
        ["Complejidad", s.complejidad],
        ["Lecturabilidad", s.lecturabilidad],
        ["Propósito", s.proposito],
      ];
      const parts = [];
      sections.forEach(([title, val]) => {
        if (val && val.html) {
          parts.push(`<h2>${title}</h2>`);
          parts.push(`<div>${val.html}</div>`);
          parts.push("<hr/>");
        }
      });
      const body = parts.join("\n");
      return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>PEUMO - Análisis</title></head>
<body>
<h1>Resultados de análisis</h1>
${body || "<p>No hay contenido HTML disponible.</p>"}
</body></html>`;
    },
    async downloadAnalysisZip() {
      try {
        const JSZip = await this.ensureJSZip();
        const zip = new JSZip();
        const name = (this.$store.state && this.$store.state.filename) ? this.$store.state.filename : "analisis";
        // Add JSON
        const jsonContent = JSON.stringify(this.buildAnalysisJson(), null, 2);
        zip.file(`${name}.analysis.json`, jsonContent);
        // Add CSVs
        zip.file(`${name}.sections.csv`, this.buildSectionsCsv());
        zip.file(`${name}.statistics.csv`, this.buildStatisticsCsv());
        // Add HTML
        zip.file(`${name}.document.html`, this.buildCombinedHtml());
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}.analysis.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error("ZIP error:", e);
        alert("No se pudo generar el ZIP. Ver consola para más detalles.");
      }
    },
    escape(s) {
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
    },
    scrollToBottom() {
      const el = this.$refs.messages;
      if (el) el.scrollTop = el.scrollHeight;
    },
  },
  mounted() {
    // Chat ahora está integrado en cada sección
  },
};
</script>

<style scoped>
/* Panel Derecho */
.panel-derecho {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-color);
  overflow: hidden;
}

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow: hidden;
}

.panel-header {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.panel-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.75rem;
}
.tab-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
}
.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}
.analysis-wrap {
  padding: 0.25rem 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.5rem;
}

.chat {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.75rem;
}

.typing {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 6px 8px;
  padding: 6px 10px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  width: fit-content;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: blink 1s infinite ease-in-out;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}

.message {
  display: flex;
  margin-bottom: 0.5rem;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: 85%;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md);
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}

.message.user .bubble {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.input-wrap {
  flex: 1;
  display: flex;
}

.input {
  flex: 1;
  min-height: 44px;
  max-height: 140px;
  resize: vertical;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  background: #fff;
  color: var(--text-primary);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: stretch;
}

.settings {
  position: relative;
}

.settings-btn {
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: #fff;
  cursor: pointer;
  font-weight: 700;
}

.settings-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.settings.open .settings-btn {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.settings-popup {
  position: absolute;
  bottom: calc(100% + 6px);
  right: 0;
  width: 280px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 0.75rem;
  z-index: 100;
}
.settings-section {
  margin-bottom: 1rem;
}
.settings-section:last-child {
  margin-bottom: 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}
.settings-section-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
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

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.settings-matrix {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.download-btn {
  padding: 0.5rem 0.7rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.15s ease;
}

.download-btn:hover:enabled {
  filter: brightness(0.98);
  transform: translateY(-1px);
}

.download-btn:disabled {
  background: var(--secondary-color);
  border-color: var(--secondary-color);
  color: rgba(255,255,255,0.85);
  cursor: not-allowed;
  transform: none;
}

.zip-btn {
  padding: 0.5rem 0.7rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-color);
  background: #fff;
  color: var(--primary-color);
  cursor: pointer;
  font-weight: 700;
  transition: all 0.15s ease;
}
.zip-btn:hover:enabled {
  border-color: var(--primary-dark);
  color: var(--primary-dark);
  transform: translateY(-1px);
}
.zip-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.send-btn {
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.send-btn:hover:enabled {
  filter: brightness(0.98);
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}
</style>