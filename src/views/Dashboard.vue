<template>
<div>
  <div id="Dashboard" class="dashboard" v-if="!showError">
    <div class="content-main">
      <Sidenav />
      <div class="main">
        <splitpanes
        class="default-theme"
        vertical
        style="position:'relative'"
        >
          <pane min-size="50" size="65">
            <div class="row">
              <div class="col lg-12">
                <PanelIzquierdo />
              </div>
            </div>
          </pane>
          <pane min-size="20" size="35">
            <div class="row">
              <div class="col lg-12">
                <PanelDerecho />
              </div>
            </div>
          </pane>
        </splitpanes>
      </div>
    </div>
  </div>
  <div v-else>
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
span {
  text-align: justify;
}
.splitpanes--vertical > .splitpanes__splitter {
  min-width: 12px;
  background: linear-gradient(
    90deg,
    rgb(230, 230, 230),
    rgba(230, 230, 230, 0.6)
  ); /* color del separador (por alguna razon debe ser con linear-gradient) */
}
.splitpanes__pane {
  background-color: white !important; /* color de los paneles (fondo default era gris) */
}
</style>

