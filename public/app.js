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
  console.log(event.target.title);
  $.post('/test', {}, function(){
    alert('The recipe was saved.');
  });
}

setEventListeners();

