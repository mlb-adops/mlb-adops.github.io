const adUnitInputField = document.getElementById('AdUnitInputField');
const assetKeyInputField = document.getElementById('AssetKeyInputField');
const tokenInputField = document.getElementById('TokenInputField');
const domainInputField = document.getElementById('DomainInputField');

updateInputField();
function updateInputField() {
  // Get the URLSearchParams object from the current document's URL search parameters
  const urlSearchParams = new URLSearchParams(window.location.search);

  const adUnitInputFieldValue = urlSearchParams.get('iu');
  const assetKeyInputFieldValue = urlSearchParams.get('assetkey');
  const tokenInputFieldValue = urlSearchParams.get('token');
  const domainInputFieldValue = urlSearchParams.get('domain');


  // console.log(inputFieldDecoded);
  adUnitInputField.value = adUnitInputFieldValue;
  assetKeyInputField.value = assetKeyInputFieldValue;
  tokenInputField.value = tokenInputFieldValue;
  domainInputField.value = domainInputFieldValue;
}

function shareInputField() {
  const inputFieldValue = inputField.value;

  let inputFieldEncoded = btoa(inputFieldValue);
  inputFieldEncoded= encodeURIComponent(inputFieldEncoded)

  copyToClipboard(inputFieldEncoded);
  console.log(inputFieldValue);
  console.log(inputFieldEncoded);
}

function copyToClipboard(text) {
  // Get the Window Origin & Pathname
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const domain = origin + pathname;

  // Create a new textarea element
  var textarea = document.createElement('textarea');

  // Set the value of the textarea to the text you want to copy
  textarea.value = domain + '?share=' + text;

  // Make sure to make the textarea non-editable to avoid accidental user changes
  textarea.setAttribute('readonly', '');

  // Hide the textarea from view
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';

  // Append the textarea to the DOM
  document.body.appendChild(textarea);

  // Select the text inside the textarea
  textarea.select();

  // Copy the selected text to the clipboard
  document.execCommand('copy');

  // Clean up - remove the textarea from the DOM
  document.body.removeChild(textarea);
}