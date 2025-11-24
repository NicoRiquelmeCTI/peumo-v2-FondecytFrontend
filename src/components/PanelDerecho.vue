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
          <textarea
            v-model="input"
            class="input"
            placeholder="Escribe tu consulta sobre el texto…"
            @keydown.enter.exact.prevent="send"
          ></textarea>
          <button class="send-btn" :disabled="!canSend" @click="send">
            Enviar
          </button>
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
    };
  },
  computed: {
    canSend() {
      return this.input && this.input.trim().length > 0;
    },
  },
  methods: {
    send() {
      const text = (this.input || "").trim();
      if (!text) return;
      this.messages.push({ role: "user", content: this.escape(text) });
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
      return `
        <div><strong>Respuesta preliminar</strong> (mock):</div>
        <div>He leído tu consulta: “${this.escape(q)}”.</div>
        <div>Pronto conectaré con un modelo LLM para darte una sugerencia concreta y referencias.</div>
      `;
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
  align-items: flex-end;
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