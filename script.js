'use strict';

$(document).ready(function() {
$(".clickable-div").click(function() {

    // Get the URL from the nested anchor tag
    var url = $(this).find("a").attr("href");

    // Prevent default behavior (following the link normally)
    event.preventDefault();

    // Redirect to the URL using window.location.href
    window.location.href = url;
  });

  $(".clickable-div").hover(function() {
    // Change background color on hover
    $(this).css("background-color", "your-hover-color");

    // Increase font size of nested anchor on hover
    $(this).find("a").css("font-size", "20px");
  }, function() {
    // Change background color back to original on mouseout (optional)
    $(this).css("background-color", "your-original-color");

    // Reset font size of nested anchor on mouseout (optional)
    $(this).find("a").css("font-size", "15px"); // Or remove if you want font size to persist
  });

});