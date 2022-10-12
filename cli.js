/**
 * Command Line Script for retrieving and displaying the
 * circulating supply of an HTS token.
 * 
 * The expected arguments include:
 * 
 *  - source: the mirror node dns or ip address to query.
 *  - token id: the ID of the token in HAPI format (0.0.0).
 *  - treasuries: the remaining arguments identify treasury
 *                accounts whos holdings are not considered 
 *                part of the circulating supply, and should
 *                subtracted from the total supply of token
 *                when computing the circulating supply.
 * 
 * Command Line Invocation:
 * 
 * node ./cli.js <mirror host> <token id> [ <treasury id> ...]
 */
const getTokenBalances = require('./token-balances');
/**
 * Retrieves, computes and displays the circulating supply of
 * the target token specified in command line arguments.
 */
async function getCirculation() {
    if (process.argv.length < 4) {
        console.error('Usage: node ./cli.js <mirror host> <token id> [ <treasury id> ...]')
        process.exit(1);
    }
    const source = process.argv[2];
    const token = process.argv[3];
    const treasuries = process.argv.slice(4);
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
 * Invoke the method retrieving the arguments from the command line.
 */
getCirculation();