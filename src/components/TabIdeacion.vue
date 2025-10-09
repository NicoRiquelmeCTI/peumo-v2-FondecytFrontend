<template>
    <div id="Ideacion">
        <header class="cont-tit">
            <h2 class="tit">Ideación</h2>
            <div class="description-card">
                <div class="card-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="card-content">
                    <p class="bajada">
                        En la casilla de patrón debes copiar el fragmento de tu tesis que está cumpliendo cierto propósito para revisar oraciones similares. Te sugerimos marcar la opción 'todos los años' para mayor precisión.
                    </p>
                </div>
            </div>
        </header>
        <div class="wrapper">
            <FormulateForm class="filterbar" @submit="submitHandler" #default="{ isLoading }">
                <div class="form-group">
                    <div class="form-group">
                        <FormulateInput
                                type="text"
                                name="patron"
                                label="Patrón"
                                label-class="control-label"
                                placeholder="Patrón"
                                v-model="patron"
                        />
                    </div>
                </div>
                <div class="form-group">
                    <div class="form-group">
                        <FormulateInput
                                type="select"
                                name="anio"
                                label="Año"
                                label-class="control-label"
                                placeholder="Seleccione"
                                :options="optionsTipoAnio"
                                v-model="anio"
                        />
                    </div>
                </div>
                <div class="form-group">
                    <div class="form-group">
                        <FormulateInput
                                type="select"
                                name="funcs"
                                label="Función"
                                label-class="control-label"
                                placeholder="Seleccione"
                                :options="optionsFunciones"
                                v-model="funciones"
                        />
                    </div>
                </div>
                <FormulateInput
                        type="submit"
                        :disabled="isLoading"
                        :label="isLoading ? 'Cargando...' : 'BUSCAR'"
                        class="formulate-input"
                        v-b-modal.modal-xl-ideacion
                />

            </FormulateForm>

            <!-- <div class="accordion" role="tablist" id="accordion1">
              <span v-html="resIndice"></span>
            </div> -->
            <b-modal id="modal-xl-ideacion" size="xl" :title="funciones" hide-footer>
                <div class="accordion" role="tablist" id="accordionIdeacion">
                    <b-card v-for="(item, index) in resIndice2" v-bind:key="index" no-body class="mb-1">
                        <b-card-header header-tag="header" class="p-1" role="tab">
                            <b-button block v-b-toggle="`collapse-${ index }-ideacion`" variant="info">{{ item.title }}</b-button>
                        </b-card-header>
                        <b-collapse :id="`collapse-${ index }-ideacion`" accordion="my-accordion" role="tabpanel">
                            <b-card-body>
                                <div v-html="item.paper_index" class="preserve-line-breaks"></div>
                            </b-card-body>
                        </b-collapse>
                    </b-card>
                </div>
            </b-modal>
        </div>

    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "TabIdeacion",
    data() {
        return {
            resIndice: null,
            resIndice2: [{'title':'','paper_index':''}],
            patron: null,
            anio: "null",
            funciones: null,
            optionsTipoAnio: [
                { value: "null", label: "Todos los años" },
                { value: "2007", label: "2007" },
                { value: "2008", label: "2008" },
                { value: "2009", label: "2009" },
                { value: "2010", label: "2010" },
                { value: "2011", label: "2011" },
                { value: "2012", label: "2012" },
                { value: "2013", label: "2013" },
                { value: "2014", label: "2014" },
                { value: "2015", label: "2015" },
                { value: "2016", label: "2016" },
                { value: "2017", label: "2017" },
                { value: "2018", label: "2018" },
                { value: "2019", label: "2019" },
                { value: "2020", label: "2020" },
                { value: "2021", label: "2021" },

            ],
            optionsFunciones:[
                {value: 'Títulos', label:"Títulos"},
                {value: 'Palabras clave', label:"Palabras clave"},
                {value: 'Nubes conceptuales', label:"Nubes conceptuales"},
                {value: 'Hallazgos previos', label:"Hallazgos previos"},
                {value: 'Espacios de contribución', label:"Espacios de contribución"},
                {value: 'Relevancia investigaciones previas', label:"Relevancia investigaciones previas"}

            ],
        };
    },
    methods: {
        async submitHandler() {
            let loader = this.$loading.show({ isFullPage: true, canCancel: false });
            try {
                const formData = new FormData();
                formData.append("patron", this.patron);
                formData.append("anio", this.anio);
                formData.append("funciones", this.funciones);
                let res = await axios.post(
                    `${process.env.VUE_APP_API_URL}/api/Ideacion`,
                    formData
                );
                this.resIndice = res.data.html_response;

                // Si es un array, para cada uno de sus elementos, limpiar el campo paper_index para dejar solo texto plano
                const context2 = res.data.context2.map(item => {
                    item.paper_index = item.paper_index
                        .replace(/<[^>]*>?/g, '')
                        .split(/[.!?]+\s+/)
                        .filter(sentence => sentence.trim().length > 0)
                        .map(sentence => `• ${sentence.trim()}`)
                        .join('<br>');
                    return item;
                });
                this.resIndice2 = context2;
                this.makeToast(
                    "Mostrar Indice realizado exitosamente.",
                    "success"
                );
            } catch (err) {
                console.warn(err);
                this.makeToast(err, "danger");
            }
            loader.hide();
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
        },
    },
};
</script>

<style scoped>
.preserve-line-breaks {
  white-space: pre-line;
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* Description Card Styles */
.description-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-top: 1rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.description-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.bajada {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .description-card {
    padding: 0.875rem;
    gap: 0.625rem;
  }
  
  .card-icon {
    width: 28px;
    height: 28px;
  }
  
  .bajada {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .description-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .card-icon {
    align-self: flex-start;
  }
}
</style>