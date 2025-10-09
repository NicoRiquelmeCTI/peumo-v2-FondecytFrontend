<template>
  <div id="PanelIzquierdo">
    <div class="container">
      <!-- Document Header -->
      <header class="document-header">
        <!-- Document Actions Row -->
        <div class="document-actions-row">
          <button class="btn-replace" @click="triggerFileUpload" title="Reemplazar documento">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Reemplazar
          </button>
          <button class="btn-download" @click="exportHTML" title="Descargar documento">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Descargar
          </button>
        </div>

        <!-- Document Title and Analysis -->
        <div class="document-main">
          <div class="document-title-section">
            <h1 class="document-name">{{ filename || 'Documento sin título' }}</h1>
            <div class="document-status">
              <span class="status-indicator"></span>
              <span class="status-text">Listo para editar</span>
            </div>
          </div>
          
          <button class="btn-analyze" @click="sendEditorText" :disabled="!hasContent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Analizar Documento
          </button>
        </div>
      </header>

      <!-- Hidden File Input -->
      <input
        ref="file"
        type="file"
        id="file"
        style="display: none"
        @change="handleFileUpload"
        accept=".doc,.docx,.txt"
      />

      <!-- Editor -->
      <div class="editor-section">
        <Editor />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { Analisis } from "@/includes/constants.js";
import Editor from "@/components/Editor.vue";
import axios from "axios";

export default {
  name: "PanelIzquierdo",
  components: {
    Editor
  },
  data() {
    return {
      analisis: Analisis,
      file: null
    };
  },
  computed: {
    ...mapGetters({
      filename: "getFilename",
      retroalimentacion: "getRetroalimentacion",
      textoEditor: "getTextoEditor"
    }),
    hasContent() {
      return this.textoEditor && this.textoEditor.trim().length > 0;
    }
  },
  methods: {
    ...mapActions([
      "saveAnalysisGroupTab", 
      "saveAnalisisPantalla",
      "saveEstadisticasGenerales",
      "saveGerundios",
      "saveOraciones",
      "saveParrafos",
      "savePersona",
      "saveVozPasiva",
      "saveConectores",
      "saveComplejidad",
      "saveLecturabilidad",
      "saveProposito",
      "saveFilename",
      "saveAnalisisPantalla"
    ]),
    triggerFileUpload() {
      this.$refs.file.click();
    },
    handleFileUpload() {
      this.file = this.$refs.file.files[0];
      this.saveFilename(this.file.name);
      this.onSubmit();
    },
    async onSubmit() {
      const formData = new FormData();
      formData.append("file", this.file);
      if (!this.file) {
        this.makeToast("No se adjuntó el archivo.", "danger");
        return 0;
      }
      let extension = this.file.name.split(".")[1];
      let loader = this.$loading.show({ isFullPage: true, canCancel: false });
      try {
        if (!["docx", "doc", "txt"].includes(extension)) {
          throw new Error(
            "Archivo no soportado, utilice documentos con extensión .doc, .docx o .txt"
          );
        }
        let res = await axios.post(
          `${process.env.VUE_APP_API_URL}/api/FileUploadView`,
          formData
        );
        this.saveEstadisticasGenerales(res.data.statistics);
        this.saveGerundios({
          html: res.data.gerunds.html_response,
          error: res.data.gerunds.flag,
        });
        this.saveOraciones({
          html: res.data.oraciones.html_response,
          error: res.data.oraciones.flag,
        });
        this.saveParrafos({
          html: res.data.micro_paragraphs.html_response,
          error: res.data.micro_paragraphs.flag,
        });
        this.savePersona({
          html: res.data.fs_person.html_response,
          error: res.data.fs_person.flag,
        });
        this.saveVozPasiva({
          html: res.data.passive_voice.html_response,
          error: res.data.passive_voice.flag,
        });
        this.saveConectores({
          html: res.data.conectores.html_response,
          error: res.data.conectores.flag,
        });
        this.saveComplejidad({
          html: res.data.sentence_complexity.html_response,
          error: res.data.sentence_complexity.flag,
        });
        this.saveLecturabilidad({
          html: res.data.lecturabilidad_parrafo.html_response,
          error: res.data.lecturabilidad_parrafo.flag,
        });
        this.saveProposito({
          html: res.data.proposito.html_response,
          error: res.data.proposito.flag,
        });
        this.saveAnalisisPantalla({endpoint: "gerunds", selected: "gerundios"});
        this.makeToast("Documento analizado correctamente.", "success");
      } catch (err) {
        console.warn(err);
        this.makeToast(err, "danger");
      } finally {
        loader.hide();
      }
    },
    async sendEditorText() {
      let loader = this.$loading.show({ isFullPage: true, canCancel: false });
      try {
        const formData = new FormData();
        formData.append(
          "html",
          this.retroalimentacion.html.replace(/<\/?span[^>]*>/g, "")
        );
        formData.append("text", this.textoEditor);
        let res = await axios.post(
          `${process.env.VUE_APP_API_URL}/api/SendText`,
          formData
        );
        this.saveEstadisticasGenerales(res.data.statistics);
        this.saveGerundios({
          html: res.data.gerunds.html_response,
          error: res.data.gerunds.flag,
        });
        this.saveOraciones({
          html: res.data.oraciones.html_response,
          error: res.data.oraciones.flag,
        });
        this.saveParrafos({
          html: res.data.micro_paragraphs.html_response,
          error: res.data.micro_paragraphs.flag,
        });
        this.savePersona({
          html: res.data.fs_person.html_response,
          error: res.data.fs_person.flag,
        });
        this.saveVozPasiva({
          html: res.data.passive_voice.html_response,
          error: res.data.passive_voice.flag,
        });
        this.saveConectores({
          html: res.data.conectores.html_response,
          error: res.data.conectores.flag,
        });
        this.saveComplejidad({
          html: res.data.sentence_complexity.html_response,
          error: res.data.sentence_complexity.flag,
        });
        this.saveLecturabilidad({
          html: res.data.lecturabilidad_parrafo.html_response,
          error: res.data.lecturabilidad_parrafo.flag,
        });
        this.saveProposito({
          html: res.data.proposito.html_response,
          error: res.data.proposito.flag,
        });
        this.saveAnalisisPantalla({ endpoint: "gerunds", selected: "gerundios" });
        this.makeToast("Documento analizado correctamente.", "success");
      } catch (err) {
        console.warn(err);
        this.makeToast(err, "danger");
      }
      loader.hide();
    },
    async exportHTML() {
      if (this.retroalimentacion.html === null) {
        this.makeToast("No se adjuntó el archivo.", "danger");
        return;
      }
      var html2doc = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>" + this.retroalimentacion.html + "</body></html>";
      var source =
        "data:application/vnd.ms-word;charset=utf-8," +
        encodeURIComponent(html2doc);
      var fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `${this.filename}-corregido.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
    },
    makeToast(message, variant) {
      let title =
        variant == "success" ? "Operación exitosa" : "Operación fallida";
      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        solid: false,
        autoHideDelay: 2000,
      });
    }
  }
};
</script>

<style scoped>
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
  padding: 0;
  overflow: hidden;
}

/* Document Header */
.document-header {
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem;
  flex-shrink: 0;
}

/* Document Actions Row */
.document-actions-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn-replace,
.btn-download {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.btn-replace:hover,
.btn-download:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-replace:active,
.btn-download:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-replace:focus,
.btn-download:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Document Main Section */
.document-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.document-title-section {
  flex: 1;
  min-width: 0;
}

.document-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  word-break: break-word;
  line-height: 1.3;
}

.document-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Analyze Button */
.btn-analyze {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-lg);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-analyze:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-dark);
}

.btn-analyze:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-analyze:disabled {
  background: var(--secondary-color);
  border-color: var(--secondary-color);
  color: rgba(255, 255, 255, 0.6);
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-sm);
}

.btn-analyze:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

/* Button Hover Effects */
.btn-replace::before,
.btn-download::before,
.btn-analyze::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-replace:hover::before,
.btn-download:hover::before,
.btn-analyze:hover::before {
  left: 100%;
}

/* Editor Section */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface-color);
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .document-main {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .btn-analyze {
    align-self: center;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .document-header {
    padding: 1rem;
  }
  
  .document-actions-row {
    margin-bottom: 1rem;
  }
  
  .document-name {
    font-size: 1.25rem;
  }
  
  .btn-replace,
  .btn-download {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }
  
  .btn-analyze {
    padding: 0.875rem 1.5rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .document-header {
    padding: 0.75rem;
  }
  
  .document-actions-row {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .btn-replace,
  .btn-download {
    padding: 0.5rem;
    font-size: 0.75rem;
    justify-content: center;
  }
  
  .document-name {
    font-size: 1.125rem;
  }
  
  .btn-analyze {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
  }
}

/* Icon Animations */
.btn-replace svg,
.btn-download svg,
.btn-analyze svg {
  transition: transform 0.2s ease;
}

.btn-replace:hover svg,
.btn-download:hover svg,
.btn-analyze:hover svg {
  transform: scale(1.1);
}
</style>

