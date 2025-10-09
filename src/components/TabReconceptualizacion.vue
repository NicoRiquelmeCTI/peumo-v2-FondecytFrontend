<template>
    <div id="Reconceptualizacion">
        <header class="cont-tit">
            <h2 class="tit">Reconceptualización</h2>
            <div class="description-card">
                <div class="card-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="1" fill="currentColor"/>
                        <circle cx="12" cy="12" r="1" fill="currentColor"/>
                        <circle cx="12" cy="17" r="1" fill="currentColor"/>
                    </svg>
                </div>
                <div class="card-content">
                    <p class="bajada">
                        Puedes complementar esta función con todas las de la columna izquierda ('tipos de análisis').
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
                        v-b-modal.modal-xl-reconceptualizacion
                />

            </FormulateForm>

            <!-- <div class="accordion" role="tablist" id="accordion1">
              <span v-html="resIndice"></span>
            </div> -->
            <b-modal id="modal-xl-reconceptualizacion" size="xl" :title="funciones" hide-footer>
                <div class="accordion" role="tablist" id="accordionReconceptualizacion">
                    <b-card v-for="(item, index) in resIndice2" v-bind:key="index" no-body class="mb-1">
                        <b-card-header header-tag="header" class="p-1" role="tab">
                            <b-button block v-b-toggle="`collapse-${ index }-Reconcept`" variant="info">{{ item.title }}</b-button>
                        </b-card-header>
                        <b-collapse :id="`collapse-${ index }-Reconcept`" accordion="my-accordion" role="tabpanel">
                            <b-card-body>
                                <b-card-text v-html="item.paper_index"></b-card-text>
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
    name: "TabReconceptualizacion",
    data() {
        return {
            resIndice: null,
            resIndice2: [{'title':'test','paper_index':''}],
            patron: null,
            funciones: null,
            optionsFunciones:[
                {value: 'Revisión de objetivo', label:"Revisión de objetivo"},

            ],
        };
    },
    methods: {
        async submitHandler() {
            let loader = this.$loading.show({ isFullPage: true, canCancel: false });
            try {
                const formData = new FormData();
                formData.append("patron", this.patron);
                formData.append("funciones", this.funciones);
                let res = await axios.post(
                    `${process.env.VUE_APP_API_URL}/api/Reconceptualizacion`,
                    formData
                );
                this.resIndice = res.data.html_response;
                this.resIndice2 = res.data.context2;

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