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
    $(this).css("background-color", "red");
  }, function() {
    // Change background color back to original on mouseout (optional)
    $(this).css("background-color", "#777777"); // Or remove this line to keep the hover color
  });

});