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
      if (value.includes('=')) {
        const params = new URLSearchParams(value);

        const obj = {};
        for (const [key, value] of params) {
          obj[key] = value;
        }
        searchParams[key] = obj;
      }
    }
    catch {
      searchParams[key] = value;
    }
  });

  outputFieldValue['protocol'] = parsedUrl.protocol;
  outputFieldValue['hostname'] = parsedUrl.hostname;
  outputFieldValue['pathname'] = parsedUrl.pathname;
  outputFieldValue['query parameters'] = searchParams;
  // console.log(JSON.stringify(outputFieldValue));
  const highlightedObj = highlightEmptyValues(outputFieldValue);

  // outputField.innerText = JSON.stringify(outputFieldValue, null, 2);
  // outputField.innerHTML = JSON.stringify(outputFieldValue, null, 2).replace(/""/g, '<span style="background-color: red">&quot;&quot;</span>');

  outputField.innerHTML = JSON.stringify(highlightedObj, null, 2);

  // console.log(`protocol: ${parsedUrl.protocol}`); // "https:"
  // console.log(`hostname: ${parsedUrl.hostname}`); // "www.example.com"
  // console.log(`pathname: ${parsedUrl.pathname}`); // "/path/to/resource"
  // console.log(JSON.stringify(searchParams)); // '{"foo":"bar","baz":"qux"}'
  
}

function highlightEmptyValues(obj) {
  const newObj = {};
  // Loop through all keys in the object
  for (let key in obj) {
    // Check if the value of the current key is empty
    if (!obj[key]) {
      // Wrap the key and empty value in span elements with red background color
      newObj['<span style="background-color: red;">' + key + '</span>'] = '<span style="background-color: red;"></span>';
    } else {
      // Copy the key-value pair to the new object
      newObj[key] = obj[key];
    }
  }
  return newObj;
}
