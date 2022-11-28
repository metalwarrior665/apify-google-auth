## Apify Google Auth

This small library allows using OAuth for Google services with [Apify](http://apify.com/) actors platform.

## Chagelog
### 0.5.0 -> 0.5.1
Added option to provide custom redirect_uri which is now needed after Google banned Out-of-band OAuth. You need ot direct the redirect to your server.

### 0.4.* -> 0.5.0
`apify` package is not only peer dependency. It should work even for most old versions.

### 0.3.* -> 0.4.0
Bumped underlying `google-auth-library` from `2.0` to `6.1.1`. It should not affect anything

### 0.1.* -> 0.3.0
From version `0.3.0` you cannot use Apify's Google OAuth credentials on your local machine. If you want to run it from outside of official Apify actors (like [Google Sheets](https://apify.com/lukaskrivka/google-sheets)), you have to create your own project in Google Console and provide your own credentials.

## How it works
This library opens an authorization page either inside the live view tab on the Apify platform or at `localhost:3000` otherwise. The user needs to click on `Authorize` and then login and submit with his or her Google account that should be integrated. Then he or she needs to copy the key to the input field and submit. The tokens will be stored into the named Key-Value Store (by default `google-oauth-tokens`) and any subsequent runs will first use these tokens so there is no need to authorize again.

The token usually expire only if you don't use the library at all for 6 months. If the token expires or you need to use another Google account, you have to either delete the current tokens or use a different `tokensStore`.

#### Passing credentials
You have to create your own project in [Google Dev Console](https://console.developers.google.com/). Then create OAuth installed credentials and pass them into the `apifyGoogleAuth` function of this library in this format:

```javascript
const credentials = {
    client_id: 'yourClientId',
    client_secret: 'yourClientSecret',
    redirect_uri: 'yourRedirectUri', // the first one
};
```

#### Non-verified Google projects
Unless you go through a strict verification process, Google will mark your project as potentially dangerous. The exact warning depends on the security settings of the user. For some users, a normal authorization screen is displayed. Some will have to go to "Advanced" screen after a warning and for some, the authorization will be completely disabled. Test it with your users first.

## Usage
This library returns you the authorized client that you can pass into `googleapis` library to use any Google service. Example for Google Sheets.

```javascript
const Apify = require('apify');
const { google } = require('googleapis');
const { apifyGoogleAuth } = require('apify-google-auth');

Apify.main(async () => {
    const authOptions = {
        scope: 'spreadsheets',
        credentials: {
            client_id: 'yourClientId',
            client_secret: 'yourClientSecret',
            redirect_uri: 'yourRedirectUri',
        },
        tokensStore: 'my-tokens', // optional
    };

    // Checks your tokensStore for token first. If not found, prompts you to authorize.
    const authClient = await apifyGoogleAuth(authOptions);

    const sheets = google.sheets({ version: 'v4', auth: authClient });

    await sheets.spreadsheets.values.update({
        spreadsheetId: '1cNgnKm9WQSDKG2bGjgTSr-y39J0K61zBHUA0Hhpx4ng',
        range: 'Sheet1',
        valueInputOption: 'RAW',
        resource: { values: [['header1', 'header2'], ['value1', 'value2']] },
    }
})
```



