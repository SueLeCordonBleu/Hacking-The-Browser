
var tabList = [];

//Creating a tabObj object as the model
function tabObj(tab)
{
    this.tab = tab;
    this.title = tab.title;
    this.id = tab.id;
    this.pinned = tab.pinned;
    this.active = tab.active;
    this.selected = false;

    this.update = function update() {
        this.tab = tab;
        this.title = tab.title;
        this.id = tab.id;
        this.pinned = tab.pinned;
        this.active = tab.active;
    }

    this.selectTabObj = function (){
        this.selected = true;
    }

    this.unselectTabObj = function (){
        this.selected = false;
    }
}


function getTabList() {
    chrome.runtime.sendMessage({greeting: "GetTabList"},
        function (response) {
            console.log(response);
            for (thisTab of response) {
                let thisTabObj = new tabObj(thisTab);
                tabList.push(thisTabObj);
            }
            console.log(tabList);
            updateList();
        });
}

//Controller Part
getTabList();

function updateList (){
    updateListElementView();
}

function getSelectedTabs(){
    var selectedList = [];
    for(thisTabObj of tabList) {
        if (thisTabObj.selected == true) {
            selectedList.push(thisTabObj);
        }
    }
    return selectedList;
}

function selectAllTabs(){
    for (thisTabObj of tabList) {
        toggleSelected(thisTabObj, true);
    }
}

function unselectAllTabs(){
    for (thisTabObj of tabList) {
        toggleSelected(thisTabObj, false);
    }
}

function toggleSelected(tabObj, message) {
    if (message == true) {
        tabObj.selectTabObj();
    } else {
        tabObj.unselectTabObj();
    }
    updateHeader();
}

function togglePinned (tabObj){
    if (tabObj.pinned === false){
        tabObj.pinned = true;
        pinTab (tabObj);
    } else if (tabObj.pinned === true){
        tabObj.pinned = false;
        unPinTab (tabObj);
    }
    pinButtonUpdate();
}

function pinTab(tabObj){
    chrome.runtime.sendMessage({greeting: "pinThisTab", tabId: tabObj.id});
}

function unPinTab(tabObj){
    chrome.runtime.sendMessage({greeting: "unPinThisTab", tabId: tabObj.id});
}

function closeTab(tabObj){
    chrome.runtime.sendMessage({greeting: "closeThisTab", tabId: tabObj.id});
    tabList.splice(tabList.indexOf(tabObj),1);
    updateList();
}


function switchToActiveTab(tabObj) {
    chrome.runtime.sendMessage({greeting: "setThisToActive", tabId: tabObj.id});
}



/*

View Part

*/
function updateListElementView() {
    let listDiv = document.getElementById('tabList');
    while(listDiv.hasChildNodes()) //remove all existing child elements
    {
        listDiv.removeChild(listDiv.firstChild);
    }
    for (thisTab of tabList){
        createTabBar(thisTab, listDiv);
    }
    pinButtonUpdate();
}

function updateHeader() {
    let headerDiv = document.getElementById('header-div');
    let tabBarSelectBoxes = document.getElementsByClassName('tabBar-selectBox');
    let toggle = false;
    for (item of tabBarSelectBoxes) {
      if (item.checked == true) {
        toggle = true;
      }
    }
    if (toggle == true) {
      console.log('selected!');
      let searchBar = document.getElementsByClassName('search');
      for (element of searchBar) {
        element.style.visibility = 'hidden';
      }
      let pinButton = document.getElementById('header-pinButton');
      pinButton.style.visibility = 'visible';
      let unpinButton = document.getElementById('header-unpinButton');
      unpinButton.style.visibility = 'visible';
      let closeButton = document.getElementById('header-closeButton');
      closeButton.style.visibility = 'visible';
    } else {
      console.log('nothing selected!');
      let searchBar = document.getElementsByClassName('search');
      for (element of searchBar) {
        element.style.visibility = 'visible';
      }
      let pinButton = document.getElementById('header-pinButton');
      pinButton.style.visibility = 'hidden';
      let unpinButton = document.getElementById('header-unpinButton');
      unpinButton.style.visibility = 'hidden';
      let closeButton = document.getElementById('header-closeButton');
      closeButton.style.visibility = 'hidden';
    }
}

function createTabBar (tabObj,parentDiv){
    //create a tab bar (div)
    let tabDiv = document.createElement('div');
    tabDiv.classList.add('tabBar');

    //create select box for each tab bar
    let selectBox = document.createElement('input');
    selectBox.type = "checkbox";
    selectBox.name = "tabSelectBox";
    selectBox.id = 'tabBar-selectBox' + tabObj.id;
    selectBox.classList.add('tabBar-selectBox');
    tabDiv.appendChild(selectBox);
    addSelectBoxListener(selectBox, tabObj);
    let label4SelectBox = document.createElement('label');
    label4SelectBox.htmlFor = 'tabBar-selectBox'+tabObj.id;
    tabDiv.appendChild(label4SelectBox);

    //create pin/unpin button for each tab bar
    let pinButton = document.createElement('button');
    pinButton.value = "Pin";
    pinButton.classList.add('tabBar-pinButton');
    tabDiv.appendChild(pinButton);
    addPinListener(pinButton, tabObj);

    //create a favicon showbox
    let favicon = document.createElement('img');
    favicon.setAttribute('src', tabObj.tab.favIconUrl);
    // favicon.setAttribute('alt', 'favicon');
    favicon.classList.add('tabBar-favicon');
    tabDiv.appendChild(favicon);
    addDirectSwitch(favicon, tabDiv, tabObj);

    //create a paragraph element for each tab bar to store the name of tabs
    let title = document.createElement('span');
    title.innerHTML = tabObj.title;
    title.classList.add('tabBar-title');
    tabDiv.appendChild(title);
    addDirectSwitch(title, tabDiv, tabObj);

    //create a close button for each tab bar
    let closeButton = document.createElement('button');
    closeButton.value = "close";
    closeButton.classList.add('tabBar-closeButton');
    tabDiv.appendChild(closeButton);
    addCloseListener(closeButton,tabObj);

    //add the tab bar to the DOM tree
    parentDiv.appendChild(tabDiv);
}

function addSelectBoxListener(selectBox, tabObj) {
    selectBox.addEventListener('change', function() {
        if (this.checked) {
            toggleSelected(tabObj, true);
        } else {
            toggleSelected(tabObj, false);
        }
    });
}

function addPinListener(pinButton, tabObj){
    pinButton.addEventListener('click', function(){
        togglePinned(tabObj);
    });
}

function pinButtonUpdate(){
    let tabBars = document.getElementsByClassName('tabBar');
    for (let i = 0; i< tabList.length; i++) {
        let barElems = tabBars[i].childNodes;
        let pinButton = barElems[2];
        let tabObj = tabList[i];
        if (tabObj.pinned == true) {
            pinButton.setAttribute('value','Unpin');
        } else {
            pinButton.setAttribute('value','Pin');
        }
    }
}

function addCloseListener(closeButton, tabObj){
    closeButton.addEventListener("click", function(){
        closeTab(tabObj);
    });
}


//when clicked: switch to active tab
function addDirectSwitch(title, tabDiv, tabObj){
    title.addEventListener("click",function(event){
        switchToActiveTab(tabObj);
    });
}




//Header view part
let selectBox = document.getElementById('header-selectBox');
let closeButton = document.getElementById('header-closeButton');
let pinButton = document.getElementById('header-pinButton');
let unpinButton = document.getElementById('header-unpinButton');
let searchInput = document.getElementById('header-searchInput');
let searchButton = document.getElementById('header-searchButton');

//selectAllBox
selectBox.addEventListener('click', function(){
    if(this.checked) {
        selectAllTabs();
        let tabBarSelectBoxes = document.getElementsByClassName('tabBar-selectBox');
        for (thisSelectBox of tabBarSelectBoxes){
            thisSelectBox.checked = true;
        }
    } else {
        unselectAllTabs();
        let tabBarSelectBoxes = document.getElementsByClassName('tabBar-selectBox');
        for (thisSelectBox of tabBarSelectBoxes) {
            thisSelectBox.checked = false;
        }
    }
    updateHeader();
});

//pin selected tabs Button
pinButton.addEventListener( 'click' , function(){
    let selectedList = getSelectedTabs();
    for(thisTabObj of selectedList) {
        if (thisTabObj.pinned == false){
            togglePinned(thisTabObj);
        }
    }
})

//unpin selected tabs Button
unpinButton.addEventListener( 'click' , function(){
    let selectedList = getSelectedTabs();
    for(thisTabObj of selectedList) {
        if (thisTabObj.pinned == true){
            togglePinned(thisTabObj);
        }
    }
})


//close Selected tabs Button
closeButton.addEventListener( 'click' , function(){
    let selectedList = getSelectedTabs();
    for(thisTabObj of selectedList) {
        closeTab(thisTabObj);
    }
})


//search for tabs
searchInput.onfocus = function(){
    searchInput.value = '';
}
searchInput.onchange = function(){
    searchForTabs(searchInput.value);
}
searchButton.onclick = function(){
    searchForTabs(searchInput.value);
}
function searchForTabs(keyword){
    console.log(keyword);

    let searchResult = [];
    //initialize the results to empty;
    let tabBars = document.getElementsByClassName('tabBar');
    let tabBarSelectBoxes = document.getElementsByClassName('tabBar-selectBox');
    for (tabObj of tabList) {
        searchUnHighLightTabBar(tabBars[tabList.indexOf(tabObj)]);
        tabBarSelectBoxes[tabList.indexOf(tabObj)].checked = false;
        toggleSelected(tabObj, false);
    }
    if(keyword.length > 0) {
        for (tabObj of tabList) {
            let result = tabObj.title.toUpperCase().indexOf(keyword.toUpperCase());
            if (result != -1){
                searchResult.push(tabList.indexOf(tabObj));
            }
        }
        console.log(searchResult);
        if (searchResult.length > 0){
            for (thisIndex of searchResult){
                searchHighLightTabBar(tabBars[thisIndex]);
                tabBarSelectBoxes[thisIndex].checked = true;
                toggleSelected(tabList[thisIndex], true);
            }
        }
    }

}

function searchHighLightTabBar(tabDiv){
    tabDiv.classList.add('searchResult');
}

function searchUnHighLightTabBar(tabDiv){
    tabDiv.classList.remove('searchResult');
}
