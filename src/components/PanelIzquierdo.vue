<template>
  <div id="PanelIzquierdo">
    <div class="container">
      <header class="enc-txt">
        <h1 class="tit">Tu texto</h1>
        <p class="doc-name">{{ this.filename }}</p>
      </header>
      <FileHandler />
      <Editor />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { Analisis } from "@/includes/constants.js";
import FileHandler from "@/components/FileHandler.vue";
import Editor from "@/components/Editor.vue";

export default {
  name: "PanelIzquierdo",
  components: {
    FileHandler,
    Editor
  },
  data() {
    return {
      analisis: Analisis,
    };
  },
  methods: {
    ...mapActions(["saveAnalysisGroupTab", "saveAnalisisPantalla"]),
  },
  computed: {
    ...mapGetters({filename: "getFilename"})
  }
};
</script>

<style>
#PanelIzquierdo {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-color);
  overflow: hidden;
}

.container {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow: hidden;
}

.enc-txt {
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.tit {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.doc-name {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .tit {
    font-size: 1.25rem;
  }
  
  .doc-name {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.75rem;
  }
  
  .tit {
    font-size: 1.125rem;
  }
  
  .enc-txt {
    margin-bottom: 1rem;
  }
}
</style>
