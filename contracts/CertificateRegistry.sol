// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Educational demo. On-chain strings are public forever; avoid sensitive data.
contract CertificateRegistry {
    struct Certificate {
        string studentName;
        string course;
        string rollNo;
        string issueDate;
        address issuer;
        bool exists;
    }

    mapping(string => Certificate) private certificates;
    address public owner;
    uint256 public totalCertificates;

    event CertificateIssued(
        string indexedCertificateId,
        address indexed issuer,
        string studentName
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        string calldata certId,
        string calldata studentName,
        string calldata course,
        string calldata rollNo,
        string calldata issueDate
    ) external onlyOwner {
        require(bytes(certId).length > 0, "Certificate ID required");
        require(bytes(studentName).length > 0, "Student name required");
        require(!certificates[certId].exists, "Certificate ID already used");

        certificates[certId] = Certificate({
            studentName: studentName,
            course: course,
            rollNo: rollNo,
            issueDate: issueDate,
            issuer: msg.sender,
            exists: true
        });
        totalCertificates += 1;
        emit CertificateIssued(certId, msg.sender, studentName);
    }

    function getCertificate(string calldata certId)
        external
        view
        returns (
            string memory studentName,
            string memory course,
            string memory rollNo,
            string memory issueDate,
            address issuer,
            bool exists
        )
    {
        Certificate storage c = certificates[certId];
        return (c.studentName, c.course, c.rollNo, c.issueDate, c.issuer, c.exists);
    }
}
