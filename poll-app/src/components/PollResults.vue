<template>
    <div id="pollResultsDiv">
    </div>
</template>

<script>
export default {
  name: 'PollResults',
  props:{
      pollData: Object
  },
  mounted: function(){
    // Get the total # of votes
    let totalVotes = 0
    for (let index = 0; index < this.pollData.poll_vote_counts.length; index++) {
        totalVotes += this.pollData.poll_vote_counts[index].total_vote_count
    }

    
    // Append results to the dom
    let resultsDiv = document.getElementById('pollResultsDiv')
    for (let index = 0; index < this.pollData.poll_vote_counts.length; index++) {
        let currentVoteDetails = this.pollData.poll_vote_counts[index]
        let currentPercent = currentVoteDetails.total_vote_count * 100 / totalVotes
        // Show only 2 digits after .
        if(currentPercent%1 == 0){
            currentPercent = currentPercent.toString()
        }
        else{
            currentPercent = currentPercent.toFixed(1)
        }
        
        resultsDiv.insertAdjacentHTML('beforeend',
            `
            <div class="col card-panel ${this.pollData.current_user_choice_index == currentVoteDetails.option_id ? 'lime lighten-4' : ''}">
                <div class="row s12">
                    <div class="col s8 m9 l10">
                        <h5>
                            ${currentVoteDetails.option_title}
                        </h5>
                        <blockquote style="border-color:#512da8 !important">
                            ( ${currentVoteDetails.total_vote_count} ) Votes
                        </blockquote>
                    </div>
                <div class="col s4 m3 l2">
                    <h3>${currentPercent}%</h3>
                </div>
            </div>
                <div class="progress row s12">
                    <div class="determinate" style="width: ${currentPercent}%"></div>
                </div>
            </div>
        `
        )
    }


  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>