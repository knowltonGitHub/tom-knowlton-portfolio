'use strict';

$(".clickable-div").click(function() {
    // Get the URL from the nested anchor tag
    var url = $(this).find("a").attr("href");

    // Prevent default behavior (following the link normally)
    event.preventDefault();

    // Redirect to the URL using window.location.href
    window.location.href = url;
  });