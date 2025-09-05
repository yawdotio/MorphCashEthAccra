//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * VirtualCardContract - Virtual Card Management
 * Handles virtual card creation, updating, and management
 * @author MorphCash Team
 */
contract VirtualCardContract is Ownable, ReentrancyGuard {
    // Virtual Card Struct
    struct VirtualCard {
        uint256 cardId;
        string cardName;
        string cardNumber; // Masked: ****1234
        string expiryDate;
        string cardType; // Visa, Mastercard, etc.
        uint256 spendingLimit;
        uint256 currentSpend;
        bool isActive;
        uint256 createdAt;
    }

    // State Variables
    address public immutable contractOwner;
    
    // Mappings
    mapping(address => VirtualCard[]) public userVirtualCards;
    mapping(address => uint256) public userCardCount;
    
    // Arrays
    uint256 public nextCardId = 1;

    // Events
    event VirtualCardCreated(address indexed user, uint256 indexed cardId, string cardName);
    event VirtualCardUpdated(address indexed user, uint256 indexed cardId);
    event VirtualCardDeactivated(address indexed user, uint256 indexed cardId);

    // Constructor
    constructor(address _owner) {
        contractOwner = _owner;
        _transferOwnership(_owner);
    }

    // Modifier
    modifier isOwner() {
        require(msg.sender == contractOwner, "Not the Owner");
        _;
    }

    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev Create a new virtual card for the user
     * @param cardName Name for the virtual card
     * @param cardNumber Masked card number (e.g., ****1234)
     * @param cardType Type of card (Visa, Mastercard, etc.)
     * @param spendingLimit Maximum spending limit for the card
     */
    function createVirtualCard(
        string memory cardName,
        string memory cardNumber,
        string memory cardType,
        uint256 spendingLimit
    ) external nonReentrant {
        uint256 cardId = nextCardId++;
        
        // Generate expiry date (3 years from now)
        uint256 currentTime = block.timestamp;
        uint256 expiryTimestamp = currentTime + (3 * 365 * 24 * 60 * 60); // 3 years in seconds
        
        // Convert to MM/YY format
        uint256 expiryYear = (expiryTimestamp / (365 * 24 * 60 * 60)) + 1970;
        uint256 expiryMonth = ((expiryTimestamp % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60)) + 1;
        
        string memory expiryDate = string(abi.encodePacked(
            expiryMonth < 10 ? "0" : "",
            uint2str(expiryMonth),
            "/",
            uint2str(expiryYear % 100)
        ));
        
        VirtualCard memory newCard = VirtualCard({
            cardId: cardId,
            cardName: cardName,
            cardNumber: cardNumber,
            expiryDate: expiryDate,
            cardType: cardType,
            spendingLimit: spendingLimit,
            currentSpend: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        userVirtualCards[msg.sender].push(newCard);
        userCardCount[msg.sender]++;
        
        emit VirtualCardCreated(msg.sender, cardId, cardName);
    }

    /**
     * @dev Create a virtual card for a specific user (owner only)
     * @param user The address of the user
     * @param cardName Name for the virtual card
     * @param cardNumber Masked card number (e.g., ****1234)
     * @param cardType Type of card (Visa, Mastercard, etc.)
     * @param spendingLimit Maximum spending limit for the card
     */
    function createVirtualCardForUser(
        address user,
        string memory cardName,
        string memory cardNumber,
        string memory cardType,
        uint256 spendingLimit
    ) external isOwner {
        uint256 cardId = nextCardId++;
        
        // Generate expiry date (3 years from now)
        uint256 currentTime = block.timestamp;
        uint256 expiryTimestamp = currentTime + (3 * 365 * 24 * 60 * 60); // 3 years in seconds
        
        // Convert to MM/YY format
        uint256 expiryYear = (expiryTimestamp / (365 * 24 * 60 * 60)) + 1970;
        uint256 expiryMonth = ((expiryTimestamp % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60)) + 1;
        
        string memory expiryDate = string(abi.encodePacked(
            expiryMonth < 10 ? "0" : "",
            uint2str(expiryMonth),
            "/",
            uint2str(expiryYear % 100)
        ));
        
        VirtualCard memory newCard = VirtualCard({
            cardId: cardId,
            cardName: cardName,
            cardNumber: cardNumber,
            expiryDate: expiryDate,
            cardType: cardType,
            spendingLimit: spendingLimit,
            currentSpend: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        userVirtualCards[user].push(newCard);
        userCardCount[user]++;
        
        emit VirtualCardCreated(user, cardId, cardName);
    }

    /**
     * @dev Update a virtual card
     * @param cardIndex Index of the card in user's card array
     * @param cardName New name for the card
     * @param spendingLimit New spending limit
     */
    function updateVirtualCard(
        uint256 cardIndex,
        string memory cardName,
        uint256 spendingLimit
    ) external nonReentrant {
        require(cardIndex < userVirtualCards[msg.sender].length, "Card does not exist");
        require(userVirtualCards[msg.sender][cardIndex].isActive, "Card is not active");
        
        userVirtualCards[msg.sender][cardIndex].cardName = cardName;
        userVirtualCards[msg.sender][cardIndex].spendingLimit = spendingLimit;
        
        emit VirtualCardUpdated(msg.sender, userVirtualCards[msg.sender][cardIndex].cardId);
    }

    /**
     * @dev Deactivate a virtual card
     * @param cardIndex Index of the card in user's card array
     */
    function deactivateVirtualCard(uint256 cardIndex) external nonReentrant {
        require(cardIndex < userVirtualCards[msg.sender].length, "Card does not exist");
        require(userVirtualCards[msg.sender][cardIndex].isActive, "Card is already inactive");
        
        userVirtualCards[msg.sender][cardIndex].isActive = false;
        
        emit VirtualCardDeactivated(msg.sender, userVirtualCards[msg.sender][cardIndex].cardId);
    }

    /**
     * @dev Get all virtual cards for a user
     * @param userAddress The address of the user
     * @return Array of virtual cards
     */
    function getUserVirtualCards(address userAddress) external view returns (VirtualCard[] memory) {
        return userVirtualCards[userAddress];
    }

    /**
     * @dev Get the number of virtual cards for a user
     * @param userAddress The address of the user
     * @return Number of cards
     */
    function getUserCardCount(address userAddress) external view returns (uint256) {
        return userCardCount[userAddress];
    }

    /**
     * @dev Get a specific virtual card by user and index
     * @param userAddress The address of the user
     * @param cardIndex The index of the card
     * @return The virtual card data
     */
    function getVirtualCard(address userAddress, uint256 cardIndex) external view returns (VirtualCard memory) {
        require(cardIndex < userVirtualCards[userAddress].length, "Card does not exist");
        return userVirtualCards[userAddress][cardIndex];
    }

    /**
     * @dev Get total number of cards created
     * @return The total number of cards
     */
    function getTotalCards() external view returns (uint256) {
        return nextCardId - 1;
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
