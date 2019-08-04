var tabList = [];

chrome.tabs.onCreated.addListener(function (tab){
    tabList.push(tab);
    console.log("now tab list:  ", tabList);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
  for (let i = 0; i < tabList.length; i++){
    if (tabList[i].id === tabId) {
      tabList[i] = tab;
    }
  }
    console.log('now tab List:  ', tabList);
});

chrome.tabs.onRemoved.addListener(function (tabID, removeInfo){
    for (i = 0; i <= tabList.length - 1; i++){
      if(tabList[i].id == tabID){
        tabList.splice(i,1);
      }
    }
});

chrome.browserAction.onClicked.addListener(function(tab){
    alert("under development!");
  });

chrome.tabs.query({},function(tabs){
    tabList = tabs;
});

chrome.runtime.onMessage.addListener( function(request,sender,sendResponse) {
  //return tablist
  if( request.greeting === "GetTabList" ) {
    let message = "Not set yet";
      message = tabList;
      sendResponse(message);
      console.log(message);
  }

  //Pin tab request
  if ( request.greeting === "pinThisTab") {
    console.log('start to pin');
    chrome.tabs.update(request.tabId, {pinned: true}, function(tab){
      console.log("finished pinning");
    })
  }

  //Pin tab request
  if ( request.greeting === "unPinThisTab") {
    console.log('start to unpin');
    chrome.tabs.update(request.tabId, {pinned: false}, function(tab){
      console.log("finished unpinning");
    })
  }

  //closing tab request
  if ( request.greeting === "closeThisTab") {
    console.log('start to close');
    chrome.tabs.remove(request.tabId, function (){
      console.log("finished closing");
    });
  }


  //set tab to active request
  if ( request.greeting === "setThisToActive") {
    console.log('start to setActive', request.tabId);
    chrome.tabs.update(request.tabId, {active: true}, function(tab){
      console.log("finished setActive");
    });
  }
});


function sendResponse(response){
    return response;
}
