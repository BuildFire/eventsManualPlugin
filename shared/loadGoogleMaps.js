function setGoogleMapsScript(key) {
  const docHead = document.getElementsByTagName("head");
  let scriptEl = document.createElement("script");
  scriptEl.id = "googleScript";
  scriptEl.src =
    "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=" +
    key;
  docHead[0].appendChild(scriptEl);
}

var isMapReady = false;

function mapReady() {
  isMapReady = true;
}

buildfire.getContext((error, context) => {
  setGoogleMapsScript(context.apiKeys.googleMapKey);
});
