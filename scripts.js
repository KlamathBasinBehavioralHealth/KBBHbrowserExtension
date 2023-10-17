const HOME = 'HOME';
const POPOUT = 'POPOUT';
const NOFRAMES = 'NOFRAMES';
const setAttempts = 10;
const setInt = 10;
let currentState = null;

//Function that checks on interval for an element to load.
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
    console.log('Main frame\'s load event.');
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

        waitForElementInterval(document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=left]').contentDocument.body.querySelector('#client_id'), setAttempts, setInt).then((target) => {
          let leftFrame = document.querySelector('frame[name=main]').contentDocument.querySelector('frame[name=left]').contentDocument.body;
          console.log(target.value);
          console.log(leftFrame.querySelector('visitID').value);
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
  };
}

//Updates visit status dropdown to display status that match our current scheduling policies. Does not affect the values the system saves when submitted.
async function setVisitStatus(){
	await waitForElementInterval(document.querySelector('select[name=dd_status]'));
	console.log('Found it.')
	
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

//Requiring interperter form
function checkInterpeterStatus(){

}

//Get JSON
function getJSON(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}