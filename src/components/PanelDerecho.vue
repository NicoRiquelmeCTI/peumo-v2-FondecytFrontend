<template>
  <div id="PanelDerecho" class="panel-derecho">
    <div class="container">
      <header class="panel-header">
        <h2 class="panel-title">Asistente de escritura (beta)</h2>
        <p class="panel-subtitle">Pronto conectado a uno o varios LLMs</p>
      </header>
      <div class="chat">
        <div class="chat-messages" ref="messages">
          <div
            v-for="(m, idx) in messages"
            :key="idx"
            :class="['message', m.role]"
          >
            <div class="bubble" v-html="m.content"></div>
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
                <div class="settings-row">
                  <label class="toggle">
                    <input type="checkbox" v-model="attachAnalysis" />
                    <span>Adjuntar resultados del análisis</span>
                  </label>
                </div>
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
export default {
  name: "PanelDerecho",
  data() {
    return {
      input: "",
      messages: [
        {
          role: "assistant",
          content:
            "Hola, soy tu asistente de escritura. Puedo ayudarte a mejorar tu texto, sugerir reescrituras y responder preguntas. ¿En qué te ayudo?",
        },
      ],
      showSettings: false,
      attachAnalysis: false,
    };
  },
  computed: {
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
      const includeNote = this.attachAnalysis && this.hasAnalysis
        ? `<div class='note'>[Adjuntando resumen de análisis del documento]</div>`
        : "";
      this.messages.push({ role: "user", content: this.escape(text) + includeNote });
      this.input = "";
      this.$nextTick(this.scrollToBottom);
      // Mock response (placeholder for future LLM integration)
      setTimeout(() => {
        const mock = this.generateMock(text);
        this.messages.push({ role: "assistant", content: mock });
        this.$nextTick(this.scrollToBottom);
      }, 500);
    },
    generateMock(question) {
      const q = question.length > 160 ? question.slice(0, 160) + "…" : question;
      const attachInfo = this.attachAnalysis && this.hasAnalysis
        ? "<div>He recibido también un resumen del análisis del documento.</div>"
        : "";
      return `
        <div><strong>Respuesta preliminar</strong> (mock):</div>
        <div>He leído tu consulta: “${this.escape(q)}”.</div>
        ${attachInfo}
        <div>Pronto conectaré con un modelo LLM para darte una sugerencia concreta y referencias.</div>
      `;
    },
    buildAnalysisJson() {
      const s = this.$store.state || {};
      return {
        exportedAt: new Date().toISOString(),
        filename: s.filename || null,
        analysisTab: s.analysisTab || null,
        analysisGroupTab: s.analysisGroupTab || null,
        selectedTabIndex: s.selectedTabIndex || null,
        textoEditor: s.textoEditor || "",
        statistics: s.estadisticasGenerales || null,
        gerundios: s.gerundios || null,
        oraciones: s.oraciones || null,
        parrafos: s.parrafos || null,
        persona: s.persona || null,
        vozPasiva: s.vozPasiva || null,
        conectores: s.conectores || null,
        complejidad: s.complejidad || null,
        lecturabilidad: s.lecturabilidad || null,
        proposito: s.proposito || null
      };
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
    this.scrollToBottom();
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
  width: 260px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 0.75rem;
  z-index: 100;
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