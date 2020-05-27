'use strict'

// const message = document.getElementById('message');
// const confirm = document.getElementById('confirm');

// confirm.addEventListener('click', () =>{
//   console.log('the button was clicked');
//   message.remove();
// });
function setEventListeners() {
  $('#save-form').on('submit', saveIt);
  $('#delete-form').on('submit', deleteIt);
}

$('#message').hide();

function saveIt(event){
  event.preventDefault();
  let result = event.target;
  $.post('/test', {title: result.title.value,
    image: result.image.value,
    sourceUrl: result.sourceUrl.value,
    readyInMinutes: result.readyInMinutes.value,
    servings: result.servings.value,
    id: result.api_id.value },
  function(){
    $('#message').show();
    $('#message').text(`${result.title.value} was saved to your Superdex.`);
    setInterval(function(){$('#message').hide();}, 5000);
  });
}

function deleteIt(event){
  event.preventDefault();
  let result = event.target;
  console.log(event.target.id.value, event.target.title.value);
  $.post('/test?_overrideMethod=DELETE', {id: result.id.value},
    function(){
      $('#message').show();
      $('#message').text(`${result.title.value} was deleted from your Superdex.`);
      setInterval(function(){$('#message').hide();}, 5000);
    });
}

setEventListeners();

