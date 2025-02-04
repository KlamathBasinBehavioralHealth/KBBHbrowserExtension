const subformCheckInterval = 1000;
const peerSupportService = 'Peer Support Service';

//Waits for a target using intervals
if(typeof waitForElementInterval !== 'function'){  
  function waitForElementInterval (target, maxAttempts = null, interval = 500){
    return new Promise((resolve, reject) => {
      let currentAttempt = 0;
      let currentInterval = setInterval(function(){
        try{
          if(target !== null && target !== undefined){
            clearInterval(currentInterval);
            return resolve(target);
          }else{
            if(maxAttempts !== null && maxAttempts !== undefined){
              console.log(`Attempt ${currentAttempt + 1} out of ${maxAttempts}.`);
              if(currentAttempt >= maxAttempts - 1){
                clearInterval(currentInterval);
                return reject('Not found.');
              }
              else{
                currentAttempt++;
              }
            }
          }
        }catch(error){
          console.log(error);
        }
      }, interval);
    });
  }
}  

//Waits for a target using Mutation Observer
if(typeof waitForIt !== 'function'){
  function waitForIt (target){
      return new Promise((resolve) => {
          
          if(target !== null && target !== undefined){
              console.log(target);
              return resolve(target);
          }
          
          const observer = new MutationObserver(mutations => {
              if (target !== null && target !== undefined) {
                  observer.disconnect();
                  console.log(target);
                  resolve(target);
              }
          });

          observer.observe(document.body, {
              childList: true,
              subtree: true
          });
      });
  }  
}

//Gets and scrubs data from Credible's Export Tool Web Services so it can be queried in JavaScript
if(typeof getData !== 'function'){
  function getData(url) {
    return new Promise(async (resolve, reject) => {
      try {
          const response = await fetch(url);
          
          if (!response.ok) {
            return resolve("Could not fetch data.");
          }

          const xmlString = await response.text();
      
          const parser = new DOMParser();
          const cleanedXmlString = xmlString.replaceAll(/<string\b[^>]*>(?:.*?)|<\/string>|<\/string>|\n/g, '')
              .replaceAll(/\s+/g, ' ')
              .replaceAll('&lt;', '<')
              .replaceAll('&gt;', '>');
          
          const xmlResult = parser.parseFromString(cleanedXmlString, "application/xml");

          return resolve(xmlResult);
      } catch (error) {
        console.log(error);

        resolve("Could not fetch data.");
      }
    });
  }
}

//Interpreter stuff
async function loadInterpreterStatus(target){
  waitForElementInterval(target, setAttempts, setInt).then(async () => {
    let clientID = target.value;

    console.log(clientID);

    const url = `https://cors-everywhere.azurewebsites.net/reportservices.crediblebh.com/reports/ExportService.asmx/ExportXML?connection=LYEC1uwvr-7RAoxbT4TJDuiO!gY1p8-aFVdERsxbI0eOR3--y4vF5EEReVqOj5QX&start_date=&end_date=&custom_param1=${clientID}&custom_param2=&custom_param3=`;

    try{
      let result = await getData(url);
      let interpreterStatus;
      let preferredLanguage;
      let otherLanguage;
      let hearingAssistanceNeeded;
      try{
        interpreterStatus = result.documentElement.querySelector('interpreter_status').innerHTML;
      }catch(error){
        console.log(error);
        interpreterStatus = null;
      }
      try{
        preferredLanguage = result.documentElement.querySelector('pref_lang').innerHTML;
      }catch(error){
        console.log(error);
        preferredLanguage = null;
      }
      try{
        otherLanguage = result.documentElement.querySelector('other_lang').innerHTML;
      }catch(error){
        console.log(error);
        otherLanguage = null;
      }
      try{
        hearingAssistanceNeeded = result.documentElement.querySelector('hearing_assistance_needed').innerHTML;
      }catch(error){
        console.log(error);
        hearingAssistanceNeeded = null;
      }
        
      console.log(interpreterStatus);
      console.log(preferredLanguage);
      console.log(otherLanguage);
      console.log(hearingAssistanceNeeded);

      let targetBody = target.closest('body');
      let targetDocument = targetBody.parentNode.parentNode;

      if(targetDocument.querySelector('#interpreterFlag') === null ){
        const interpreterFlag = targetDocument.createElement('div');

        interpreterFlag.id = 'interpreterFlag';

        targetDocument.body.appendChild(interpreterFlag);
      }

      let interpreterFlag = targetDocument.querySelector('#interpreterFlag');

      if(interpreterStatus === 'Foreign Language' || (preferredLanguage !== 'English' && preferredLanguage !== null) || hearingAssistanceNeeded.includes('Yes')){
        console.log('Do you understand the words that are coming out of my mouth?');
        
        interpreterFlag.value = 'true';
        
        if(interpreterFlag.value || (preferredLanguage !== 'English' && preferredLanguage !== null)){
          [...targetDocument.querySelectorAll('li')].filter((li) => {
            return li.querySelector('a').innerText === 'Accessibility Service';
          })[0].classList.add('fail');
          [...targetDocument.querySelectorAll('li')].filter((li) => {
            return li.querySelector('a').innerText === 'Accessibility Service';
          })[0].classList.add('tTip');

          let tTipContent = '';

          if(interpreterStatus != null){
            tTipContent += `Interpreter Needed: ${interpreterStatus}<br>`;
          }

          if(preferredLanguage != null){
            if(preferredLanguage === 'Other'){
              if(otherLanguage != null){
                tTipContent += `Preferred Language: ${otherLanguage}<br>`;
              }else{
                tTipContent += `Preferred Language: ${preferredLanguage}<br>`;
              } 
            }else{
              tTipContent += `Preferred Language: ${preferredLanguage}<br>`;
            }
          }

          if(hearingAssistanceNeeded != null){
            tTipContent += `Hearing Assistance Needed: ${hearingAssistanceNeeded}`;
          }

          [...targetDocument.querySelectorAll('li')].filter((li) => {
            return li.querySelector('a').innerText === 'Accessibility Service';
          })[0].setAttribute('tTip', tTipContent);

          /* if(interpreterStatus !== null){
            if(otherLanguage !== ''){
              [...targetDocument.querySelectorAll('li')].filter((li) => {
                return li.querySelector('a').innerText === 'Accessibility Service';
              })[0].setAttribute('tTip', `Interpreter Needed: ${interpreterStatus}<br>Preferred Language: ${otherLanguage}<br>Hearing Assistance Needed: ${hearingAssistanceNeeded}`);
            }else{
              [...targetDocument.querySelectorAll('li')].filter((li) => {
                return li.querySelector('a').innerText === 'Accessibility Service';
              })[0].setAttribute('tTip', `Interpreter Needed: ${interpreterStatus}<br>Preferred Language: ${preferredLanguage}<br>Hearing Assistance Needed: ${hearingAssistanceNeeded}`);
            }
          }else{
            if(hearingAssistanceNeeded !== null){
              if(otherLanguage !== ''){
                [...targetDocument.querySelectorAll('li')].filter((li) => {
                  return li.querySelector('a').innerText === 'Accessibility Service';
                })[0].setAttribute('tTip', `Preferred Language: ${otherLanguage}<br>Hearing Assistance Needed: ${hearingAssistanceNeeded}`);
              }else{
                [...targetDocument.querySelectorAll('li')].filter((li) => {
                  return li.querySelector('a').innerText === 'Accessibility Service';
                })[0].setAttribute('tTip', `Preferred Language: ${preferredLanguage}<br>Hearing Assistance Needed: ${hearingAssistanceNeeded}`);
              }
            }
          } */
          
  
          const element = [...targetDocument.querySelectorAll('li')].filter((li) => {
            return li.querySelector('a').innerText === 'Accessibility Service';
          })[0];
  
          const classChangeDetected = (mutationsList, observer) => {
              for(const mutation of mutationsList){
                  if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                      const currentClasses = element.classList;
                      console.log(`Classes: ${currentClasses}.`);
                      if(!currentClasses.contains('fail')){
                          element.classList.add('fail');
                      }
                  }
              }
          };
  
          const observer = new MutationObserver(classChangeDetected);
  
          const observerConfig = { attributes: true, attributeFilter: ['class'] };
  
          observer.observe(element, observerConfig);
        }
  
        initTTips(targetDocument);
      }else{
        console.log('I like to let people talk, who like to talk.');
        interpreterFlag.value = 'false';
      }
    }catch(error){
      console.log(error);
    }
  }).catch((error) => {
    console.log(error);
  });
}

//Require Accessibility Service
const accessibilityInterval = 1000;
async function requireAccessiblityService(target){
  let requireAccessbility = false;
  console.log('Entering require accessiblity service function.');
  waitForElementInterval(target, setAttempts, setInt).then(async () => {
    console.log('Target exists.');
    let clientID = target.value;
    let tempVisitID = target.closest('td').querySelector('#visittemp_ids').value;
    let accessiblityError = document.createElement('div');
    let accessiblityErrorContent = document.createTextNode('Please complete Accessibility Service subform.');
    accessiblityError.setAttribute('id', 'accessiblityErrorDiv');
    accessiblityError.style.color = 'red';
    accessiblityError.style.fontWeight = 'bold';
    accessiblityError.appendChild(accessiblityErrorContent);

    const url = `https://cors-everywhere.azurewebsites.net/reportservices.crediblebh.com/reports/ExportService.asmx/ExportXML?connection=LYEC1uwvr-7RAoxbT4TJDuiO!gY1p8-aFVdERsxbI0eOR3--y4vF5EEReVqOj5QX&start_date=&end_date=&custom_param1=${clientID}&custom_param2=&custom_param3=`;

    const url2 = `https://cors-everywhere.azurewebsites.net/reportservices.crediblebh.com/reports/ExportService.asmx/ExportXML?connection=LYEC1uwvr-7RAoxbT4TJDuiO!gY1p8-aFVdERsxbI0cQSjspyfSCqbt1!JCvw4X7&start_date=&end_date=&custom_param1=${tempVisitID}&custom_param2=&custom_param3=`;

    const url3 = `https://cors-everywhere.azurewebsites.net/reportservices.crediblebh.com/reports/ExportService.asmx/ExportXML?connection=LYEC1uwvr-7RAoxbT4TJDuiO!gY1p8-aFVdERsxbI0dyvlMAjcYRIifY0hysQEhP&start_date=&end_date=&custom_param1=${tempVisitID}&custom_param2=&custom_param3=`;

    try{
      let result = await getData(url);
      let interpreterStatus;
      let preferredLanguage;
      let otherLanguage;
      let hearingAssistanceNeeded;
      try{
        interpreterStatus = result.documentElement.querySelector('interpreter_status').innerHTML;
      }catch(error){
        console.log(error);
        interpreterStatus = null;
      }
      try{
        preferredLanguage = result.documentElement.querySelector('pref_lang').innerHTML;
      }catch(error){
        console.log(error);
        preferredLanguage = null;
      }
      try{
        otherLanguage = result.documentElement.querySelector('other_lang').innerHTML;
      }catch(error){
        console.log(error);
        otherLanguage = null;
      }
      try{
        hearingAssistanceNeeded = result.documentElement.querySelector('hearing_assistance_needed').innerHTML;
      }catch(error){
        console.log(error);
        hearingAssistanceNeeded = null;
      }
        
      console.log(interpreterStatus);
      console.log(preferredLanguage);
      console.log(otherLanguage);
      console.log(hearingAssistanceNeeded);

      //Check if Service has Accessiblity Service Form
      try{
        let checkForMLA = await getData(url2);

        if(checkForMLA.documentElement.querySelector('name')){
          if(interpreterStatus === 'Foreign Language' || (preferredLanguage !== 'English' && preferredLanguage !== null) || hearingAssistanceNeeded.includes('Yes')){
            console.log('Need to check for accessbility service.');
            let check = await getData(url3);
            if(!check.documentElement.querySelector('question_id')){
              console.log('Accessbility service missing.');
              if(window.top.document.querySelector('frame[name=main]')){
                console.log('We in main.');
                if(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('input[name=signAndSubmitButton]')){
                  console.log('We are on the sign and submit page');
                  try{
                    if(!window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('#accessiblityErrorDiv')){
                      window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('input[name=signAndSubmitButton]').disabled = true;
                      window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('input[name=signAndSubmitButton]').closest('tr').nextElementSibling.querySelector('td').append(accessiblityError);
                    }
                  }catch(error){
                    console.log(error);
                  }
                }
              }else if(window.top.document.querySelector('frame[name=right]')){
                console.log('We in right.');
                if(window.top.document.querySelector('frame[name=right]').contentDocument.querySelector('input[name=signAndSubmitButton]')){
                  console.log('We are on the sign and submit page');
                  try{
                    if(!window.top.document.querySelector('frame[name=right]').contentDocument.querySelector('#accessiblityErrorDiv')){
                      window.top.document.querySelector('frame[name=right]').contentDocument.querySelector('input[name=signAndSubmitButton]').disabled = true;
                      window.top.document.querySelector('frame[name=right]').contentDocument.querySelector('input[name=signAndSubmitButton]').closest('tr').nextElementSibling.querySelector('td').append(accessiblityError);
                      requireAccessbility = true;
                    }
                  }catch(error){
                    console.log(error);
                  }
                }
              }
            }
          }
        }
      }catch(error){
        console.log(error);
      }
    }catch(error){
      console.log(error);
    }
  });
  return requireAccessbility;
}

//Tooltips
function addTTipRules(targetDocument){   
  const tTipStyles = `   
    .tTip{       
      position: relative;      
      cursor: pointer;       
      zIndex: 99;     
    }      
    
    .tTipText{       
      --color: black;        
      --textColor: white;        
      position: absolute;       
      width: fit-content;        
      max-width: 100vw;       
      text-align: center;       
      left: 50%;       
      top: 0;       
      transform: translateX(25%);       
      background-color: var(--color);       
      color: var(--textColor);       
      white-space: normal;       
      padding: 10px 15px;       
      border-radius: 7px;       
      visibility: hidden;       
      opacity: 0;       
      transition: opacity 0.5s ease;     
    }      
    
    .tTipText::before{       
      content: \'\';       
      position: absolute;       
      left: 0%;       
      transform: translateX(-100%);       
      border: 7.5px solid;       
      border-color: #0000 var(--color) #0000 #0000;     
    }      
    
    .tTipText li{       
      color: var(--textColor);      
    }      
    
    .tTip:hover .tTipText{       
      left: 50%;       
      visibility: visible;       
      opacity: 1;     
    }`
  ;    
  
  const styleElement = targetDocument.createElement('style');   
  styleElement.textContent = tTipStyles;   
  targetDocument.head.appendChild(styleElement); 
}  

function initTTips(targetDocument){   
  const tTips = targetDocument.querySelectorAll('.tTip');      
  tTips.forEach((tTip) => {     
    const tTipContent = tTip.getAttribute('tTip');     
    let clonedTTip;       
    const customTTip = targetDocument.createElement('div');      
    try{       
      if(tTipContent.startsWith('#')){           
        console.log(document.querySelector(`${tTipContent}`));           
        clonedTTip = document.querySelector(`${tTipContent}`).cloneNode(true);           
        clonedTTip.removeAttribute('id');           
        clonedTTip.removeAttribute('class');           
        clonedTTip.classList.add('tTipText');           
        clonedTTip.style.zIndex = '99';           
        tTip.appendChild(clonedTTip);       
      }else{           
        customTTip.innerHTML = tTipContent;           
        if(!tTip.innerHTML.includes(tTipContent)){               
          customTTip.classList.add('tTipText');               
          tTip.appendChild(customTTip);           
        }       
      }     
    }catch(error){       
      console.log(error);       
      customTTip.innerHTML = tTipContent;       
      if(!tTip.innerHTML.includes(tTipContent)){           
        customTTip.classList.add('tTipText');           
        tTip.appendChild(customTTip);       
      }     
    }   
  });    
  
  document.querySelectorAll('.externalTTip').forEach((tTip) => {       
    tTip.closest('table').closest('tr').style.display = 'none';       
    tTip.closest('table').closest('tr').nextSibling.style.display = 'none';   
  }); 
}  

document.addEventListener('DOMContentLoaded', () => {  
  console.log('tTips load event.');   
  addTTipRules(document);   
  initTTips(document); });  

function highlightTTip(mode = 'highlight', color = 'lightblue'){   
  if(mode === 'highlight'){     
    [...document.querySelectorAll('.tTip')].forEach((tTip) => {       
      tTip.style.backgroundColor = color;     
    });   
  }else if(mode === 'clear'){     
    [...document.querySelectorAll('.tTip')].forEach((tTip) => {       
      tTip.style.backgroundColor = '';     
    });   
  } 
}

//Update Qualifacts Interface
function nixQualifacts(target){
  let hideSuccess = false;
  let frame = undefined;
  let targetColor = undefined;
  let targetBackgroundColor = undefined;
  let table = undefined;
  let targetBanner = undefined;
  let serverInfo = undefined;
  try{
    frame = target.querySelector('frameset').querySelector('frame[name=banner]').contentDocument;
    targetColor = frame.querySelector('div[title=\'Badge Name\']').style.color;
    targetBackgroundColor = frame.querySelector('#banner_badge').style.backgroundColor
    table = frame.querySelector('.header__img').closest('table');
    table.style.backgroundColor = targetColor;
    table.style.width = '100%';
    table.style.marginLeft = '0px';
    frame.querySelector('svg[data-icon=circle-question]').querySelector('path').setAttribute('fill', targetBackgroundColor);
    frame.querySelector('svg[data-icon=arrow-right-from-bracket]').querySelector('path').setAttribute('fill', targetBackgroundColor);
    targetBanner = frame.querySelector('#partner_logo').src;
    serverInfo = frame.querySelector('.header__img').title;
    frame.querySelector('.header__img').src = targetBanner;
    frame.querySelector('.header__img').remove();
    //frame.querySelector('.header__img').style.opacity = '0';
    hideSuccess = true;
    frame.querySelector('#partner_logo').title = serverInfo;
  }catch(error){
    console.log(error);
  }
}

const HOME = 'HOME';
const POPOUT = 'POPOUT';
const NOFRAMES = 'NOFRAMES';
const setAttempts = 10;
const setInt = 10;
let currentState = null;

//Upon loading into Credible, checks to see if the user is in one of three states.
function whereAmI(){
  return new Promise((resolve) => {
    console.log('Looking for Main.');
    waitForElementInterval(document.querySelector('frame[name=main]'), setAttempts, setInt).then(() => {
      currentState = HOME; 
      return resolve(HOME);
    }).catch((error) => {
      console.log(error);
      console.log('Did not find main, looking for right.');
      
      waitForElementInterval(document.querySelector('frame[name=right]'), setAttempts, setInt).then(() => {
        currentState = POPOUT; 
        return resolve(POPOUT);
      }).catch((error) => {
        console.log(error); 
        console.log('Did not find right.');
        currentState = NOFRAMES;
        console.log(currentState);
        return resolve(NOFRAMES);
      });
    });
  });
}

//Based on user's current state, calls various functions for each state.
async function hereWeGo(state){
  switch(state){
    case HOME:
      forMain();
      break;
    case POPOUT:
      forPopout();
      break;
    case NOFRAMES:
      forNoFrames();
      break;
    default:
  }
}

window.onload = async (event) => {
  console.log('Is this a load?');

  let hereWeAre = await whereAmI();

  console.log();

  hereWeGo(hereWeAre);
};

//Changes the Recipient dropdown to show a more detailed description for each item, vs the short hand the system displays.
async function setRecipient(target){
  for(let count = 0; count < target.length; count++){
    console.log(target[count].text);
    switch (target[count].text){
      case 'Ct+F+P':
        target[count].text = 'In Person: Client, Family, Partner';
        break;
      case 'Ct+Fmly':
        target[count].text = 'In Person: Client & Family';
        break;
      case 'Ct+Prtnr':
        target[count].text = 'In Person: Client & Partner';
        break;
      case 'CtOnly':
        target[count].text = 'In Person: Client Only';
        break;
      case 'Day Tx Ct':
        target[count].text = 'Day Tx Client';
        break;
      case 'Fmly+Prtnr':
        target[count].text = 'In Person: Family & Partner';
        break;
      case 'FmlyOnly':
        target[count].text = 'In Person: Family Only';
        break;
      case 'NoCtCntct':
        target[count].text = 'Service provided without client contact';
        break;
      case 'PhoneC+F+P':
        target[count].text = 'Phone: Client, Family, Partner';
        break;
      case 'PhoneCt':
        target[count].text = 'Phone: Client Only';
        break;
      case 'PhoneCt+F':
        target[count].text = 'Phone: Client & Family';
        break;
      case 'PhoneCt+P':
        target[count].text = 'Phone: Client & Partner';
        break;
      case 'PhoneF+P':
        target[count].text = 'Phone: Family & Partner';
        break;
      case 'PhoneFmly':
        target[count].text = 'Phone: Family Only';
        break;
      case 'PhonePrtnr':
        target[count].text = 'Phone: Community Partner Only';
        break;
      case 'PrtnrOnly':
        target[count].text = 'In Person: Community Partner Only';
        break;
      case 'Resident':
        target[count].text = 'Residential Client';
        break;
      case 'Respite':
        target[count].text = 'Respite Client';
        break;
      case 'SELECT':
        target[count].text = 'Select a recipient type';
        break;
      case 'StaffOnly':
        target[count].text = 'Staff Only';
        break;
      case 'TELEMED':
        target[count].text = 'Video: Medical Patient';
        break;
      case 'TELMEDKBBH':
        target[count].text = 'Video: Medical Patient at KBBH; Provider remote';
        break;
      case 'Video@KBBH':
        target[count].text = 'Video: Client at KBBH; Provider remote';
        break;
      case 'VideoC+F+P':
        target[count].text = 'Video: Client, Family, Partner';
        break;
      case 'VideoCt':
        target[count].text = 'Video: Client Only';
        break;
      case 'VideoCt+F':
        target[count].text = 'Video: Client & Family';
        break;
      case 'VideoCt+P':
        target[count].text = 'Video: Client & Partner';
        break;
      case 'VideoF+P':
        target[count].text = 'Video: Family & Partner';
        break;
      case 'VideoFmly':
        target[count].text = 'Video: Family Only';
        break;
      case 'VideoPrtnr':
        target[count].text = 'Video: Partner Only';
        break;
      case 'xDoNotUse':
        target[count].text = '';
        break;
      case 'ComOutRch':
        target[count].text = 'Community Outreach';
        break;
      default:
        target[count].text = 'Select a recipient type'
    }
  }
}

//This is the normal window the user works in when the EHR loads.
async function forMain(){
  let requireAccessbility = false;
  console.log('Entered forMain.');
  nixQualifacts(parent.document);
  document.querySelector('frame[name=main]').onload = async (event) => {
    console.log('Main frame\'s load event. I\'m a chunky monkey from funky town.');
    waitForElementInterval(document.querySelector('frame[name=main]')?.contentDocument?.querySelector('frame[name=right]'), setAttempts, setInt).then(async () => {
      console.log('Found right after Main\'s load event.');
      window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').onload = async (event) => {
        console.log('Right frame\'s load event.');
        try{
          [...document.querySelector('frame[name=main]')?.contentDocument?.querySelector('frame[name=right]')?.contentDocument?.querySelectorAll('a')].filter((element) => {
            return element.innerText.includes('Credible Plan');
          })[0].closest('tr').remove();
        }catch(error){
          console.log(error);
        }

        waitForElementInterval(document.querySelector('frame[name=main]')?.contentDocument?.querySelector('frame[name=right]')?.contentDocument?.querySelector('#recipient_id'), setAttempts, setInt).then(async () => {
          console.log('Found recipient.');
          try{
            setRecipient(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('#recipient_id').querySelectorAll('option'));
          }catch(error){
            console.log(error);
          }
        }).catch((error) => {
          console.log(error);
        });
    
        waitForElementInterval(document.querySelector('frame[name=main]')?.contentDocument?.querySelector('frame[name=right]')?.contentDocument?.querySelector('#signAndSubmitButton'), setAttempts, setInt).then(async () => {
          console.log('Found Sign and Submit Button.');
          console.log('Test 9000');
      
          let accessibilityCheckInterval = setInterval(() => {
            try{
              if(window.top.document.querySelector('frame[name=main]')?.contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('#accessiblityErrorDiv')){
                clearInterval(accessibilityCheckInterval);
              }
              requireAccessbility = requireAccessiblityService(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=left]').contentDocument.querySelector('#client_id'));
            }catch(error){
              console.log(error);
            }
          }, accessibilityInterval);

          
            

              try{
                setupAutoOverrideSupervisor(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument);
          
                checkIntern(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument);
              }catch(error){
                console.log(error);
              }
                  
        }).catch((error) => {
          console.log(error);
        });         
      };
    }).catch((error) => {
      console.log(error);
      try{
        [...window.top.document.querySelector('frame[name=main]').contentDocument.querySelectorAll('a')].filter((element) => {
          return element.innerText.includes('Credible Plan');
        })[0].closest('tr').remove();
      }catch(error){
        console.log(error);
      }
      try{
        setRecipient(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('#recipient_id').querySelectorAll('option'));
      }catch(error){
        console.log(error);
      } 
      try{
        setupAutoOverrideSupervisor(window.top.document.querySelector('frame[name=main]').contentDocument);

        checkIntern(window.top.document.querySelector('frame[name=main]').contentDocument);
      }catch(error){
        console.log(error);
      } 
    });

    //Doing stuff based on client id from left frame
    waitForElementInterval(window.top.document.querySelector('frame[name=main]')?.contentDocument?.querySelector('frame[name=left]'), setAttempts, setInt).then(async () => {
      console.log('Found left after Main\'s load event.');
      addTTipRules(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=left]').contentDocument);
      loadInterpreterStatus(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=left]').contentDocument.querySelector('#client_id'));
      
      let accessibilityCheckInterval = setInterval(() => {
        try{
          if(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('#accessiblityErrorDiv')){
            clearInterval(accessibilityCheckInterval);
          }
          requireAccessbility = requireAccessiblityService(window.top.document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=left]').contentDocument.querySelector('#client_id'));
        }catch(error){
          console.log(error);
        }
      }, accessibilityInterval);

      //Aggregate subforms
      aggregateSubforms(window.top.document.querySelector('frame[name=main]').contentDocument);
    }).catch((error) => {
      console.log(error);
    });
  };
}

//Updates visit status dropdown to display status that match our current scheduling policies. Does not affect the values the system saves when submitted.
async function setVisitStatus(){
	await waitForElementInterval(document.querySelector('select[name=dd_status]'));
	console.log('Found it.');
	try{
    document.querySelector('option[value=\'CANCELLED\']').text = 'Late Cancellation';
    document.querySelector('option[value=\'CNCLD>24hr\']').text = 'Cancellation';
    document.querySelector('option[value=\'NOTPRESENT\']').text = 'School: Absent';
  }catch(error){
    console.log(error);
  }
  console.log('Why are we still here?');
}

//This state is when a user opens a tab in a new window, which will cause the main frame to not load.
async function forPopout(){
  let requireAccessbility = false;

  loadInterpreterStatus(document.querySelector('frame[name=left]').contentDocument.querySelector('#client_id'));
 
  let accessibilityCheckInterval = setInterval(() => {
    try{
      if(document.querySelector('frame[name=right]').contentDocument.querySelector('#accessiblityErrorDiv')){
        clearInterval(accessibilityCheckInterval);
      }
      requireAccessbility = requireAccessiblityService(document.querySelector('frame[name=left]').contentDocument.querySelector('#client_id'));
    }catch(error){
      console.log(error);
    }
  }, accessibilityInterval);  

  waitForElementInterval(window.top.document.querySelector('frame[name=right]'), setAttempts, setInt).then(async () => {
    console.log('Found right frame in popout.');
    
    window.top.document.querySelector('frame[name=right]').onload = async () => {
      console.log('Popout\'s right frame load event.');
      try{
        [...window.top.document.querySelector('frame[name=right]').contentDocument.querySelectorAll('a')].filter((element) => {
          return element.innerText.includes('Credible Plan');
        })[0].closest('tr').remove();
      }catch(error){
        console.log(error);
      }
  
      try{
        setRecipient(window.top.document.querySelector('frame[name=right]').contentDocument.querySelector('#recipient_id').querySelectorAll('option'));
      }catch(error){
        console.log(error);
      }

      try{
        setupAutoOverrideSupervisor(window.top.document.querySelector('frame[name=right]').contentDocument);
  
        checkIntern(window.top.document.querySelector('frame[name=right]').contentDocument);
      }catch(error){
        console.log(error);
      }
    };
  }).catch((error) => {
    console.log(error);
  });

  try{
    addTTipRules(document.querySelector('frame[name=left]').contentDocument);
  }catch(error){
    console.log(error);
  }

  //Aggregate subforms
  aggregateSubforms(window.top.document);
}

//This state is specifically for new windows the EHR creates for pages like scheduler entries.
async function forNoFrames(){
  setVisitStatus();
  try{
    [...document.querySelectorAll('a')].filter((element) => {
      return element.innerText.includes('Credible Plan');
    })[0].closest('tr').remove();
  }catch(error){
    console.log(error);
  }
  try{
    setRecipient(document.querySelector('#recipient_id').querySelectorAll('option'));
  }catch(error){
    console.log(error);
  } 
  try{
    setupAutoOverrideSupervisor(document);
  }catch(error){
    console.log(error);
  } 
}

function aggregateSubforms(targetDocument){
  let notInFormBuilder = true;
  try{
    if([...window.top.document.querySelector('frame[name=main]').contentDocument.querySelectorAll('title')].filter((title) => {
      return title.innerText = 'Form Builder';
  })[0]){
      notInFormBuilder = false
    }
  }catch(error){

  }
  try{
    if([...window.top.document.querySelector('frame[name=right]').contentDocument.querySelectorAll('title')].filter((title) => {
      return title.innerText = 'Form Builder';
  })[0]){
      notInFormBuilder = false
    }
  }catch(error){

  }
  if(notInFormBuilder){
    try{
      if([...targetDocument.querySelector('frame[name=left]').contentDocument.querySelectorAll('a')].filter((element) => {
        return element.innerText.includes('Subforms');
      })){
        console.log('Subforms found.');    

        targetDocument.querySelector('frame[name=right]').contentDocument.addEventListener('onload', () => {
          try{
            if([...targetDocument.querySelector('frame[name=left]').contentDocument.querySelectorAll('a')].filter((element) => {
              return element.innerText.includes('Subforms');
            })){
              console.log('Subforms found.');    
        
              [...targetDocument.querySelector('frame[name=left]').contentDocument.querySelectorAll('li')].filter((element) => {
                return element.innerHTML.includes('Subforms');
              }).at(-1).hidden = false;
        
              if(
                [...targetDocument.querySelector('frame[name=right]').contentDocument.querySelectorAll('h1')].filter((element) => {
                  return element.innerText.includes('START');
                })
              ){
                [...targetDocument.querySelector('frame[name=left]').contentDocument.querySelectorAll('li')].filter((element) => {
                  return element.innerHTML.includes('Subforms');
                }).at(-1).hidden = true;
        
                [...targetDocument.querySelector('frame[name=right]').contentDocument.querySelectorAll('li')].filter((element) => {
                  return element.innerHTML.includes('Subforms');
                }).at(-1).hidden = true;
              }
            }
          }catch(error){
            console.log(error);
          }
        });

        [...targetDocument.querySelector('frame[name=left]').contentDocument.querySelectorAll('li')].filter((element) => {
          return element.innerHTML.includes('Subforms');
        }).at(-1).hidden = false;

        if(
          [...targetDocument.querySelector('frame[name=right]').contentDocument.querySelectorAll('h1')].filter((element) => {
            return element.innerText.includes('START');
          })
        ){
          [...targetDocument.querySelector('frame[name=left]').contentDocument.querySelectorAll('li')].filter((element) => {
            return element.innerHTML.includes('Subforms');
          }).at(-1).hidden = true;

          [...targetDocument.querySelector('frame[name=right]').contentDocument.querySelectorAll('li')].filter((element) => {
            return element.innerHTML.includes('Subforms');
          }).at(-1).hidden = true;
        }
      }
    }catch(error){
      console.log(error);
    }
  }
}

function autoOverrideSupervisor(targetDocument){
  if(targetDocument.querySelector('#supervising_id').value !== ''){
    if(!targetDocument.querySelector('input[name=overridewsupervising][value=\'1\']').checked){
      targetDocument.querySelector('input[name=overridewsupervising][value=\'1\']').checked = true;
    }
  }else{
    if(!targetDocument.querySelector('input[name=overridewsupervising][value=\'0\']').checked){
      targetDocument.querySelector('input[name=overridewsupervising][value=\'0\']').checked = true;
    }
  }
}

function setupAutoOverrideSupervisor(targetDocument){
  hideOverrideSupervisor(targetDocument);
  autoOverrideSupervisor(targetDocument);
  targetDocument.querySelector('#supervising_id').addEventListener('blur', () => {
    autoOverrideSupervisor(targetDocument);
  });
  targetDocument.querySelector('#supervising_id').addEventListener('change', () => {
    autoOverrideSupervisor(targetDocument);
  });
}

function hideOverrideSupervisor(targetDocument, mode = 'hide'){
  if(targetDocument.querySelector('#signAndSubmitButton')){
    if(mode === 'hide'){
      targetDocument.querySelector('[name=overridewsupervising]').closest('tr').hidden = true;
    }else{
      targetDocument.querySelector('[name=overridewsupervising]').closest('tr').hidden = false;
    }
  }
}

//Check Intern Status
async function checkIntern(targetDocument){
  try{
    console.log('Checking for intern status.');

    let internError = targetDocument.createElement('div');
    let internErrorContent = targetDocument.createTextNode('Please select supervisor.');
    internError.setAttribute('id', 'internError');
    internError.style.color = 'red';
    internError.style.fontWeight = 'bold';
    internError.appendChild(internErrorContent);


    let tempVisitID = targetDocument.querySelector('body').querySelector('#visittemp_id').value;

    let internUrl = `https://cors-everywhere.azurewebsites.net/reportservices.crediblebh.com/reports/ExportService.asmx/ExportXML?connection=LYEC1uwvr-7RAoxbT4TJDuiO!gY1p8-aFVdERsxbI0c2Yz!VEp0!eZrPdAAIgsal&start_date=&end_date=&custom_param1=${tempVisitID}&custom_param2=&custom_param3=`;

    let internData = await getData(internUrl);

    if(!targetDocument.querySelector('#accessiblityErrorDiv')){
      targetDocument.querySelector('input[name=signAndSubmitButton]').disabled = false;
    }

    targetDocument.querySelector('#supervising_id').closest('tr').hidden = false;
    if([...[...targetDocument.querySelectorAll('tr')].filter((element) => {
      return element.innerHTML.includes('Service Type:');
  }).at(-1).querySelectorAll('td')].at(-1).innerText === peerSupportService){
      targetDocument.querySelector('#supervising_id').closest('tr').hidden = true;
    }

    if(internData.documentElement.querySelector('is_intern')){
      if(internData.documentElement.querySelector('is_intern').innerHTML === '1' && [...[...targetDocument.querySelectorAll('tr')].filter((element) => {
      return element.innerHTML.includes('Service Type:');
  }).at(-1).querySelectorAll('td')].at(-1).innerText !== peerSupportService){

        console.log('Require supervisor dropdown.');
        try{
          if(!targetDocument.querySelector('#internErrorDiv')){
            targetDocument.querySelector('input[name=signAndSubmitButton]').disabled = true;
            if(!targetDocument.querySelector('#internError')){
              targetDocument.querySelector('input[name=signAndSubmitButton]').closest('tr').nextElementSibling.querySelector('td').append(internError);
            }

            targetDocument.querySelector('#supervising_id').addEventListener('change', () => {
            console.log('Sups');

            try{
              targetDocument.querySelector('#internError').remove();
            }catch(error){
                console.log(error);
            }
        
            if(!targetDocument.querySelector('#accessiblityErrorDiv')){
              targetDocument.querySelector('input[name=signAndSubmitButton]').disabled = false;
            }
          });
          }
        }catch(error){
          console.log(error);
        }
      }
      console.log(internData.documentElement.querySelector('is_intern'));
    }
  }catch(error){
    console.log(error);
  }
}