let visitorCount = localStorage.getItem('visitorCount') || 0;

visitorCount++;

const visitorCountElement = document.getElementById('visitor-count');
visitorCountElement.textContent = visitorCount;   

localStorage.setItem('visitorCount', visitorCount);


const urlParams = new URLSearchParams(window.location.search);

// Access specific parameters by name
const param1Value = urlParams.get('param1');
const param2Value = urlParams.get('param2');

console.log("param1:", param1Value);  // Output: param1: 1
//console.log("param2:", param2Value);  // Output: param2: horse

if(param1 === "cow")
{
    //reset visitor count to 0
    const visitorCountElement = document.getElementById('visitor-count');
    visitorCountElement.textContent = 0;
    localStorage.setItem('visitorCount', 0);
}


// Iterate through all parameters
for (const [key, value] of urlParams.entries()) {
  //console.log(key, value);
}