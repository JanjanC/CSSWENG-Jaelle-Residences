$(document).ready(function(){
    //Initializes tooltip elements to work properly on page load
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    //Initializes popover elements to work properly on page load
    let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    let popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl)
    });

    //Allows popover values/txt to be formattable in HTML
    $('[data-toggle="popover"]').popover({html:true});
});
