$(document).ready(function() {
    $('.content-button').click(function(e) {
      e.preventDefault(); // Prevent default button behavior
  
      var url = $(this).data('url'); // Get the URL from the button's data-url attribute
  
      // Clear any previous content
      $('#content-area').html('');
  
      // Use jQuery's load() method to fetch and display content
      $('#content-area').load(url, function(response, status) {
        if (status === "error") {
          $('#content-area').html('An error occurred while fetching content:  ' + url);
        }
      });
    });
  });
  