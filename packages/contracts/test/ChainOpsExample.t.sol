// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ChainOpsExample} from "../src/ChainOpsExample.sol";

contract ChainOpsExampleTest {
    function testInitialValueIsZero() public {
        ChainOpsExample example = new ChainOpsExample();

        require(example.value() == 0, "initial value should be zero");
    }

    function testSetValue() public {
        ChainOpsExample example = new ChainOpsExample();

        example.setValue(42);

        require(example.value() == 42, "value should be 42");
    }

    function testMultipleStateUpdates() public {
        ChainOpsExample example = new ChainOpsExample();

        example.setValue(10);
        example.setValue(99);

        require(example.value() == 99, "latest value should be 99");
    }
}