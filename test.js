const { apifyGoogleAuth } = require('./main');

apifyGoogleAuth({
    scope: 'spreadsheets',
    // These are not real ones
    credentials: {
        client_id: '211810992764-08fbdfgd9jqch0ng652ukbl8d5dahook.apps.googleusercontent.com',
        client_secret: 'Zdfgdfg3sdfsdfs5dfgdfgdfg',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    }
})