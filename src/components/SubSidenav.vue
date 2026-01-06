<template>
  <div id="SubSidenav" class="sub-sidenav">
    <div class="analysis-list">
      <div
        v-for="(analysis, index) in analysisTypes"
        :key="index"
        class="analysis-item"
        :class="{ 'analysis-item--active': isSelected(index) }"
        @click="selectAnalysis(analysis, index)"
      >
        <div class="analysis-content">
          <div class="analysis-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="analysis-title">{{ analysis.analysisTitle }}</span>
          <div class="analysis-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { Analisis } from "@/includes/constants.js";

export default {
  name: "Sidenav",
  props: ["analysisTypes"],
  components: {},
  data() {
    return {
      analisis: Analisis,
    };
  },
  computed: {
    ...mapGetters(["getSelectedTabIndex"]),
  },
  methods: {
    ...mapActions(["saveAnalisisPantalla", "saveAnalysisGroupTab"]),
    selectAnalysis(analysis, index) {
      this.saveAnalisisPantalla({
        endpoint: analysis.endpoint,
        selected: index,
      });
      this.tabRetro();
    },
    tabRetro() {
      this.$root.$emit("tabRetro");
    },
    isSelected(i) {
      return i === this.getSelectedTabIndex;
    },
  },
};
</script>

<style scoped>
/* Sub Sidenav */
.sub-sidenav {
  margin-left: 1rem;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.analysis-item {
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  overflow: hidden;
}

.analysis-item:hover {
  background: var(--background-color);
}

.analysis-item--active {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-sm);
}

.analysis-item--active:hover {
  background: var(--primary-dark);
}

.analysis-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  position: relative;
}

.analysis-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--primary-color);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.analysis-item:hover .analysis-icon {
  background: rgba(255, 255, 255, 0.2);
  color: var(--primary-color);
}

.analysis-item--active .analysis-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.analysis-item--active:hover .analysis-icon {
  background: rgba(255, 255, 255, 0.3);
}

.analysis-title {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.analysis-item:hover .analysis-title {
  color: var(--primary-color);
}

.analysis-item--active .analysis-title {
  color: white;
  font-weight: 600;
}

.analysis-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.analysis-item:hover .analysis-arrow {
  color: var(--primary-color);
}

.analysis-item--active .analysis-arrow {
  color: white;
}

.analysis-item--active:hover .analysis-arrow {
  /* Sin movimiento horizontal */
}

/* Responsive Design */
@media (max-width: 768px) {
  .sub-sidenav {
    margin-left: 0.75rem;
  }
  
  .analysis-content {
    padding: 0.625rem 0.75rem;
    gap: 0.625rem;
  }
  
  .analysis-icon {
    width: 20px;
    height: 20px;
  }
  
  .analysis-title {
    font-size: 0.8125rem;
  }
  
  .analysis-arrow {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .sub-sidenav {
    margin-left: 0.5rem;
  }
  
  .analysis-content {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .analysis-icon {
    width: 18px;
    height: 18px;
  }
  
  .analysis-title {
    font-size: 0.75rem;
  }
  
  .analysis-arrow {
    width: 14px;
    height: 14px;
  }
}
</style>

