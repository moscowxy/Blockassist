// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VRFConsumerBaseV2Plus
 * @dev Minimal subset of Chainlink's VRF consumer for integration tests.
 */
abstract contract VRFConsumerBaseV2Plus {
    address private immutable _vrfCoordinator;

    constructor(address coordinator) {
        require(coordinator != address(0), "VRF: coordinator zero");
        _vrfCoordinator = coordinator;
    }

    function vrfCoordinator() public view returns (address) {
        return _vrfCoordinator;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;

    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        require(msg.sender == _vrfCoordinator, "VRF: only coordinator");
        fulfillRandomWords(requestId, randomWords);
    }
}
