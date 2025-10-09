<template>
<div>
  <div id="Dashboard" class="dashboard" v-if="!showError">
    <!-- Header -->
    <header class="dashboard-header" data-aos="fade-down">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-section">
            <img src="@/assets/imag/v1/logos/logo_main.svg" alt="PEUMO" class="header-logo">
            <span class="brand-name">PEUMO</span>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="welcome-text">Bienvenido</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="dashboard-content">
      <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="sidebar" data-aos="fade-right" data-aos-delay="200">
          <Sidenav />
        </aside>

        <!-- Main Workspace -->
        <main class="workspace">
          <splitpanes
            class="modern-splitpanes"
            vertical
            style="position: relative; height: 100%;"
          >
            <pane min-size="50" size="65" class="workspace-pane">
              <div class="pane-content">
                <PanelIzquierdo />
              </div>
            </pane>
            <pane min-size="20" size="35" class="workspace-pane">
              <div class="pane-content">
                <PanelDerecho />
              </div>
            </pane>
          </splitpanes>
        </main>
      </div>
    </div>
  </div>
  
  <!-- Mobile Error -->
  <div v-else class="mobile-error">
    <ErrorMobile />
  </div>
</div>
</template>

<script>
import { mapGetters } from "vuex";
import Sidenav from "@/components/Sidenav.vue";
import PanelIzquierdo from "@/components/PanelIzquierdo.vue";
import PanelDerecho from "@/components/PanelDerecho.vue";
import ErrorMobile from "@/components/ErrorMobile.vue";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";

export default {
  name: "Dashboard",
  components: {
    Splitpanes,
    Pane,
    Sidenav,
    PanelIzquierdo,
    PanelDerecho,
    ErrorMobile
  },
  data() {
    return {
      showError: false
    };
  },
  computed: {
    ...mapGetters({
      retroalimentacion: "getRetroalimentacion",
    }),
  },
  created() {
    if(window.innerWidth < 767){
      this.showError = true;
    }
    window.addEventListener("resize", () => {
      if(window.innerWidth < 767){
        this.showError = true;
      } else{
        this.showError = false;
      }
    });
  }

};

</script>

<style>
/* Dashboard Layout */
.dashboard {
  height: 100vh;
  max-height: 100vh;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.dashboard-header {
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-logo {
  width: 32px;
  height: 32px;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.welcome-text {
  color: var(--text-secondary);
  font-weight: 500;
}

/* Dashboard Content */
.dashboard-content {
  flex: 1;
  display: flex;
  height: calc(100vh - 80px);
  max-height: calc(100vh - 80px);
  overflow: hidden;
}

.dashboard-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  background: var(--surface-color);
  border-right: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  z-index: 10;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  position: relative;
  height: 100%;
}

/* Workspace */
.workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
  min-width: 0;
  overflow: hidden;
  height: 100%;
  max-height: 100%;
}

/* Modern Splitpanes */
.modern-splitpanes {
  height: 100%;
  max-height: 100%;
}

.workspace-pane {
  background: var(--surface-color);
  border-radius: 0;
  overflow: hidden;
  height: 100%;
  max-height: 100%;
}

.pane-content {
  height: 100%;
  max-height: 100%;
  padding: 0;
  overflow: hidden;
}

/* Splitpanes Styling */
.splitpanes--vertical > .splitpanes__splitter {
  min-width: 8px;
  background: var(--border-color);
  border: none;
  position: relative;
  transition: all 0.2s ease;
}

.splitpanes--vertical > .splitpanes__splitter:hover {
  background: var(--primary-color);
  min-width: 12px;
}

.splitpanes--vertical > .splitpanes__splitter::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 40px;
  background: var(--secondary-color);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.splitpanes--vertical > .splitpanes__splitter:hover::before {
  background: white;
  width: 6px;
  height: 50px;
}

/* Mobile Error */
.mobile-error {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-color);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .header-content {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .workspace {
    height: calc(100vh - 160px);
  }
  
  .header-content {
    padding: 0.75rem 1rem;
  }
  
  .brand-name {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0.5rem;
  }
  
  .brand-name {
    font-size: 1.125rem;
  }
  
  .welcome-text {
    font-size: 0.875rem;
  }
}

/* Animation Classes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translateX(-100%);
}

/* Utility Classes */
.text-justify {
  text-align: justify;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
}

.shadow-card {
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  background: var(--surface-color);
}
</style>

