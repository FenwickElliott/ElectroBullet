# ElectroBullet

ElectroBullet is a desktop client for PushBullet, which allows users to send and recive text messages from their desktop.

## Usage

ElectroBullet is designed to be usable with no technical knowledge. A packaged version is available for Mac [here](https://fenwickelliott.io/ElectroBullet.html).

In order to use ElectroBullet, you must have a PushBullet account and have the app installed on your phone, either from the [PlayStore](https://play.google.com/store/apps/details?id=com.pushbullet.android&referrer=utm_source%3Dpushbullet.com) or the [App Store](https://itunes.apple.com/us/app/pushbullet/id810352052?ls=1&mt=8).

When run for the first time ElectroBullet will open your browser to the PushBullet OAuth2 page for authorization. Upon approval ElectroBullet will save your API token and relaunch.

## To compile yourself
* Clone this reop: `git clone https://github.com/FenwickElliott/ElectroBullet.git`
* Change into the root directory: `cd ElectroBullet`
* Install the dependencies: `npm install`
* Start it up: `electron .`

## To package yourself
* Clone this repo: `git clone https://github.com/FenwickElliott/ElectroBullet.git`
* Change into the root directory: `cd ElectroBullet`
* Install the dependencies (if you haven't already): `npm install`
* Package for Mac: `npm run package-mac`
* You will find the packaged apps in ./release-builds