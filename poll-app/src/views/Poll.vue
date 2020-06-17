<template>
  <div class="about container" style="margin-top:3rem">
    <Loading v-if="isLoading" />
    <div v-else>
      <div class="row s12">
        <h3 class="col deep-purple-text text-darken-2">Question</h3>
      </div>
      <div class="row s12">
        <h5 class="col" id="askedQuestion">{{pollQuestion}}</h5>
      </div>
      <PollResults v-bind:pollData="pollData" v-if="userVoted" />
      <VoteToPoll v-bind:userIP="userIP" v-bind:pollID="pollID" v-bind:pollData="pollData" v-else />
      <div class="row s12" style="margin-top: 3rem;">
        <h5 class="col deep-purple-text text-darken-2">Share this poll</h5>
      </div>
      <div class="row s12">
        <a v-on:click="copyLink" class="waves-effect waves-light btn deep-purple darken-2 col">
          <i class="material-icons left">content_copy</i>Copy link
        </a>
      </div>
    </div>

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
// @ is an alias to /src
import PollResults from "@/components/PollResults.vue";
import Loading from "@/components/Loading.vue";
import VoteToPoll from "@/components/VoteToPoll.vue";
import M from "materialize-css";

export default {
  name: "Poll",
  components: {
    PollResults,
    Loading,
    VoteToPoll
  },
  data: () => {
    return {
      pollQuestion: String,
      modalInstance: undefined,
      isLoading: true,
      userVoted: false,
      pollData: {},
      pollID: "123321321",
      userIP: "132.321.321.321"
    };
  },
  methods: {
    copyLink: function() {
      // Copy the poll link (current url link) to the clipboard
      const el = document.createElement("textarea");
      el.value = window.location.href;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      const selected =
        document.getSelection().rangeCount > 0
          ? document.getSelection().getRangeAt(0)
          : false;
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
      }

      // Notify the user
      M.toast({ html: "Copied to the clipboard!" });
    },
    showModal: function(title, description) {
      // Initialize the modal
      document.getElementById("modalTitle").innerHTML = title;
      document.getElementById("modalDescription").innerHTML = description;
      this.modalInstance.open();
    }
  },
  mounted: async function() {
    M.AutoInit();
    var elems = document.querySelectorAll(".modal");
    var instances = M.Modal.init(elems, {});

    this.modalInstance = instances[0];

    // Get the poll id from the url
    var url = new URL(window.location.href);
    this.pollID = url.searchParams.get("id");

    // if ID is not provided in the url, show
    // that this poll was not found, eventually
    // redirect to the root page
    if (!this.pollID) {
      this.modalInstance.options.onCloseEnd = () => {
      }
      this.showModal(
        "Oops",
        `We couldn't quite understand which poll you are
             looking for, the poll_id parameter is missing
              in the url.`
      )
      return;
    }

    // Vue instance
    let v = this;

    this.userIP = await fetch("https://api6.ipify.org?format=json")
      .then(response => response.json())
      .then(data => data.ip)
      .catch(err => {
        v.modalInstance.options.onCloseEnd = () => {
          v.$router.push({ path: '/'})
        }
        v.showModal(
          "Oops",
          `Your browser is restricting access to your IP,
                 please deactivate shield or try accessing the 
                 poll from a different browser; ${err}`
        )

        return;
      })

    // Make a request to the back-end server to get the poll details
    fetch(`/api/get_poll/${this.pollID}/${this.userIP}`, {
      method: "GET"
    })
      .then(r => {
        r.json().then(response => {
          this.pollData = response;
          if (!response.success) {
            v.modalInstance.options.onCloseEnd = () => {
              v.$router.push({ path: '/'})
            };
            v.showModal(
              "Oops",
              `We couldn't access the poll. ${response.info}`
            );
          } else {

            v.pollQuestion = response.poll_title
            if (!response.user_voted) {
              // User has not voted update the UI
              this.userVoted = false;
            } else {
              // User already voted, show the results
              this.userVoted = true;
            }

            this.isLoading = false;
          }
        });
      })
      .catch(function(error) {
        v.modalInstance.options.onCloseEnd = () => {
          v.$router.push({ path: '/'})
        };
        v.showModal(
          "Oops",
          `An error occured while fetching the poll: ${error}`
        );
      });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
