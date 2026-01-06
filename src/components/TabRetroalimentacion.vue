<template>
  <div id="TabRetroalimentacion" class="wrapper">
    <div v-if="activeSection" class="section-container">
      <div v-if="activeSection.data && activeSection.data.html" class="section-content">
        <h2 class="section-title">{{ activeSection.name }}</h2>
        <p v-if="activeSection.data.ayuda" class="section-help">{{ activeSection.data.ayuda }}</p>
        <div class="feedback-cards">
          <div
            v-for="(tipoRetroalimentacion, index) in activeSection.data.tiposRetroalimentacion"
            :key="index"
            class="box-dest"
            :class="cardColor(tipoRetroalimentacion, activeSection.data)"
          >
            <div class="cont-tit">
              <img v-if="tipoRetroalimentacion.nro_errores == 0 && !activeSection.data.ayuda" class="ic-check" src="../assets/imag/v1/icon/ic_check_w.svg" alt="" />
              <h3 class="tit">
                {{ tipoRetroalimentacion.feedbackTitle }} ({{ tipoRetroalimentacion.nro_errores }} encontrados)
              </h3>
            </div>
            <p class="baj" v-if="tipoRetroalimentacion.nro_errores == 0">
              {{ tipoRetroalimentacion.positiveFeedback }}
            </p>
            <p class="baj" v-else-if="tipoRetroalimentacion.nro_errores > 0">
              {{ tipoRetroalimentacion.negativeFeedback }}
            </p>
            <div class="cont-btn">
              <a
                data-fancybox=""
                data-src="#modal-selector"
                data-modal="true"
                href="javascript:;"
                class="btn-sec"
                @click="showDetalles(tipoRetroalimentacion.feedbackTitle)"            
                >Ver más</a
              >
            </div>
            <div>
              <b-modal :id="tipoRetroalimentacion.feedbackTitle" size="lg" hide-footer hide-header>
                <DetalleRetroalimentacion :tipoRetroalimentacion="tipoRetroalimentacion"/>
              </b-modal>
            </div>
          </div>
        </div>
        <!-- Chat para esta sección -->
        <SectionChat 
          :section-key="activeSection.key"
          :section-name="activeSection.name"
          :section-data="activeSection.data"
        />
      </div>
      <div v-else class="no-data-message">
        <p>No hay datos de análisis disponibles para esta sección.</p>
      </div>
    </div>
    <div v-else class="no-selection-message">
      <p>Selecciona un análisis desde el panel izquierdo para ver los resultados.</p>
    </div>
  </div>
</template>
  
<script>
import { mapGetters } from "vuex";
import DetalleRetroalimentacion from "@/components/DetalleRetroalimentacion.vue";
import SectionChat from "@/components/SectionChat.vue";

export default {
  name: "TabRetroalimentacion",
  components: {
    DetalleRetroalimentacion,
    SectionChat
  },
  data() {
    return {};
  },
  methods: {
    cardColor(tipoRetroalimentacion, sectionData) {
      if (tipoRetroalimentacion.nro_errores == 0 && !sectionData.ayuda) return 'bg-green';
      return tipoRetroalimentacion.style;
    },
    showDetalles(modal) {
      this.$root.$emit('bv::show::modal', modal, '#btnShow')
    }
  },
  computed: {
    ...mapGetters({
      retroalimentaciones: "getRetroalimentacion",
      analysisTab: "getAnalysisTab",
    }),
    // Mapeo de endpoints a información de secciones
    endpointToSectionMap() {
      return {
        'gerunds': { key: 'gerundios', name: 'Gerundios' },
        'oraciones': { key: 'oraciones', name: 'Oraciones' },
        'micro_paragraphs': { key: 'parrafos', name: 'Párrafos' },
        'fs_person': { key: 'persona', name: 'Persona' },
        'passive_voice': { key: 'vozPasiva', name: 'Voz Pasiva' },
        'conectores': { key: 'conectores', name: 'Conectores' },
        'sentence_complexity': { key: 'complejidad', name: 'Complejidad' },
        'lecturabilidad_parrafo': { key: 'lecturabilidad', name: 'Lecturabilidad' },
        'proposito': { key: 'proposito', name: 'Propósito' },
      };
    },
    activeSection() {
      if (!this.analysisTab) return null;
      
      const sectionInfo = this.endpointToSectionMap[this.analysisTab];
      if (!sectionInfo) return null;
      
      // Usar getRetroalimentacion que ya hace el mapeo correcto
      return {
        key: sectionInfo.key,
        name: sectionInfo.name,
        data: this.retroalimentaciones
      };
    },
  },
};
</script>

<style scoped>
.section-container {
  margin-bottom: 2rem;
}

.section-content {
  padding: 1rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.section-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.section-help {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.feedback-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-data-message,
.no-selection-message {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.no-data-message p,
.no-selection-message p {
  margin: 0;
}
</style>