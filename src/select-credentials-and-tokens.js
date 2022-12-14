const getUuid = require('uuid-by-string');

function getTokensRecordKey(clientId, scope) {
    let resultKey = `${clientId.match(/(.+)\.apps\.googleusercontent/)[1]}-${scope}`;

    if (/[^a-zA-Z0-9!-_.'()]/.test(resultKey)) {
        resultKey = resultKey.replace(/[^a-zA-Z0-9!\-_.'()]+/g, '-')
    }

    const MAX_KEY_SIZE = 256;
    if (resultKey.length > MAX_KEY_SIZE) {
        const hash = getUuid(resultKey);
        resultKey = resultKey.substring(0, MAX_KEY_SIZE - hash.length).concat(hash);
    }

    return resultKey;
}

module.exports = async ({ store, credentials, scope }) => {
    // Here we apply this ugly hack that user can send more client_ids and we will
    // either pick one from his store or make new tokens on the latest (fresh) one
    // to work around the 100 users limitation
    const additionalClients = credentials.additionalClients || [];
    const allCredentials = [credentials, ...additionalClients];
    for (const creds of allCredentials) {
        let tokensRecordKey;
        try {
            tokensRecordKey = getTokensRecordKey(creds.client_id, scope);
        } catch (e) {
            throw new Error('Your client_id has wrong format. It should end with .apps.googleusercontent.com')
        }

        const tokens = await store.getValue(tokensRecordKey);
        if (tokens) {
            return {
                pickedCredentials: creds,
                tokens,
                tokensRecordKey,
            };
        }
    }
    // If we didn't find any active tokens we use the last credentials as those should be fresh
    const pickedCredentials = allCredentials[allCredentials.length - 1];

    const tokensRecordKey = getTokensRecordKey(pickedCredentials.client_id, scope);

    return {
        pickedCredentials,
        tokens: null,
        tokensRecordKey,
    };
};
