<template>
  <div class="section-chat">
    <div class="chat-header">
      <div class="chat-header-content">
        <div>
          <h4 class="chat-title">Asistente de escritura</h4>
          <p class="chat-subtitle">Haz preguntas sobre esta sección de análisis</p>
        </div>
        <button class="maximize-btn" @click="showMaximized = true" title="Maximizar chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="chat-messages" :ref="`messages-${sectionKey}`">
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
          :placeholder="`Escribe tu consulta sobre ${sectionName}…`"
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
              <div class="settings-section-header">
                <h4 class="settings-section-title">Contexto a adjuntar</h4>
                <button class="info-btn" @click="showInfo = !showInfo" title="Más información sobre el contexto por defecto">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              
              <!-- Popup de información -->
              <div v-if="showInfo" class="info-popup">
                <div class="info-content">
                  <h5>Contexto por defecto</h5>
                  <p>Cuando no tienes opciones seleccionadas, el chat recibe automáticamente:</p>
                  <ul>
                    <li><strong>nro_errores</strong>: El número de errores encontrados en cada tipo de retroalimentación</li>
                    <li><strong>errorExtracts</strong>: Extractos HTML de los párrafos/oraciones que contienen errores destacados</li>
                  </ul>
                  <p>Esto permite al asistente ver dónde están los errores sin necesidad de configurar opciones adicionales.</p>
                  <p><strong>Opcional:</strong> Puedes activar los checkboxes para incluir campos adicionales como títulos, comentarios, ejemplos y correcciones.</p>
                </div>
              </div>
              
              <div class="settings-row">
                <label class="toggle">
                  <input type="checkbox" v-model="ctx.includeEditorText" />
                  <span>Texto del editor</span>
                </label>
              </div>
              <div class="settings-row">
                <label class="toggle">
                  <input type="checkbox" v-model="attachTipoFields.feedbackTitle" />
                  <span>feedbackTitle</span>
                </label>
              </div>
              <div class="settings-row">
                <label class="toggle">
                  <input type="checkbox" v-model="attachTipoFields.feedbackComment" />
                  <span>feedbackComment</span>
                </label>
              </div>
              <div class="settings-row">
                <label class="toggle">
                  <input type="checkbox" v-model="attachTipoFields.negativeFeedback" />
                  <span>negativeFeedback</span>
                </label>
              </div>
              <div class="settings-row">
                <label class="toggle">
                  <input type="checkbox" v-model="attachTipoFields.errorExample" />
                  <span>errorExample</span>
                </label>
              </div>
              <div class="settings-row">
                <label class="toggle">
                  <input type="checkbox" v-model="attachTipoFields.errorCorrection" />
                  <span>errorCorrection</span>
                </label>
              </div>
              <div class="settings-row">
                <label class="toggle">
                  <input type="checkbox" v-model="attachTipoFields.errorComment" />
                  <span>errorComment</span>
                </label>
              </div>
              <p class="context-note">Nota: Solo se incluirán tipos de retroalimentación con errores detectados (nro_errores > 0). Los extractos HTML de errores se incluyen automáticamente.</p>
            </div>
          </div>
        </div>
        <button class="send-btn" :disabled="!canSend" @click="send">
          Enviar
        </button>
      </div>
    </div>
    
    <!-- Modal maximizado -->
    <b-modal 
      v-model="showMaximized" 
      :id="`chat-modal-${sectionKey}`"
      size="xl" 
      hide-footer
      :title="`Asistente de escritura - ${sectionName}`"
      class="chat-modal"
      @shown="scrollMaximizedToBottom"
      @hidden="showMaximized = false"
    >
      <div class="maximized-chat">
        <div class="chat-messages-maximized" :ref="`messages-maximized-${sectionKey}`">
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
        <div class="chat-input-maximized">
          <div class="input-wrap">
            <textarea
              v-model="input"
              class="input"
              :placeholder="`Escribe tu consulta sobre ${sectionName}…`"
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
                  <div class="settings-section-header">
                    <h4 class="settings-section-title">Contexto a adjuntar</h4>
                    <button class="info-btn" @click="showInfo = !showInfo" title="Más información sobre el contexto por defecto">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Popup de información -->
                  <div v-if="showInfo" class="info-popup">
                    <div class="info-content">
                      <h5>Contexto por defecto</h5>
                      <p>Cuando no tienes opciones seleccionadas, el chat recibe automáticamente:</p>
                      <ul>
                        <li><strong>nro_errores</strong>: El número de errores encontrados en cada tipo de retroalimentación</li>
                        <li><strong>errorExtracts</strong>: Extractos HTML de los párrafos/oraciones que contienen errores destacados</li>
                      </ul>
                      <p>Esto permite al asistente ver dónde están los errores sin necesidad de configurar opciones adicionales.</p>
                      <p><strong>Opcional:</strong> Puedes activar los checkboxes para incluir campos adicionales como títulos, comentarios, ejemplos y correcciones.</p>
                    </div>
                  </div>
                  
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="ctx.includeEditorText" />
                      <span>Texto del editor</span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="attachTipoFields.feedbackTitle" />
                      <span>feedbackTitle</span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="attachTipoFields.feedbackComment" />
                      <span>feedbackComment</span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="attachTipoFields.negativeFeedback" />
                      <span>negativeFeedback</span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="attachTipoFields.errorExample" />
                      <span>errorExample</span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="attachTipoFields.errorCorrection" />
                      <span>errorCorrection</span>
                    </label>
                  </div>
                  <div class="settings-row">
                    <label class="toggle">
                      <input type="checkbox" v-model="attachTipoFields.errorComment" />
                      <span>errorComment</span>
                    </label>
                  </div>
                  <p class="context-note">Nota: Solo se incluirán tipos de retroalimentación con errores detectados (nro_errores > 0). Los extractos HTML de errores se incluyen automáticamente.</p>
                </div>
              </div>
            </div>
            <button class="send-btn" :disabled="!canSend" @click="send">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { runPromptBatch } from "@/api/llm.js";

export default {
  name: "SectionChat",
  props: {
    sectionKey: {
      type: String,
      required: true
    },
    sectionName: {
      type: String,
      required: true
    },
    sectionData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      input: "",
      messages: [
        {
          role: "assistant",
          content: `Hola, soy tu asistente de escritura especializado en ${this.sectionName}. Puedo ayudarte a entender los errores encontrados y sugerir mejoras. ¿En qué te ayudo?`,
        },
      ],
      showSettings: false,
      showMaximized: false,
      showInfo: false,
      isLoading: false,
      typingTimer: null,
      selectedModel: 'openai/gpt-oss-20b:free',
      ctx: {
        includeEditorText: false
      },
      attachTipoFields: {
        feedbackTitle: false,
        feedbackComment: false,
        negativeFeedback: false,
        errorExample: false,
        errorCorrection: false,
        errorComment: false,
      },
    };
  },
  computed: {
    canSend() {
      return this.input && this.input.trim().length > 0;
    },
    hasSectionData() {
      return this.sectionData && this.sectionData.html;
    },
  },
  methods: {
    /**
     * Extrae los párrafos/oraciones que contienen errores destacados del HTML
     */
    extractErrorHtml(html) {
      if (!html || typeof html !== 'string') {
        return [];
      }
      
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const extracts = [];
        const seen = new Set();
        
        const errorSpans = tempDiv.querySelectorAll('span[style*="background-color"]');
        errorSpans.forEach(span => {
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
        
        if (extracts.length === 0) {
          const paragraphs = tempDiv.querySelectorAll('p');
          paragraphs.forEach(p => {
            const hasErrorSpan = p.querySelector('span[style*="background-color"]');
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
        
        const paragraphsWithClasses = tempDiv.querySelectorAll('p.bg-red, p.bg-yellow, p.bg-orange, p.bg-blue, p.bg-lightgreen, p[class*="bg-"]');
        paragraphsWithClasses.forEach(p => {
          const paragraphHtml = p.outerHTML;
          const htmlHash = paragraphHtml.substring(0, 300);
          if (!seen.has(htmlHash)) {
            seen.add(htmlHash);
            extracts.push(paragraphHtml);
          }
        });
        
        return extracts;
      } catch (error) {
        console.warn('[SectionChat] Error extracting HTML extracts:', error);
        return [];
      }
    },
    buildContextPayload() {
      const s = this.$store.state || {};
      const ctx = { 
        schemaVersion: 3
      };
      
      const stripHtml = (t) => String(t || "").replace(/<[^>]+>/g, '');
      const MAX_EDITOR_CHARS = 2000;
      
      if (this.ctx.includeEditorText && s.textoEditor) {
        ctx.editorText = stripHtml(s.textoEditor);
        if (ctx.editorText.length > MAX_EDITOR_CHARS) {
          ctx.editorText = ctx.editorText.slice(0, MAX_EDITOR_CHARS) + '…';
        }
      }
      
      ctx.sectionFeedback = {};
      
      if (!this.sectionData) return ctx;
      
      const tiposRetroalimentacion = this.sectionData.tiposRetroalimentacion;
      if (!tiposRetroalimentacion || typeof tiposRetroalimentacion !== 'object') return ctx;
      
      ctx.sectionFeedback[this.sectionKey] = {};
      
      Object.keys(tiposRetroalimentacion).forEach(ruleKey => {
        const feedbackType = tiposRetroalimentacion[ruleKey];
        if (!feedbackType) return;
        
        const nroErrores = feedbackType.nro_errores;
        const hasErrors = nroErrores !== null && nroErrores !== undefined && nroErrores > 0;
        
        if (!hasErrors) return;
        
        const feedbackObj = {};
        
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
        
        if (typeof nroErrores !== 'undefined') {
          feedbackObj.nro_errores = nroErrores;
        }
        
        if (this.sectionData.html && nroErrores > 0) {
          const errorExtracts = this.extractErrorHtml(this.sectionData.html);
          feedbackObj.errorExtracts = errorExtracts;
        }
        
        if (Object.keys(feedbackObj).length > 0) {
          ctx.sectionFeedback[this.sectionKey][ruleKey] = feedbackObj;
        }
      });
      
      if (Object.keys(ctx.sectionFeedback[this.sectionKey]).length === 0) {
        delete ctx.sectionFeedback[this.sectionKey];
      }
      
      return ctx;
    },
    send() {
      const text = (this.input || "").trim();
      if (!text) return;
      
      const hasContext = this.hasSectionData || this.ctx.includeEditorText;
      const includeNote = hasContext
        ? `<div class='note'>[Adjuntando contexto de ${this.sectionName}]</div>`
        : "";
      
      this.messages.push({ role: "user", content: this.escape(text) + includeNote });
      this.input = "";
      this.$nextTick(() => this.scrollToBottomIfNeeded());
      
      this.isLoading = true;
      this.messages.push({ role: "assistant", content: "" });
      const assistantIndex = this.messages.length - 1;
      const models = [this.selectedModel];
      const params = { temperature: 0.7, maxTokens: 512 };
      const context = hasContext ? this.buildContextPayload() : {};
      
      runPromptBatch({
        prompt: text,
        models,
        params,
        context
      })
        .then((resp) => {
          const errors = resp?.errors || {};
          const modelError = errors[models[0]];
          
          if (modelError) {
            const errorMessage = modelError.message || "Error desconocido del backend";
            const html = this.escape(`Error: ${errorMessage}`);
            this.$set(this.messages, assistantIndex, { role: "assistant", content: html });
            this.isLoading = false;
            this.$nextTick(() => this.scrollToBottomIfNeeded());
            return;
          }
          
          const results = resp?.results || {};
          const content = results[models[0]]?.content || "";
          
          if (!content || content.trim().length === 0) {
            const html = this.escape("El backend no devolvió contenido en la respuesta.");
            this.$set(this.messages, assistantIndex, { role: "assistant", content: html });
            this.isLoading = false;
            this.$nextTick(() => this.scrollToBottomIfNeeded());
          } else {
            this.typeOut(assistantIndex, content);
          }
        })
        .catch((error) => {
          console.error("[SectionChat] Error en runPromptBatch:", error);
          const errorMessage = error?.message || "Error al conectar con el backend";
          const html = this.escape(`Error: ${errorMessage}`);
          this.$set(this.messages, assistantIndex, { role: "assistant", content: html });
          this.isLoading = false;
          this.$nextTick(() => this.scrollToBottomIfNeeded());
        });
    },
    async typeOut(index, fullText) {
      if (this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
      }
      
      // Asegurar que marked esté cargado
      await this.ensureMarked();
      
      const tokens = String(fullText).split(/(\s+)/);
      let acc = "";
      let i = 0;
      const step = () => {
        if (i >= tokens.length) {
          this.isLoading = false;
          this.typingTimer = null;
          this.$nextTick(() => this.scrollToBottomIfNeeded());
          return;
        }
        acc += tokens[i++];
        // Renderizar markdown en lugar de solo escapar
        const html = this.renderMarkdown(acc);
        this.$set(this.messages, index, { role: "assistant", content: html });
        this.$nextTick(() => this.scrollToBottomIfNeeded());
      };
      const interval = 25;
      this.typingTimer = setInterval(step, interval);
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
        console.warn("[SectionChat] Error rendering markdown:", e);
      }
      // Fallback: escapar y convertir saltos de línea
      return this.escape(String(text || "")).replace(/\n/g, "<br>");
    },
    escape(s) {
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
    },
    scrollToBottom() {
      const el = this.$refs[`messages-${this.sectionKey}`];
      if (el) el.scrollTop = el.scrollHeight;
    },
    scrollMaximizedToBottom() {
      this.$nextTick(() => {
        const el = this.$refs[`messages-maximized-${this.sectionKey}`];
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    scrollToBottomIfNeeded() {
      // Scroll en vista normal
      const el = this.$refs[`messages-${this.sectionKey}`];
      if (el) {
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        if (isNearBottom) {
          el.scrollTop = el.scrollHeight;
        }
      }
      
      // Scroll en vista maximizada
      const elMaximized = this.$refs[`messages-maximized-${this.sectionKey}`];
      if (elMaximized) {
        const isNearBottomMax = elMaximized.scrollHeight - elMaximized.scrollTop - elMaximized.clientHeight < 100;
        if (isNearBottomMax) {
          elMaximized.scrollTop = elMaximized.scrollHeight;
        }
      }
    },
  },
  mounted() {
    this.scrollToBottom();
  },
};
</script>

<style scoped>
.section-chat {
  margin-top: 1.5rem;
  border-top: 2px solid var(--border-color);
  padding-top: 1rem;
}

.chat-header {
  margin-bottom: 0.75rem;
}

.chat-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.maximize-btn {
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.maximize-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--background-color);
  transform: translateY(-1px);
}

.chat-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.chat-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.chat-messages {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* Estilos para markdown renderizado */
.bubble :deep(h1),
.bubble :deep(h2),
.bubble :deep(h3),
.bubble :deep(h4),
.bubble :deep(h5),
.bubble :deep(h6) {
  margin: 0.75rem 0 0.5rem 0;
  font-weight: 600;
  line-height: 1.3;
}

.bubble :deep(h1) { font-size: 1.5rem; }
.bubble :deep(h2) { font-size: 1.3rem; }
.bubble :deep(h3) { font-size: 1.1rem; }
.bubble :deep(h4) { font-size: 1rem; }
.bubble :deep(h5) { font-size: 0.95rem; }
.bubble :deep(h6) { font-size: 0.9rem; }

.bubble :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.bubble :deep(ul),
.bubble :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.bubble :deep(li) {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.bubble :deep(strong),
.bubble :deep(b) {
  font-weight: 600;
  color: var(--text-primary);
}

.bubble :deep(em),
.bubble :deep(i) {
  font-style: italic;
}

.bubble :deep(code) {
  background: var(--background-color);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
  border: 1px solid var(--border-color);
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

.bubble :deep(pre) {
  background: var(--background-color);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  overflow-x: auto;
  margin: 0.5rem 0;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.bubble :deep(pre code) {
  background: transparent;
  padding: 0;
  border: none;
  font-size: 0.85em;
}

.bubble :deep(blockquote) {
  border-left: 3px solid var(--primary-color);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.bubble :deep(a) {
  color: var(--primary-color);
  text-decoration: underline;
}

.bubble :deep(a:hover) {
  color: var(--primary-dark);
}

.bubble :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 0.75rem 0;
}

/* Contenedor para tablas anchas con scroll horizontal */
.bubble :deep(table) {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  table-layout: auto;
}

.bubble :deep(thead),
.bubble :deep(tbody) {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.bubble :deep(tr) {
  display: table-row;
}

.bubble :deep(th),
.bubble :deep(td) {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 200px;
  min-width: 80px;
}

.bubble :deep(th) {
  background: var(--background-color);
  font-weight: 600;
}


.message.user .bubble {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
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
  max-height: 100px;
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
  width: 260px;
  max-height: 60vh;
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
}

.settings-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.settings-section-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.info-btn {
  padding: 0.25rem 0.4rem;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.info-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--background-color);
}

.info-popup {
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--radius-md);
}

.info-content h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.info-content p {
  margin: 0.5rem 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.info-content ul {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.info-content li {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.info-content strong {
  color: var(--text-primary);
  font-weight: 600;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
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

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

/* Estilos para modal maximizado */
:deep(.chat-modal .modal-body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 70vh;
  min-height: 500px;
}

.maximized-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.75rem;
}

.chat-messages-maximized {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.chat-input-maximized {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
  padding: 0 0.5rem 0.5rem 0.5rem;
}

.chat-messages-maximized::-webkit-scrollbar {
  width: 8px;
}

.chat-messages-maximized::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.chat-messages-maximized::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}
</style>

