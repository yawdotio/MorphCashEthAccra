//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * VirtualCardContractV2 - Enhanced Virtual Card Management with Balance Tracking
 * Handles virtual card creation with payment verification and balance management
 * @author MorphCash Team
 */
contract VirtualCardContractV2 is Ownable, ReentrancyGuard {
    // Virtual Card Struct
    struct VirtualCard {
        uint256 cardId;
        string cardName;
        string cardNumber; // Masked: ****1234
        string expiryDate;
        string cvc; // Encrypted CVC for database storage
        string cardType; // Visa, Mastercard, etc.
        uint256 spendingLimit;
        uint256 currentSpend;
        uint256 balance; // Available balance on the card
        bool isActive;
        uint256 createdAt;
        string paymentReference; // Reference to the payment that funded this card
        string currency; // GHS, USD, etc.
    }

    // Payment Record Struct
    struct PaymentRecord {
        string paymentReference;
        string paymentMethod; // mtn, crypto, etc.
        uint256 amount;
        string currency;
        address user;
        uint256 timestamp;
        bool verified;
        bool processed;
    }

    // State Variables
    address public immutable contractOwner;
    
    // Mappings
    mapping(address => VirtualCard[]) public userVirtualCards;
    mapping(address => uint256) public userCardCount;
    mapping(string => PaymentRecord) public paymentRecords;
    mapping(address => uint256) public userTotalBalance; // Total balance across all cards
    
    // Arrays
    uint256 public nextCardId = 1;
    
    // Constants
    uint256 public constant PLATFORM_FEE_PERCENT = 2; // 0.02% platform fee

    // Events
    event VirtualCardCreated(
        address indexed user, 
        uint256 indexed cardId, 
        string cardName, 
        uint256 balance,
        string paymentReference
    );
    event VirtualCardUpdated(address indexed user, uint256 indexed cardId);
    event VirtualCardDeactivated(address indexed user, uint256 indexed cardId);
    event CardFunded(
        address indexed user, 
        uint256 indexed cardId, 
        uint256 amount, 
        string paymentReference,
        string paymentMethod
    );
    event PaymentVerified(
        string indexed paymentReference,
        address indexed user,
        uint256 amount,
        string paymentMethod
    );
    event BalanceTransferred(
        address indexed from,
        address indexed to,
        uint256 amount
    );

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
     * @dev Record a payment for verification
     * @param paymentReference Unique payment reference
     * @param paymentMethod Payment method used (mtn, crypto, etc.)
     * @param amount Payment amount
     * @param currency Payment currency
     * @param user Address of the user making payment
     */
    function recordPayment(
        string memory paymentReference,
        string memory paymentMethod,
        uint256 amount,
        string memory currency,
        address user
    ) external isOwner {
        require(bytes(paymentReference).length > 0, "Payment reference required");
        require(amount > 0, "Amount must be greater than 0");
        require(user != address(0), "Invalid user address");
        
        paymentRecords[paymentReference] = PaymentRecord({
            paymentReference: paymentReference,
            paymentMethod: paymentMethod,
            amount: amount,
            currency: currency,
            user: user,
            timestamp: block.timestamp,
            verified: false,
            processed: false
        });
    }

    /**
     * @dev Verify a payment and trigger card creation
     * @param paymentReference Payment reference to verify
     * @param cardName Name for the virtual card
     * @param cardNumber Generated card number
     * @param cvc Generated CVC
     * @param cardType Type of card
     * @param spendingLimit Spending limit for the card
     */
    function verifyPaymentAndCreateCard(
        string memory paymentReference,
        string memory cardName,
        string memory cardNumber,
        string memory cvc,
        string memory cardType,
        uint256 spendingLimit
    ) external isOwner nonReentrant {
        PaymentRecord storage payment = paymentRecords[paymentReference];
        require(bytes(payment.paymentReference).length > 0, "Payment not found");
        require(!payment.verified, "Payment already verified");
        require(!payment.processed, "Payment already processed");
        
        // Mark payment as verified
        payment.verified = true;
        payment.processed = true;
        
        // Calculate platform fee
        uint256 platformFee = (payment.amount * PLATFORM_FEE_PERCENT) / 10000;
        uint256 cardBalance = payment.amount - platformFee;
        
        // Create the virtual card
        uint256 cardId = nextCardId++;
        
        // Generate expiry date (3 years from now)
        uint256 currentTime = block.timestamp;
        uint256 expiryTimestamp = currentTime + (3 * 365 * 24 * 60 * 60);
        
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
            cvc: cvc,
            cardType: cardType,
            spendingLimit: spendingLimit,
            currentSpend: 0,
            balance: cardBalance,
            isActive: true,
            createdAt: block.timestamp,
            paymentReference: paymentReference,
            currency: payment.currency
        });
        
        userVirtualCards[payment.user].push(newCard);
        userCardCount[payment.user]++;
        userTotalBalance[payment.user] += cardBalance;
        
        emit PaymentVerified(paymentReference, payment.user, payment.amount, payment.paymentMethod);
        emit VirtualCardCreated(payment.user, cardId, cardName, cardBalance, paymentReference);
    }

    /**
     * @dev Add funds to an existing virtual card
     * @param cardIndex Index of the card to fund
     * @param paymentReference Reference of the payment
     */
    function fundCard(
        address user,
        uint256 cardIndex,
        string memory paymentReference
    ) external isOwner nonReentrant {
        require(cardIndex < userVirtualCards[user].length, "Card does not exist");
        require(userVirtualCards[user][cardIndex].isActive, "Card is not active");
        
        PaymentRecord storage payment = paymentRecords[paymentReference];
        require(bytes(payment.paymentReference).length > 0, "Payment not found");
        require(!payment.verified, "Payment already verified");
        require(payment.user == user, "Payment user mismatch");
        
        // Mark payment as verified
        payment.verified = true;
        payment.processed = true;
        
        // Calculate platform fee
        uint256 platformFee = (payment.amount * PLATFORM_FEE_PERCENT) / 10000;
        uint256 fundingAmount = payment.amount - platformFee;
        
        // Add funds to the card
        userVirtualCards[user][cardIndex].balance += fundingAmount;
        userTotalBalance[user] += fundingAmount;
        
        emit PaymentVerified(paymentReference, user, payment.amount, payment.paymentMethod);
        emit CardFunded(user, userVirtualCards[user][cardIndex].cardId, fundingAmount, paymentReference, payment.paymentMethod);
    }

    /**
     * @dev Update card spending (for transaction processing)
     * @param user Address of the card owner
     * @param cardIndex Index of the card
     * @param amount Amount spent
     */
    function recordSpending(
        address user,
        uint256 cardIndex,
        uint256 amount
    ) external isOwner {
        require(cardIndex < userVirtualCards[user].length, "Card does not exist");
        require(userVirtualCards[user][cardIndex].isActive, "Card is not active");
        require(userVirtualCards[user][cardIndex].balance >= amount, "Insufficient balance");
        require(userVirtualCards[user][cardIndex].currentSpend + amount <= userVirtualCards[user][cardIndex].spendingLimit, "Spending limit exceeded");
        
        userVirtualCards[user][cardIndex].balance -= amount;
        userVirtualCards[user][cardIndex].currentSpend += amount;
        userTotalBalance[user] -= amount;
    }

    /**
     * @dev Transfer balance between cards
     * @param fromCardIndex Source card index
     * @param toCardIndex Destination card index
     * @param amount Amount to transfer
     */
    function transferBetweenCards(
        uint256 fromCardIndex,
        uint256 toCardIndex,
        uint256 amount
    ) external nonReentrant {
        require(fromCardIndex < userVirtualCards[msg.sender].length, "Source card does not exist");
        require(toCardIndex < userVirtualCards[msg.sender].length, "Destination card does not exist");
        require(fromCardIndex != toCardIndex, "Cannot transfer to same card");
        require(userVirtualCards[msg.sender][fromCardIndex].isActive, "Source card is not active");
        require(userVirtualCards[msg.sender][toCardIndex].isActive, "Destination card is not active");
        require(userVirtualCards[msg.sender][fromCardIndex].balance >= amount, "Insufficient balance");
        
        userVirtualCards[msg.sender][fromCardIndex].balance -= amount;
        userVirtualCards[msg.sender][toCardIndex].balance += amount;
        
        emit BalanceTransferred(msg.sender, msg.sender, amount);
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
     * @dev Get user's total balance across all cards
     * @param userAddress The address of the user
     * @return Total balance
     */
    function getUserTotalBalance(address userAddress) external view returns (uint256) {
        return userTotalBalance[userAddress];
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
     * @dev Get payment record
     * @param paymentReference The payment reference
     * @return The payment record
     */
    function getPaymentRecord(string memory paymentReference) external view returns (PaymentRecord memory) {
        return paymentRecords[paymentReference];
    }

    /**
     * @dev Get total number of cards created
     * @return The total number of cards
     */
    function getTotalCards() external view returns (uint256) {
        return nextCardId - 1;
    }

    /**
     * @dev Emergency function to withdraw contract balance (owner only)
     */
    function emergencyWithdraw() external isOwner {
        payable(contractOwner).transfer(address(this).balance);
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
