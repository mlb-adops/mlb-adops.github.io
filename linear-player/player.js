const BACKUP_STREAM = 'https://storage.googleapis.com/interactive-media-ads/media/bbb.m3u8';

// Livestream asset key.
const ASSET_KEY = assetKeyInputField.value;
const CDN_TOKEN = tokenInputField.value;

const domainValue = domainInputField.value;

// VOD content source and video IDs.
const TEST_CONTENT_SOURCE_ID = "2548831";
const TEST_VIDEO_ID = "tears-of-steel";

// Ad Manager Network Code.
const NETWORK_CODE = '';
const API_URL_BASE = 'https://dai.google.com/linear/v1/hls/event/';



const hls = new Hls({
  xhrSetup: (xhr, videoUrl) => {
    const domain = new URL(videoUrl)
    if (domain.hostname.includes(domainValue)) {
      // xhr.withCredentials = true;
      xhr.setRequestHeader('x-cdn-token', CDN_TOKEN);
      // xhr.setRequestHeader('Access-Control-Allow', 'localho.st');
      // xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://localho.st');
      // xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://localho.st:5501');
      // xhr.setRequestHeader('Access-Control-Allow-Credentials', true);
      xhr.setRequestHeader('Access-Control-Allow-Headers', 'x-cdn-token');
    }
  }
});

let videoElement;
let adUiElement;
let isAdBreak;

let mediaIdsQueue = [];
let verificationUrl;
let pollingFrequencyMs = 10000;
let metadataUrl;

let adBreakTags = {};
let adBreaks = {};
let ads = {};
let currentAd = null;
let lastProgressTagTime = 0;
let mediaIdInterval;
let controlInterval;
const mediaIdsSet = new Set();

// Ad Tag Parameters
const adTagParameters = {
  'iu': '/2605/snla.tv/default/live',
  "ppid": "e3a15d525c0922993368b91608c200b78f971ef2993f9e6c60428b19a72fedd1",
  "cust_params": "Custom=Parameter",
  "hl": "en",
  "an": "MLB App",
  "us_privacy": "1---",
  "sid": generateUUIDv4().toUpperCase(),
  "did": generateUUIDv4(),
  // 'sz': '1920x1080'
}

function initPlayer() {
  videoElement = document.getElementById('video-player');
  adUiElement = document.getElementById('ad-ui');
  streamManager = new google.ima.dai.api.StreamManager(videoElement, adUiElement);

  videoElement.addEventListener('pause', onStreamPause);
  videoElement.addEventListener('play', onStreamPlay);

  streamManager.addEventListener(
    [google.ima.dai.api.StreamEvent.Type.LOADED,
     google.ima.dai.api.StreamEvent.Type.ERROR,
     google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
     google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED],
    onStreamEvent,
    false);

  // Timed metadata is only used for LIVE streams.
  hls.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data) {
    if (streamManager && data) {
      // For each ID3 tag in the metadata, pass in the type - ID3, the
      // tag data (a byte array), and the presentation timestamp (PTS).
      data.samples.forEach(function(sample) {
        streamManager.processMetadata('ID3', sample.data, sample.pts);
      });
    }
  });

  // requestVODStream(TEST_CONTENT_SOURCE_ID, TEST_VIDEO_ID, null, NETWORK_CODE);
  // Uncomment the line below and comment out the one above to request a
  // LIVE stream instead of a VOD stream.
  requestLiveStream(ASSET_KEY, null, NETWORK_CODE);
}

async function initApiPlayer() {
  videoElement = document.getElementById('video-player');
  adUiElement = document.getElementById('ad-ui');

  requestAPIStream(ASSET_KEY, null, NETWORK_CODE);
}

function requestAPIStream(assetKey, apiKey, networkCode) {
  const apiUrl = API_URL_BASE + assetKey + 'stream';

  // Make initial API request to create a DAI stream.
  fetch(apiUrl, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: new URLSearchParams(adTagParameters).toString()  // x-www-form-urlencoded
  })
  .then((response) => {
    // Server should respond with HTTP/1.1 201 Created.
    if (response.status != 201) {
      throw new Error('BAD response: ' + response);
    }
    return response.json();
  })
  .then((data) => {
    onStreamCreated(data);
  });
}

function requestVODStream(cmsId, videoId, apiKey, networkCode) {
  var streamRequest = new google.ima.dai.api.VODStreamRequest();
  streamRequest.contentSourceId = cmsId;
  streamRequest.videoId = videoId;
  streamRequest.apiKey = apiKey;
  streamRequest.networkCode = networkCode;
  streamManager.requestStream(streamRequest);
}

function requestLiveStream(assetKey, apiKey, networkCode) {
  var streamRequest = new google.ima.dai.api.LiveStreamRequest();
  streamRequest.assetKey = assetKey;
  streamRequest.apiKey = apiKey;
  streamRequest.networkCode = networkCode;
  streamRequest.adTagParameters = adTagParameters;
  streamManager.requestStream(streamRequest);
}

function onStreamEvent(e) {
  switch (e.type) {
    case google.ima.dai.api.StreamEvent.Type.LOADED:
      console.log('Stream loaded');
      console.log('Stream Id:', e.getStreamData().streamId);
      loadUrl(e.getStreamData().url);
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      console.log('Error loading stream, playing backup stream.' + e);
      loadUrl(BACKUP_STREAM);
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      console.log('Ad Break Started');
      isAdBreak = true;
      videoElement.controls = false;
      adUiElement.style.display = 'block';
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      console.log('Ad Break Ended');
      isAdBreak = false;
      videoElement.controls = true;
      adUiElement.style.display = 'none';
      break;
    default:
      break;
  }
}

function loadUrl(url) {
  console.log('Loading:' + url);
  hls.loadSource(url);
  hls.attachMedia(videoElement);
  hls.on(Hls.Events.MANIFEST_PARSED, function() {
    console.log('Video Play');
    videoElement.play();
  });
}

function onStreamPause() {
  console.log('paused');
  if (isAdBreak) {
    videoElement.controls = true;
    adUiElement.style.display = 'none';
  }
}

function onStreamPlay() {
  console.log('played');
  if (isAdBreak) {
    videoElement.controls = false;
    adUiElement.style.display = 'block';
  }
}

function onStreamCreated(json) {
  const mainPlaylist = json['stream_manifest'] || '';
  verificationUrl = json['media_verification_url'] || '';
  pollingFrequencyMs = json['polling_frequency'] * 1000 || pollingFrequencyMs;
  metadataUrl = json['metadata_url'] || '';

  if (!mainPlaylist) {
    throw new Error('HLS playlist not found!');
  }
  if (!verificationUrl) {
    throw new Error('Verification URL not found!');
  }
  if (!pollingFrequencyMs) {
    throw new Error('Polling Frequency not found!');
  }
  if (!metadataUrl) {
    throw new Error('Metadata URL not found!');
  }
  updateMetadata();
  // Parse metadata to extract the media identifier used for verification.
  hls.on(Hls.Events.FRAG_PARSING_METADATA, parseMetadata);
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    videoElement.controls = true;
  });
  videoElement.addEventListener('play', (e) => {
    updateMetadata();
  });
  videoElement.addEventListener('timeupdate', (e) => {
    processMediaIds();
  });

  loadUrl(mainPlaylist);
}

function updateMetadata() {
  fetch(metadataUrl).then((response) => response.json()).then((data) => {
    adBreakTags = data['tags'] || {};
    adBreaks = data['ad_breaks'] || {};
    ads = data['ads'] || {};
    setTimeout(() => {
      updateMetadata();
    }, pollingFrequencyMs);
  });
}

function parseMetadata(event, data = null) {
  if (!data) {
    return;
  }
  const samples = data['samples'] || [];
  samples.forEach((sample) => {
    const data = sample['data'] || '';
    const pts = sample['pts'] || 0;
    const sampleString = new TextDecoder('utf-8').decode(data);
    const mediaId = sampleString.slice(
        sampleString.indexOf('google_'), sampleString.length);

    // Keep track of mediaIds and timestamps in a queue.
    const newID3 = new URLSearchParams({mediaId: mediaId, timestamp: pts}).toString();
    if (!mediaIdsSet.has(newID3)) {
      mediaIdsSet.add(newID3);
      mediaIdsQueue.push({mediaId: mediaId, timestamp: pts, processed: false});
    }
  });
}

/**
 * Checks for newly reached timed metadata and sends it for processing.
 */
function processMediaIds() {
  const time = videoElement.currentTime;
  for (let i = 0; i < mediaIdsQueue.length; i++) {
    const entry = mediaIdsQueue[i];
    if (entry.processed) {
      continue;
    }
    if (entry.timestamp <= time) {
      processMediaId(entry.mediaId);
      mediaIdsQueue[i].processed = true;
    }
  }
  while (mediaIdsQueue[0] && mediaIdsQueue[0].processed) {
    mediaIdsQueue.shift();
  }
}

/**
 * Cross-references media id with ad events queue and fires appropriate beacons.
 * @param {string} mediaId the mediaID string sent via id3
 **/
function processMediaId(mediaId) {
  // adInfo is not used in this sample, but could be used to
  // trigger ad callback events, such as STARTED
  let adInfo = null;
  for (let key in adBreakTags) {
    if (mediaId.startsWith(key)) {
      const adBreak = adBreakTags[key] || {};
      const adId = adBreak['ad'] || '';
      adInfo = {
        ad: adId,
        ad_break_id: adBreak['ad_break_id'] || '',
        type: adBreak['type'] || '',
        isSlate: (ads[adId] && ads[adId]['slate'])
      };
      break;
    }
  }

  if (adInfo) {
    updateCurrentAd(adInfo);
    if (adInfo.type == 'progress') {
      // do not verify progress events.
      return;
    }
  }

  fetch(verificationUrl + mediaId).then((response) => {
    switch (response.status) {
      case 204:  // Normal response for verification success, do nothing.
      case 202:  // Normal response for delayed verification processing, do
                 // nothing.
        break;
      case 404:  // Incorrect verification URL.
        console.warn(
            'Media verification not found. This verification may have already fired, or may be expired.');
        break;
      default:  // We shouldn't be getting any other status codes.
        console.error(
            'Unknown status code from media verification: ' + response.status);
        break;
    }
  });
}

/**
 * updates the current ad.
 * @param {?Object=} adInfo Information from most recent ad event.
 */
function updateCurrentAd(adInfo = null) {
  const type = adInfo.type || '';
  const ad = adInfo.ad || '';
  currentAd = ads[ad] || null;
  if (type == 'start') {
    console.log('start ad', currentAd);
  }
  if (type == 'complete') {
    console.log('end ad', currentAd);
    currentAd = null;
  }
  lastProgressTagTime = videoElement.currentTime;
}

function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}