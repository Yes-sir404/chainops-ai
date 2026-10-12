// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Counter} from "../src/Counter.sol";

contract CounterTest {
    function testIntentionalFailure() public {
        Counter counter = new Counter();

        counter.setValue(42);

        require(counter.value() == 99, "intentional test failure");
    }
}
