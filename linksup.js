$(document).ready(function() {
    // Trigger modal on link click
    $('a.technology-link').click(function(e) {
      e.preventDefault(); // Prevent default link behavior
  
      var url = $(this).attr('href'); // Get the URL from the link
  
      // Make AJAX request to your server-side script (replace with your script URL)
      $.ajax({
        url: url, // Replace with your server script URL
        data: { targetUrl: url }, // Send the external URL to the server
        dataType: 'json', // Expect a JSON response
        success: function(data) {
          if (data.success) {
            // Update the modal content with extracted data from the server
            $('#modalContent').html(data.content);
            $('#myModal').modal('show'); // Show the modal
          } else {
            // Handle errors from the server (optional)
            alert('An error occurred while fetching content.');
          }
        }
      });
    });
  });
  