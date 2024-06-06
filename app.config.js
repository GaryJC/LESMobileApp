const IS_PREVIEW = process.env.APP_ENV === 'preview'

export default {
  "jsEngine": "hermes",
  "name": "NexGami",
  "slug": "NexGami",
  "version": "1.1.1",
  "orientation": "portrait",
  "icon": "./assets/icon.png",
  "userInterfaceStyle": "light",
  "appMode": process.env.APP_ENV,
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#080F14"
  },
  "assetBundlePatterns": [
    "**/*"
  ],
  "ios": {
    "associatedDomains": [
      "applinks:nexgami.com"
    ],
    "supportsTablet": true,
    "bitcode": false,
    "googleServicesFile": "./GoogleService-Info.plist",
    "entitlements": {
      "com.apple.developer.associated-domains": [
        "applinks:nexgami.com"
      ]
    }
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "package": "com.nexgami.im.mobile",
    "googleServicesFile": "./google-services.json",
  },
  "web": {
    "favicon": "./assets/favicon.png"
  },
  "sdkVersion": "48.0.0",
  "plugins": [
    "@react-native-google-signin/google-signin"
  ],
  "extra": {
    "eas": {
      "projectId": "5f44be01-64a4-4fe0-b442-d9f92dd68282"
    },
  },
  "runtimeVersion": "1.1.1",
  "updates": {
    "fallbackToCacheTimeout": 0,
    "url": "https://u.expo.dev/5f44be01-64a4-4fe0-b442-d9f92dd68282"
  }
}