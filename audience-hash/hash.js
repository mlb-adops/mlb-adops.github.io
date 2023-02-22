//Hash String to SHA 256

function processFile(){
  let file = document.querySelector('#myFile').files[0];
  let reader = new FileReader();
  let hashedArray = [];

  reader.readAsText(file);

  //if you need to read a csv file with a 'ISO-8859-1' encoding
  /*reader.readAsText(file,'ISO-8859-1');*/

  //When the file finish load
  reader.onload = async function(event) {

    //get the file.
    let csv = event.target.result;

    //split and get the rows in an array
    let rows = csv.split('\n');

    //move line by line
    for (let i=0; i<rows.length; i++) {
      //split by separator (,) and get the columns
      cols = rows[i].split(',');
      hashedArray[i] = new Array();

      //move column by column
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
    download("hashed.csv", hashedArray);
  }
}

function download(filename, data) {

  let lineArray = [];
  data.forEach(function (infoArray, index) {
    let line = infoArray.join(",");
      lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
  });

  data = lineArray.join("\n");

  const blob = new Blob([data], {type: 'text/csv'});
  if(window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
  }
  else{
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;        
      document.body.appendChild(elem);
      elem.click();        
      document.body.removeChild(elem);
  }
}

async function digestMessage(message) {

  // Set Algorithm to Hash
  let algorithmInput = document.getElementsByName('algorithm');
  let algorithmValue;
            
  for (let i=0; i<algorithmInput.length; i++) {
    if (algorithmInput[i].checked) {
      algorithmValue = algorithmInput[i].value;
    }
  }

  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest(algorithmValue, msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}