<template>
          <div class="row card-panel">
        <form id="pollForm" class="col s12">
          <div class="row">
            <div class="input-field col s12">
              <i class="material-icons prefix deep-purple-text text-darken-2">hdr_weak</i>
              <input v-model="pollQuestion" id="question" type="text">
              <label for="question">Type your question here</label>
            </div>
          </div>
          <h5>Options</h5>
          <div class="row">
            <div class="input-field col s12">
              <i class="material-icons prefix deep-purple-text text-darken-2">chevron_right</i>
              <input id="option1" type="text">
              <label for="poll_option">Poll option #1</label>
            </div>
          </div>

          <div class="row">
            <div class="input-field col s12">
              <i class="material-icons prefix deep-purple-text text-darken-2">chevron_right</i>
              <input id="option2" type="text">
              <label for="poll_option">Poll option #2</label>
            </div>
          </div>

          <div class="row">
            <div class="input-field col s12">
              <i class="material-icons prefix deep-purple-text text-darken-2">chevron_right</i>
              <input id="option3" type="text">
              <label for="poll_option">Poll option #3</label>
            </div>
          </div>

          <div id="confirmPollButton" class="floating-action-btn right">
            <a v-on:click="confirmPoll" class="btn-floating btn-large deep-purple darken-2 pulse">
              <i class="large material-icons">done</i>
            </a>
          </div>
        </form>

        <!-- Modal -->
        <div id="warningModal" class="modal">
          <div class="modal-content">
            <h4 id="modalTitle"></h4>
            <p id="modalDescription"></p>
          </div>
          <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-green btn-flat">okay</a>
          </div>
        </div>

      </div>

</template>


<script>
import M from 'materialize-css'


export default {
  name: 'CreatePoll',
  data: function(){
    return{
      pollQuestion: '',
      modalInstance: undefined,
      currentFinalOptionIndex: 3
    }
  },
  methods:{
    confirmPoll: function(){

      // Check if the question is filled
      if(this.pollQuestion == ''){
        this.showModal('Oops','Please enter a question for the poll')
        return
      }

      // Fetch the options
      let validOptions = []

      let optionIndex = 1
      let currentOptionElement = document.getElementById(`option${optionIndex}`)
      while (currentOptionElement) {
          if (!currentOptionElement) {
              // This element does not exist we have reached
              // the end of the options list
              break
          }
          else {
              // Check if the provided input is valid
              if (currentOptionElement.value.length >= 1) {
                  validOptions.push(currentOptionElement.value)
              }
          }
          optionIndex++
          currentOptionElement = document.getElementById(`option${optionIndex}`)
      }

      if(validOptions.length < 2){
        this.showModal('Oops','Please provide at least 2 options to your poll')
        return
      }

      // Provided data is valid
      // Prepare the data that will be passed into the API
      let requestData = {
          poll_title: this.pollQuestion,
          poll_options: validOptions
      }

      // Stringify the data
      let postDataString = JSON.stringify(requestData)

      // Make the request to the backend

      // Can't refer to Vue in fecth, due to this will reference the function itself
      let v = this

      fetch('/api/create_poll', {
          method: 'POST',
          headers: {'Content-Type':'text/plain;charset=UTF-8'}, 
          body: postDataString
      }).then((r) =>{
          r.json().then(response=>{
              console.log(response)
              if(response.success){
                  console.log('Created the poll succesfull')
                  // Navigate to the poll page
                  this.$router.push({ path: 'poll', query: { id: response.poll_id }})
              }
              else{
                  v.showModal(`Oops`, `We had a problem while creating your poll: ${response.info}, please try again.`)
              }
          })
      }).catch(function(error) {
          console.log("An error occured while creating poll:", error)
          v.showModal(`Oops`, `An error occured while creating poll:, ${error}`)
      })

    },
    showModal: function(title, description){
        // Initialize the modal
        document.getElementById('modalTitle').innerHTML = title
        document.getElementById('modalDescription').innerHTML = description
        this.modalInstance.open()  
    },
    changeEventListenerElement: function(){
      // Remove the event listener from the current last
      // option in the UI 
      document.getElementById(`option${this.currentFinalOptionIndex}`)
          .removeEventListener('input', this.changeEventListenerElement)

      // Add a new option to the UI
      this.appendNewOption_DOM()

      // Attach an event listener to the newly created option field
      document.getElementById(`option${this.currentFinalOptionIndex}`)
          .addEventListener('input', this.changeEventListenerElement)
      
    },
    appendNewOption_DOM: function(){
      this.currentFinalOptionIndex++
      document.getElementById(`confirmPollButton`)
          .insertAdjacentHTML('beforebegin',
              `
                  <div class="row">
                      <div class="input-field col s12">
                          <i class="material-icons prefix deep-purple-text text-darken-2">chevron_right</i>
                          <input id="option${this.currentFinalOptionIndex}" type="text">
                          <label for="poll_option">Poll option #${this.currentFinalOptionIndex}</label>
                      </div>
                  </div>
          `);
    }
  },
  mounted () {
    M.AutoInit()
    var elems = document.querySelectorAll('.modal')
    var instances = M.Modal.init(elems, {})

    this.modalInstance = instances[0]

    // When user types in to the last option create a new option
    document.getElementById(`option${this.currentFinalOptionIndex}`)
        .addEventListener('input', this.changeEventListenerElement)
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>