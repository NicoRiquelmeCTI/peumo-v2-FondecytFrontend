<template>
  <div id="FileHandler" class="file-handler">
    <!-- Header Section -->
    <div class="file-header">
      <h3 class="file-title">Gestión de Documento</h3>
      <p class="file-subtitle">Carga, descarga y evalúa tu texto</p>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <!-- File Upload Section -->
      <div
        class="upload-section"
        @dragover.prevent="onDragOver"
        @dragenter.prevent="onDragEnter"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <label for="file" class="upload-btn" :class="{ dragging: isDragging }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ fileInputLabel }}
        </label>
        <input
          style="display: none"
          type="file"
          id="file"
          ref="file"
          value="Reemplazar el documento"
          @change="handleFileUpload"
          accept=".doc,.docx,.txt"
        />
      </div>

      <!-- Secondary Actions (removed download button per request) -->
    </div>

    <!-- Primary Action -->
    <div class="primary-action">
      <button class="btn-primary" @click="sendEditorText()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Evaluar Texto
      </button>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import { mapActions, mapGetters } from "vuex";
import { PREHTML, POSTHTML } from "@/includes/constants.js";

export default {
  name: "FileHandler",
  data() {
    return {
      file: null,
      isDragging: false,
    };
  },
  computed: {
    ...mapGetters({
      retroalimentacion: "getRetroalimentacion",
      fileName: "getFilename",
      analysisType: "getAnalysisTab",
      textoEditor: "getTextoEditor",
    }),
    fileInputLabel: function () {
      if (this.retroalimentacion.html) return "Reemplazar el documento";
      return "Carga tu texto aquí";
    },
  },
  methods: {
    ...mapActions([
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
      "saveAnalisisPantalla",
    ]),
    onDragOver() {
      // Keep drag state active for visual feedback
      this.isDragging = true;
    },
    onDragEnter() {
      this.isDragging = true;
    },
    onDragLeave() {
      this.isDragging = false;
    },
    onDrop(event) {
      this.isDragging = false;
      const files = event.dataTransfer && event.dataTransfer.files;
      if (!files || files.length === 0) return;
      const dropped = files[0];
      const ext = (dropped.name.split(".").pop() || "").toLowerCase();
      if (!["docx", "doc", "txt"].includes(ext)) {
        this.mostrarToast("Archivo no soportado. Usa .doc, .docx o .txt", "danger");
        return;
      }
      this.file = dropped;
      this.saveFilename(this.file.name);
      this.onSubmit();
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
        this.mostrarToast("No se adjuntó el archivo.", "danger");
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
        console.log(res.data);
        this.saveTodo(res.data);
        this.mostrarToast("Documento analizado correctamente.", "success");
      } catch (err) {
        console.warn(err);
        this.mostrarToast(err, "danger");
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
        console.log(res.data);
        this.saveTodo(res.data);
        this.mostrarToast("Documento analizado correctamente.", "success");
      } catch (err) {
        console.warn(err);
        this.showError = true;
      }
      loader.hide();
    },
    saveTodo(data) {
      this.saveEstadisticasGenerales(data.statistics);
      this.saveGerundios({
        html: data.gerunds.html_response,
        error: data.gerunds.flag,
      });
      this.saveOraciones({
        html: data.oraciones.html_response,
        error: data.oraciones.flag,
      });
      this.saveParrafos({
        html: data.micro_paragraphs.html_response,
        error: data.micro_paragraphs.flag,
      });
      this.savePersona({
        html: data.fs_person.html_response,
        error: data.fs_person.flag,
      });
      this.saveVozPasiva({
        html: data.passive_voice.html_response,
        error: data.passive_voice.flag,
      });
      this.saveConectores({
        html: data.conectores.html_response,
        error: data.conectores.flag,
      });
      this.saveComplejidad({
        html: data.sentence_complexity.html_response,
        error: data.sentence_complexity.flag,
      });
      this.saveLecturabilidad({
        html: data.lecturabilidad_parrafo.html_response,
        error: data.lecturabilidad_parrafo.flag,
      });
      this.saveProposito({
        html: data.proposito.html_response,
        error: data.proposito.flag,
      });
      this.saveAnalisisPantalla({ endpoint: "gerunds", selected: "gerundios" });
    },
    exportHTML() {
      if (this.retroalimentacion.html === null) {
        this.mostrarToast("No se adjuntó el archivo.", "danger");
        return;
      }
      var html2doc = PREHTML + this.retroalimentacion.html + POSTHTML;
      var source =
        "data:application/vnd.ms-word;charset=utf-8," +
        encodeURIComponent(html2doc);
      var fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `${this.fileName}-${this.analysisType}-corregido.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
    },
    mostrarToast(message, variant) {
      let title =
        variant == "success" ? "Operación exitosa" : "Operación fallida";
      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        solid: false,
        autoHideDelay: 2000,
      });
    },
  },
};

// this.saveAnalisisPantalla(this.endpoint);
// const payload = {
//   html: res.data.tipo_analisis.html_response,
//   error: res.data.tipo_analisis.flag,
// };
// switch (this.endpoint) {
//   case "gerunds":
//     this.saveGerundios(payload);
//     break;
//   case "oraciones":
//     this.saveOraciones(payload);
//     break;
//   case "micro_paragraphs":
//     this.saveParrafos(payload);
//     break;
//   case "fs_person":
//     this.savePersona(payload);
//     break;
//   case "passive_voice":
//     this.saveVozPasiva(payload);
//     break;
//   case "conectores":
//     this.saveConectores(payload);
//     break;
//   case "sentence_complexity":
//     this.saveComplejidad(payload);
//     break;
//   case "lecturabilidad_parrafo":
//     this.saveLecturabilidad(payload);
//     break;
//   case "proposito":
//     this.saveProposito(payload);
//     break;
//   default:
//     break;
// }
</script>

<style scoped>
/* File Handler Container */
.file-handler {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

/* Header Section */
.file-header {
  text-align: center;
  flex-shrink: 0;
}

.file-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.file-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-shrink: 0;
}

/* Upload Section */
.upload-section {
  width: 100%;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--background-color);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.upload-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(37, 99, 235, 0.05);
}

.upload-btn.dragging {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(37, 99, 235, 0.08);
}

.upload-btn:active {
  transform: translateY(1px);
}

/* Secondary Actions */
.secondary-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:active {
  transform: translateY(0);
}

/* Primary Action */
.primary-action {
  flex-shrink: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--primary-color);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-primary:disabled {
  background: var(--secondary-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .file-handler {
    padding: 1rem;
    gap: 1rem;
  }
  
  .file-title {
    font-size: 1rem;
  }
  
  .file-subtitle {
    font-size: 0.8125rem;
  }
  
  .upload-btn {
    padding: 0.75rem;
    font-size: 0.8125rem;
  }
  
  .btn-secondary {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .btn-primary {
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .file-handler {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .action-buttons {
    gap: 0.75rem;
  }
  
  .secondary-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .upload-btn {
    padding: 0.625rem;
    font-size: 0.75rem;
  }
  
  .btn-secondary {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .btn-primary {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }
}

/* Loading States */
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:disabled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
}

/* Focus States */
.upload-btn:focus,
.btn-secondary:focus,
.btn-primary:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Icon Animations */
.upload-btn svg,
.btn-secondary svg,
.btn-primary svg {
  transition: transform 0.2s ease;
}

.upload-btn:hover svg,
.btn-secondary:hover svg,
.btn-primary:hover svg {
  transform: scale(1.1);
}
</style>
