$(document).ready(function() {
    // Trigger modal on link click (replace 'https://example.com' with the actual URL)
    $('a.technology-link').click(function(e) {
      e.preventDefault(); // Prevent default link behavior (opening in new window)
      var url = $(this).attr('href'); // Get the URL from the link
      //alert(url);
      // Use jQuery's AJAX to fetch content
      $.ajax({
        url: url,
        dataType: 'jsonp', // Specify JSONP data type
        success: function(data) {
          alert(data);
          // Once data is fetched, update the modal content
          $('#modalContent').html(data);
          // Show the modal (replace with your modal show function)
          $('#myModal').modal('show');
        }
      });
    });
  });
  