pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Faucet {
    
    struct User {
      address addr;
      uint donate;  // 捐獻金額
      uint donateTime;  // 捐獻時間
      uint withdrawal;  // 提領金額累計
      uint withdrawalTime; // 最近一次的提領時間
      bool blacklist;  // 被列為黑名單
    }
    
    // 每次提領金額
    uint public withdrawalAmount = 0.1 ether;
    address payable owner;
    
    // 黑名單清單
    mapping (address => bool) public blacklist;
    // user 清單
    mapping (address => User) public users;
    
    // 事件
    // 用戶捐獻通知
    event UserDonate(address indexed addr, User user, uint balance);   
    // 用戶提領通知 
    event UserWithdrawal(address indexed addr, User user, uint balance);    
    
    modifier onlyOwner() { require(msg.sender == owner); _; }
    
    // 提領前置檢查
    modifier available() {
        require(!blacklist[msg.sender], "You are in the black list.");
        if(!isNewUser(msg.sender)) {
            require(now > users[msg.sender].withdrawalTime + 1 days, "you need to waiting for a few hours.");
        }
        _;
    }
    
    // 建構子
    constructor() public {
        owner = msg.sender;
    }
    
    function isNewUser(address addr) private returns (bool) {
        return users[addr].donate == 0 && users[addr].withdrawal == 0;
    }
    
    // 捐獻
    function donate() public payable {
        if(isNewUser(msg.sender)) {
            users[msg.sender] = User(msg.sender, msg.value, now, 0, 0, false);
        } else {
            users[msg.sender].donate += msg.value;
            users[msg.sender].donateTime = now;
            if(msg.value >= 10 ether) blacklist[msg.sender] = false;
        }
        emit UserDonate(msg.sender, users[msg.sender], address(this).balance);
    }
    
    // 提領
    function withdrawal() public available payable {
        if(isNewUser(msg.sender)) {
            users[msg.sender] = User(msg.sender, 0, 0, withdrawalAmount, now, false);
        } else {
            if(now > users[msg.sender].withdrawalTime + 10 minutes)
            users[msg.sender].withdrawal += withdrawalAmount;
            users[msg.sender].withdrawalTime = now;
        }
        msg.sender.transfer(withdrawalAmount);
        emit UserWithdrawal(msg.sender, users[msg.sender], address(this).balance);
    }
    
    // 加入至黑名單
    function addBlacklist(address addr) onlyOwner public {
        blacklist[addr] = true;
    }
    
    // 從黑名單中移除
    function removeBlacklist(address addr) onlyOwner public {
        blacklist[addr] = false;
    }
    
    // 更改每次提領金額
    function setWithdrawalAmount(uint amount) onlyOwner public {
        withdrawalAmount = amount;
    }
    
    // 查詢餘額
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
    function remove() onlyOwner public {
        selfdestruct(owner);
    }
}