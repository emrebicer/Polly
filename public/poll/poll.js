let modalInstance;


window.addEventListener('load', async function() {
    
    // Initialize the modal
    var elems = document.querySelectorAll('.modal')
    var instances = M.Modal.init(elems, {})

    modalInstance = instances[0]

    // Get the poll id from the url
    var url = new URL(window.location.href)
    var pollID = url.searchParams.get('id')

    // if ID is not provided in the url, show 
    // that this poll was not found, eventually
    // redirect to the root page
    if (!pollID) {
        modalInstance.options.onCloseEnd = () =>{
            window.location.href = `/`
        }
        showModal('Oops', 
            `We couldn\'t quite understand which poll you are
             looking for, the poll_id parameter is missing
              in the url.`)
        return
    }


    const USER_IP = await fetch('https://api6.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(err => {
            modalInstance.options.onCloseEnd = () =>{
                window.location.href = `/`
            }
            showModal('Oops', 
                `Your browser is restricting access to your IP,
                 please deactivate shield or try accessing the 
                 poll from a different browser.`)
        })

    
    // Make a request to the back-end server to get the poll details
    fetch(`/api/get_poll/${pollID}/${USER_IP}`, {
        method: 'GET'
    }).then((r) =>{
        r.json().then(response=>{
            if(!response.success){
                modalInstance.options.onCloseEnd = () =>{
                    window.location.href = `/`
                }
                showModal('Oops', 
                    `We couldn't access the poll. ${response.info}`)
            }
            else{
                if(!response.user_voted){
                    // User has not voted update the UI
                    displayPollOptions(response)
                }
                else{
                    // User already voted, show the results
                    displayPollResults(response)
                }
            }            
        })
    }).catch(function(error) {
        console.log("An error occured while fetching the poll:", error)
    })

})


function displayPollOptions(response){
    // TO DO: show only poll options hide all irrelevant data
}

function displayPollResults(response){
    // TO DO: show only poll results hide all irrelevant data
}


function showModal(title, description){
    document.getElementById('modalTitle').innerHTML = title
    document.getElementById('modalDescription').innerHTML = description
    modalInstance.open()
}