# Web3

2024年3月21日

## 文档

[blockchain](https://andersbrownworth.com/blockchain/hash)

[soliditylang](https://docs.soliditylang.org/zh/latest/index.html)

[区块连教程(二)：Solidity编程基础](https://zhuanlan.zhihu.com/p/365746526)

[区块链教程(四)：搭建私链、web3.js基础](https://zhuanlan.zhihu.com/p/366293993)

[区块链教程(五)：合约编写实战实例](https://zhuanlan.zhihu.com/p/366753850)

[以太坊环境以及Solidity学习](https://zhuanlan.zhihu.com/p/353507891)

[ethereum](https://eips.ethereum.org/EIPS/eip-721)

[数据存储位置](https://www.cnblogs.com/zccst/p/14952292.html)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyToken1 is ERC721 {

    // 它用来表示一个商品。
    struct Product {
        uint256 tokenId;
        string name;
        string description;   // 描述
        uint256 price; // wei
        uint status;
    }
    
    
    mapping(uint256 => Product) public ProductStorage;

    // 合约控制者地址
    address private _owner; 

    constructor() ERC721("MyToken", "MTK") {
        _owner = msg.sender; // 设置合约控制者地址为合约发布地址
    }
    
    // 上架商品
    function up_product(uint256 tokenId, string memory name, string memory description, uint256 price) external {
        // address ownerMe = ownerOf(tokenId);
        // require(ownerMe == address(0), "exit!");
        
        ProductStorage[tokenId] = Product(tokenId, name, description, price, 1);
        _safeMint(msg.sender, tokenId);
    }

    // 下架商品
    function down_product(uint256 tokenId) external {
        address ownerMe = ownerOf(tokenId);
        require(ownerMe != address(0), "not exit!");
        Product storage storageVal = ProductStorage[tokenId];
        storageVal.status = 0;
        _burn(tokenId);
        ProductStorage[tokenId] = storageVal;
    }

    // 用户购买
    function deal_product(address owner, uint256 tokenId) external payable {
        address ownerMe = ownerOf(tokenId);
        require(ownerMe != address(0) || ownerMe != owner, "not exit!");
        Product storage storageVal = ProductStorage[tokenId];
        // 商品转移
        _safeTransfer(owner, msg.sender, tokenId);
        // 支付
        payable(owner).transfer(storageVal.price);
        storageVal.status = 2;
        ProductStorage[tokenId] = storageVal;
    }

    // 用户 商品列表的查询
    function find_product() external {

    }

}
```
