// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    
    struct Campaign {
        uint id;
        string name;
        string description;
        uint deadline;
        uint fundsRaised;
        address payable creator;
        bool active;
    }

    mapping(uint => Campaign) public campaigns;
    uint public totalCampaigns;
    
    event CampaignCreated(uint id, string name, string description, uint deadline, address creator);
    event ContributionReceived(uint campaignId, address contributor, uint amount);

    function createCampaign(
        string memory name,
        string memory description,
        uint duration 
    ) public {
        uint deadline = block.timestamp + duration; 
        campaigns[totalCampaigns] = Campaign({
            id: totalCampaigns,
            name: name,
            description: description,
            deadline: deadline,
            fundsRaised: 0,
            creator: payable(msg.sender),
            active: true
        });

        emit CampaignCreated(totalCampaigns, name, description, deadline, msg.sender);
        totalCampaigns++;
    }

    function contribute(uint campaignId) public payable {
        Campaign storage campaign = campaigns[campaignId];

        require(campaign.active, "This campaign is no longer active.");
        require(block.timestamp < campaign.deadline, "Campaign has ended.");
        require(msg.value > 0, "Contribution must be greater than 0.");

        campaign.fundsRaised += msg.value;
        campaign.creator.transfer(msg.value); // Transfer the contribution to the campaign creator

        emit ContributionReceived(campaignId, msg.sender, msg.value);
    }

    function checkCampaignStatus(uint campaignId) public view returns (bool) {
        Campaign storage campaign = campaigns[campaignId];
        return block.timestamp > campaign.deadline || campaign.fundsRaised >= 100 ether; 
    }

    function getCampaignDetails(uint campaignId) public view returns (
        string memory name,
        string memory description,
        uint deadline,
        uint fundsRaised,
        address creator,
        bool active
    ) {
        Campaign storage campaign = campaigns[campaignId];
        return (
            campaign.name,
            campaign.description,
            campaign.deadline,
            campaign.fundsRaised,
            campaign.creator,
            campaign.active
        );
    }
    
    function endCampaign(uint campaignId) public {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.creator, "Only the campaign creator can end the campaign.");
        require(block.timestamp > campaign.deadline, "Campaign cannot be ended before the deadline.");

        campaign.active = false;
    }
}
