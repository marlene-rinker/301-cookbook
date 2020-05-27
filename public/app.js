'use strict'

// const message = document.getElementById('message');
// const confirm = document.getElementById('confirm');

// confirm.addEventListener('click', () =>{
//   console.log('the button was clicked');
//   message.remove();
// });
function setEventListeners() {
  $('#save-form').on('submit', saveIt);
}



function saveIt(event){
  event.preventDefault();
  let result = event.target;
  console.log(event.target.title.value);
  $.post('/test', {title: result.title.value,
    image: result.image.value,
    sourceUrl: result.sourceUrl.value,
    readyInMinutes: result.readyInMinutes.value,
    servings: result.servings.value,
    id: result.api_id.value },
  function(){
    alert('The recipe was saved.');
  });
}

setEventListeners();

