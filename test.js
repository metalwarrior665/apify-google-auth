const { apifyGoogleAuth } = require('./src/main');

apifyGoogleAuth({
    scope: 'spreadsheets',
    // These are not real ones
    credentials: {
        client_id: '118138324390-1nmbvv5q2nffuagp65i03k086qr173jg.apps.googleusercontent.com',
        client_secret: 'U8O18p03593vMUgcE1m67z8j',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        /*
        additionalClients: [{
            client_id: '211810992764-n3k9d189h8h631vnvviock7ui5mu1ak1.apps.googleusercontent.com',
            client_secret: 'DmBVmdsfsdfsdkkdHRgWwAgC',
        }]
        */
    }
})