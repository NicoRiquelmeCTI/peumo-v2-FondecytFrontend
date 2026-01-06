<template>
  <div id="Editor" class="editor-container">
    <div v-if="retroalimentacion.tiposRetroalimentacion" class="editor-wrapper">
      <div v-if="showError" class="error-container">
        <ErrorHtml />
      </div>
      <div class="quill-container">
        <quill-editor
          v-model="retroalimentacion.html"
          :options="editorOptions"
          @change="onEditorChange($event)"
          ref="myQuillEditor"
          class="quill-editor"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ErrorHtml from "./ErrorHtml.vue";
import { quillEditor } from "vue-quill-editor";
import "../../node_modules/quill/dist/quill.snow.css";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Editor",
  props: ["endpoint"],
  components: {
    ErrorHtml,
    quillEditor,
  },
  data() {
    return {
      showError: false,
      editorOptions: {
        readOnly: false,
        theme: "snow",
        placeholder: "Inserte el texto aquí...",
      },
    };
  },
  computed: {
    ...mapGetters({
      retroalimentacion: "getRetroalimentacion"
    }),
  },
  methods: {
    ...mapActions([
      "savetextoEditor"
    ]),
    onEditorChange({ text }) {
      this.savetextoEditor(text);
    }
  }
};
</script>

<style scoped>
/* Editor Container */
.editor-container {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-wrapper {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.error-container {
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.quill-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: white;
  min-height: 0;
}

.quill-editor {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Quill Editor Styles */
.quill-editor >>> .ql-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border: none;
  font-size: 15px;
  line-height: 1.7;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.quill-editor >>> .ql-editor {
  padding: 1.25rem;
  min-height: 200px;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  height: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-primary);
}

.quill-editor >>> .ql-toolbar {
  border: none;
  border-bottom: 1px solid var(--border-color);
  padding: 0.5rem;
  background: var(--background-color);
}

.quill-editor >>> .ql-toolbar .ql-formats {
  margin-right: 1rem;
}

/* Enhanced Text Highlighting Styles */
.quill-editor >>> .ql-editor .highlight {
  background: rgba(239, 68, 68, 0.15) !important;
  padding: 2px 4px;
  border-radius: 3px;
  border-left: 3px solid #ef4444;
  font-weight: 500;
  color: #dc2626;
  transition: all 0.2s ease;
}

.quill-editor >>> .ql-editor .highlight:hover {
  background: rgba(239, 68, 68, 0.25) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

/* Enhanced Background Colors for Better Contrast */
.quill-editor >>> .ql-editor p.bg-red {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 6px;
  color: #991b1b;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.1);
}

.quill-editor >>> .ql-editor p.bg-yellow {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important;
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 6px;
  color: #92400e;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.1);
}

.quill-editor >>> .ql-editor p.bg-orange {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%) !important;
  border: 1px solid #fdba74;
  border-left: 4px solid #f97316;
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 6px;
  color: #9a3412;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.1);
}

.quill-editor >>> .ql-editor p.bg-blue {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border: 1px solid #93c5fd;
  border-left: 4px solid #3b82f6;
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 6px;
  color: #1e40af;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
}

.quill-editor >>> .ql-editor p.bg-lightgreen {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
  border: 1px solid #86efac;
  border-left: 4px solid #22c55e;
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 6px;
  color: #166534;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.1);
}

/* Strong text styling */
.quill-editor >>> .ql-editor strong {
  font-weight: 600;
  color: var(--text-primary);
  background: rgba(37, 99, 235, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
}

/* Scrollbar for Quill */
.quill-editor >>> .ql-container::-webkit-scrollbar {
  width: 6px;
}

.quill-editor >>> .ql-container::-webkit-scrollbar-track {
  background: transparent;
}

.quill-editor >>> .ql-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.quill-editor >>> .ql-container::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .quill-editor >>> .ql-editor {
    padding: 1rem;
    font-size: 14px;
    line-height: 1.6;
  }
  
  .quill-editor >>> .ql-toolbar {
    padding: 0.5rem;
  }
  
  /* Mobile highlighting adjustments */
  .quill-editor >>> .ql-editor p.bg-red,
  .quill-editor >>> .ql-editor p.bg-yellow,
  .quill-editor >>> .ql-editor p.bg-orange,
  .quill-editor >>> .ql-editor p.bg-blue,
  .quill-editor >>> .ql-editor p.bg-lightgreen {
    padding: 10px 12px;
    margin: 6px 0;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .quill-editor >>> .ql-editor {
    padding: 0.875rem;
    font-size: 13px;
    line-height: 1.5;
  }
  
  .quill-editor >>> .ql-toolbar {
    padding: 0.375rem;
  }
  
  .quill-editor >>> .ql-toolbar .ql-formats {
    margin-right: 0.5rem;
  }
  
  /* Mobile highlighting adjustments */
  .quill-editor >>> .ql-editor p.bg-red,
  .quill-editor >>> .ql-editor p.bg-yellow,
  .quill-editor >>> .ql-editor p.bg-orange,
  .quill-editor >>> .ql-editor p.bg-blue,
  .quill-editor >>> .ql-editor p.bg-lightgreen {
    padding: 8px 10px;
    margin: 4px 0;
    font-size: 13px;
    border-radius: 4px;
  }
  
  .quill-editor >>> .ql-editor .highlight {
    padding: 1px 3px;
    font-size: 13px;
  }
}

/* Legacy styles for compatibility */
.buttonContainer {
  justify-content: space-around;
  display: flex;
  flex-direction: row;
  margin: 2% auto;
  width: 25%;
  min-width: 280px;
}
</style>