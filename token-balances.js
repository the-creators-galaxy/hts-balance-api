const https = require('https');
const URLSearchParams = require('url').URLSearchParams;
/**
 * Queries a remote hedera mirror node, retrieving the supply of 
 * tokens and lists of account holders, identifying treasuries separately.
 * 
 * @param {string} source the mirror node to query token information and balances.
 * @param {string} token the id of the token (in HAPI 0.0.0 format)
 * @param {string[]} treasuries an array of treasury accounts.  Treasury accounts
 * do not count towards circulating token supply.
 * 
 * @returns an object holding the results of query balances and calculations.
 */
module.exports = async function tokenCirculation(source, token, treasuries) {

    validateInput();
    const agent = new https.Agent({ keepAlive: true });
    const timestamp = (Date.now() / 1000).toFixed(9);
    const { totalSupply, decimals } = await getTokenSupply();
    const consumerBalances = await getAllHTSAccountBalances();
    const treasuryBalances = new Map();
    let nonCirculatingSupply = BigInt(0);
    for (const treasury of treasuries) {
        if (consumerBalances.has(treasury)) {
            const balance = consumerBalances.get(treasury);
            nonCirculatingSupply = nonCirculatingSupply + balance;
            treasuryBalances.set(treasury, balance);
            consumerBalances.delete(treasury);
        } else {
            treasuryBalances.set(treasury, BigInt(0));
        }
    }
    const circulating = totalSupply - nonCirculatingSupply;
    return {
        token,
        decimals,
        totalSupply,
        circulating,
        treasuryBalances,
        consumerBalances,
        timestamp,
        source
    }
    /**
     * Helper function to validate token/treasury input values.  It checks
     * to confirm that the strings for address are in HAPI format (0.0.0) and
     * that the mirror node server is identified.
     * 
     * @throws {Error} Error if any of the input values appear to be invalid.
     */
    function validateInput() {
        if (!source) {
            throw new TypeError('Source (mirror node) must be defined.');
        }
        if (!/^\d+\.\d+\.\d+$/.test(token)) {
            throw new TypeError(`Invalid token ID ${token}`);
        }
        if (treasuries) {
            if (!Array.isArray(treasuries)) {
                throw new TypeError('If defined, the treasuries argument must be an arrray.');
            }
            for (let treasury of treasuries) {
                if (!/^\d+\.\d+\.\d+$/.test(treasury)) {
                    throw new TypeError(`Invalid treasury ID ${treasury}`);
                }
            }
        }
    }
    /**
     * Retrieves the total supply and decimal places for the target token.
     * 
     * @returns a structure identifying the total supply and decimial places
     * for the target token.
     * 
     * @throws {Error} Error if there was a problem communicating with the mirror node
     * endpoint or if the token with the specified ID was not found.
     */
    async function getTokenSupply() {
        const tokenInfo = await getHtsTokenInfo();
        return {
            totalSupply: BigInt(tokenInfo.total_supply),
            decimals: tokenInfo.decimals !== undefined ? parseInt(tokenInfo.decimals, 10) : 0
        };
    }
    /**
     * Retrieves the token info from a mirror node for the given HTS token.
     * 
     * @returns the token info object returned from the mirror node, this information
     * includes the tokens's total supply and decimal places.
     * 
     * @throws {Error} Error if there was a problem communicating with the mirror node
     * endpoint or if the token with the specified ID was not found.
     */
    async function getHtsTokenInfo() {
        const queryParams = new URLSearchParams({ 'timestamp': timestamp });
        const path = `/api/v1/tokens/${token}?${queryParams.toString()}`;
        const options = { hostname: source, path, method: 'GET', agent };
        let { code, data } = await executeRequest(options);
        if (code === 200) {
            return JSON.parse(data.toString('ascii'));
        } else {
            throw new Error(`HTS Token ${token} was not found, code: ${code}`);
        }
    }
    /**
     * Retrieves the balances of all accounts holding the given HTS token.
     * 
     * @returns a map of account ids and their associated token balance
     * (in units of the smallest token denomination).
     * 
     * @throws {Error} Error if there was a problem communicating with the mirror node
     * endpoint or if the token with the specified ID was not found.
     */
    async function getAllHTSAccountBalances() {
        const result = new Map();
        const queryParams = new URLSearchParams({ 'timestamp': timestamp });
        const path = `/api/v1/tokens/${token}/balances?${queryParams.toString()}`;
        const options = { hostname: source, path, method: 'GET', agent };
        while (true) {
            let { code, data } = await executeRequest(options);
            if (code === 200) {
                const balances = JSON.parse(data.toString('ascii'));
                const list = balances.balances;
                if (list && list.length > 0) {
                    for (const item of list) {
                        result.set(item.account, BigInt(item.balance));
                    }
                }
                const links = balances.links;
                if (links && links.next) {
                    options.path = links.next;
                } else {
                    return result;
                }
            } else {
                throw new Error(`Balances for token ${token} were not found, code: ${code}`);
            }
        }
    }
    /**
     * Helper function that executes a simple https request
     * for the given resource.
     * 
     * @param {import('https').RequestOptions} options HTTP options
     * of the request, including the host name, path, method and agent.
     * 
     * @returns the http code returned from the retmote service
     * pluss a buffer containing body content from the response.
     */
    function executeRequest(options) {
        let data = [];
        return new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                res.on('data', chunk => { data.push(chunk); });
                res.on('end', () => resolve({ code: res.statusCode, data: Buffer.concat(data) }));
            });
            req.on('error', e => reject(e));
            req.end();
        });
    }
};