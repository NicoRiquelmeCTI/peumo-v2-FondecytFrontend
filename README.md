# PEUMO - FondecytFrontend

## Descripción General

PEUMO es una aplicación web orientada a la retroalimentación y análisis de textos académicos, especialmente informes de ingeniería. Su objetivo es ayudar a los usuarios a mejorar la calidad de sus escritos mediante análisis automáticos y sugerencias, sin requerir conocimientos previos sobre lingüística ni sobre el dominio específico de ingeniería.

## Público objetivo de este README
Este documento está dirigido a desarrolladores que se integran al proyecto y no tienen contexto previo sobre el caso de negocio ni sobre los conceptos de análisis textual o escritura académica.

---

## ¿Qué hace la aplicación?

- Permite a los usuarios cargar documentos de texto (doc, docx, txt) o escribir directamente en un editor web.
- Analiza el texto cargado y entrega retroalimentación automática sobre aspectos gramaticales, formales, de estilo y discursivos.
- Proporciona estadísticas, ejemplos y sugerencias para mejorar la redacción.
- Ofrece cápsulas informativas y recursos de aprendizaje sobre escritura académica.

---

## Flujo de uso típico

1. **Pantalla de inicio**: El usuario puede cargar un archivo o acceder al editor para escribir su texto.
2. **Carga y análisis**: Al cargar un archivo o enviar el texto, la app lo envía a un backend para su análisis.
3. **Dashboard**: Se muestran los resultados en un panel dividido:
   - **Panel izquierdo**: Editor de texto y carga/descarga de archivos.
   - **Panel derecho**: Retroalimentación, estadísticas, concordancia de palabras, procesos de conceptualización, ideación, transcripción y cápsulas informativas.
4. **Navegación**: El usuario puede cambiar entre diferentes tipos de análisis mediante la barra lateral.

---

## Arquitectura y organización del código

La aplicación sigue principios de arquitectura limpia y separación de responsabilidades:

- **Frontend**: Basado en Vue.js 2, Vuex para manejo de estado global y Vue Router para navegación.
- **Componentes**: Cada funcionalidad principal está encapsulada en componentes Vue reutilizables (por ejemplo, `FileHandler`, `Editor`, `PanelIzquierdo`, `PanelDerecho`, `TabRetroalimentacion`, etc.).
- **Estado global**: El store de Vuex centraliza el estado de los análisis, resultados y configuración de la interfaz.
- **Estilos**: Uso de SASS y Bootstrap-Vue para estilos y componentes visuales.
- **Comunicación con backend**: Se realiza mediante Axios, enviando archivos o textos para análisis y recibiendo resultados estructurados.

### Estructura de carpetas relevante

- `src/views/`: Vistas principales (`Inicio.vue`, `Dashboard.vue`).
- `src/components/`: Componentes reutilizables y específicos de cada panel/tab.
- `src/store/`: Estado global (acciones, mutaciones, getters, estado inicial).
- `src/includes/constants.js`: Definición de tipos de análisis y recursos informativos.
- `src/assets/`: Recursos estáticos (imágenes, estilos, fuentes).

---

## Principales conceptos y módulos de análisis

La app analiza el texto en cuatro grandes dimensiones, cada una con subcategorías:

1. **Léxico-Gramatical**
   - Gerundios: Detección y sugerencias para evitar su uso excesivo.
2. **Formal**
   - Oraciones: Identificación de oraciones demasiado extensas o breves.
   - Párrafos: Identificación de párrafos demasiado extensos o breves.
3. **Estilo**
   - Uso de primera/segunda persona.
   - Voz pasiva.
   - Conectores: Ausencia o repetición de conectores.
4. **Discursivo**
   - Complejidad de las oraciones.
   - Lecturabilidad: Facilidad de lectura de los párrafos.
   - Propósito: Identificación de secciones como introducción, desarrollo, resultados y conclusión.

Además, existen módulos de **concordancia** (búsqueda de uso de palabras en corpus), **conceptualización**, **ideación**, **transcripción** y **reconceptualización**, que permiten explorar patrones y ejemplos de escritura académica.

Las **cápsulas informativas** son recursos multimedia para aprender sobre escritura académica y géneros textuales.

---

## Dependencias principales

- [Vue.js 2](https://vuejs.org/): Framework principal de frontend.
- [Vuex](https://vuex.vuejs.org/): Manejo de estado global.
- [Vue Router](https://router.vuejs.org/): Navegación entre vistas.
- [Bootstrap-Vue](https://bootstrap-vue.org/): Componentes visuales y estilos.
- [Axios](https://axios-http.com/): Comunicación HTTP con el backend.
- [Vue Formulate](https://vueformulate.com/): Formularios y validaciones.
- [Vue Quill Editor](https://github.com/surmon-china/vue-quill-editor): Editor de texto enriquecido.
- [Chart.js](https://www.chartjs.org/) y [vue-chartjs](https://vue-chartjs.org/): Gráficos y visualización de datos.

---

## Consideraciones para desarrollo

- El frontend está desacoplado del backend, que expone endpoints para análisis textual.
- El código sigue principios de separación de responsabilidades y modularidad.
- Los errores y mensajes se manejan de forma controlada para evitar caídas de la app.
- El sistema está pensado para ser extendido con nuevos tipos de análisis o recursos educativos.

---

## Recursos útiles para nuevos desarrolladores

- **Cápsulas informativas**: Sección dentro de la app con videos y recursos sobre escritura académica.
- **Ejemplos y sugerencias**: Cada tipo de análisis incluye ejemplos de errores y correcciones.
- **Documentación en el código**: Los componentes y el store están comentados para facilitar la comprensión.

---

## ¿Dudas o sugerencias?

Si tienes dudas sobre el funcionamiento o la arquitectura, revisa primero los componentes principales y el store de Vuex. Para preguntas sobre el dominio, consulta las cápsulas informativas o contacta al equipo de producto.
