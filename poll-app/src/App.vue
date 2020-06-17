<template>
  <div id="app">
    <Navbar/>
    <main>
          <router-view/>
    </main>
    <Footer/>
  </div>
</template>


<script>
// @ is an alias to /src
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'


export default {
  name: 'Home',
  components: {
    Navbar,
    Footer
  },

}
</script>


<style>
  main {
      flex: 1 0 auto;
  }

  #app {
       display: flex;
   min-height: 100vh;
   flex-direction: column;
    font-family: 'Montserrat', sans-serif;
  }

  #mainDiv{
    margin-top:3rem;
    margin-bottom: 3rem;
  }

    input:focus {
    color: #512da8 !important;
    border-bottom: 1px solid #512da8 !important;
    box-shadow: 0 1px 0 0 #512da8 !important;
  }

  label.active {
    color: #512da8 !important;
  }

  [type="radio"]:checked+span:after,
    [type="radio"].with-gap:checked+span:after {
        background-color: #512da8 !important;
        border-color: #512da8 !important;
    }

    .progress {
        background-color: #d1c4e9 !important;
    }

    .progress .determinate {
        background-color: #512da8 !important;
    }

    .progress .indeterminate {
        background-color: #512da8 !important;
    }
</style>
