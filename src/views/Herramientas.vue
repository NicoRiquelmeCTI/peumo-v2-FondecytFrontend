<template>
  <div id="Herramientas" class="tools">
    <header class="tools-header">
      <div class="header-row">
        <div class="header-left">
          <img src="@/assets/imag/v1/logos/logo_main.svg" alt="PEUMO" class="header-logo">
          <span class="brand-name">PEUMO</span>
        </div>
        <div class="header-right">
          <router-link to="/dashboard" class="back-btn">Volver al editor</router-link>
        </div>
      </div>
      <h1 class="title">Herramientas de creatividad y búsqueda</h1>
      <p class="subtitle">Concordancia y procesos de escritura</p>
    </header>
    <div class="tools-layout">
      <!-- Sidebar -->
      <aside class="tools-sidebar">
        <nav class="nav">
          <div class="nav-group">
            <div class="nav-group-title">Búsquedas</div>
            <button
              class="nav-item"
              :class="{ active: selected === 'concordancia' }"
              @click="selected = 'concordancia'"
            >
              Concordancia
            </button>
          </div>
          <div class="nav-group">
            <div class="nav-group-title">Procesos de escritura</div>
            <button
              class="nav-item"
              :class="{ active: selected === 'conceptualizacion' }"
              @click="selected = 'conceptualizacion'"
            >
              Conceptualización
            </button>
            <button
              class="nav-item"
              :class="{ active: selected === 'ideacion' }"
              @click="selected = 'ideacion'"
            >
              Ideación
            </button>
            <button
              class="nav-item"
              :class="{ active: selected === 'transcripcion' }"
              @click="selected = 'transcripcion'"
            >
              Transcripción / Traducción
            </button>
            <button
              class="nav-item"
              :class="{ active: selected === 'reconceptualizacion' }"
              @click="selected = 'reconceptualizacion'"
            >
              Traducción / Reconceptualización
            </button>
          </div>
        </nav>
      </aside>
      <!-- Main content -->
      <main class="tools-main">
        <section v-show="selected === 'concordancia'" class="section">
          <h2 class="section-title">Concordancia</h2>
          <TabConcordancia />
        </section>
        <section v-show="selected === 'conceptualizacion'" class="section">
          <h2 class="section-title">Conceptualización</h2>
          <tabConceptualizacion />
        </section>
        <section v-show="selected === 'ideacion'" class="section">
          <h2 class="section-title">Ideación</h2>
          <tabIdeacion />
        </section>
        <section v-show="selected === 'transcripcion'" class="section">
          <h2 class="section-title">Transcripción / Traducción</h2>
          <tabTranscripcion />
        </section>
        <section v-show="selected === 'reconceptualizacion'" class="section">
          <h2 class="section-title">Traducción / Reconceptualización</h2>
          <tabReconceptualizacion />
        </section>
      </main>
    </div>
  </div>
  </template>
  
  <script>
  import TabConcordancia from "@/components/TabConcordancia.vue";
  import tabConceptualizacion from "@/components/TabConceptualizacion.vue";
  import tabIdeacion from "@/components/TabIdeacion.vue";
  import tabTranscripcion from "@/components/TabTranscripcion.vue";
  import tabReconceptualizacion from "@/components/TabReconceptualizacion.vue";
  
  export default {
    name: "Herramientas",
    components: {
      TabConcordancia,
      tabConceptualizacion,
      tabIdeacion,
      tabTranscripcion,
      tabReconceptualizacion
    },
    data() {
      return {
        selected: "concordancia"
      };
    }
  };
  </script>
  
  <style scoped>
  .tools {
    min-height: 100vh;
    background: var(--background-color);
    display: flex;
    flex-direction: column;
  }
  .tools-header {
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
  .header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  .tools-layout {
    flex: 1;
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 0;
    min-height: 0;
  }
  .tools-sidebar {
    background: var(--surface-color);
    border-right: 1px solid var(--border-color);
    padding: 1rem;
    overflow-y: auto;
  }
  .nav {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .nav-group-title {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0 0 0.5rem 0;
  }
  .nav-item {
    width: 100%;
    text-align: left;
    padding: 0.625rem 0.75rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background: var(--background-color);
    color: var(--text-primary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
  }
  .nav-item:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
  }
  .nav-item.active {
    background: var(--primary-color);
    color: #fff;
    border-color: var(--primary-color);
  }
  .tools-main {
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
  @media (max-width: 1024px) {
    .tools-layout {
      grid-template-columns: 220px 1fr;
    }
  }
  @media (max-width: 768px) {
    .tools-layout {
      grid-template-columns: 1fr;
    }
    .tools-sidebar {
      border-right: none;
      border-bottom: 1px solid var(--border-color);
    }
  }
  </style>
  

