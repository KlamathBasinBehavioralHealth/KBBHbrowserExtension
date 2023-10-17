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
      let interperterStatus = result.documentElement.querySelector('lookup_desc').innerHTML;
      console.log(interperterStatus);
    }catch(error){
      console.log(error);
    }
  }).catch((error) => {
    console.log(error);
  });
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
      default:
        target[count].text = 'Select a recipient type'
    }
  }
}

//This is the normal window the user works in when the EHR loads.
async function forMain(){
  console.log('Entered forMain.');
  document.querySelector('frame[name=main]').onload = async (event) => {
    console.log('Main frame\'s load event. I\'m a chunky monkey from funky town.');
    waitForElementInterval(document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]'), setAttempts, setInt).then(() => {
      console.log('Found right after Main\'s load event.');
      document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').onload = async (event) => {
        console.log('Right frame\'s load event.');
        waitForElementInterval(document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('#recipient_id'), setAttempts, setInt).then(() => {
          console.log('Found recipient.');
          setRecipient(document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=right]').contentDocument.querySelector('#recipient_id').querySelectorAll('option'));
        }).catch((error) => {
          console.log(error);
        });
      };
    }).catch((error) => {
      console.log(error);
      try{
        setRecipient(document.querySelector('frame[name=main]').contentDocument.querySelector('#recipient_id').querySelectorAll('option'));
      }catch(error){
        console.log(error);
      } 
    });

    //Doing stuff based on client id from left frame
    waitForElementInterval(document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=left]'), setAttempts, setInt).then(async () => {
      console.log('Found left after Main\'s load event.');
      
      loadInterpreterStatus(document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=left]').contentDocument.querySelector('#client_id'));
    }).catch((error) => {
      console.log(error);
    });
  };
}

//Updates visit status dropdown to display status that match our current scheduling policies. Does not affect the values the system saves when submitted.
async function setVisitStatus(){
	await waitForElementInterval(document.querySelector('select[name=dd_status]'));
	console.log('Found it.');
	
	document.querySelector('option[value=\'CANCELLED\']').text = 'Late Cancellation';
  document.querySelector('option[value=\'CNCLD>24hr\']').text = 'Cancellation';
  document.querySelector('option[value=\'NOTPRESENT\']').text = 'School: Absent';
  console.log('Why are we still here?');
}

//This state is when a user opens a tab in a new window, which will cause the main frame to not load.
async function forPopout(){
  document.querySelector('frame[name=right]').onload = () => {
    console.log('Popout\'s right frame load event.');
    try{
      setRecipient(document.querySelector('frame[name=right]').contentDocument.querySelector('#recipient_id').querySelectorAll('option'));
    }catch(error){
      console.log(error);
    }
  };

  loadInterpreterStatus(document.querySelector('frame[name=left]').contentDocument.querySelector('#client_id'));
}

//This state is specifically for new windows the EHR creates for pages like scheduler entries.
async function forNoFrames(){
  setVisitStatus();
  try{
    setRecipient(document.querySelector('#recipient_id').querySelectorAll('option'));
  }catch(error){
    console.log(error);
  } 
}