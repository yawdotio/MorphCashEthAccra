//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * MorphCash - ENS User Profile and Virtual Cards Contract
 * A smart contract that manages user profiles associated with ENS names and virtual cards
 * @author MorphCash Team
 */
contract YourContract is Ownable, ReentrancyGuard {
    // State Variables
    address public immutable contractOwner;
    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint) public userGreetingCounter;

    // ENS User Profile Struct
    struct UserProfile {
        string displayName;
        string bio;
        string avatar;
        string website;
        string twitter;
        string github;
        string discord;
        string telegram;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }

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

    // Mappings
    mapping(bytes32 => UserProfile) public userProfiles;
    mapping(address => bytes32) public addressToENS;
    mapping(address => VirtualCard[]) public userVirtualCards;
    mapping(address => uint256) public userCardCount;
    
    // Arrays
    bytes32[] public registeredENS;
    uint256 public nextCardId = 1;

    // Events
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);
    event ProfileCreated(bytes32 indexed ensHash, address indexed user, string ensName);
    event ProfileUpdated(bytes32 indexed ensHash, address indexed user, string ensName);
    event VirtualCardCreated(address indexed user, uint256 indexed cardId, string cardName);
    event VirtualCardUpdated(address indexed user, uint256 indexed cardId);
    event VirtualCardDeactivated(address indexed user, uint256 indexed cardId);

    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner) {
        contractOwner = _owner;
        _transferOwnership(_owner);
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == contractOwner, "Not the Owner");
        _;
    }

    /**
     * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
     *
     * @param _newGreeting (string memory) - new greeting to save on the contract
     */
    function setGreeting(string memory _newGreeting) public payable {
        // Print data to the hardhat chain console. Remove when deploying to a live network.
        console.log("Setting new greeting '%s' from %s", _newGreeting, msg.sender);

        // Change state variables
        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        // msg.value: built-in global variable that represents the amount of ether sent with the transaction
        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        // emit: keyword used to trigger an event
        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
    }

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() public isOwner {
        (bool success, ) = contractOwner.call{ value: address(this).balance }("");
        require(success, "Failed to send Ether");
    }

    // ENS Profile Functions
    
    /**
     * @dev Create a new user profile associated with an ENS name
     * @param ensHash The keccak256 hash of the ENS name
     * @param ensName The actual ENS name string for events
     * @param profile The initial profile data
     */
    function createProfile(
        bytes32 ensHash,
        string memory ensName,
        UserProfile memory profile
    ) external nonReentrant {
        require(userProfiles[ensHash].createdAt == 0, "Profile already exists");
        require(addressToENS[msg.sender] == bytes32(0), "Address already has a profile");
        
        profile.createdAt = block.timestamp;
        profile.updatedAt = block.timestamp;
        profile.isActive = true;
        
        userProfiles[ensHash] = profile;
        addressToENS[msg.sender] = ensHash;
        registeredENS.push(ensHash);
        
        emit ProfileCreated(ensHash, msg.sender, ensName);
    }

    /**
     * @dev Update an existing user profile
     * @param ensHash The keccak256 hash of the ENS name
     * @param ensName The actual ENS name string for events
     * @param profile The updated profile data
     */
    function updateProfile(
        bytes32 ensHash,
        string memory ensName,
        UserProfile memory profile
    ) external nonReentrant {
        require(userProfiles[ensHash].createdAt > 0, "Profile does not exist");
        require(addressToENS[msg.sender] == ensHash, "Not the profile owner");
        
        profile.createdAt = userProfiles[ensHash].createdAt;
        profile.updatedAt = block.timestamp;
        profile.isActive = true;
        
        userProfiles[ensHash] = profile;
        
        emit ProfileUpdated(ensHash, msg.sender, ensName);
    }

    /**
     * @dev Get user profile by ENS name hash
     * @param ensHash The keccak256 hash of the ENS name
     * @return The user profile data
     */
    function getProfile(bytes32 ensHash) external view returns (UserProfile memory) {
        require(userProfiles[ensHash].createdAt > 0, "Profile does not exist");
        return userProfiles[ensHash];
    }

    /**
     * @dev Get user profile by address
     * @param userAddress The address of the user
     * @return The user profile data
     */
    function getProfileByAddress(address userAddress) external view returns (UserProfile memory) {
        bytes32 ensHash = addressToENS[userAddress];
        require(ensHash != bytes32(0), "No profile found for this address");
        return userProfiles[ensHash];
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

    // Virtual Card Functions

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
     * @dev Get total number of registered profiles
     * @return The number of registered profiles
     */
    function getTotalProfiles() external view returns (uint256) {
        return registeredENS.length;
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
