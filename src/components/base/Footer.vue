<template>
  <v-footer color="surface-darken-1">
    <v-container class="py-8 text-body-2">
      <div class="d-flex justify-space-between flex-column flex-md-row gap-3">
        <div>
          <h5 class="text-h5 mb-4">Contact Us</h5>
          <router-link class="d-block mb-3" to="/contact">Contact</router-link>
          <div>
            Learn more about
            <a href="https://ciroh.ua.edu/" target="_blank">CIROH</a>
          </div>
        </div>
        <div>
          <h5 class="text-h5 mb-4">Policies</h5>
          <a class="d-block mb-3" href="#">Terms of Use</a>
          <a class="d-block" href="#">Privacy</a>
        </div>
        <div class="text-left text-md-center flex-shrink-0">
          <h5 class="text-h5 mb-4">Developed By</h5>
          <v-img
            :src="uwrlLogo"
            alt="UWRL Logo"
            max-width="25rem"
            min-width="20rem"
          ></v-img>
        </div>
        <div>
          <h5 class="text-h5 mb-4">Open Source</h5>
          <p class="mb-3">
            HydroServer is open Source. Find us on
            <a
              href="https://github.com/hydroserver2/hydroserver"
              target="_blank"
              >GitHub.</a
            >
          </p>
          <p class="mb-3">
            Report a bug
            <a
              href="https://github.com/hydroserver2/hydroserver/issues"
              target="_blank"
              >here.</a
            >
          </p>
          <p>
            This is Version {{ version }} of the Hydroserver web application.
          </p>
        </div>
      </div>

      <div class="text-center mt-12">
        <p class="d-inline-block text-body-2">
          &copy; Utah Water Research Laboratory (UWRL). This material is based
          on work supported by the Cooperative Institute for Research to
          Operations in Hydrology (CIROH). Funding was awarded to CIROH through
          the NOAA Cooperative Agreement with the University of Alabama
          (NA22NWS4320003).
        </p>
      </div>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import uwrlLogo from '@/assets/UWRL-min.png'

const version = import.meta.env.VITE_APP_VERSION || '0.0.1'
</script>

<style scoped>
p {
  max-width: 75rem;
}
</style>
