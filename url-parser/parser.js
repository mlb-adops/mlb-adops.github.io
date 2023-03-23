let inputField = document.getElementById('input');
let outputField = document.getElementById('output');

function updateOutputField() {
  let outputFieldValue = {};
  let parsedUrl;

  const inputFieldValue = inputField.value;
  try {
    parsedUrl = new URL(inputFieldValue);
  }
  catch {
    outputFieldValue = 'Error - Not a Valid URL'
    outputField.value = outputFieldValue;
    return;
  }
  const protocol = parsedUrl.protocol;
  const hostname = parsedUrl.hostname;
  const port = parsedUrl.port;
  const pathname = parsedUrl.pathname;
  let searchParams = {};

  parsedUrl.searchParams.forEach((value, key) => {
    try {
      searchParams[key] = decodeURIComponent(value);
    }
    catch {
      searchParams[key] = value;
    }
  });

  outputFieldValue['protocol'] = parsedUrl.protocol;
  outputFieldValue['hostname'] = parsedUrl.hostname;
  outputFieldValue['pathname'] = parsedUrl.pathname;
  outputFieldValue['query parameters'] = searchParams
  console.log(JSON.stringify(outputFieldValue));
  outputField.innerText = JSON.stringify(outputFieldValue, null, 2);
  outputField.innerHTML = JSON.stringify(outputFieldValue, null, 2).replace(/""/g, '<span style="background-color: red">&quot;&quot;</span>');

  console.log(`protocol: ${parsedUrl.protocol}`); // "https:"
  console.log(`hostname: ${parsedUrl.hostname}`); // "www.example.com"
  console.log(`pathname: ${parsedUrl.pathname}`); // "/path/to/resource"
  console.log(JSON.stringify(searchParams)); // '{"foo":"bar","baz":"qux"}'
  
}