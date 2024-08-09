# Stylus Extension

This is a Chrome Extension that lets you show touches or a virtual stylus in your app when recording demos.
It adds a canvas on top of your app and renders any pointerevents to it. Only touches and stylus are shown.

## Usage

1. Clone this repo.
2. Run `npm run build` to bundle the script
3. Go to chrome://extensions, enable developer mode, choose "load unpacked", and select the `extension/` folder
4. On any website, click the extension to add the overlay
5. As you write and tap, you should see an overlay showing a virtual stylus and touches.
