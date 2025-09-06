//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * PaymentContract - Blockchain Payment Processing for Card Funding
 * Handles ETH payments from ENS/connected wallets via Coinbase integration
 * Emits events for frontend to handle Supabase card creation
 * @author MorphCash Team
 */
contract PaymentContract is Ownable, ReentrancyGuard {
    // Card Funding Struct
    struct CardFunding {
        uint256 fundingId;
        address user;
        uint256 amount; // Amount in wei (ETH)
        uint256 ghsAmount; // Amount in GHS (for reference)
        string cardType; // Visa, Mastercard, etc.
        string paymentReference;
        string transactionHash;
        bool isProcessed;
        uint256 createdAt;
    }

    // State Variables
    address public immutable contractOwner;
    uint256 public minimumFundingAmount = 0.001 ether; // Minimum 0.001 ETH
    uint256 public maximumFundingAmount = 10 ether; // Maximum 10 ETH
    
    // Mappings
    mapping(uint256 => CardFunding) public cardFundings;
    mapping(string => uint256) public paymentReferenceToFundingId;
    mapping(address => uint256[]) public userFundings;
    
    // Arrays
    uint256 public nextFundingId = 1;

    // Events
    event CardFundingInitiated(uint256 indexed fundingId, address indexed user, uint256 amount, string paymentReference);
    event CardFundingSuccess(uint256 indexed fundingId, address indexed user, uint256 amount, string cardType, string transactionHash);
    event CardFundingFailed(uint256 indexed fundingId, address indexed user, string reason);

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

    /**
     * @dev Fund a virtual card with ETH payment
     * This function is called when a user wants to fund their virtual card
     * The payment is processed immediately and events are emitted for frontend handling
     * @param ghsAmount Amount in GHS (for reference)
     * @param cardType Type of card (Visa, Mastercard, etc.)
     * @param paymentReference Payment reference for tracking
     */
    function fundCard(
        uint256 ghsAmount,
        string memory cardType,
        string memory paymentReference
    ) external payable nonReentrant {
        require(msg.value >= minimumFundingAmount, "Amount below minimum");
        require(msg.value <= maximumFundingAmount, "Amount above maximum");
        require(bytes(paymentReference).length > 0, "Reference cannot be empty");
        require(paymentReferenceToFundingId[paymentReference] == 0, "Reference already exists");
        require(bytes(cardType).length > 0, "Card type cannot be empty");
        
        uint256 fundingId = nextFundingId++;
        
        CardFunding memory newFunding = CardFunding({
            fundingId: fundingId,
            user: msg.sender,
            amount: msg.value,
            ghsAmount: ghsAmount,
            cardType: cardType,
            paymentReference: paymentReference,
            transactionHash: "",
            isProcessed: false,
            createdAt: block.timestamp
        });
        
        cardFundings[fundingId] = newFunding;
        paymentReferenceToFundingId[paymentReference] = fundingId;
        userFundings[msg.sender].push(fundingId);
        
        emit CardFundingInitiated(fundingId, msg.sender, msg.value, paymentReference);
        
        // Process the funding immediately and emit success event
        _processCardFunding(fundingId);
    }

    /**
     * @dev Internal function to process card funding
     * @param fundingId The funding ID to process
     */
    function _processCardFunding(uint256 fundingId) internal {
        CardFunding storage funding = cardFundings[fundingId];
        require(funding.fundingId != 0, "Funding does not exist");
        require(!funding.isProcessed, "Funding already processed");
        
        // Set transaction hash (in a real implementation, this would come from the actual transaction)
        funding.transactionHash = _generateTransactionHash(fundingId);
        funding.isProcessed = true;
        
        emit CardFundingSuccess(fundingId, funding.user, funding.amount, funding.cardType, funding.transactionHash);
    }

    /**
     * @dev Generate a transaction hash for the funding
     * In a real implementation, this would be the actual transaction hash
     * @param fundingId The funding ID
     * @return A generated transaction hash
     */
    function _generateTransactionHash(uint256 fundingId) internal view returns (string memory) {
        return string(abi.encodePacked(
            "0x",
            _toHexString(block.timestamp),
            _toHexString(fundingId),
            _toHexString(uint256(uint160(msg.sender)))
        ));
    }

    /**
     * @dev Convert uint256 to hex string
     * @param value The value to convert
     * @return The hex string representation
     */
    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp >>= 4;
        }
        bytes memory buffer = new bytes(digits);
        for (uint256 i = digits; i > 0; i--) {
            buffer[i - 1] = bytes16("0123456789abcdef")[value & 0xf];
            value >>= 4;
        }
        return string(buffer);
    }

    /**
     * @dev Set minimum and maximum funding amounts (owner only)
     * @param _minimumAmount Minimum funding amount in wei
     * @param _maximumAmount Maximum funding amount in wei
     */
    function setFundingLimits(uint256 _minimumAmount, uint256 _maximumAmount) external isOwner {
        require(_minimumAmount > 0, "Minimum amount must be greater than 0");
        require(_maximumAmount > _minimumAmount, "Maximum must be greater than minimum");
        
        minimumFundingAmount = _minimumAmount;
        maximumFundingAmount = _maximumAmount;
    }

    /**
     * @dev Withdraw contract balance (owner only)
     * @param amount Amount to withdraw in wei
     */
    function withdraw(uint256 amount) external isOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        payable(contractOwner).transfer(amount);
    }

    /**
     * @dev Emergency withdraw all funds (owner only)
     */
    function emergencyWithdraw() external isOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(contractOwner).transfer(balance);
    }

    /**
     * @dev Get card funding details by ID
     * @param fundingId The funding ID
     * @return The card funding data
     */
    function getCardFunding(uint256 fundingId) external view returns (CardFunding memory) {
        require(cardFundings[fundingId].fundingId != 0, "Funding does not exist");
        return cardFundings[fundingId];
    }

    /**
     * @dev Get card funding by reference
     * @param paymentReference The payment reference
     * @return The card funding data
     */
    function getCardFundingByReference(string memory paymentReference) external view returns (CardFunding memory) {
        uint256 fundingId = paymentReferenceToFundingId[paymentReference];
        require(fundingId != 0, "Funding not found");
        return cardFundings[fundingId];
    }

    /**
     * @dev Get all card fundings for a user
     * @param userAddress The user's address
     * @return Array of funding IDs
     */
    function getUserCardFundings(address userAddress) external view returns (uint256[] memory) {
        return userFundings[userAddress];
    }

    /**
     * @dev Check if a card funding is processed
     * @param fundingId The funding ID
     * @return True if processed, false otherwise
     */
    function isCardFundingProcessed(uint256 fundingId) external view returns (bool) {
        require(cardFundings[fundingId].fundingId != 0, "Funding does not exist");
        return cardFundings[fundingId].isProcessed;
    }

    /**
     * @dev Get total number of card fundings
     * @return The total number of fundings
     */
    function getTotalCardFundings() external view returns (uint256) {
        return nextFundingId - 1;
    }

    /**
     * @dev Get card fundings by processed status
     * @param isProcessed Whether to filter by processed status
     * @return Array of funding IDs matching the criteria
     */
    function getCardFundingsByStatus(bool isProcessed) external view returns (uint256[] memory) {
        uint256[] memory matchingFundings = new uint256[](nextFundingId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextFundingId; i++) {
            if (cardFundings[i].isProcessed == isProcessed) {
                matchingFundings[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = matchingFundings[i];
        }
        
        return result;
    }

    /**
     * @dev Get contract balance
     * @return The contract's ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get funding limits
     * @return minimumAmount The minimum funding amount
     * @return maximumAmount The maximum funding amount
     */
    function getFundingLimits() external view returns (uint256 minimumAmount, uint256 maximumAmount) {
        return (minimumFundingAmount, maximumFundingAmount);
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
