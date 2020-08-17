module.exports = async ({ store, credentials, scope }) => {
    // Here we apply this ugly hack that user can send more client_ids and we will 
    // either pick one from his store or make new tokens on the latest (fresh) one
    // to work around the 100 users limitation
    const additionalClients = credentials.additionalClients || [];
    const allCredentials = [credentials, ...additionalClients];
    for (const creds of allCredentials) {
        let tokensRecordKey;
        try {
            tokensRecordKey = `${creds.client_id.match(/(.+)\.apps\.googleusercontent/)[1]}-${scope}`;
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
    return {
        pickedCredentials,
        tokens: null,
        tokensRecordKey: `${pickedCredentials.client_id.match(/(.+)\.apps\.googleusercontent/)[1]}-${scope}`,
    };
};
