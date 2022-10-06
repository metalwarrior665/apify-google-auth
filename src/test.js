const Apify = require('apify');
const { apifyGoogleAuth } = require('./main');

Apify.main(async () => {
    const input = await Apify.getValue('INPUT');
    const {
        scope = 'spreadsheets',
        credentials
    } = input;
    const oAuth2Client = await apifyGoogleAuth({ scope, credentials });
    console.log(oAuth2Client);
});