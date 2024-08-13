function buildEmailLink() {
    var subject = document.getElementById("subject").value;
    var body = document.getElementById("message").value;
    var mailtoLink = "mailto:softwaredevrt@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    window.location.href = mailtoLink;
  }