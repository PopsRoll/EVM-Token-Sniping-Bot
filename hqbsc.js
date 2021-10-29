require('dotenv').config(); //env file should be named .env NOTHING BEFORE 
const ethers = require('ethers'); 
const { url, seed} = process.env; // names must match names in .env file
const Web3 = require('web3');
const web3 = new Web3(url)
const mnemonic = seed
const provider = new ethers.providers.WebSocketProvider(url);
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);

//ALL must be checksum addy's
const addresses = {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',       
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    smartContract: '', // Your Deployed Smart contract address
    target: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',   //UPDATE EACH LAUNCH 1 of 4
    recipient: ''   // Wallet address you want to recieve the swapped tokens
}

const SmartContract = new ethers.Contract(
    addresses.SmartContract,
    [
        'function getAdministrator() external view returns(address payable)',
        'function getRouter() external view returns(address)',
        'function plan( uint _amountIn, address _tknToBuy, uint _amountOutMin, uint _orders, uint _approveAmount) external returns(bool success)',
        'function getPlan() external view returns(uint, address, uint, uint, uint)',
        'function emergencyWithdrawTkn(address _token, uint _amount) external returns(bool success)',
        'function setRouter(address _newRouter) external returns (bool success)',
        'function exactIn(address _tokenPaired) external returns(bool success)',
        'function exactOut(address _tokenPaired) external returns(bool success)'
    ],
    account
);

const init = async () => {
    //number of swaps per TX
    const orders = 2;
    // how much weth contract will approve router to spend
    const approveAmount = ethers.utils.parseUnits('.02', 18)
    amountIn = ethers.utils.parseUnits('.002', 18)
    // Update so DECIMAL matches target token <------
    amountOutMin = ethers.utils.parseUnits('.01', 18)   
    const withdraw = ethers.utils.parseUnits('.01')
    //console.log(Date.now()/1000)
    const admin = await SmartContract.getAdministrator()// if it is a view function, it needs no gas
    console.log('Admin: ', admin)
    //await SmartContract.setRouter('0x8d43CEB4B707Fb829b1FBc25B3b6fAF827Da0C0c',{ gasLimit: ethers.utils.hexlify(60000), gasPrice: ethers.utils.parseUnits('8', 'gwei') } )
    const router = await SmartContract.getRouter()
    console.log('Router: ', router)
    
    //This Below is what sends the smart contract instructions
    //const plan =  await SmartContract.plan(
    //   amountIn,
    //   addresses.target,
    //   amountOutMin,
    //   orders,
    //   approveAmount,
    //   { gasLimit: ethers.utils.hexlify(300000), gasPrice: ethers.utils.parseUnits('15', 'gwei') }
    //)
    //console.log(plan.hash)
    const config = await SmartContract.getPlan()
    console.log(config)
    //const pull = await SmartContract.emergencyWithdrawTkn(
    //    addresses.WBNB,
    //    withdraw,
    //    { gasLimit: ethers.utils.hexlify(300000), gasPrice: ethers.utils.parseUnits('8', 'gwei') }
    //)
    //console.log(pull.hash)
    //const exactIn = await SmartContract.exactIn({ gasLimit: ethers.utils.hexlify(3000000), gasPrice: ethers.utils.parseUnits('8', 'gwei') });
    //console.log(exactIn.hash)
    //const exactOut = await SmartContract.exactOut({ gasLimit: ethers.utils.hexlify(3000000), gasPrice: ethers.utils.parseUnits('8', 'gwei') });
    //console.log(exactOut.hash)

}
init();
