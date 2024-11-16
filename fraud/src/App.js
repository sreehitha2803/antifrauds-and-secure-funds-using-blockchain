import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import CrowdfundingABI from './contracts/Crowdfunding.json'; 
import './index.css';

import campaign1 from './images/campaign1.jpg';
import campaign2 from './images/campaign2.jpg';
import campaign3 from './images/campaign3.jpg';

const App = () => {
  const [account, setAccount] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  let web3;

  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  } else {
    web3 = new Web3('http://127.0.0.1:7545'); 
  }

  const contract = new web3.eth.Contract(CrowdfundingABI.abi, CrowdfundingABI.networks['5777'].address);

  const campaignImages = {
    0: campaign1, 
    1: campaign2,
    2: campaign3  
  };

  const contributeToCampaign = async (campaignId, amount) => {
    try {
      await contract.methods.contribute(campaignId).send({
        from: account,
        value: web3.utils.toWei(amount.toString(), 'ether'),
      });
      await refreshCampaigns(); 
    } catch (error) {
      console.error('Error contributing to campaign:', error);
    }
  };

  const mockCampaigns = [
    {
      id: 0,
      name: 'Water for All',
      description: 'Clean water access for rural communities.',
      deadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5, 
    },
    {
      id: 1,
      name: 'Education Support',
      description: 'Help underprivileged children with education.',
      deadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, 
    },
    {
      id: 2,
      name: 'Tree Planting',
      description: 'Contribute to combat climate change.',
      deadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 10, 
    }
  ];

  const refreshCampaigns = async () => {
    const updatedCampaigns = mockCampaigns.map((campaign) => {
      const remainingTime = new Date(campaign.deadline * 1000).toLocaleString();
      return { ...campaign, remainingTime };
    });
    setCampaigns(updatedCampaigns);
  };

  const main = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        await refreshCampaigns();
      } else {
        console.error("MetaMask is not installed.");
      }
    } catch (error) {
      console.error('Error requesting accounts:', error);
    }
  };

  useEffect(() => {
    main();
  }, []);

  return (
    <div className="App">
      <div id="account" className="text-center mb-4">
        {account ? `Connected: ${account}` : "Please connect your wallet"}
      </div>
      <div id="campaigns" className="d-flex flex-wrap justify-content-center">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="card shadow-sm m-2" style={{ width: '18rem' }}>
              <img 
                src={campaignImages[campaign.id]} 
                alt="Campaign" 
                className="card-img-top" 
              />
              <div className="card-body">
                <h5 className="card-title">{campaign.name}</h5>
                <p className="card-text">{campaign.description}</p>
                <p className="card-text text-muted">Ends: {campaign.remainingTime}</p>

                <button
                  className="btn btn-primary w-100 mt-2"
                  onClick={() => {
                    const amount = prompt('Enter amount in ETH:');
                    if (amount) {
                      contributeToCampaign(campaign.id, amount);
                    }
                  }}
                >
                  Contribute
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No active campaigns available.</p>
        )}
      </div>
    </div>
  );
};

export default App;
