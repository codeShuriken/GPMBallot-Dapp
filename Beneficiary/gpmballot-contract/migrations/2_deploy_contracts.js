var GPMBallot = artifacts.require("GPMBallot.sol");

//NumberOfVoters given is 1, but it can be changed to other value and it will still work.
//the second parameter is the password
//The third parameter is the number of proposals
module.exports = function(deployer){
deployer.deploy(GPMBallot, 1, 426526, 4)
};
