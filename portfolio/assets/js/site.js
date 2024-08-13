function buildEmailLink() {
    console.log("emailing");
    var subject = document.getElementById("subject").value;
    var body = document.getElementById("message").value;

    console.log("emailing" + subject + body);
    var mailtoLink = "mailto:softwaredevr@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    window.location.href = mailtoLink;
  }