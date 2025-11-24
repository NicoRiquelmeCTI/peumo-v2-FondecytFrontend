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
          <label class="checkbox"><input type="checkbox" v-model="selectedModels" value="gpt-4.1" /> gpt-4.1</label>
          <label class="checkbox"><input type="checkbox" v-model="selectedModels" value="gpt-4o-mini" /> gpt-4o-mini</label>
          <label class="checkbox"><input type="checkbox" v-model="selectedModels" value="claude-3.5-sonnet" /> claude-3.5-sonnet</label>
          <label class="checkbox"><input type="checkbox" v-model="selectedModels" value="llama-3.1-70b" /> llama-3.1-70b</label>
        </div>

        <div class="section">
          <h3 class="section-title">Contexto a adjuntar</h3>
          <label class="checkbox"><input type="checkbox" v-model="ctx.includeStatistics" /> Estadísticas generales</label>
          <label class="checkbox"><input type="checkbox" v-model="ctx.includeSections" /> Secciones (HTML)</label>
          <label class="checkbox"><input type="checkbox" v-model="ctx.includeEditorText" /> Texto del editor</label>
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
                <div v-if="runStatus[m] === 'idle'" class="placeholder">Selecciona Ejecutar para correr este modelo.</div>
                <div v-else-if="runStatus[m] === 'running'" class="loading">Generando respuesta...</div>
                <div v-else-if="runStatus[m] === 'error'" class="error">Ocurrió un error generando la respuesta.</div>
                <div v-else class="answer" v-html="results[m]"></div>
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
export default {
  name: "PromptingLab",
  data() {
    return {
      prompt: "",
      selectedModels: ["gpt-4o-mini"],
      params: {
        temperature: 0.7,
        maxTokens: 1024
      },
      ctx: {
        includeStatistics: true,
        includeSections: false,
        includeEditorText: false
      },
      runStatus: {}, // model -> 'idle' | 'running' | 'done' | 'error'
      results: {} // model -> html
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
      if (this.ctx.includeStatistics && s.estadisticasGenerales) {
        parts.push(`# Estadísticas\n${JSON.stringify(s.estadisticasGenerales).slice(0, 1500)}${JSON.stringify(s.estadisticasGenerales).length > 1500 ? '…' : ''}`);
      }
      if (this.ctx.includeEditorText && s.textoEditor) {
        parts.push(`# Texto del editor\n${String(s.textoEditor).slice(0, 1500)}${String(s.textoEditor).length > 1500 ? '…' : ''}`);
      }
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
        const htmlSnippets = sec
          .filter(([, v]) => v && v.html)
          .map(([k, v]) => `## ${k}\n${String(v.html).replace(/<[^>]+>/g, '').slice(0, 800)}${String(v.html).length > 800 ? '…' : ''}`);
        if (htmlSnippets.length) {
          parts.push(`# Secciones\n${htmlSnippets.join('\n\n')}`);
        }
      }
      return parts.join('\n\n') || 'Sin contexto seleccionado.';
    }
  },
  methods: {
    copyPrompt() {
      navigator.clipboard.writeText(this.prompt).catch(() => {});
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
    buildContext() {
      // Construye contexto completo (string) según toggles
      return this.contextPreview;
    },
    async runAll() {
      const ctx = this.buildContext();
      const models = [...this.selectedModels];
      models.forEach(m => {
        this.$set(this.runStatus, m, 'running');
        this.$set(this.results, m, '');
      });
      // Ejecuta "en paralelo" (mock). Aquí se conectaría a un backend para cada modelo.
      await Promise.all(models.map(async (model) => {
        try {
          const answer = await this.generateMockAnswer(model, this.prompt, ctx, this.params);
          this.$set(this.results, model, answer);
          this.$set(this.runStatus, model, 'done');
        } catch (e) {
          this.$set(this.runStatus, model, 'error');
        }
      }));
    },
    async generateMockAnswer(model, prompt, context, params) {
      // Simula latencia variable
      const ms = 400 + Math.floor(Math.random() * 900);
      await new Promise(r => setTimeout(r, ms));
      const ctxNote = this.hasAnyContext ? ' (con contexto)' : '';
      const safePrompt = prompt.length > 300 ? prompt.slice(0, 300) + '…' : prompt;
      return `
        <div><strong>${model}</strong>${ctxNote}:</div>
        <div>Prompt: ${this.escape(safePrompt)}</div>
        <div style="margin-top:6px;">Respuesta simulada. temperature=${params.temperature}, maxTokens=${params.maxTokens}.</div>
      `;
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
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.field input {
  width: 120px;
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


