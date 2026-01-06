<template>
  <div id="Sidenav" class="sidenav">
    <!-- Header -->
    <div class="sidenav-header" data-aos="fade-right" data-aos-delay="100">
      <div class="header-content">
        <h2 class="section-title">Tipos de Análisis</h2>
        <p class="section-subtitle">Selecciona el tipo de análisis que deseas realizar</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidenav-nav" data-aos="fade-right" data-aos-delay="200">
      <div class="nav-content">
        <div v-for="(category, index) in analisis" :key="index" class="nav-category">
          <div class="category-header">
            <div class="category-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="category-title">{{ category.tabTitle }}</span>
          </div>
          <SubSidenav :analysisTypes="category.analysisTypes" />
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidenav-footer" data-aos="fade-up" data-aos-delay="300">
      <div class="footer-content">
        <p class="footer-text">PEUMO v2.0</p>
        <p class="footer-subtitle">Análisis Inteligente</p>
        <router-link to="/herramientas" class="tools-link">Herramientas</router-link>
        <router-link to="/prompting-lab" class="tools-link">Prompting Lab</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { Analisis } from "@/includes/constants.js";
import SubSidenav from "@/components/SubSidenav.vue";

export default {
  name: "Sidenav",
  components: {
    SubSidenav
  },
  data() {
    return {
      analisis: Analisis,
    };
  },
  methods: {
    ...mapActions(["saveAnalysisGroupTab", "saveAnalisisPantalla"]),
  },
};
</script>

<style scoped>
/* Sidenav Container */
.sidenav {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-color);
  border-right: 1px solid var(--border-color);
  overflow-x: hidden;
  position: relative;
}

/* Header */
.sidenav-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.header-content {
  text-align: center;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

/* Navigation */
.sidenav-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-content {
  padding: 0 1rem;
}

.nav-category {
  margin-bottom: 1.5rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--background-color);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.category-header:hover {
  background: var(--primary-color);
  color: white;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--primary-color);
  transition: all 0.2s ease;
}

.category-header:hover .category-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.category-title {
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.category-header:hover .category-title {
  color: white;
}

/* Footer */
.sidenav-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
}

.footer-content {
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 0.25rem 0;
}

.footer-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.tools-link {
  display: inline-block;
  margin-top: 0.5rem;
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
}

.tools-link:hover {
  text-decoration: underline;
}

/* Scrollbar */
.sidenav-nav::-webkit-scrollbar {
  width: 4px;
}

.sidenav-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidenav-nav::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.sidenav-nav::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidenav {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .sidenav-header {
    padding: 1rem;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .nav-content {
    padding: 0 0.75rem;
  }
  
  .category-header {
    padding: 0.625rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .sidenav-header {
    padding: 0.75rem;
  }
  
  .logo {
    width: 36px;
    height: 36px;
  }
  
  .section-title {
    font-size: 0.875rem;
  }
  
  .nav-content {
    padding: 0 0.5rem;
  }
  
  .category-header {
    padding: 0.5rem;
  }
  
  .category-icon {
    width: 28px;
    height: 28px;
  }
}
</style>


