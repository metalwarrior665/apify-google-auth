## Apify Google Auth

This small library allows using OAuth for Google services on [Apify](http://apify.com/) platform.

### 0.1.* -> 0.2.0
From version `0.2.0` you cannot use Apify's Google OAuth keys on your local machine. If you want to run it from outside of official Apify actors, you have to create your own project in Google Console and provide your own keys.

## How it works

This library opens a page either at live view (default port) on Apify platform or at `localhost:3000` otherwise. You need to click on `Authorize` and then login and submit with your Google account that you want to integrate. Then copy the key to the input field and submit. Your tokens will be stored in named key value store (the field is called `tokensStore` and by defaults to `google-oauth-tokens`) and any subsequent runs will first use these tokens so you don't need to authorize again.

The token usually expire only if you don't use them at all for 6 monhts. If the token expires or you need to use anothe Google account, you have to either delete the current tokens or use different `tokensStore`.

#### Official actor on Apify platform
Your actor needs to contain `CLIENT_SECRET` environment variable. This variable is automatically read by this library and then deleted from the environment to reduce the risk of leaking. If you want to implement official Apify actor, please contact support@apify.com.

#### Custom implementation
For any other use, you have to create your own project in [Google Dev Console](https://console.developers.google.com/). Then create OAuth installed credentials and pass them into function of this library in this format:

```javascript
const keys = {
    client_id: 'yourClientId',
    client_secret: 'yourClientSecret,
    redirect_uri: 'yourRedirectUri' // the first one
}
```

## Usage
This library returns you the authorized client that you can pass into `googleapis` library to use any Google service. Example for Google Sheets.

```javascript
const Apify = require('apify');
const { google } = require('googleapis');
const { apifyGoogleAuth } = require('apify-google-auth');

Apify.main(async () => {
    const authOptions = {
        scope: 'spreadsheets',
        tokensStore: 'my-tokens',
        keys, // Optional parameter. If not provided, CLIENT_SECRET env var is assumed.
    };

    // Checks your tokensStore for token first. If not found, prompts you to authorize.
    const authClient = await apifyGoogleAuth(authOptions);

    const sheets = google.sheets({ version: 'v4', auth: authClient });

    await sheets.spreadsheets.values.update({
        spreadsheetId: '1cNgnKm9WQSDKG2bGjgTSr-y39J0K61zBHUA0Hhpx4ng'
        range: 'Sheet1',
        valueInputOption: 'RAW',
        resource: { values: [['header1', 'header2']['value1', 'value2']] },
    }
})
```



