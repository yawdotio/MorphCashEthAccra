//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * ENSProfileContract - ENS User Profile Management
 * Handles user profile creation and management associated with ENS names
 * @author MorphCash Team
 */
contract ENSProfileContract is Ownable, ReentrancyGuard {
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

    // State Variables
    address public immutable contractOwner;
    
    // Mappings
    mapping(bytes32 => UserProfile) public userProfiles;
    mapping(address => bytes32) public addressToENS;
    
    // Arrays
    bytes32[] public registeredENS;

    // Events
    event ProfileCreated(bytes32 indexed ensHash, address indexed user, string ensName);
    event ProfileUpdated(bytes32 indexed ensHash, address indexed user, string ensName);

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

    /**
     * @dev Get total number of registered profiles
     * @return The number of registered profiles
     */
    function getTotalProfiles() external view returns (uint256) {
        return registeredENS.length;
    }

    /**
     * @dev Get all registered ENS hashes
     * @return Array of registered ENS hashes
     */
    function getAllRegisteredENS() external view returns (bytes32[] memory) {
        return registeredENS;
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
