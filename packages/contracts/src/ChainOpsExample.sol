// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ChainOpsExample
/// @notice Minimal contract used to validate the ChainOps compilation pipeline.
contract ChainOpsExample {
    uint256 public value;

    event ValueUpdated(uint256 previousValue, uint256 newValue);

    function setValue(uint256 newValue) external {
        uint256 previousValue = value;
        value = newValue;
        emit ValueUpdated(previousValue, newValue);
    }
}
