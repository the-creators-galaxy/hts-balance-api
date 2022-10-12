# Hedera Token Service Balances API 

## Description 

This is a developer tool intended to easily retrieve the balances of all accounts holding a given ([HTS](https://docs.hedera.com/guides/docs/sdks/tokens)) token. 

It can be run as a CLI or referenced by consumer JavaScript code.

Users can provide a HTS Token ID, and optionally accounts that should **not** be considered part of circulation.

## Technologies

- [Node.js](https://nodejs.org/en/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) 

## How it works

Users can provide a HTS Token ID, as well as accounts that should **not** be considered part of circulation. The tool will query a Hedera Mirror Node and retreive the current balances of all accounts. It will deduct the current balance of non-circulating accounts from the HTS Token's total supply, thus calculating it's remaining circulating supply. 

## Getting started

This project provides multiple options for invocation and retrieval of information - 
it can be run from the command line or consumed by user written code. To get started,
download the source code and open a command prompt in the project’s directory:

1.  `git clone https://github.com/the-creators-galaxy/hts-balance-api.git`
2.  `cd hts-balances-api`

Next, chose your preferred method for invoking the algorithm:

### Retrieve **$CLXY** info using the CLI

To retrieve the current *mainnet* circulating supply of the `$CLXY`, enter the following in the command line:

```bash
node clxy
```
or
```bash
npm run clxy
```

Something similar to the following should be displayed in the console:

```
Token,0.0.859814
Decimals,6
Source,mainnet-public.mirrornode.hedera.com
Timestamp,1657907287.855999947
Total Supply,1000000000000000
Circulating,16249557333300

Treasuries
0.0.849428,0
0.0.859877,100000000000000
0.0.859897,89966626000000
0.0.859903,349000000000000
0.0.859906,55000000000000
0.0.859908,46000000000000
0.0.859910,199815566666700
0.0.859911,143968250000000

Consumers
0.0.975694,10000000000
0.0.971021,10000000000
0.0.970584,201367187500
0.0.970573,201367187500
....
```

### Retrieve any arbitrary token's circulation using the CLI

To retrieve the current supply of any HTS token in the console, enter the following in the command line:

```bash
node cli <mirror host> <token id> [ <treasury id> ...]
```
or
```bash
npm run cli -- <mirror host> <token id> [ <treasury id> ...]
```

Where:

* <**mirror host**> - is the mirror node dns or ip address to query. 
* <**token id**> - is the ID of the token in HAPI format (0.0.0).
* <**treasury id**> - additional IDs of treasury accounts in HAPI format (0.0.0).

And each is separated by a space.

Something similar to the example above will appear in the console.

## Authors

[Jason Fabritz](mailto:jason@calaxy.com)

## License

[MIT](/LICENSE)
