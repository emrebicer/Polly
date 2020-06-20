<template>
  <div>
    <a
      id="voteButton"
      v-on:click="voteClicked"
      class="waves-effect waves-light btn deep-purple darken-2"
      style="margin-top: 1rem;"
    >
      <i class="material-icons left">done</i>
      Vote
    </a>

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
import M from "materialize-css";

export default {
  name: "VoteToPoll",
  props: {
    pollID: String,
    userID: String,
    pollData: Object
  },
  data: function() {
    return {
      modalInstance: undefined
    };
  },
  methods: {
    voteClicked: function() {
      // Find the selected option

      let radioIndex = 0;
      let foundCheckedOptionIndex = -1;
      while (document.getElementById(`option_${radioIndex}`)) {
        if (document.getElementById(`option_${radioIndex}`).checked) {
          // This is the checked radio button
          foundCheckedOptionIndex = radioIndex;
        }
        radioIndex++;
      }

      if (foundCheckedOptionIndex == -1) {
        this.showModal("Oops", "Please select one of the options");
        return;
      }

        // Now make a request to the API to register this vote
        let requestBody = {
            poll_id: this.pollID,
            user_choice_index: foundCheckedOptionIndex,
            user_id: this.userID
        }

        // Can't refer to Vue in fecth, due to this will reference the function itself
        let v = this

        fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(requestBody)
        }).then((r) => {
            r.json().then(response => {
                if (response.success) {
                    // Notify the parent component to fetch the poll again
                    // And show the results...
                    v.$emit('fetchPoll')
                }
                else {
                    v.showModal(`Oops`, `We had a problem while counting your vote: ${response.info}, please try again.`)
                }
            })
        }).catch(function (error) {
            v.showModal(`Oops', 'An error occured while voting poll:, ${error}`)
        })

    },
    showModal: function(title, description) {
      // Initialize the modal
      document.getElementById("modalTitle").innerHTML = title;
      document.getElementById("modalDescription").innerHTML = description;
      this.modalInstance.open();
    }
  },
  mounted: function() {
    M.AutoInit();
    var elems = document.querySelectorAll(".modal");
    var instances = M.Modal.init(elems, {});

    this.modalInstance = instances[0];

    // Append the poll optios to the dom
    for (let index = 0; index < this.pollData.poll_options.length; index++) {
      document.getElementById("voteButton").insertAdjacentHTML(
        "beforebegin",
        `
            <p>
                <label>
                    <input id="option_${this.pollData.poll_options[index].option_id}" name="group" type="radio" />
                    <span class="bold black-text">${this.pollData.poll_options[index].option_title}</span>
                </label>
            </p>
        `
      );
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>