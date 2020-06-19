<template>


  <div class="container NotFoundMainDiv">

    <h2 class='deep-purple-text text-darken-2'>Oops!</h2>
    <i class="material-icons medium">search</i>
    <h5>We couldn't find that page</h5>
    <router-link to="/" tag="button"

            class="waves-effect waves-light btn deep-purple darken-2"
            style="margin-top: 1rem;"
    >
      <i class="material-icons left">poll</i>
      back to homepage

    </router-link>


  </div>


  
</template>

<script>


export default {
  name: 'NotFound',

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
