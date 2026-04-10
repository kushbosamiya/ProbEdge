// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/YellowChannel.sol";

contract YellowChannelTest is Test {
    YellowChannel channel;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        channel = new YellowChannel();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testOpenChannel() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(alice);
        uint256 channelId = channel.openChannel(participants);

        assertTrue(channelId >= 0, "channelId should be valid");
    }

    function testUpdateState_IncrementsVersion() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(alice);
        uint256 channelId = channel.openChannel(participants);

        uint256[] memory allocs = new uint256[](2);
        allocs[0] = 1000;
        allocs[1] = 1000;
        bytes memory newState = abi.encode(uint256(1), allocs, "");

        bytes[] memory signatures = new bytes[](1);

        vm.prank(alice);
        channel.updateState(channelId, newState, signatures);

        (uint256 version, , ) = channel.getChannelState(channelId);
        assertEq(version, 1, "version should increment");
    }

    function testUpdateState_ZeroSumAllocations() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(alice);
        uint256 channelId = channel.openChannel(participants);

        uint256[] memory allocs = new uint256[](2);
        allocs[0] = 1200;
        allocs[1] = 800;
        bytes memory newState = abi.encode(uint256(1), allocs, "");

        bytes[] memory signatures = new bytes[](1);

        vm.prank(alice);
        channel.updateState(channelId, newState, signatures);

        (uint256 version, uint256 aliceBal, uint256 bobBal) = channel.getChannelState(channelId);
        assertEq(version, 1, "version should be 1");
        assertEq(aliceBal, 1200, "alice balance should be 1200");
        assertEq(bobBal, 800, "bob balance should be 800");
    }

    function testCloseChannel_ReleaseFunds() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(alice);
        uint256 channelId = channel.openChannel(participants);

        uint256[] memory allocs = new uint256[](2);
        allocs[0] = 1200;
        allocs[1] = 800;
        bytes memory finalState = abi.encode(uint256(1), allocs, "");

        bytes[] memory signatures = new bytes[](1);

        vm.prank(alice);
        channel.closeChannel(channelId, finalState, signatures);

        (uint256 version, , ) = channel.getChannelState(channelId);
        assertEq(version, 0, "version should be 0 after close");
    }

    function testDispute_RevertsOnStaleState() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(alice);
        uint256 channelId = channel.openChannel(participants);

        uint256[] memory allocs1 = new uint256[](2);
        allocs1[0] = 1100;
        allocs1[1] = 900;
        bytes memory stateV1 = abi.encode(uint256(1), allocs1, "");
        bytes[] memory sigs = new bytes[](1);
        
        vm.prank(alice);
        channel.updateState(channelId, stateV1, sigs);

        uint256[] memory allocs0 = new uint256[](2);
        allocs0[0] = 1000;
        allocs0[1] = 1000;
        bytes memory staleState = abi.encode(uint256(0), allocs0, "");

        vm.prank(bob);
        vm.expectRevert();
        channel.disputeChannel(channelId, staleState);
    }

    function testDispute_RevertsOnInvalidSignature() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(alice);
        uint256 channelId = channel.openChannel(participants);

        uint256[] memory allocs = new uint256[](2);
        allocs[0] = 1000;
        allocs[1] = 1000;
        
        bytes32 hash = channel.encodeStateHash(channelId, 1, allocs, "");
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, ethHash);
        bytes memory invalidSig = abi.encodePacked(r, s, v);
        
        bytes memory newState = abi.encode(uint256(1), allocs, "");
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = invalidSig;
        
        vm.prank(alice);
        vm.expectRevert();
        channel.updateState(channelId, newState, signatures);
    }

    function testOnlyParticipantCanUpdate() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(alice);
        uint256 channelId = channel.openChannel(participants);

        address charlie = makeAddr("charlie");
        uint256[] memory allocs = new uint256[](2);
        allocs[0] = 1000;
        allocs[1] = 1000;
        bytes memory newState = abi.encode(uint256(1), allocs, "");

        bytes[] memory signatures = new bytes[](1);
        
        vm.prank(charlie);
        vm.expectRevert();
        channel.updateState(channelId, newState, signatures);
    }
}
