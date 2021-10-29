
//Our goal is to be able to see all new minted tokens for roughly the last week, then be able to match those up to upcoming steal launches
//Methods: mint METHOD: 40c10f19, New token:60806040, 60c06040 mint
const fs = require('fs');
const line = require('single-line-log').stdout;
require('dotenv').config(); //env file should be named .env NOTHING BEFORE 
const { url3, url4, seed } = process.env; // names must match names in .env file

const Web3 = require('web3');
const web3 = new Web3(url3)         //CHANGE TO URL3 FOR BSC, URL4 FOR POLY 
const ethers = require('ethers');
const mnemonic = seed
const provider = new ethers.providers.WebSocketProvider(url3);    //CHANGE TO URL3 FOR BSC, URL4 FOR POLY 
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);


var pottokenstx = []
var data = []

var subscription = web3.eth.subscribe('pendingTransactions')
  .on("data", function(transaction){
      
      web3.eth.getTransaction(transaction, function(err, tx){
        
        try {
          let tx_data = tx.input;
          method =  tx_data.slice(2,10)// this clearly tells us the type of function it was, the Method Id is global we just need to match it up
          line('Method: ', method,)
          

          if (method == '40c10f19' || method == '60806040' || method == '6c0815c6' || method == '60c06040') {
            
            console.log('  MintTxHash: ', tx.hash)
            pottokenstx.push(tx.hash)
            init();
            
          // what we want to do is add to an array here with each tx has then use the code built out in test.js to run through and put names on the tokens and build that list
          } else {
          throw 'Wrong Method'
          } 
          

        }
        catch {
          line('Method:         ');
        }
      
      });

  });

  const init = async () => {
    if (pottokenstx.length == 10) {
      txlist = pottokenstx
      pottokenstx = []
      console.log(txlist.length)
      init2();    // we pass along the analysing of the tx's to init2 because init can be called again very rapidly so we don't want it to be in the middle of processes
    }
  }
  const init2 = async () => {
    
    for (var i = 0; i < txlist.length; i++) {
      
      let pottoken = txlist[i]
      
      try {
        
        let details = await web3.eth.getTransactionReceipt(pottoken) 
        let contractaddy = details['contractAddress']
        console.log('Contract Address: ', contractaddy)

        let targettoken = new ethers.Contract(
          contractaddy,
          [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function decimals() view returns (uint)'
          ],
          account
        )
        
        let name = await targettoken.name()
        let hexdec = await targettoken.decimals()
        let dec = ethers.utils.arrayify(hexdec);
        let symbol = await targettoken.symbol()

        data.push(name)
        data.push(symbol)
        data.push(dec[0])
        data.push(contractaddy)
        
        console.log('Name: ', name, ' Symbol: ', symbol, ' Decimals: ', dec[0], '\n')
      }
      catch { 
      }
    
    }
    init3();// maybe instead run if i == txlist.length
  }
  
    
  const init3 = async () => {
    for (i = 0; i < data.length; i++) {
  
      let remainder = i % 4
      if (remainder === 0 || i === 0) {   // so at the start it makes a space and for every multiple of 4 it makes a space
          fs.appendFile('newtokens.txt', '\n', function (err) {
              if (err) throw err;
          }); 

          await new Promise(resolve => setTimeout(resolve, 3)); // 1000ms = 1 sec
      }
      
      fs.appendFile('newtokens.txt', data[i] + '        ' , function (err) { 
          if (err) throw err;
      });   
      
      await new Promise(resolve => setTimeout(resolve, 3)); // 1000ms = 1 sec IF you let this run full speed it jumbles up order
      
  
    }
    data = []
    console.log('Written to .txt')
  }
  
  
