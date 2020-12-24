App = {
  web3Provider: null,
  contracts: {},
  PTproposals: new Array(),
  FMproposals: new Array(),
  OAproposals: new Array(),
  url: '',
  chairPerson:null,
  _dec : 0,
  _state : 1,
  proposals : 0,

  GPMPhases: {
    "AddProposalPhaseStarted": {'text': "Add Proposal Phase Started" },
    "RegistrationPhaseStarted": {'text': "Registration Phase Started" },
    "VotingPhaseStarted": {'text': "Voting Phase Started" },
    "ResultsPhaseStarted": {'text': "Results Phase Started" }  
  },
  temp : [
    "AddProposalPhaseStarted",
    "RegistrationPhaseStarted",
    "VotingPhaseStarted",
    "ResultsPhaseStarted"
  ],
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
     $.getJSON('GPMBallot.json', function(data) {
   // Get the necessary contract artifact file and instantiate it with truffle-contract
   var voteArtifact = data;
   App.contracts.vote = TruffleContract(voteArtifact);
   console.log();

   App.currentAccount = web3.eth.coinbase; // get current account
   $("#accountAddress").text(web3.eth.coinbase);
  
   // Set the provider for our contract
   App.contracts.vote.setProvider(App.web3Provider);
   App.getChairperson();
   App.getProposals();
   return App.bindEvents();
 });
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
   $(document).on('click', '#changeState', App.Change_State);
 },

//Owner address not displaying in the drop down list in web page
 getChairperson : function(){
   App.contracts.vote.deployed().then(function(instance) {
     return instance;
   }).then(function(result) {
     App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
     App.currentAccount = web3.eth.coinbase;
     if(App.chairPerson != App.currentAccount){
       jQuery('#address_div').css('display','none');
       jQuery('#register_div').css('display','none');
     }else{
       jQuery('#address_div').css('display','block');
       jQuery('#register_div').css('display','block');
     }
   })
 },

 getProposals : function(){
   App.contracts.vote.deployed().then(function(instance){
     return instance.ReturnProposals();
   }).then(function(res){
     App.proposals = res;
     console.log("Here" + App.proposals);
     //toastr["info"]("You are in "+App.States[App._state]+" State ");
     App.PTprop();
     App.FMprop();
     App.OAprop();
     App.showNotification(App.temp[App._state]);
   });
 },


//Calling the Register function of Smart Contract
 handleRegister: function(addr,val){
   var voteInstance;
   App.contracts.vote.deployed().then(function(instance) {
     voteInstance = instance;
     return voteInstance.AddPerson(addr,val);
   }).then(function(result, err){
        console.log(result);
       if(result){
           if(parseInt(result.receipt.status) == 1){
            toastr["success"](addr + " registration done successfully")
              if (result.logs.length > 0) {
                App._state = 2;
                App.showNotification(result.logs[0].event);
              }
           }
           else
           toastr["error"](addr + " registration not done successfully due to revert")
       } else {
          toastr["error"](addr + " registration failed")
       }
      }).catch(function (err) {
        toastr["error"]("All People have already been registered. Cannot Register more people !!");
   });
 },

//Giving proposals and Loading the choices of policies
 PTprop: function(){
   var propInstance;
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
   var propInstance;
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
   var propInstance;
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
    console.log(s);
    App.contracts.vote.deployed().then(function(instance) {
      return instance.Switch(App._dec);
    }).then(function(result,err) {
      if(result){
            if(parseInt(result.receipt.status) == 1)
              toastr["success"](" Voting State successfully switched to "+s)
            else
              toastr["error"]("Voting not changed due to revert")
        } else {
          toastr["error"]("Operation failed")
        }
    }).catch(function (err) {
      toastr["error"]("Operation failed. You might be trying to change to a decision which you can't change to now!");
    });
  },

//Vote function
   Vote: function(choice) {
     var voteInstance;
     console.log(choice);
     web3.eth.getAccounts(function(error, accounts){
       var account = accounts[0];
       $("#accountAddress").html(account);
       App.contracts.vote.deployed().then(function(instance) {
         voteInstance = instance;

         return voteInstance.CastVote(choice, {from: account});
       }).then(function(result, err){
             if(result){
                 console.log(result.receipt.status);
                 if(parseInt(result.receipt.status) == 1){
                  toastr["success"](account + " voting done successfully for proposal")
                  if (result.logs.length > 0) {
                    App._state = 3;
                    App.showNotification(result.logs[0].event);
                  }
                }
                 else
                  toastr["error"](account + " voting not done successfully due to revert")
             } else {
                toastr["error"](account + " voting failed")
             }
         }).catch(function (err) {
          toastr["error"]("Voting failed. You might be voting for a same proposal more than once !!");
        });
       });
   },

//Policy best choice
   PTWinner : function() {
     var voteInstance;
     var secret = $('#fname').val();
     console.log(secret)
     App.contracts.vote.deployed().then(function(instance) {
       voteInstance = instance;
       return voteInstance.BestPolicy(secret);
     }).then(function(res){
     console.log(res);
     toastr["info"]("Best Policy Decision is Policy_"+App.PTproposals[res]);
     }).catch(function(err){
      toastr["error"]("Incorrect Passcode")
     })

    
   },

//InStateLocalPolicy best choice
   FGWinner : function() {
     var voteInstance;
     var secret = $('#fname').val();
     console.log(secret)
     App.contracts.vote.deployed().then(function(instance) {
       voteInstance = instance;
       return voteInstance.BestInStateLocalPolicy(secret);
     }).then(function(res){
     console.log(res);
     toastr["info"]("Best InStateLocalPolicy is InStateLocalPolicy_"+App.FMproposals[res]);
     }).catch(function(err){
      toastr["error"]("Incorrect Passcode")
     })
   },


//PolicyAreaOfFocus best choice
   OAWinner : function() {
    var voteInstance;
    var secret = $('#fname').val();
    console.log(secret)
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.BestPolicyAreaOfFocus(secret);
    }).then(function(res){
    console.log(res);
    toastr["info"]("Best In PolicyAreaOfFocus is PolicyAreaOfFocus_"+App.OAproposals[res]);
    }).catch(function(err){
     toastr["error"]("Incorrect Passcode")
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

   //checking the actual state in the process
   Act_State: function(){
    App.contracts.vote.deployed().then(function(instance) {
      return instance.CurrentState();
    }).then(function(res){
      App._state = res;
     console.log(App._state);
     toastr["info"]("You are in "+App.States[App._state]+" State ");
   });
   },

   //checking the actual state in the process
   Change_State: function(){
    App.contracts.vote.deployed().then(function(instance) {
      return instance.ChangeState();
    }).then(function(res){
      App._state = res;
     console.log(App._state);
     toastr["info"]("The beneficiary changed State!");
   });
   },


//Initialising the app
showNotification: function (phase) {
  console.log(phase);
  var notificationText = App.GPMPhases[phase];
  var t = notificationText.text;
  //console.log(t);
  $('#phase-notification-text').text(t);
  toastr.info(t, "", { "iconClass": 'toast-info notification' + String(notificationText.id) });
}
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