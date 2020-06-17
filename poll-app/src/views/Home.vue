<template>


  <div class="home">
    <div id="mainDiv" class="container">
        <h4>Create instant polls</h4>
        <CreatePoll/>
    </div>



  </div>


  
</template>

<script>
// @ is an alias to /src
import CreatePoll from '@/components/CreatePoll.vue'

export default {
  name: 'Home',
  components: {
    CreatePoll
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
