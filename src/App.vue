<template>
  <div>
    <Scene ws-api-path="ws://localhost:8000/ws/traffic-model/"/>
  </div>
</template>

<script>
import Scene from "./components/Scene"

export default {
  name: 'TrafficModelingApp',
  components: {
    Scene
  }
}
</script>

<style scoped>
body {
  margin: 0px !important;
  padding: 0;
  height: 100%;
  width: 100%;
  display: inline !important;
}
</style>
