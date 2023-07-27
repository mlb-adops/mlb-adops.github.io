// Wait for the final page load to begin ad insertion
window.googletag = window.googletag || {cmd: []};

// Capture each ad element on the page
const AdSlots = document.getElementsByClassName('ad-unit');

// Size mapping for the Leaderboard ad unit
const LeaderboardMapping = [[[760, 0], [[728, 90], 'fluid']],
    [[480, 0], [[468, 60], [300, 250], 'fluid']],
    [[0, 0], [[300, 250], [320, 50], 'fluid']]];

// Size mapping for the In-Article ad unit
const InArticleMapping = [[[760, 0], [[728, 90], 'fluid']],
    [[480, 0], [[468, 60], [300, 250], 'fluid']],
    [[0, 0], [[300, 250], [320, 50], 'fluid']]];

// Search the URL for the query string
// Index starts at 0 - Set index to 1
const QuerySearchString = window.location.search;
const QueryString = QuerySearchString.substring(1);

// Gather all possible Key Value Pairs from the Query String into an array
const KeyValuePairs = loadKeyValues(QueryString);

// Build the ad request to Google Ad Manager
googletag.cmd.push(function() {

  // Build the slot for each Ad Element on the page
  for( let i=0; i < AdSlots.length; i++ ) {
    const AdSlotData = AdSlots[i].dataset;

    // Define the ad request - ad size, ad unit, slot specific targeting
    googletag.defineSlot('/2605/mlb.mlb', [[300, 250], [728, 90], [320, 50], 'fluid', [320, 100]], AdSlots[i].id )
      .setTargeting('pos', AdSlotData.slot || 1)
      .defineSizeMapping(eval(AdSlotData.mapping))
      .addService( googletag.pubads() );
  }

  // Add page-level targeting from the query parameters
  if (KeyValuePairs) {
    for (let i=0; i < Object.keys(KeyValuePairs).length; i++ ) {
      const Key = Object.keys(KeyValuePairs)[i];
      const Value = KeyValuePairs[Object.keys(KeyValuePairs)[i]];
      googletag.pubads().setTargeting(Key, Value);
    }
  }
  
  // For an empty response, collapse the empty parent element
  // Lazy load the ad requests based on proximity to the viewport
  googletag.pubads().collapseEmptyDivs( true );
  googletag.pubads().enableLazyLoad({
    fetchMarginPercent: 50,
    renderMarginPercent: 25,
      mobileScaling: 2.0
  });  
  googletag.enableServices();
  
  // Loop through each element and display the ad
  for( let i=0; i<AdSlots.length; i++ ) {
    googletag.display( AdSlots[i].id );
  }
});

// Split the Query String into Key Value Pairs
function loadKeyValues(queryString) {
  let params = {}, queries, temp;

  // Split into key/value pairs
  queries = queryString.split("&");

  // Convert the array of strings into an object
  for (let i=0; i<queries.length; i++ ) {
    temp = queries[i].split('=');
    params[temp[0]] = temp[1];
  }
  return params;
};