// Parse & Hash CSV File

let processedArray = [];
let adobeIdCheckArray = [];
let adobeIdArray = [];
let googleIdArray = [];
let PenultimateArray = [];
let FinalArray = [];

let fileNameWithoutExtension;

const progressLabelInput = document.getElementById("progress-label-input");
const progressBarInput = document.getElementById("progress-bar-input");
const progressLabelOutput = document.getElementById("progress-label-output");
const progressBarOutput = document.getElementById("progress-bar-output");

let mergedRows = []; // Array to store rows from all files

async function processFile() {
  
  progressLabelInput.classList.add('label-warning');
  progressLabelInput.innerText = 'In Progress';

  loadAndMergeFiles()
  .then(async () => {
    // Move through the rows line by line
    // for (let i=0; i<10000; i++) {
    // console.log(rows.length);
    for (let i=0; i<mergedRows.length; i++) {

      // Split by separator (,) and get the columns
      let commaRegex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
      cols = mergedRows[i].split(commaRegex);
      processedArray[i] = new Array();

      // progressBar.style.width = ((i/rows.length) * 100) + '%';
      // console.log(i/rows.length);

      /*the value of the current column.
      Do whatever you want with the value*/
      let value = null;
      let valueId = null;
      if (cols[0]) {
        value = cols[0].trim();
      }
      if (cols[3]) {
        valueId = cols[4].trim();
      }

      // console.log(value);
      // console.log(valueId);

      // progressBarInput.style.width = ((i/rows.length) * 100) + '%';


      // Check the Adobe Id Array for a unique value
      // Add the value to the array if unique
      if (adobeIdCheckArray.indexOf(valueId) == -1){
        // console.group(`Row:Column - ${i}:${j+1}`);
        // console.log(`Unique Value - ${cols[j+1]}`);
        // console.groupEnd();

        adobeIdCheckArray.push(valueId);
        adobeIdArray.push(`(${valueId}) - ${cols[5]}`);
        await sleep(i, mergedRows);
      }

      processedArray[i].push(value);
      processedArray[i].push(valueId);
    }

    createAdobeFields();
  })
  .catch(error => {
    console.error('Error loading and merging files:', error);
  });
}

function createAdobeFields() {

  // Organize the date for further input
  let adobeField = document.querySelector('#adobe-identifiers');
  adobeField.innerHTML = '';
  for (i=0; i<adobeIdArray.length; i++) {

    const AdobeForm = document.createElement('form');
    const AlphaAdobeField = document.createElement('label');
    const BetaAdobeField = document.createElement('label');
    const textAdobeField =document.createElement('p');
    const IncludeField = document.createElement('input');
    // const iAdobeField = document.createElement('i');
    const GoogleIdField = document.createElement('input');
    const divider = document.createElement('div');

    AdobeForm.setAttribute('class', 'adobe-id-form');
    AdobeForm.setAttribute('name', adobeIdCheckArray[i]);

    AlphaAdobeField.setAttribute('id', 'adobe-id');
    AlphaAdobeField.style = 'margin: 0 0 8px; width: 100%; display: block;'
    // AlphaAdobeField.setAttribute('class', 'form-checkbox');
    AlphaAdobeField.innerText = adobeIdArray[i];
    // textAdobeField.setAttribute('class', '')

    // iAdobeField.setAttribute('class', 'form-icon');

    GoogleIdField.setAttribute('name', adobeIdCheckArray[i]);
    GoogleIdField.setAttribute('type', 'text');
    GoogleIdField.setAttribute('class', 'google-input');
    GoogleIdField.setAttribute('placeholder', 'Google Id');

    BetaAdobeField.setAttribute('name', 'field');
    
    IncludeField.setAttribute('name', adobeIdCheckArray[i]);
    IncludeField.setAttribute('checked', true);
    IncludeField.setAttribute('type', 'checkbox');
    IncludeField.setAttribute('class', 'include-input');
    IncludeField.setAttribute('value', true);

    divider.setAttribute('class', 'divider');

    // AlphaAdobeField.appendChild(IncludeField);
    // AlphaAdobeField.appendChild(iAdobeField);
    // AlphaAdobeField.appendChild(textAdobeField);
    BetaAdobeField.appendChild(GoogleIdField);
    AdobeForm.appendChild(AlphaAdobeField);
    AdobeForm.appendChild(BetaAdobeField);
    adobeField.appendChild(AdobeForm);
    adobeField.appendChild(divider);
  }

  progressBarInput.style.width = '100%';
  progressLabelInput.classList.add('label-success');
  progressLabelInput.classList.remove('label-warning');
  progressLabelInput.innerText = 'Complete';
}

async function hashArray() {

  // Reset All Arrays
  googleIdArray = [];
  PenultimateArray = [];
  FinalArray = [];

  progressLabelOutput.classList.add('label-warning');
  progressLabelOutput.innerText = 'In Progress';
  
  let AllFormInputs = document.querySelectorAll('.adobe-id-form');
  console.log(AllFormInputs);

  for (i = 0; i < AllFormInputs.length; i++) {
    const inputs = AllFormInputs[i].querySelectorAll('input');
    let CheckArray = [];
    // console.log(inputs);
    if (inputs.length > 0) {
      // console.log(inputs[0].value);
      CheckArray.push(inputs[0].value.trim());
      // CheckArray.push(inputs[1].value.trim());
    }
    CheckArray.push(AllFormInputs[i].name);
    // if (CheckArray[0] && CheckArray[1]) {
    if (CheckArray[0]) {
      googleIdArray.push(CheckArray);
    }
  }

  console.log(googleIdArray);
  // console.log(processedArray);

  for (let i = 1; i < processedArray.length; i++) {
    // console.log(processedArray[i])
    for (let j = 0; j < googleIdArray.length; j++) {
      // console.log(processedArray[i][j]);
      // console.log(googleIdArray[j]);
      if (googleIdArray[j][0] && processedArray[i][1] === googleIdArray[j][1]) {
        let ImminentArray = new Array;
        ImminentArray.push(processedArray[i][0],googleIdArray[j][0]);
        // processedArray[i][1] = googleIdArray[j][1];
        PenultimateArray.push(ImminentArray);
        break;
      }
    }
  }

  for (let i=0; i<PenultimateArray.length; i++) {
    //split by separator (,) and get the columns
    // cols = PenultimateArray[i].split(',');
    FinalArray[i] = new Array();

    // Go column by column through the CSV
    for (let j=0; j<PenultimateArray[i].length; j++) {
      /*the value of the current column.
      Do whatever you want with the value*/
      let value = PenultimateArray[i][j];
      value = value.trim();

      progressBarOutput.style.width = ((i/PenultimateArray.length) * 100) + '%';


      if (j === 0){
        value = await digestMessage(value, 'SHA-256');
      }
      FinalArray[i][j] = value;
    }
  }

  download(FinalArray);
}

function download(data) {

  let lineArray = [];
  let OrganizedArray = ['ppid', 'list_id'];
  
  const fileName = googleIdArray.map((id) => {
    return id[1];
  });

  console.log(fileName)

  data.unshift(OrganizedArray);
  
  data.forEach(function (infoArray, index) {
    let line = infoArray.join(",");
      // lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
      lineArray.push(line);
  });

  data = lineArray.join("\n");

  const date = new Date();

  const blob = new Blob([data], {type: 'text/csv'});
  if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, fileName + '.' + Date.now() + '.hashed.csv');
  }
  else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = fileName + '.' + Date.now() + '.hashed.csv';        
      document.body.appendChild(elem);
      elem.click();        
      document.body.removeChild(elem);
  }

  progressLabelOutput.classList.add('label-success');
  progressLabelOutput.classList.remove('label-warning');
  progressLabelOutput.innerText = 'Complete';
}

async function digestMessage(message, algorithmValue) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest(algorithmValue, msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

function sleep(i, rows) {
  console.log('sleep');
  return new Promise(resolve => {
    progressBarInput.style.width = ((i/rows.length) * 100) + '%';
    setTimeout(resolve, 0);
  });
}


// Define a function to handle file loading and merging
function loadAndMergeFile(file) {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = function(event) {
      // Gather the name of the file without the extension
      const fileNameFull = file.name;
      const fileNameWithoutExtension = fileNameFull.substring(0, fileNameFull.lastIndexOf('.'));

      // Get the file data as an ArrayBuffer
      const csv = event.target.result;

      // // Create a new Uint8Array from the buffer
      // const array = new Uint8Array(buffer);

      // // Convert the Uint8Array to a string using a specific encoding (e.g., UTF-8)
      // const decoder = new TextDecoder('utf-8');
      // const csv = decoder.decode(array);

      // Split and get the rows in an array
      let rows = csv.split('\n');
      rows.shift();

      // Check if the last row is empty
      if (rows[rows.length - 1].trim() === '') {
        console.log('truncate');
        rows.pop(); // Remove the last row
      }

      // Add the rows from the current file to the mergedRows array
      mergedRows = mergedRows.concat(rows);

      resolve();
    };

    reader.onerror = function() {
      reject(reader.error);
    };

    reader.readAsText(file);
  });
}

// Use async/await to sequentially load and merge files
async function loadAndMergeFiles() {
  let files = document.querySelector('#myFile').files; // Get the array of selected files
  mergedRows = [];
  
  for (let i = 0; i < files.length; i++) {
    let file = files[i];

    try {
      await loadAndMergeFile(file);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  }

  // Perform any necessary steps with the mergedRows array
  // ...
}