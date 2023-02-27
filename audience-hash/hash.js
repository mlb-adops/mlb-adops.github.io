//Hash String to SHA 256



function processFile(){

  const progressLabel = document.getElementById("progress-label");
  const progressBar = document.getElementById("progress-bar");
  
  // Set Delete Value: True or False
  const deleteInput = document.getElementsByName('delete');
  let deleteValue = false;
  if (deleteInput[0].checked) {
    deleteValue = true;
  }

  // Set Algorithm to Hash
  const algorithmInput = document.getElementsByName('algorithm');
  let algorithmValue;
            
  for (let i=0; i<algorithmInput.length; i++) {
    if (algorithmInput[i].checked) {
      algorithmValue = algorithmInput[i].value;
    }
  }

  // Set Identifier
  const identifierInput = document.getElementsByName('identifier');
  let identifierValue;
            
  for (let i=0; i<identifierInput.length; i++) {
    if (identifierInput[i].checked) {
      identifierValue = identifierInput[i].value;
    }
  }

  let file = document.querySelector('#myFile').files[0];
  let reader = new FileReader();
  let hashedArray = [];

  reader.readAsText(file);

  //if you need to read a csv file with a 'ISO-8859-1' encoding
  /*reader.readAsText(file,'ISO-8859-1');*/

  //When the file finish load
  reader.onload = async function(event) {

    // Gather the name of the file without the extension
    const fileNameFull = file.name;
    const fileNameWithoutExtension = fileNameFull.substring(0, fileNameFull.lastIndexOf('.'));
    

    progressLabel.classList.add('label-warning');
    progressLabel.innerText = 'In Progress';
    //get the file.
    let csv = event.target.result;

    //split and get the rows in an array
    let rows = csv.split('\n');

    //move line by line
    for (let i=0; i<rows.length; i++) {
      //split by separator (,) and get the columns
      cols = rows[i].split(',');
      hashedArray[i] = new Array();

      progressBar.style.width = ((i/rows.length) * 100) + '%';
      // console.log(i/rows.length);

      //move column by column
      for (let j=0; j<cols.length; j++) {
        /*the value of the current column.
        Do whatever you want with the value*/
        let value = cols[j];
        value = value.trim();

        if (i !==0 && j === 0){
          value = await digestMessage(value, algorithmValue);
        }
        hashedArray[i][j] = value;
      }
    }
    
    // Add Values to First Row and/or Add Delete Column
    if (identifierValue !== null && deleteValue) {
      hashedArray.unshift([identifierValue, 'list_id', 'delete']);
    }
    if (identifierValue !== null && !deleteValue) {
      hashedArray.unshift([identifierValue, 'list_id']);
    }
    progressLabel.classList.add('label-success');
    progressLabel.classList.remove('label-warning');
    progressLabel.innerText = 'Complete';
    download(fileNameWithoutExtension, hashedArray);
  }
}

function hashFile() {

  const file = document.querySelector('#myFile').files[0];
  const reader = new FileReader();
  let hashedArray = [];

  reader.readAsText(file);

  return new Promise((resolve, reject) => {
    // When the file finish load
    reader.onload = async function(event) {

      let csv = event.target.result;
      let rows = csv.split('\n');

      // Go line by line through the CSV
      for (let i=0; i<rows.length; i++) {
        //split by separator (,) and get the columns
        cols = rows[i].split(',');
        hashedArray[i] = new Array();

        // Go column by column through the CSV
        for (let j=0; j<cols.length; j++) {
          /*the value of the current column.
          Do whatever you want with the value*/
          let value = cols[j];
          value = value.trim();

          if (i !==0 && j === 0){
            value = await digestMessage(value);
          }
          hashedArray[i][j] = value;
        }
      }
      resolve();
    }

    reader.onerror = () => {
      reject(reader.error);
    }
  });
}

function download(filename, data) {

  let lineArray = [];
  data.forEach(function (infoArray, index) {
    let line = infoArray.join(",");
      // lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
      lineArray.push(line);
  });

  data = lineArray.join("\n");

  const blob = new Blob([data], {type: 'text/csv'});
  if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename + '-hashed.csv');
  }
  else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename + '-hashed.csv';        
      document.body.appendChild(elem);
      elem.click();        
      document.body.removeChild(elem);
  }
}

async function digestMessage(message, algorithmValue) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest(algorithmValue, msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}