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
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-wrapper {
  height: 100%;
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
}

.quill-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Quill Editor Styles */
.quill-editor >>> .ql-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border: none;
  font-size: 14px;
  line-height: 1.6;
}

.quill-editor >>> .ql-editor {
  padding: 1rem;
  min-height: 200px;
  max-height: none;
  overflow-y: auto;
  overflow-x: hidden;
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
    padding: 0.75rem;
    font-size: 13px;
  }
  
  .quill-editor >>> .ql-toolbar {
    padding: 0.375rem;
  }
}

@media (max-width: 480px) {
  .quill-editor >>> .ql-editor {
    padding: 0.5rem;
    font-size: 12px;
  }
  
  .quill-editor >>> .ql-toolbar {
    padding: 0.25rem;
  }
  
  .quill-editor >>> .ql-toolbar .ql-formats {
    margin-right: 0.5rem;
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