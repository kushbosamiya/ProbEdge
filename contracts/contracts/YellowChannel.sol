// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

error ChannelNotFound();
error OnlyParticipant();
error InvalidState();
error ChannelAlreadyClosed();
error InvalidSignatures();

contract YellowChannel is ReentrancyGuard {
    using ECDSA for bytes32;

    struct ChannelState {
        uint256 channelID;
        uint256 version;
        address[] participants;
        uint256[] allocations;
        bytes appData;
        bool isClosed;
    }

    event ChannelOpened(uint256 indexed channelID, address[] participants);
    event StateUpdated(uint256 indexed channelID, uint256 version);
    event ChannelClosed(uint256 indexed channelID, bytes finalState);
    event DisputeRaised(uint256 indexed channelID);

    mapping(uint256 => ChannelState) public channels;
    uint256 public nextChannelID;

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public immutable STATE_TYPEHASH;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId)"),
                keccak256("YellowChannel"),
                keccak256("1"),
                block.chainid
            )
        );

        STATE_TYPEHASH = keccak256(
            abi.encode(
                keccak256("State(uint256 channelID,uint256 version,uint256[] allocations,bytes appData)")
            )
        );
    }

    function openChannel(address[] memory participants) external returns (uint256 channelID) {
        require(participants.length == 2, "Must have exactly 2 participants");
        
        channelID = nextChannelID++;
        
        uint256[] memory allocations = new uint256[](2);
        allocations[0] = 1000;
        allocations[1] = 1000;

        channels[channelID] = ChannelState({
            channelID: channelID,
            version: 0,
            participants: participants,
            allocations: allocations,
            appData: "",
            isClosed: false
        });

        emit ChannelOpened(channelID, participants);
    }

    function updateState(
        uint256 channelID,
        bytes memory state,
        bytes[] memory signatures
    ) external {
        ChannelState storage ch = channels[channelID];
        require(ch.channelID == channelID, "ChannelNotFound");
        require(!ch.isClosed, "ChannelAlreadyClosed");
        require(isParticipant(ch, msg.sender), "OnlyParticipant");

        (uint256 newVersion, uint256[] memory newAllocations, bytes memory appData) = decodeState(state);
        require(newVersion == ch.version + 1, "InvalidState");

        if (signatures.length > 0 && signatures[0].length > 0) {
            bytes32 hash = encodeStateHash(channelID, newVersion, newAllocations, appData);
            bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
            address signer = ethHash.recover(signatures[0]);
            require(isParticipant(ch, signer), "InvalidSignatures");
        }

        ch.version = newVersion;
        ch.allocations = newAllocations;
        ch.appData = appData;

        emit StateUpdated(channelID, newVersion);
    }

    function closeChannel(
        uint256 channelID,
        bytes memory finalState,
        bytes[] memory signatures
    ) external nonReentrant {
        ChannelState storage ch = channels[channelID];
        require(ch.channelID == channelID, "ChannelNotFound");
        require(!ch.isClosed, "ChannelAlreadyClosed");
        require(isParticipant(ch, msg.sender), "OnlyParticipant");

        (uint256 finalVersion, uint256[] memory finalAllocations, ) = decodeState(finalState);
        
        if (signatures.length > 0 && signatures[0].length > 0) {
            bytes32 hash = encodeStateHash(channelID, finalVersion, finalAllocations, "");
            bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
            address signer = ethHash.recover(signatures[0]);
            require(isParticipant(ch, signer), "InvalidSignatures");
        }

        ch.isClosed = true;
        ch.version = 0;

        emit ChannelClosed(channelID, finalState);
    }

    function disputeChannel(uint256 channelID, bytes memory state) external {
        ChannelState storage ch = channels[channelID];
        require(ch.channelID == channelID, "ChannelNotFound");

        (uint256 disputeVersion, , ) = decodeState(state);
        require(disputeVersion >= ch.version, "InvalidState: stale state");

        emit DisputeRaised(channelID);
    }

    function getChannelState(uint256 channelID) external view returns (
        uint256 version,
        uint256 aliceBalance,
        uint256 bobBalance
    ) {
        ChannelState storage ch = channels[channelID];
        require(ch.channelID == channelID, "ChannelNotFound");
        
        version = ch.version;
        if (ch.allocations.length >= 2) {
            aliceBalance = ch.allocations[0];
            bobBalance = ch.allocations[1];
        }
    }

    function isParticipant(ChannelState storage ch, address addr) internal view returns (bool) {
        for (uint256 i = 0; i < ch.participants.length; i++) {
            if (ch.participants[i] == addr) return true;
        }
        return false;
    }

    function decodeState(bytes memory state) internal pure returns (
        uint256 version,
        uint256[] memory allocations,
        bytes memory appData
    ) {
        (version, allocations, appData) = abi.decode(state, (uint256, uint256[], bytes));
    }

    function encodeStateHash(
        uint256 channelID,
        uint256 version,
        uint256[] memory allocations,
        bytes memory appData
    ) public view returns (bytes32) {
        return keccak256(abi.encode(
            STATE_TYPEHASH,
            channelID,
            version,
            keccak256(abi.encodePacked(allocations)),
            keccak256(appData)
        ));
    }
}
