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
          <label class="checkbox"><input type="checkbox" v-model="ctx.includeStatistics" /> Estadísticas generales</label>
          <label class="checkbox"><input type="checkbox" v-model="ctx.includeSections" /> Secciones (HTML)</label>
          <label class="checkbox"><input type="checkbox" v-model="ctx.includeEditorText" /> Texto del editor</label>
          <div style="margin-top:0.5rem;">
            <label class="checkbox"><input type="radio" value="compact" v-model="ctx.format" /> Formato compacto</label>
            <label class="checkbox"><input type="radio" value="extracts" v-model="ctx.format" /> Extractos</label>
          </div>
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
        includeStatistics: true,
        includeSections: false,
        includeEditorText: false,
        format: "compact" // 'compact' | 'extracts'
      },
      runStatus: {}, // model -> 'idle' | 'running' | 'done' | 'error'
      results: {}, // model -> html
      customModelInput: "",
      customModels: JSON.parse(localStorage.getItem('peumo.plab.customModels') || "[]")
    };
  },
  computed: {
    canRun() {
      return this.prompt && this.prompt.trim().length > 0 && this.selectedModels.length > 0;
    },
    hasAnyContext() {
      return this.ctx.includeStatistics || this.ctx.includeSections || this.ctx.includeEditorText;
    },
    contextPreview() {
      const s = this.$store.state || {};
      const parts = [];
      // Estadísticas (resumen legible)
      if (this.ctx.includeStatistics && s.estadisticasGenerales && s.estadisticasGenerales.analysis) {
        const a = s.estadisticasGenerales.analysis;
        const lines = [];
        if (typeof a.total_words !== "undefined") lines.push(`- Palabras: ${a.total_words}`);
        if (typeof a.total_sentences !== "undefined") lines.push(`- Oraciones: ${a.total_sentences}`);
        if (typeof a.paragraphs !== "undefined") lines.push(`- Párrafos: ${a.paragraphs}`);
        parts.push(`# Estadísticas\n${lines.join('\n') || '(sin métricas)'}`);
      }
      // Secciones (modo compacto o extractos)
      if (this.ctx.includeSections) {
        const sec = [
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
        const recs = {
          "Gerundios": "Evita gerundios repetidos; prefiere verbos conjugados y conectores.",
          "Oraciones": "Evita oraciones demasiado largas o cortas; usa puntuación y conectores.",
          "Párrafos": "Mantén 3–5 oraciones por párrafo con una idea central.",
          "Persona": "Prefiere tercera persona/voz impersonal para informes.",
          "Voz Pasiva": "Reduce voz pasiva en exceso; usa voz activa cuando aporte claridad.",
          "Conectores": "Asegura conectores adecuados y evita repetición.",
          "Complejidad": "Acerca el verbo al primer cuarto de la oración; simplifica el inicio.",
          "Lecturabilidad": "Ajusta longitud de palabras/frases al rango recomendado.",
          "Propósito": "Alinea el contenido con el propósito de la sección (introducción, resultados, etc.)."
        };
        const compactLine = (k, v) => {
          const flag = typeof v?.error !== "undefined" ? (v.error ? "Problemas" : "OK") : "N/D";
          const count = this.sectionErrorCount(k, v);
          const reco = recs[k] ? ` – ${recs[k]}` : "";
          const extras = count !== null ? ` (errores: ${count})` : "";
          return `## ${k}\nIndicador: ${flag}${extras}${reco}`;
        };
        const blocks = sec.map(([k, v]) => {
          if (!v) return null;
          if (this.ctx.format === "compact") {
            return compactLine(k, v);
          } else {
            const flag = typeof v.error !== "undefined" ? v.error : null;
            const txt = v.html ? String(v.html).replace(/<[^>]+>/g, '') : '';
            const snippet = txt ? (txt.slice(0, 400) + (txt.length > 400 ? '…' : '')) : '';
            const lineFlag = flag === null ? '' : `\nIndicador: ${flag ? 'Problemas detectados' : 'Sin problemas'}`;
            const reco = recs[k] ? `\nRecomendación: ${recs[k]}` : '';
            return `## ${k}${lineFlag}${reco}${snippet ? `\nExtracto: ${snippet}` : ''}`;
          }
        }).filter(Boolean);
        if (blocks.length) {
          parts.push(`# Secciones\n${blocks.join('\n\n')}`);
        }
      }
      // Texto del editor: si ya incluimos secciones (que suelen derivar del texto), evita duplicar
      if (this.ctx.includeEditorText && s.textoEditor) {
        if (!this.ctx.includeSections) {
          parts.push(`# Texto del editor\n${String(s.textoEditor).slice(0, 1500)}${String(s.textoEditor).length > 1500 ? '…' : ''}`);
        } else {
          parts.push(`# Texto del editor\n(adjuntado en payload, omitido aquí para evitar duplicación)`);
        }
      }
      return parts.join('\n\n') || 'Sin contexto seleccionado.';
    },
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
    buildContextPayload() {
      // Construye contexto estructurado para backend
      const s = this.$store.state || {};
      const ctx = { schemaVersion: 2 };
      const MAX_EDITOR_CHARS = 2000; // limita texto del editor
      const MAX_SECTION_CHARS = 1200; // por sección en modo extractos
      const stripHtml = (t) => String(t || "").replace(/<[^>]+>/g, '');
      const truncate = (t, n) => {
        const str = String(t || "");
        return str.length > n ? (str.slice(0, n) + '…') : str;
      };
      if (this.ctx.includeStatistics && s.estadisticasGenerales) {
        ctx.statistics = s.estadisticasGenerales;
      }
      // Evitar duplicar: si se incluyen secciones, no enviar texto completo del editor
      // En su lugar, enviar un snippet pequeño solo en formato compacto
      if (this.ctx.includeSections) {
        if (this.ctx.format === "compact") {
          // Solo indicadores y conteos
          ctx.sectionSummary = {
            gerundios: { flag: s.gerundios?.error ?? null, errors: this.sectionErrorCount("Gerundios", s.gerundios) },
            oraciones: { flag: s.oraciones?.error ?? null, errors: this.sectionErrorCount("Oraciones", s.oraciones) },
            parrafos: { flag: s.parrafos?.error ?? null, errors: this.sectionErrorCount("Párrafos", s.parrafos) },
            persona: { flag: s.persona?.error ?? null, errors: this.sectionErrorCount("Persona", s.persona) },
            vozPasiva: { flag: s.vozPasiva?.error ?? null, errors: this.sectionErrorCount("Voz Pasiva", s.vozPasiva) },
            conectores: { flag: s.conectores?.error ?? null, errors: this.sectionErrorCount("Conectores", s.conectores) },
            complejidad: { flag: s.complejidad?.error ?? null, errors: this.sectionErrorCount("Complejidad", s.complejidad) },
            lecturabilidad: { flag: s.lecturabilidad?.error ?? null, errors: this.sectionErrorCount("Lecturabilidad", s.lecturabilidad) },
            proposito: { flag: s.proposito?.error ?? null, errors: this.sectionErrorCount("Propósito", s.proposito) },
          };
          if (this.ctx.includeEditorText && s.textoEditor) {
            ctx.editorTextSnippet = truncate(s.textoEditor, MAX_EDITOR_CHARS);
          }
        } else {
          // Extractos HTML (legacy)
          const sec = {
            gerundios: s.gerundios?.html,
            oraciones: s.oraciones?.html,
            parrafos: s.parrafos?.html,
            persona: s.persona?.html,
            vozPasiva: s.vozPasiva?.html,
            conectores: s.conectores?.html,
            complejidad: s.complejidad?.html,
            lecturabilidad: s.lecturabilidad?.html,
            proposito: s.proposito?.html,
          };
          // Strip HTML y trunca cada sección, eliminando nulos
          const cleaned = {};
          Object.keys(sec).forEach(k => {
            if (sec[k]) {
              const txt = stripHtml(sec[k]);
              cleaned[k] = truncate(txt, MAX_SECTION_CHARS);
            }
          });
          ctx.sections = cleaned;
          // No incluir editorText cuando ya adjuntamos extractos para evitar duplicación
        }
      } else if (this.ctx.includeEditorText && s.textoEditor) {
        // Si no hay secciones, incluir texto del editor (truncado)
        ctx.editorText = truncate(s.textoEditor, MAX_EDITOR_CHARS);
      }
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
        const editorLen = (ctxPayload.editorText || ctxPayload.editorTextSnippet || "").length || 0;
        const sectionKeys = ctxPayload.sections ? Object.keys(ctxPayload.sections) : [];
        const sectionCharSum = sectionKeys.reduce((acc, k) => acc + String(ctxPayload.sections[k] || "").length, 0);
        // eslint-disable-next-line no-console
        console.log("[PromptingLab] Context payload", {
          approxBytes: approx,
          hasStatistics: !!ctxPayload.statistics,
          hasSectionSummary: !!ctxPayload.sectionSummary,
          sectionKeys,
          sectionCharSum,
          editorChars: editorLen,
          format: this.ctx.format
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("[PromptingLab] Context log error", e);
      }
      // Intento vía backend
      try {
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


