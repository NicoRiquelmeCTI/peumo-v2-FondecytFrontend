<template>
  <div id="PanelDerecho" class="panel-derecho">
    <div class="container">
      <header class="panel-header">
        <h2 class="panel-title">Acerca de tu texto y otros apoyos</h2>
        <p class="panel-subtitle">Herramientas y recursos para mejorar tu escritura</p>
      </header>
      <!-- tabs -->
      <div class="content">

          <b-nav test1>
              <b-nav-item
                data-toggle-target=".tab-content-1"
                :class="{ 'active': isSelected(0) }"
                @click="selected = 0">Análisis</b-nav-item>
              <b-nav-item
                      data-toggle-target=".tab-content-2"
                      :class="{ 'active': isSelected(1) }"
                      @click="selected = 1" >Concordancia</b-nav-item>
              <b-nav-item
                      data-toggle-target=".tab-content-3"
                      :class="{ 'active': isSelected(3) }"
                      @click="selected = 3">Cápsulas</b-nav-item>
              <b-nav-dropdown
                      id="dropdown_test"
                      text="Consulta Procesos"
                      toggle-class="nav-link-custom"
                      right
              >
                  <b-dropdown-item
                          data-toggle-target=".tab-content-4"
                          :class="{ 'active': isSelected(4) }"
                          @click="selected = 4"
                  >Conceptualización</b-dropdown-item>
                  <b-dropdown-item data-toggle-target=".tab-content-5"
                                   :class="{ 'active': isSelected(5) }"
                                   @click="selected = 5"
                  >Ideación</b-dropdown-item>
                  <b-dropdown-item data-toggle-target=".tab-content-6"
                                   :class="{ 'active': isSelected(6) }"
                                   @click="selected = 6"
                  >Transcripción Traducción</b-dropdown-item>
                  <b-dropdown-item data-toggle-target=".tab-content-7"
                                   :class="{ 'active': isSelected(7) }"
                                   @click="selected = 7"
                  >Traducción Reconceptualización</b-dropdown-item>

              </b-nav-dropdown>
              
          </b-nav>
        <!--
        <nav class="tabs__bar tab-btns">
          <a
            href="#"
            class="tab"
            data-toggle-target=".tab-content-1"
            :class="{ 'active': isSelected(0) }"
            @click="selected = 0"
          >
            Análisis
          </a>
          <a
            href="#"
            class="tab"
            data-toggle-target=".tab-content-2"
            :class="{ 'active': isSelected(1) }"
            @click="selected = 1"
          >
            Concordancia
          </a>
          <a
            href="#"
            class="tab"
            data-toggle-target=".tab-content-4"
            :class="{ 'active': isSelected(2) }"
            @click="selected = 2"
          >
            Consulta Procesos
          </a>
          <a
            href="#"
            class="tab"
            data-toggle-target=".tab-content-3"
            :class="{ 'active': isSelected(3) }"
            @click="selected = 3"
          >
            Cápsulas
          </a>
        </nav>
        -->
        <div class="tabs__content tab-content tab-content-1"
          v-show="isSelected(0)">
          <TabRetroalimentacion />
        </div>
        <div
          class="tabs__content tab-content tab-content-2"
          v-show="isSelected(1)"
        >
          <TabConcordancia />
        </div>
        <div
          class="tabs__content tab-content tab-content-3"
          v-show="isSelected(3)"
        >
          <TabCapsulas />
        </div>

        <div
                class="tabs__content tab-content tab-content-4"
                v-show="isSelected(4)"
        >
            <tabConceptualizacion />
        </div>
        <div
                class="tabs__content tab-content tab-content-5"
                v-show="isSelected(5)"
        >
            <tabIdeacion />
        </div>
          <div
                  class="tabs__content tab-content tab-content-6"
                  v-show="isSelected(6)"
          >
              <tabTranscripcion />
          </div>
          <div
                  class="tabs__content tab-content tab-content-7"
                  v-show="isSelected(7)"
          >
              <tabReconceptualizacion />
          </div>
      </div>
      <!-- / tabs -->
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { Analisis } from "@/includes/constants.js";
import TabRetroalimentacion from "@/components/TabRetroalimentacion.vue";
import TabConcordancia from "@/components/TabConcordancia.vue";

import TabCapsulas from "@/components/TabCapsulas.vue";
import tabConceptualizacion from "./TabConceptualizacion.vue";
import tabIdeacion from "./TabIdeacion.vue";
import tabTranscripcion from "./TabTranscripcion.vue";
import tabReconceptualizacion from "./TabReconceptualizacion.vue";
export default {
  name: "PanelDerecho",
  components: {
    TabRetroalimentacion,
    TabConcordancia,
    TabCapsulas,
      tabConceptualizacion,
      tabIdeacion,
      tabTranscripcion,
      tabReconceptualizacion,
  },
  data() {
    return {
      analisis: Analisis,
      selected: 0,
    };
  },
  computed: {
    ...mapActions(["saveAnalysisGroupTab", "saveAnalisisPantalla"]),
    ...mapGetters({ retroalimentacion: "getRetroalimentacion" }),
  },
  methods: {
    isSelected(i) {
      return i === this.selected;
    },
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
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.panel-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Navigation Tabs */
.nav {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.nav-item {
  margin-right: 0.5rem;
}

.nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: all 0.2s ease;
  border: none;
  background: transparent;
}

.nav-link:hover {
  color: var(--primary-color);
  background: var(--background-color);
}

.nav-link.active {
  color: var(--primary-color);
  background: var(--background-color);
  border-bottom: 2px solid var(--primary-color);
}

/* Tab Content */
.tabs__content {
  padding: 1rem 0;
}

.tabs__content.active {
  display: block;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .panel-title {
    font-size: 1.125rem;
  }
  
  .panel-subtitle {
    font-size: 0.8125rem;
  }
  
  .nav-link {
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.75rem;
  }
  
  .panel-title {
    font-size: 1rem;
  }
  
  .panel-header {
    margin-bottom: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.8125rem;
  }
}

/* Scrollbar */
.content::-webkit-scrollbar {
  width: 4px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}
</style>