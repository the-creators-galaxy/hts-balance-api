/**
 * Example script for retrieving the balances the official $CLXY token.
 */
const getTokenBalances = require('./token-balances');
/**
 * Retrieves, computes and displays the balances of $CLXY tokens.
 */
async function getClxyCirculation() {
    const source = 'mainnet-public.mirrornode.hedera.com';
    const token = '0.0.859814';
    const treasuries = ['0.0.849428', '0.0.859877', '0.0.859897', '0.0.859903', '0.0.859906', '0.0.859908', '0.0.859910', '0.0.859911'];
    const results = await getTokenBalances(source, token, treasuries);

    console.log(`Token,${results.token}`);
    console.log(`Decimals,${results.decimals}`);
    console.log(`Source,${results.source}`);
    console.log(`Timestamp,${results.timestamp}`);
    console.log(`Total Supply,${results.totalSupply}`);
    console.log(`Circulating,${results.circulating}`);
    if (results.treasuryBalances.size) {
        console.log();
        console.log(`Treasuries`);
        results.treasuryBalances.forEach((balance, treasury) => console.log(`${treasury},${balance}`));
    }
    if (results.consumerBalances.size) {
        console.log();
        console.log(`Consumers`);
        results.consumerBalances.forEach((balance, account) => console.log(`${account},${balance}`));
    }
}
/**
 * Invoke the async function to retrieve and 
 * print results to the console.
 */
getClxyCirculation();