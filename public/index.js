function comfirmPoll() {
    // Get the poll question
    let enteredQuestion = document.getElementById('question').value

    // Get all options
    let validOptions = []

    let optionIndex = 1
    while (true) {
        let currentOptionElement = document.getElementById(`option${optionIndex}`)

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
    }


    // Check if the question and options array is valid
    if(enteredQuestion == ''){
        showModal('Oops','Please enter a question for the poll')
        return
    }
    
    if(validOptions.length < 2){
        showModal('Oops','Please provide at least 2 options to your poll')
        return
    }

    // Provided data is valid
    // Prepare the data that will be passed into the API
    let requestData = {
        poll_title: enteredQuestion,
        poll_options: validOptions
    }

    // Stringify the data
    let postDataString = JSON.stringify(requestData)

    // Make the request to the backend
    fetch('api/create_poll', {
        method: 'POST',
        headers: {'Content-Type':'text/plain;charset=UTF-8'}, 
        body: postDataString
    }).then((r) =>{
        r.json().then(response=>{
            console.log(response)
            if(response.success){
                console.log('Created the poll succesfull')
                // Navigate to the poll page
                window.location.href = `/poll/?id=${response.poll_id}`
            }
            else{
                showModal(`Oops', 'We had a problem while creating your poll: ${response.info}, please try again.`)
            }
        })
    }).catch(function(error) {
        console.log("An error occured while creating poll:", error)
    })
}



function showModal(title, description){
    document.getElementById('modalTitle').innerHTML = title
    document.getElementById('modalDescription').innerHTML = description
    modalInstance.open()
}



let modalInstance;
let currentFinalOptionIndex = 3
window.onload = () => {

    // Inıtialize the modal
    var elems = document.querySelectorAll('.modal')
    var instances = M.Modal.init(elems, {})

    modalInstance = instances[0]


    // When user types in to the last option create a new option
    document.getElementById(`option${currentFinalOptionIndex}`)
        .addEventListener('input', changeEventListenerElement)

}

function changeEventListenerElement(){
    // Remove the event listener from the current last
    // option in the UI 
    document.getElementById(`option${currentFinalOptionIndex}`)
        .removeEventListener('input', changeEventListenerElement)

    // Add a new option to the UI
    appendNewOption_DOM()

    // Attach an event listener to the newly created option field
    document.getElementById(`option${currentFinalOptionIndex}`)
        .addEventListener('input', changeEventListenerElement)
}


function appendNewOption_DOM() {
    currentFinalOptionIndex++
    document.getElementById(`confirmPollButton`)
        .insertAdjacentHTML('beforebegin',
            `
                <div class="row">
                    <div class="input-field col s12">
                        <i class="material-icons prefix deep-purple-text text-darken-2">chevron_right</i>
                        <input id="option${currentFinalOptionIndex}" type="text">
                        <label for="poll_option">Poll option #${currentFinalOptionIndex}</label>
                    </div>
                </div>
         `);
}



