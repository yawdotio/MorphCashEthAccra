//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * PaymentContract - Payment Verification and Processing
 * Handles payment creation, verification, and processing
 * @author MorphCash Team
 */
contract PaymentContract is Ownable, ReentrancyGuard {
    // Payment Struct
    struct Payment {
        uint256 paymentId;
        address user;
        uint256 amount; // Amount in wei (ETH)
        uint256 ghsAmount; // Amount in GHS (for reference)
        string paymentMethod; // "mobile_money" or "crypto"
        string paymentReference;
        string transactionId;
        bool isVerified;
        bool isProcessed;
        uint256 createdAt;
        uint256 verifiedAt;
    }

    // State Variables
    address public immutable contractOwner;
    
    // Mappings
    mapping(uint256 => Payment) public payments;
    mapping(string => uint256) public paymentReferenceToPaymentId;
    mapping(address => uint256[]) public userPayments;
    
    // Arrays
    uint256 public nextPaymentId = 1;

    // Events
    event PaymentCreated(uint256 indexed paymentId, address indexed user, uint256 amount, string paymentReference);
    event PaymentVerified(uint256 indexed paymentId, address indexed user, string transactionId);
    event PaymentProcessed(uint256 indexed paymentId, address indexed user);

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
     * @dev Create a payment record for verification
     * @param amount Amount in wei (ETH)
     * @param ghsAmount Amount in GHS (for reference)
     * @param paymentMethod Payment method ("mobile_money" or "crypto")
     * @param paymentReference Payment reference
     * @return paymentId The created payment ID
     */
    function createPayment(
        uint256 amount,
        uint256 ghsAmount,
        string memory paymentMethod,
        string memory paymentReference
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(paymentReference).length > 0, "Reference cannot be empty");
        require(paymentReferenceToPaymentId[paymentReference] == 0, "Reference already exists");
        
        uint256 paymentId = nextPaymentId++;
        
        Payment memory newPayment = Payment({
            paymentId: paymentId,
            user: msg.sender,
            amount: amount,
            ghsAmount: ghsAmount,
            paymentMethod: paymentMethod,
            paymentReference: paymentReference,
            transactionId: "",
            isVerified: false,
            isProcessed: false,
            createdAt: block.timestamp,
            verifiedAt: 0
        });
        
        payments[paymentId] = newPayment;
        paymentReferenceToPaymentId[paymentReference] = paymentId;
        userPayments[msg.sender].push(paymentId);
        
        emit PaymentCreated(paymentId, msg.sender, amount, paymentReference);
        
        return paymentId;
    }

    /**
     * @dev Verify a payment (called by backend after payment confirmation)
     * @param paymentId The payment ID to verify
     * @param transactionId The transaction ID from payment provider
     */
    function verifyPayment(
        uint256 paymentId,
        string memory transactionId
    ) external isOwner {
        require(payments[paymentId].paymentId != 0, "Payment does not exist");
        require(!payments[paymentId].isVerified, "Payment already verified");
        require(bytes(transactionId).length > 0, "Transaction ID cannot be empty");
        
        payments[paymentId].isVerified = true;
        payments[paymentId].transactionId = transactionId;
        payments[paymentId].verifiedAt = block.timestamp;
        
        emit PaymentVerified(paymentId, payments[paymentId].user, transactionId);
    }

    /**
     * @dev Mark a payment as processed
     * @param paymentId The payment ID to process
     */
    function processPayment(uint256 paymentId) external isOwner {
        require(payments[paymentId].paymentId != 0, "Payment does not exist");
        require(payments[paymentId].isVerified, "Payment not verified");
        require(!payments[paymentId].isProcessed, "Payment already processed");
        
        payments[paymentId].isProcessed = true;
        
        emit PaymentProcessed(paymentId, payments[paymentId].user);
    }

    /**
     * @dev Get payment details by ID
     * @param paymentId The payment ID
     * @return The payment data
     */
    function getPayment(uint256 paymentId) external view returns (Payment memory) {
        require(payments[paymentId].paymentId != 0, "Payment does not exist");
        return payments[paymentId];
    }

    /**
     * @dev Get payment by reference
     * @param paymentReference The payment reference
     * @return The payment data
     */
    function getPaymentByReference(string memory paymentReference) external view returns (Payment memory) {
        uint256 paymentId = paymentReferenceToPaymentId[paymentReference];
        require(paymentId != 0, "Payment not found");
        return payments[paymentId];
    }

    /**
     * @dev Get all payments for a user
     * @param userAddress The user's address
     * @return Array of payment IDs
     */
    function getUserPayments(address userAddress) external view returns (uint256[] memory) {
        return userPayments[userAddress];
    }

    /**
     * @dev Check if a payment is verified
     * @param paymentId The payment ID
     * @return True if verified, false otherwise
     */
    function isPaymentVerified(uint256 paymentId) external view returns (bool) {
        require(payments[paymentId].paymentId != 0, "Payment does not exist");
        return payments[paymentId].isVerified;
    }

    /**
     * @dev Check if a payment is processed
     * @param paymentId The payment ID
     * @return True if processed, false otherwise
     */
    function isPaymentProcessed(uint256 paymentId) external view returns (bool) {
        require(payments[paymentId].paymentId != 0, "Payment does not exist");
        return payments[paymentId].isProcessed;
    }

    /**
     * @dev Get total number of payments
     * @return The total number of payments
     */
    function getTotalPayments() external view returns (uint256) {
        return nextPaymentId - 1;
    }

    /**
     * @dev Get payments by status
     * @param isVerified Whether to filter by verified status
     * @param isProcessed Whether to filter by processed status
     * @return Array of payment IDs matching the criteria
     */
    function getPaymentsByStatus(bool isVerified, bool isProcessed) external view returns (uint256[] memory) {
        uint256[] memory matchingPayments = new uint256[](nextPaymentId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextPaymentId; i++) {
            if (payments[i].isVerified == isVerified && payments[i].isProcessed == isProcessed) {
                matchingPayments[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = matchingPayments[i];
        }
        
        return result;
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
