<template>
  <div class="about container" style="margin-top:3rem">
    <Loading v-if="isLoading" />
    <div v-else>
      <div class="row s12">
        <h3 class="col deep-purple-text text-darken-2">Question</h3>
      </div>
      <div class="row s12">
        <h4 class="col" id="askedQuestion">{{pollQuestion}}</h4>
      </div>
      <PollResults v-bind:pollData="pollData" v-if="userVoted" />
      <VoteToPoll
        v-on:fetchPoll="fetchPoll"
        v-bind:userID="userID"
        v-bind:pollID="pollID"
        v-bind:pollData="pollData"
        v-else
      />
      <div class="row s12" style="margin-top: 3rem;">
          <h5 class="row s12 deep-purple-text text-darken-2">Share this poll</h5>
          <div class="row s12">
            <a v-on:click="copyLink" class="waves-effect waves-light btn deep-purple darken-2 col">
              <i class="material-icons left">content_copy</i>Copy link
            </a>
          </div>
      </div>

      <div class="row s12">
          <h5 class="row s12 deep-purple-text text-darken-2">Or scan the QR code</h5>
          <qrcode-vue class="row s12" :value="windowLocation" :size="120" level="M"></qrcode-vue>
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
import QrcodeVue from 'qrcode.vue'

import M from "materialize-css";

export default {
  name: "Poll",
  components: {
    PollResults,
    Loading,
    VoteToPoll,
    QrcodeVue
  },
  data: () => {
    return {
      pollQuestion: String,
      modalInstance: undefined,
      isLoading: true,
      userVoted: false,
      pollData: {},
      pollID: String,
      userID: String,
      windowLocation: String
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
    },
    fetchPollLoop: async function(){
      // This would have been 100% better if it was
      // implemented with sockets, but I am too lazy...

      await this.fetchPoll();
      setTimeout(this.fetchPollLoop, 1000)
    },
    fetchPoll: async function() {
      // Get the poll id from the url
      var url = new URL(window.location.href);
      this.pollID = url.searchParams.get("id");

      // if ID is not provided in the url, show
      // that this poll was not found, eventually
      // redirect to the root page
      if (!this.pollID) {
        this.modalInstance.options.onCloseEnd = () => {
          this.$router.push({ path: "/" });
        };
        this.showModal(
          "Oops",
          `We couldn't quite understand which poll you are
              looking for, the poll_id parameter is missing
                in the url.`
        );
        return;
      }


      // Make a request to the back-end server to get the poll details
      let serverResponse = await fetch(
        `/api/get_poll/${this.pollID}/${this.userID}`,
        {
          method: "GET"
        }
      )
        

      if (serverResponse.ok) {
        // Get the body
        let response = await serverResponse.json();

        try {
          this.pollData = response;
          if (!response.success) {
            this.modalInstance.options.onCloseEnd = () => {
              this.$router.push({ path: "/" });
            };
            this.showModal(
              "Oops",
              `We couldn't access the poll. ${response.info}`
            );
          } else {
            // Fetched the poll details successfully, update the UI
            this.pollQuestion = response.poll_title;
            // This will re-render the UI
            this.userVoted = response.user_voted
            this.isLoading = false;
          }
        } catch (error) {
          // Something went wrong...
          this.showModal("Oops", `We couldn't access the poll ${error}`);
        }
      } else {
        // The http request was not successful
        this.modalInstance.options.onCloseEnd = () => {
          this.$router.push({ path: "/" });
        };
        this.showModal(
          "Oops",
          `We couldn't access the poll. (Can't access the back-end server)`
        );
      }
    }
  },
  mounted: async function() {

    // Get the full url for sharing the poll
    this.windowLocation = location.href

    // Initialize the materialize framework
    M.AutoInit();
    var elems = document.querySelectorAll(".modal");
    var instances = M.Modal.init(elems, {});
    this.modalInstance = instances[0];

    // Instead of fetching the IP on the Client side
    // send -1 as user and, and the back-end server
    // will automatically get the IP address of the
    // client
    this.userID = -1

    // Fetch the poll
    this.fetchPollLoop();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
