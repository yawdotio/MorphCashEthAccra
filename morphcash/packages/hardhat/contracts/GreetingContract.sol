//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * GreetingContract - Basic Greeting Functionality
 * Handles greeting messages and basic counter functionality
 * @author MorphCash Team
 */
contract GreetingContract is Ownable, ReentrancyGuard {
    // State Variables
    address public immutable contractOwner;
    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint) public userGreetingCounter;

    // Events
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);

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

    /**
     * @dev Get the current greeting
     * @return The current greeting string
     */
    function getGreeting() external view returns (string memory) {
        return greeting;
    }

    /**
     * @dev Get the total counter value
     * @return The total counter value
     */
    function getTotalCounter() external view returns (uint256) {
        return totalCounter;
    }

    /**
     * @dev Get the greeting counter for a specific user
     * @param user The user's address
     * @return The user's greeting counter
     */
    function getUserGreetingCounter(address user) external view returns (uint256) {
        return userGreetingCounter[user];
    }

    /**
     * @dev Check if premium mode is active
     * @return True if premium mode is active
     */
    function isPremium() external view returns (bool) {
        return premium;
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
