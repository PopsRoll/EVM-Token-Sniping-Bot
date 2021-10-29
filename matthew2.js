
// This system uses swapExactTokensForTokens controlling max amount in

console.log('Running Matthew V.2 (Matic ExactIN). ');
const line = require('single-line-log').stdout;
const ethers = require('ethers');
require('dotenv').config(); //env file should be named .env NOTHING BEFORE 
const { url2, seed, url4 } = process.env; // names must match names in .env file
const Web3 = require('web3');
const web3 = new Web3(url2)
const sweb3 = new Web3(url4)  // this is the provider we use to listen to mempool so we dont get throttled
const mnemonic = seed
const provider = new ethers.providers.WebSocketProvider(url2);
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);

console.log('Scanning Start Time: ', (Date.now()/1000), ' (number left of decimal is seconds)');
//ALL must be checksum addy's
const addresses = {
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    smartContract: '', // Your Deployed Smart contract address
    target: '0xcfb373cf60373344c78c384bd89cd5f4bc49e14e',   //UPDATE EACH LAUNCH 1 of 4
    recipient: ''// Wallet you want to recieve the swapped tokens
  }

const jump = async () => {
    var thenonce = await web3.eth.getTransactionCount(addresses.recipient, 'latest') // nonce starts counting from 0
    var noncenum = thenonce
    console.log('Nonce: ', noncenum)
    
    const SmartContract = new ethers.Contract(
        addresses.smartContract,
        [
            'function exactIn(address _tokenPaired) external returns(bool success)'
        ],
        account
    );



    var subscription = sweb3.eth.subscribe('pendingTransactions')
    .on("data", function(transaction){
        const listen = addresses.target.toUpperCase();  // CHANGE AFTER TESTING
    
        sweb3.eth.getTransaction(transaction, function(err, tx){
            
            try {
                
                let tx_data = tx.input;
                let input_data = '0x' + tx_data.slice(10);  // get only data without function selector, is that good? do we need function selector to see LQ add
                let method =  tx_data.slice(2,10)// this clearly tells us the type of function it was, the Method Id is global we just need to match it up
                gasCost = tx.gasPrice // so we can match up our gas price with lq add gas price
                let params = sweb3.eth.abi.decodeParameters(['address', 'address'], input_data); 
                let address0 = params[0].toUpperCase(); //.toUpperCase allows us to compare apples to apples with listen token
                let address1 = params[1].toUpperCase(); //parses out just the singular address for evaluation sake
                line('Scanning: ', address0);//This probably slows us down, even though we like it we should get rid of it
                if (method == 'f305d719' || method == 'e8e33700' ) {  //this just keeps us from hitting false alarms with our target token addLQEth 0xf305d719, addLQ 0xe8e33700
                    // if we console log here, cmdline gets messy
                } else {
                    throw 'wrong method'
                }
                if (address0 == listen) {
                console.log('\n', 'OG Tx: ', tx.hash);
                console.log('\n', 'Target: ', listen, '\n', 'address0: ', address0);
                subscription.unsubscribe();
                console.log('Method: ', method);
                console.log('gasPrice: ', gasCost);
                if (method == 'f305d719') {   //This is say if function is lqaddeth that lq is being added with Wbnb or Wmatic
                    lqtoken = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
                } else {
                    lqtoken = sweb3.utils.toChecksumAddress(address1);
                }
                init();
                }
                
                if (address1 == listen) {
                console.log('\n', 'OG Tx: ', tx.hash);
                console.log('\n', 'Target: ', listen, '/n', 'address0: ', address1);
                subscription.unsubscribe();
                console.log('Method: ', method);
                console.log('gasPrice: ', gasCost);
                if (method == 'f305d719') {   //This is say if function is lqaddeth that lq is being added with Wbnb or Wmatic
                    lqtoken = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
                } else {
                    lqtoken = sweb3.utils.toChecksumAddress(address1);
                }
                init();
                }
                
            }
            
            catch {
                line('Scanning: skipped');
            }
            
        });
    
    });
    
    const init = async () => {
       //Run self transfer of 0 to make sure nonce is good
       console.log('Swap Start Time: ', (Date.now()/1000));
       //HOW many orders we send
       const loops = 0;              

        let gashex = ethers.utils.hexlify(Number(gasCost))
        const tokenpaired = lqtoken
        
        for (var i = 0; i < loops; i++) {
            
            const buy = SmartContract.exactIn(tokenpaired, { gasLimit: ethers.utils.hexlify(3000000), gasPrice: gashex, nonce: noncenum})

            noncenum ++;
            console.log('Nonce now: ', noncenum);
            
        }

    }

}
jump();
