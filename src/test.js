const { Actor } = require('apify');
const { apifyGoogleAuth } = require('./main');

Actor.main(async () => {
    const input = await Actor.getInput();
    const {
        scope = 'spreadsheets',
        credentials
    } = input;
    const oAuth2Client = await apifyGoogleAuth({ scope, credentials });
    console.log(oAuth2Client);
});