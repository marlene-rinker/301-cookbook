'use strict'

function setEventListeners() {
  $('.save-form').on('submit', saveIt);
  $('.delete-form').on('submit', deleteIt);
}

$('#message').hide();

function saveIt(event){
  event.preventDefault();
  let result = event.target;
  console.log(result.sourceurl.value);
  $.post('/save', {title: result.title.value,
    image: result.image.value,
    sourceurl: result.sourceurl.value,
    readyinminutes: result.readyinminutes.value,
    servings: result.servings.value,
    id: result.api_id.value },
  function(){
    $('#message').show();
    $('#message').text(`${result.title.value} was saved to your Superdex.`);
    setInterval(function(){$('#message').hide();}, 3000);
  });
}

function deleteIt(event){
  event.preventDefault();
  let result = event.target;
  $.post('/delete?_overrideMethod=DELETE', {id: result.id.value},
    function(){
      event.target.parentElement.remove();
      $('#message').show();
      $('#message').text(`${result.title.value} was deleted from your Superdex.`);
      setInterval(function(){$('#message').hide();}, 3000);
    });
}

function myFunction() {
    let x = document.getElementById("main-nav"); 
    if (x.style.display === "grid") {
        x.style.display = "none"; 
    } else {
        x.style.display = "grid"; 
    }
};


setEventListeners();

