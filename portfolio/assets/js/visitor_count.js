let visitorCount = localStorage.getItem('visitorCount') || 0;

visitorCount++;

const visitorCountElement = document.getElementById('visitor-count');
visitorCountElement.textContent = visitorCount;   

localStorage.setItem('visitorCount', visitorCount);