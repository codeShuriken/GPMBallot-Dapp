App = {
  web3Provider: null,
  contracts: {},
  PTproposals: new Array(),
  FMproposals: new Array(),
  OAproposals: new Array(),
  //url: '',
  chairPerson:null,
  address: '0xB3D26D20e2E93Fe1335eae3CDAA651AF4Aa7faF6',
  _dec : 0,
  _state : 1,
  proposals : 0,

  GPMPhases: {
    "AddProposalPhaseStarted": {'text': "Add Proposal Phase Started" },
    "RegistrationPhaseStarted": {'text': "Registration Phase Started" },
    "VotingPhaseStarted": {'text': "Voting Phase Started" },
    "ResultsPhaseStarted": {'text': "Results Phase Started" }  
  },
  States: {
      "0": "Add",
      "1": "Register",
      "2": "Voting",
      "3": "Results",
  },
  Decisions: {
    "0": "Policy",
    "1": "InStateLocalPolicy",
    "2": "PolicyAreaOfFocus",
  },
  currentAccount:null,
  init: function() {
    return App.initWeb3();
 },

//web3 initialization
 initWeb3: function() {
       // Is there is an injected web3 instance?
   if (typeof web3 !== 'undefined') {
     App.web3Provider = web3.currentProvider;
   } else {
     // If no injected web3 instance is detected, fallback to the TestRPC
     App.web3Provider = new Web3.providers.HttpProvider(App.url);
   }
   web3 = new Web3(App.web3Provider);

   console.log(web3);
   ethereum.enable();

   //App.populateAddress();
   return App.initContract();

 },

//Contract Initialization
 initContract: function() {
   // Get the necessary contract artifact file and instantiate it with truffle-contract
   App.contracts.vote =  web3.eth.contract(App.abi).at(App.address);
   console.log();

   App.currentAccount = web3.eth.coinbase; // get current account
   $("#accountAddress").text(web3.eth.coinbase);
  
   // Set the provider for our contract
   //App.contracts.vote.setProvider(App.web3Provider);
   App.getChairperson();
   App.getProposals();
   return App.bindEvents();
 },

//Bind Functions
 bindEvents: function() {
   $(document).on('click', '#register', function(){
      var ad = $('#enter_address').val(); 
      var val = $('#number_of_Votes').val();
      App.handleRegister(ad,val); 
    });
   $(document).on('click', '#switch-button', function(){App.switchto()});
   $(document).on('click', '#PTVote',function(){
     var v1 = parseInt($('#PTselect').val()) - 1;
     App.Vote(v1.toString())
    });
   $(document).on('click', '#FGVote', function(){
     var v3 = parseInt($('#FMselect').val()) - 1;
     App.Vote(v3.toString())
    });
   $(document).on('click', '#OAVote', function(){
     var v4 = parseInt($('#OAselect').val()) - 1;
     App.Vote(v4.toString())
    });
   $(document).on('click', '#PTwin-count', App.PTWinner);
   $(document).on('click', '#FGwin-count', App.FGWinner);
   $(document).on('click', '#OAwin-count', App.OAWinner);
   $(document).on('click', '#decision', App.Voting_Decision);
   $(document).on('click', '#State', App.Act_State);
 },

//Owner address not displaying in the drop down list in web page
 getChairperson : function(){
   App.contracts.vote.government((e, result) => {
    if(!e){
      App.chairPerson = result
      console.log("Hello" + App.chairPerson)
    }
  })
 },

 getProposals : function(){
   App.contracts.vote.ReturnProposals((e,r)=>{
      if(!e){
        App.proposals = r
        console.log("Proposals are" + App.proposals)
        toastr["info"]("You are in "+App.States[App._state]+" State!");
        App.PTprop();
        App.FMprop();
        App.OAprop();
      }
   })
 },

 //AddPerson(addr,val)

//Calling the Register function of Smart Contract
 handleRegister: function(addr,val){
  console.log("I came inside Register");
   App.contracts.vote.AddPerson(addr,val,(err, r) => {
     if(!err){
       function pendingConfirmation(){
         web3.eth.getTransactionReceipt(r, (e, rec) =>{
           if(rec){
             clearInterval(myInterval)
             if(parseInt(rec.status) == 1){
              toastr["success"](addr + " registration done successfully")
              console.log(rec)
              //if (rec.logs.length > 0) {
               //       App._state = 2;
                //      App.showNotification(rec.logs[0].event);
                 //   }
             } else {
              toastr["error"](addr + " registration not done successfully due to revert")
             }
           }
           if(e){
            clearInterval(myInterval)
            toastr["error"](addr + "registration failed")
           }
   })
       }
       const myInterval = setInterval(pendingConfirmation, 3000);
     } else {
      toastr["error"]("All People have already been registered. Cannot Register more people!!")
     }
    })
 },

//Giving proposals and Loading the choices of policies
 PTprop: function(){
   var loader = $("#loader3");
   var content = $("#content3");

   loader.show();
   content.hide();

    var PTchoices = $('#PTchoices');
    PTchoices.empty();

    var PTselect = $('#PTselect');
    PTselect.empty();

    for( var i = 1; i <= App.proposals; i++){
      var id = i;
      var name = "Policy_"+i.toString();

      App.PTproposals.push(i);

      var choiceTemplate = "<tr><th>" + id  + "</th><td>" + name + "</td></tr>"
      PTchoices.append(choiceTemplate);

      var PToption = "<option value='" + id + "' >" + name + "</ option>"
      PTselect.append(PToption);
    }
    loader.hide();
    content.show();
 },

//Giving proposals and Loading the choices of InStateLocalPolicy
 FMprop: function(){
   var loader = $("#loader");
   var content = $("#content");

   loader.show();
   content.hide();

    var FMchoices = $('#FMchoices');
    FMchoices.empty();

    var FMselect = $('#FMselect');
    FMselect.empty();

    for( var i = 1; i <= App.proposals; i++){
      var id = i;
      var name = "InStateLocalPolicy_"+i.toString();

      App.FMproposals.push(i);

      var choiceTemplate = "<tr><th>" + id  + "</th><td>" + name + "</td></tr>"
      FMchoices.append(choiceTemplate);

      var FMoption = "<option value='" + id + "' >" + name + "</ option>"
      FMselect.append(FMoption);
    }

    loader.hide();
    content.show();          
 },



 //Giving proposals and Loading the choices of PolicyAreaOfFocus
 OAprop: function(){
   var loader = $("#loader4");
   var content = $("#content4");

   loader.show();
   content.hide();
   
    var OAchoices = $('#OAchoices');
    OAchoices.empty();

    var OAselect = $('#OAselect');
    OAselect.empty();
    console.log("OA" + App.proposals);
    for( var i = 1; i <= App.proposals; i++){
      var id = i;
      var name = "PolicyAreaOfFocus_"+i.toString();
      App.OAproposals.push(i);

      var choiceTemplate = "<tr><th>" + id  + "</th><td>" + name + "</td></tr>"
      OAchoices.append(choiceTemplate);

      var OAoption = "<option value='" + id + "' >" + name + "</ option>"
      OAselect.append(OAoption);
    }
    loader.hide();
    content.show();         
 },


//Switch function to change to other decision while voting
 switchto: function() {
   // var _dec;
    var s = $('#change').val();
    if(s == 'Policy'){App._dec = 0;}
    else if(s == 'InStateLocalPolicy'){App._dec = 1;}
    else if(s == 'PolicyAreaOfFocus'){App._dec = 2;}
    console.log("Switch: " + s);


    App.contracts.vote.Switch(App._dec,(err, r) => {
      if(!err){
        function pendingConfirmation(){
        web3.eth.getTransactionReceipt(r, (e, rec) =>{
          if(rec){
            clearInterval(myInterval)
            if(parseInt(rec.status) == 1){
             toastr["success"](" Voting State successfully switched to " + s)
             console.log("SwitchTo: " + rec);
             //if (rec.logs.length > 0) {
              //       App._state = 2;
               //      App.showNotification(rec.logs[0].event);
                //   }
            } else {
             toastr["error"]("Voting not changed due to revert")
            }
          }
          if(e){
           clearInterval(myInterval)
           toastr["error"]("Operation failed")
          }
      })
      }
      const myInterval = setInterval(pendingConfirmation, 3000);
    } else {
     toastr["error"]("Operation failed. You might be trying to change to PolicyAreaOfFocus. If so, it is only possible if you have 3 votes.")
    }
  })
  },

//Vote function CastVote
   Vote: function(choice) {
     console.log("Vote Choice: " + choice);
     web3.eth.getAccounts(function(error, accounts){
        var account = accounts[0];
        $("#accountAddress").html(account);

        App.contracts.vote.CastVote(choice, {from: account},(err, r) => {
          if(!err){
            function pendingConfirmation(){
            web3.eth.getTransactionReceipt(r, (e, rec) =>{
              if(rec){
                clearInterval(myInterval)
                if(parseInt(rec.status) == 1){
                toastr["success"](account + " voting done successfully for proposal")
                console.log("Here" + rec);
                //if (rec.logs.length > 0) {
                  //       App._state = 2;
                  //      App.showNotification(rec.logs[0].event);
                    //   }
                } else {
                toastr["error"](account + " voting not done successfully due to revert")
                }
              }
              if(e){
              clearInterval(myInterval)
              toastr["error"](account + " voting failed")
              }
      })
          }
          const myInterval = setInterval(pendingConfirmation, 3000);
        } else {
        toastr["error"]("Voting failed. You might be voting for a same proposal more than once !!")
        }
        })
     })
   },

//Policy best choice BestPolicy
   PTWinner : function() {
     var secret = $('#fname').val();
     //console.log(secret)
     App.contracts.vote.BestPolicy(secret,(err, r) => {
      if(!err){
        toastr["info"]("Best Policy Decision is Policy_"+App.PTproposals[r]);
      }else{
        toastr["error"]("Incorrect Passcode");
      }
     })
   },

//InStateLocalPolicy best choice BestInStateLocalPolicy
   FGWinner : function() {
     var secret = $('#fname').val();
     //console.log(secret)
     App.contracts.vote.BestInStateLocalPolicy(secret,(err, r) => {
      if(!err){
        toastr["info"]("Best InStateLocalPolicy is InStateLocalPolicy_"+App.FMproposals[r]);
      }else{
        toastr["error"]("Incorrect Passcode")
      }
     })
   },


//PolicyAreaOfFocus best choice BestPolicyAreaOfFocus
   OAWinner : function() {
    var secret = $('#fname').val();
    //console.log(secret)
    App.contracts.vote.BestPolicyAreaOfFocus(secret,(err, r) => {
    if(!err){
      toastr["info"]("Best In PolicyAreaOfFocus is PolicyAreaOfFocus_"+App.OAproposals[r]);
    }else{
     toastr["error"]("Incorrect Passcode")
    }
    })
   },

//Checking the voting decision state
   Voting_Decision: function() {
    if(App._state == 2){
      toastr["info"]("You are in "+App.Decisions[App._dec]+" Voting State ");
  }
  else {
    toastr["info"]("You are not in Voting Phase");
  }
   },

   //checking the actual state in the process CurrentState
   Act_State: function(){
    App.contracts.vote.CurrentState((err, r) => {
      if(!err){
        App._state = r;
        console.log(App._state);
        toastr["info"]("You are in "+App.States[App._state]+" State ");
      }else{
        toastr["error"]("Error while loading state!")
      }
   })
   },

//Initialising the app
showNotification: function (phase) {
  console.log(phase);
  var notificationText = App.GPMPhases[phase];
  var t = notificationText.text;
  $('#phase-notification-text').text(t);
  toastr.info(t, "", { "iconClass": 'toast-info notification' + String(notificationText.id) });
},
"abi": [
  {
    "constant": true,
    "inputs": [],
    "name": "government",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "proposals",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "CurDecision",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "state",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "number_of_voters",
        "type": "uint256"
      },
      {
        "name": "_password",
        "type": "uint256"
      },
      {
        "name": "_proposals",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "AddProposalPhaseStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "RegistrationPhaseStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "VotingPhaseStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "ResultsPhaseStarted",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_dec",
        "type": "uint256"
      }
    ],
    "name": "Switch",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_person",
        "type": "address"
      },
      {
        "name": "number_of_Votes",
        "type": "uint256"
      }
    ],
    "name": "AddPerson",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_proposal",
        "type": "uint256"
      }
    ],
    "name": "CastVote",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_password",
        "type": "uint256"
      }
    ],
    "name": "BestPolicy",
    "outputs": [
      {
        "name": "BestPolicy_",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_password",
        "type": "uint256"
      }
    ],
    "name": "BestInStateLocalPolicy",
    "outputs": [
      {
        "name": "BestInStateLocalPolicy_",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_password",
        "type": "uint256"
      }
    ],
    "name": "BestPolicyAreaOfFocus",
    "outputs": [
      {
        "name": "BestPolicyAreaOfFocus_",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "CurrentState",
    "outputs": [
      {
        "name": "_state",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "ReturnProposals",
    "outputs": [
      {
        "name": "_proposals",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "ChangeState",
    "outputs": [
      {
        "name": "_state",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
],
};


$(function () {
$(window).load(function () {
  App.init();
  //Notification UI config
  toastr.options = {
    "showDuration": "1000",
    "positionClass": "toast-top-left",
    "preventDuplicates": true,
    "closeButton": true
  };
});
});