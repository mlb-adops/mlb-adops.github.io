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


async function processFile() {

  let file = document.querySelector('#myFile').files[0];
  let reader = new FileReader();



  progressLabelInput.classList.add('label-warning');
  progressLabelInput.innerText = 'In Progress';


  reader.readAsText(file);

  //if you need to read a csv file with a 'ISO-8859-1' encoding
  /*reader.readAsText(file,'ISO-8859-1');*/

  //When the file finish load
  reader.onload = async function(event) {

    // Gather the name of the file without the extension
    const fileNameFull = file.name;
    fileNameWithoutExtension = fileNameFull.substring(0, fileNameFull.lastIndexOf('.'));

    

    // Get the File Data
    let csv = event.target.result;

    // Split and get the rows in an array
    let rows = csv.split('\n');

    // Move through the rows line by line
    // for (let i=0; i<10000; i++) {
    // console.log(rows.length);
    for (let i=1; i<rows.length; i++) {

      // Split by separator (,) and get the columns
      let commaRegex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
      cols = rows[i].split(commaRegex);
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
        valueId = cols[3].trim();
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
        adobeIdArray.push(`(${valueId}) - ${cols[4]}`);
        await sleep(i, rows);
      }

      processedArray[i].push(value);
      processedArray[i].push(valueId);
    }

    createAdobeFields();
  }
}

function createAdobeFields() {

  // Organize the date for further input
  let adobeField = document.querySelector('#adobe-identifiers');
  for (i=0; i<adobeIdArray.length; i++) {

    const AdobeForm = document.createElement('form');
    const AlphaAdobeField = document.createElement('label');
    const BetaAdobeField = document.createElement('label');
    const textAdobeField =document.createElement('p');
    const IncludeField = document.createElement('input');
    const iAdobeField = document.createElement('i');
    const GoogleIdField = document.createElement('input');
    const divider = document.createElement('div');

    AdobeForm.setAttribute('class', 'adobe-id-form');
    AdobeForm.setAttribute('name', adobeIdCheckArray[i]);

    AlphaAdobeField.setAttribute('id', 'adobe-id');
    AlphaAdobeField.setAttribute('class', 'form-checkbox');
    AlphaAdobeField.innerText = adobeIdArray[i];
    // textAdobeField.setAttribute('class', '')

    iAdobeField.setAttribute('class', 'form-icon');

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

    AlphaAdobeField.appendChild(IncludeField);
    AlphaAdobeField.appendChild(iAdobeField);
    // AlphaAdobeField.appendChild(textAdobeField);
    BetaAdobeField.appendChild(GoogleIdField);
    AdobeForm.appendChild(AlphaAdobeField);
    AdobeForm.appendChild(BetaAdobeField);
    adobeField.appendChild(AdobeForm);
    adobeField.appendChild(divider);
  }

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
  // console.log(AllFormInputs);

  for (i = 0; i < AllFormInputs.length; i++) {
    const inputs = AllFormInputs[i].querySelectorAll('input');
    let CheckArray = [];
    // console.log(inputs);
    if (inputs.length > 0) {
      // console.log(inputs[0].value);
      CheckArray.push(inputs[0].value.trim());
      CheckArray.push(inputs[1].value.trim());
    }
    CheckArray.push(AllFormInputs[i].name);
    if (CheckArray[0] && CheckArray[1]) {
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
      if (googleIdArray[j][0] && processedArray[i][1] === googleIdArray[j][2]) {
        let ImminentArray = new Array;
        ImminentArray.push(processedArray[i][0],googleIdArray[j][1]);
        // processedArray[i][1] = googleIdArray[j][1];
        PenultimateArray.push(ImminentArray);
        break;
      }
    }
  }
  // let FinalArray = new Array;
  // for (let i = 0; i < processedArray.length; i++) {
  //   let alphaRow = googleIdArray[i];
  //   FinalArray[i] = new Array;
  //   // Check if column 2 of the Alpha row is in column 3 of any Beta row where column 1 is true
  //   const betaRow = processedArray.find(row => row[0] && row[2] === alphaRow[1]);
  
  //   // If there is a matching Beta row, replace column 2 of the Alpha row with column 2 of the Beta row
  //   if (betaRow) {
  //     alphaRow[1] = betaRow[1];
  //     FinalArray[i] = alphaRow;
  //   }
  // }


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

  download('Document', FinalArray);
}

function download(filename, data) {

  let lineArray = [];
  let OrganizedArray = ['ppid', 'list_id'];

  data.unshift(OrganizedArray);
  
  data.forEach(function (infoArray, index) {
    let line = infoArray.join(",");
      // lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
      lineArray.push(line);
  });

  data = lineArray.join("\n");

  const blob = new Blob([data], {type: 'text/csv'});
  if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, fileNameWithoutExtension + '-hashed.csv');
  }
  else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = fileNameWithoutExtension + '-hashed.csv';        
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

// function sleep() {
//   // console.log('sleep');
//   return new Promise(resolve => setTimeout(resolve, 100));
// }

function sleep(i, rows) {
  console.log('sleep');
  return new Promise(resolve => {
    progressBarInput.style.width = ((i/rows.length) * 100) + '%';
    setTimeout(resolve, 0);
  });
}

// function sleep(i, rows) {
//   // console.log('sleep');
//   return new Promise(resolve => {
//     progressBarInput.style.width = ((i/rows.length) * 100) + '%';
//     resolve(progressBarInput.style.width);
//   });
// }