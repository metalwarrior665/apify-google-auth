const { OAuth2Client } = require('google-auth-library');
const { Actor } = require('apify');
const http = require('http');

const { DEFAULT_TOKENS_STORE } = require('./constants');
const { authorize, close } = require('./submit-page.js');
const { pleaseOpen, liveView, localhost } = require('./asci-text.js');
const selectCredentialsAndTokens = require('./select-credentials-and-tokens');

module.exports.apifyGoogleAuth = async ({ scope, tokensStore, credentials }) => {
    if (!scope) throw new Error('Missing scope parameter! We don\'t know which service you want to use.');

    if (typeof credentials !== 'object' || !credentials.client_id || !credentials.client_secret || !credentials.redirect_uri) {
        throw new Error('credentials have wrong format. It has to be an object with fields: client_id, client_secret, redirect_uri.');
    }

    const store = await Actor.openKeyValueStore(tokensStore || DEFAULT_TOKENS_STORE);

    const { pickedCredentials, tokens, tokensRecordKey } = await selectCredentialsAndTokens({ store, credentials, scope });

    const oAuth2Client = new OAuth2Client(
        pickedCredentials.client_id,
        pickedCredentials.client_secret,
        // This is always the same
        pickedCredentials.redirect_uri,
    );

    if (tokens) {
        console.log('We found tokens saved in our store. No need to authenticate again.');
        oAuth2Client.setCredentials(tokens);
        console.info('using stored tokens');
        return oAuth2Client;
    }

    console.log('We have to authenticate to get the tokens');

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: `https://www.googleapis.com/auth/${scope}`,
    });
    let code;
    
    const port = Actor.isAtHome() ? process.env.APIFY_CONTAINER_PORT : 3000;
    const information = Actor.isAtHome() ? liveView : localhost;

    console.log(pleaseOpen);
    console.log(information);

    const server = http.createServer((req, res) => {
        // User submitted code as payload
        if (req.url.includes('/authorize')) {
            let data = '';
            req.on('data', (body) => {
                if (body) data += body;
            });
            req.on('end', () => {
                const searchParams = new URLSearchParams(data);
                code = searchParams.get('code');
                res.end(close());
            });
        } else {
            res.end(authorize(authorizeUrl));
        }
    });

    server.listen(port, () => console.log('server is listening on port', port));

    const start = Date.now();
    while (!code) {
        const now = Date.now();
        if (now - start > 5 * 60 * 1000) {
            throw new Error('You did not provide the code in time!');
        }
        console.log(`waiting for code...You have ${300 - Math.floor((now - start) / 1000)} seconds left`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    server.close(() => console.log('closing server'));

    // Now that we have the code, use that to acquire tokens.
    const tokensResponse = await oAuth2Client.getToken(code);
    console.log(`Storing the tokens to your store under key ${tokensRecordKey}`);
    await store.setValue(tokensRecordKey, tokensResponse.tokens);
    oAuth2Client.setCredentials(tokensResponse.tokens);
    console.info('returning authenticated client');
    return oAuth2Client;
};
