let modalInstance
let globalUserIP
let pollID

window.addEventListener('load', async function () {

    // Initialize the modal
    var elems = document.querySelectorAll('.modal')
    var instances = M.Modal.init(elems, {})

    modalInstance = instances[0]

    // Get the poll id from the url
    var url = new URL(window.location.href)
    pollID = url.searchParams.get('id')

    // if ID is not provided in the url, show 
    // that this poll was not found, eventually
    // redirect to the root page
    if (!pollID) {
        modalInstance.options.onCloseEnd = () => {
            window.location.href = `/`
        }
        showModal('Oops',
            `We couldn\'t quite understand which poll you are
             looking for, the poll_id parameter is missing
              in the url.`)
        return
    }


    globalUserIP = await fetch('https://api6.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(err => {
            modalInstance.options.onCloseEnd = () => {
                window.location.href = `/`
            }
            showModal('Oops',
                `Your browser is restricting access to your IP,
                 please deactivate shield or try accessing the 
                 poll from a different browser.`)

            return
        })


    // Make a request to the back-end server to get the poll details
    fetch(`/api/get_poll/${pollID}/${globalUserIP}`, {
        method: 'GET'
    }).then((r) => {
        r.json().then(response => {
            if (!response.success) {
                modalInstance.options.onCloseEnd = () => {
                    window.location.href = `/`
                }
                showModal('Oops',
                    `We couldn't access the poll. ${response.info}`)
            }
            else {
                if (!response.user_voted) {
                    // User has not voted update the UI
                    displayPollOptions(response)
                }
                else {
                    // User already voted, show the results
                    displayPollResults(response)
                }
            }
        })
    }).catch(function (error) {
        modalInstance.options.onCloseEnd = () => {
            window.location.href = `/`
        }
        showModal('Oops',
            `An error occured while fetching the poll: ${error}`)
    })

})


function displayPollOptions(response) {


    // Hide the loading div
    document.getElementById('loadingDiv').style.display = 'none'

    // Update the question element
    document.getElementById('askedQuestion').innerHTML = response.poll_title

    // Show the maind div
    document.getElementById('mainDiv').style.display = 'block'


    // Append the options
    for (let index = 0; index < response.poll_options.length; index++) {
        document.getElementById('voteButton').insertAdjacentHTML('beforebegin',
            `
                <p>
                    <label>
                        <input id="option_${response.poll_options[index].option_id}" name="group" type="radio" />
                        <span class="bold">${response.poll_options[index].option_title}</span>
                    </label>
                </p>
            `
        )

    }

    // Show the options    
    document.getElementById('pollAnswersForm').style.display = 'block'

}

function displayPollResults(response) {
    // Hide the loading div
    document.getElementById('loadingDiv').style.display = 'none'

    // Update the question element
    document.getElementById('askedQuestion').innerHTML = response.poll_title

    // Show the maind div
    document.getElementById('mainDiv').style.display = 'block'

    // Get the total # of votes
    let totalVotes = 0
    for (let index = 0; index < response.poll_vote_counts.length; index++) {
        totalVotes += response.poll_vote_counts[index].total_vote_count
    }

    // Append results to the dom
    let resultsDiv = document.getElementById('pollResultsDiv')
    for (let index = 0; index < response.poll_vote_counts.length; index++) {
        let currentVoteDetails = response.poll_vote_counts[index]
        let currentPercent = currentVoteDetails.total_vote_count * 100 / totalVotes
        // Show only 2 digits after .
        if(currentPercent%1 == 0){
            currentPercent = currentPercent.toString()
        }
        else{
            currentPercent = currentPercent.toFixed(2)
        }
        
        resultsDiv.insertAdjacentHTML('beforeend',
            `
            <div class="col card-panel ${response.current_user_choice_index == currentVoteDetails.option_id ? 'lime lighten-4' : ''}">
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

    // Show the results div
    resultsDiv.style.display = 'block'
}


function voteClicked() {
    // Find the selected option

    let radioIndex = 0
    let foundCheckedOptionIndex = -1
    while (document.getElementById(`option_${radioIndex}`)) {
        if (document.getElementById(`option_${radioIndex}`).checked) {
            // This is the checked radio button
            foundCheckedOptionIndex = radioIndex
        }
        radioIndex++
    }


    if (foundCheckedOptionIndex == -1) {
        showModal('Oops', 'Please select one of the options')
        return
    }

    // Now make a request to the API to register this vote
    let requestBody = {
        poll_id: pollID,
        user_choice_index: foundCheckedOptionIndex,
        user_id: globalUserIP
    }

    fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(requestBody)
    }).then((r) => {
        r.json().then(response => {
            if (response.success) {
                // Voted successfully refresh the page
                location.reload();
            }
            else {
                showModal(`Oops`, `We had a problem while counting your vote: ${response.info}, please try again.`)
            }
        })
    }).catch(function (error) {
        showModal(`Oops', 'An error occured while voting poll:, ${error}`)
    })

}


function copyLink(){
    // Copy the poll link (current url link) to the clipboard
    const el = document.createElement('textarea')
    el.value = window.location.href
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'              
    el.style.left = '-9999px'
    document.body.appendChild(el)
    const selected =            
      document.getSelection().rangeCount > 0
        ? document.getSelection().getRangeAt(0)
        : false
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    if (selected) {
      document.getSelection().removeAllRanges()
      document.getSelection().addRange(selected)
    }

    // Notify the user
    M.toast({html: 'Copied to the clipboard!'})
}

function showModal(title, description) {
    // Display modal with given texts
    document.getElementById('modalTitle').innerHTML = title
    document.getElementById('modalDescription').innerHTML = description
    modalInstance.open()
}