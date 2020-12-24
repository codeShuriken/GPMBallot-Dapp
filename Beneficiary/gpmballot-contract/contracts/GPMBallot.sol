pragma solidity ^0.5.2;
contract GPMBallot{
    struct Voter{
        bool voted;
        bool authorized;
        bool policyVoted;
        bool inStateLocalPolicyVoted;
        bool policyAreaOfFocusVoted;
        uint vote;
        uint weight;
        uint count;
        uint num_of_Votes;
    }
    struct Policy_Proposal{
        uint voteCount;
    }
    struct InState_Policy_Proposal{
        uint voteCount;
    }
   
    struct Policy_AreaOfFocus_Proposal{
        uint voteCount;
    }
    
    //Events for this dapp
    event AddProposalPhaseStarted();   //emits when the app is deployed
    event RegistrationPhaseStarted();  //emits when the proposals are deployed
    event VotingPhaseStarted();        //emits when the voters are registered
    event ResultsPhaseStarted();       //emits when the voting is finished
    
    //Security password for this dapp
    bytes32 password;
    
    Policy_Proposal[] policy_proposals;
    InState_Policy_Proposal[] instate_policy_proposals;
    Policy_AreaOfFocus_Proposal[] policy_areaOfFocus_proposals;

    uint num_of_voters;
    uint num_of_Votes;
	
    uint votercount = 0;
    uint flag;
	
    uint total_votes = 0;
    uint total_count = 0;
    
    uint public proposals;
	
	address public government;
    mapping(address => Voter) voters;

    enum State{Add,Register,Voting,Results}
    State public state;

    enum Decision{Policy,InStateLocalPolicy,PolicyAreaOfFocus}
    Decision public CurDecision;
    
    //modifier to make sure to limit functionality to the government
    modifier governmentOnly(){
        require(msg.sender == government);
        _;
    }
    
    //modifier to vverify the current state is the required state
    modifier inState(State _state){
        require(state == _state);
        _;
    }

    constructor(uint number_of_voters, uint _password, uint _proposals) public{
        government = msg.sender;
        num_of_voters = number_of_voters;
        password = keccak256(abi.encodePacked(_password));
        state = State.Register;
        proposals = _proposals;
        policy_proposals.length = proposals;
        instate_policy_proposals.length = proposals;
        policy_areaOfFocus_proposals.length = proposals;
    }
    
    //The function is used to switch between different decisions based on eligibility.
    function Switch(uint _dec) inState(State.Voting) public{
        require(msg.sender != government);
        require(!voters[msg.sender].voted);
        if(_dec == 0){
            require(voters[msg.sender].num_of_Votes >= 1);
            CurDecision = Decision.Policy;
        }else if(_dec == 1){
            require(voters[msg.sender].num_of_Votes >= 2);
            CurDecision = Decision.InStateLocalPolicy;
        }else{
            require(voters[msg.sender].num_of_Votes == 3);
            CurDecision = Decision.PolicyAreaOfFocus;
        }
    }
    
    //This function is used to add person.
    function AddPerson(address _person,uint number_of_Votes) inState(State.Register) public {
        require(votercount < num_of_voters);
        require(!voters[_person].voted);
        require(!voters[_person].authorized);
        require(number_of_Votes > 0 && number_of_Votes <= 3);
		
        voters[_person].weight = 1;
        voters[_person].authorized = true;
        votercount += 1;
        total_votes += number_of_Votes;
        voters[_person].num_of_Votes = number_of_Votes;
        if(votercount == num_of_voters){
            state = State.Voting;
            emit VotingPhaseStarted();
        }
    }
    
    //This function is used to cast vote to a decision.
    function CastVote(uint _proposal) inState(State.Voting) public{
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0);
        require(!sender.voted);
		
        sender.count += sender.weight;
        if(sender.count == sender.num_of_Votes){
        sender.voted = true;
        }
        sender.vote = _proposal;
        if(CurDecision == Decision.Policy){
            require(!sender.policyVoted);
            policy_proposals[_proposal].voteCount += sender.weight;
            sender.policyVoted = true;
        }
        else if(CurDecision == Decision.InStateLocalPolicy ){
            require(!sender.inStateLocalPolicyVoted);
            instate_policy_proposals[_proposal].voteCount +=sender.weight;
            sender.inStateLocalPolicyVoted = true;
        }
        else if(CurDecision == Decision.PolicyAreaOfFocus){
            require(!sender.policyAreaOfFocusVoted);
            policy_areaOfFocus_proposals[_proposal].voteCount += sender.weight;
            sender.policyAreaOfFocusVoted = true;
        }
        
        total_count += 1;
        if(total_count == total_votes){
            state = State.Results;
            emit ResultsPhaseStarted();
        }
    }
    
    //Declares the best policy with the most votes.
    function BestPolicy(uint _password) inState(State.Results) public view returns (uint BestPolicy_){
        require(password == keccak256(abi.encodePacked(_password)));
        uint winningVoteCount = 0;
        for (uint p = 0; p < policy_proposals.length; p++) {
            if (policy_proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = policy_proposals[p].voteCount;
                BestPolicy_ = p;
            }
        }
    }
    
    //Declares the best BestInStateLocalPolicy with the most votes.
    function BestInStateLocalPolicy(uint _password) inState(State.Results) public view returns (uint BestInStateLocalPolicy_){
        require(password == keccak256(abi.encodePacked(_password)));
        uint winningVoteCount = 0;
        for (uint p = 0; p < instate_policy_proposals.length; p++) {
            if (instate_policy_proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = instate_policy_proposals[p].voteCount;
                BestInStateLocalPolicy_ = p;
            }
        }
    }
  
    //Declares the best BestPolicyAreaOfFocus with the most votes.
    function BestPolicyAreaOfFocus(uint _password) inState(State.Results) public view returns (uint BestPolicyAreaOfFocus_){
        require(password == keccak256(abi.encodePacked(_password)));
        uint winningVoteCount = 0;
        for (uint p = 0; p < policy_areaOfFocus_proposals.length; p++) {
            if (policy_areaOfFocus_proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = policy_areaOfFocus_proposals[p].voteCount;
                BestPolicyAreaOfFocus_ = p;
            }
        }
    }
      
    //Function is used to check the current state
    function CurrentState() public view returns(uint _state){
        if(state == State.Add){
            _state = 0;
            
        }else if(state == State.Register){
            _state = 1;
            
        }else if(state == State.Voting){
            _state = 2;
            
        }else if(state == State.Results){
            _state = 3;
            
        }
    }
	
	//Returns the number of proposals
	function ReturnProposals() public view returns(uint _proposals){
        _proposals = proposals;
    }

    //Changes the state
    function ChangeState() governmentOnly() public returns(uint _state){
        if (state == State.Register){
            state = State.Voting;
            _state = 2;
        }else if (state == State.Voting){
            state = State.Results;
            _state = 3;
        }
    }
    
}
