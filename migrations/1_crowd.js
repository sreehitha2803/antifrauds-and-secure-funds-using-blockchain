const CampaignPlatform = artifacts.require("Crowdfunding");

module.exports = function (deployer) {
    deployer.deploy(CampaignPlatform);
};