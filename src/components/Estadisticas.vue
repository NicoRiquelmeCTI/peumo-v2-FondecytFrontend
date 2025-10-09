<template id="Estadisticas">
  <div class="estadisticas-container">
    <div class="estadisticas-header">
      <h3 class="estadisticas-title">Estadísticas del Documento</h3>
      <p class="estadisticas-subtitle">Métricas de contenido</p>
    </div>
    
    <div v-if="estadisticas" class="stats-horizontal">
      <!-- Párrafos Widget -->
      <div class="stat-widget stat-paragraphs">
        <div class="widget-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="widget-content">
          <div class="widget-number">{{ estadisticas.analysis.paragraphs }}</div>
          <div class="widget-label">Párrafos</div>
        </div>
      </div>

      <!-- Oraciones Widget -->
      <div class="stat-widget stat-sentences">
        <div class="widget-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="1" fill="currentColor"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div class="widget-content">
          <div class="widget-number">{{ estadisticas.analysis.total_sentences }}</div>
          <div class="widget-label">Oraciones</div>
        </div>
      </div>

      <!-- Palabras Widget -->
      <div class="stat-widget stat-words">
        <div class="widget-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 9H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="widget-content">
          <div class="widget-number">{{ estadisticas.analysis.total_words }}</div>
          <div class="widget-label">Palabras</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando estadísticas...</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "Estadisticas",
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters({
      estadisticas: "getEstadisticasGenerales",
    }),
  },
};
</script>

<style scoped>
/* Estadísticas Container */
.estadisticas-container {
  padding: 1.5rem;
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

/* Header */
.estadisticas-header {
  text-align: center;
  margin-bottom: 2rem;
}

.estadisticas-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.estadisticas-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Stats Horizontal */
.stats-horizontal {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: nowrap;
  width: 100%;
}

/* Stat Widget */
.stat-widget {
  position: relative;
  background: var(--background-color);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  overflow: hidden;
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
}

.stat-widget:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

/* Widget Icons */
.widget-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.stat-paragraphs .widget-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.stat-sentences .widget-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.stat-words .widget-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.stat-widget:hover .widget-icon {
  transform: scale(1.1);
}

/* Widget Content */
.widget-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  flex-shrink: 1;
}

.widget-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 0.25rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.widget-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  white-space: nowrap;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .estadisticas-container {
    padding: 1rem;
  }
  
  .stats-horizontal {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .stat-widget {
    flex: 1 1 calc(50% - 0.375rem);
    min-width: 150px;
    padding: 0.875rem 1rem;
  }
  
  .widget-number {
    font-size: 1.25rem;
  }
  
  .widget-icon {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .estadisticas-container {
    padding: 0.75rem;
  }
  
  .estadisticas-title {
    font-size: 1.125rem;
  }
  
  .estadisticas-subtitle {
    font-size: 0.8125rem;
  }
  
  .stats-horizontal {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-widget {
    flex: 1 1 auto;
    min-width: auto;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }
  
  .widget-number {
    font-size: 1.125rem;
  }
  
  .widget-label {
    font-size: 0.75rem;
  }
  
  .widget-icon {
    width: 32px;
    height: 32px;
  }
}

/* Hover Effects */
.stat-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
  transition: left 0.5s ease;
}

.stat-widget:hover::before {
  left: 100%;
}

/* Focus States */
.stat-widget:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>
  