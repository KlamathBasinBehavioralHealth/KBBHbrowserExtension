async function waitForElement(context, selector) {
	return new Promise((resolve, reject) => {
        let el = context.querySelector(selector);
        if (el) {
            resolve(el);
        }
        new MutationObserver((mutationRecords, observer) => {
            const element = context.querySelector(selector);
            if (element) {
                resolve(element);
                observer.disconnect();
            }
        })
        .observe(context.documentElement, {
            childList: true,
            subtree: true
        });
	});
}

// Build image list into img elements 
const buildIcons = images => {
  return images.map(img => {
    let i = document.createElement('img');
    i.src = img;
    i.style.display = "flex";
    i.style.height = "calc(50% + 1vw)";
    return i;
  });
}

// Style tag for adding hover effects
const cssWrapper = css => {
  let sty = document.createElement("style");
  sty.appendChild(document.createTextNode(css));
  
  document.querySelector("head").appendChild(sty);
}

// Portal container styling
const portalContainerStyle = () => {
  document.querySelector("section").parentElement.style.maxWidth = "94vw";
  document.querySelector('div[data-test-id="help-center-portal-cards"]').style.columnGap = "0";
}

// Hide title
const hidePortalTitle = () => {
  document.querySelectorAll('h1').forEach(h1 => {
    if (h1.textContent == "KBBH Help Center"){
      h1.hidden = true;
    }
  });
}

// Set home page card styling
const createPortalCards = imgList => {
  document.querySelectorAll("div[data-testid='portal-cards-list-item']").forEach((x,i) => {
    x.firstChild.firstChild.style.columnGap = "1.5em";
    x.firstChild.firstChild.insertBefore(imgList[i], x.firstChild.firstChild.firstChild);
    x.firstChild.style.width = "20vw";
    x.firstChild.style.minWidth = "350px";
    x.firstChild.style.height = "12em";
    x.firstChild.style.margin = " 1em";
  });
}

// Get user displayName
const getUser = () => {
  const displayNameRegex = /\"displayName\":\"([^"]+)\"/
  return new Promise((resolve, reject) => {
    const userDiv = document.createElement('div');
    fetch("https://kbbh.atlassian.net/servicedesk/customer/user/profile")
      .then(response => response.text())
      .then(data => {
        userDiv.innerHTML = data;
        document.querySelector('footer').appendChild(userDiv);
        let regexMatch = displayNameRegex.exec(document.querySelector("footer").textContent)
        if (regexMatch){
          resolve(regexMatch[1])
        } else {
          reject(new Error("Could not find displayName"))
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

// Hide Quality Portal for non ops staff
const qualityHide = () => {
  const opsStaff = ['Yu Hsu', 'Danice Watters', 'Eli Gahringer', 'Susana Gahringer', 'Dylon Yoshinaga', 'Katie Huck', 'Sam Thach', 'Jacob Evans', 'Ann Omakron Westbrook', 'Brandon Clyde', 'Nathan Johnson', 'Patrick Staffler', 'Brooke Yancey', 'Fernando Barajas Romero', 'Jeán Hubbard', 'Jennifer Hill', 'Jenna Wood', 'Cindy Benesch', 'Becky Eccles', 'Lisa Abney', 'Ali Mweene', 'Barbara Clark', 'Tricia King', 'Joseph Ransom', 'Wade Coull', 'JoAnna Moss', 'Brittany Thompson', 'Misty Rose', 'Abbie McClung', 'Bruce Tapley', 'Caroline McNeely', 'Liz Maddalena', 'Help Center Admin'];
  getUser().then(user => {
    if (!opsStaff.includes(user)){
      document.querySelector('[data-test-id="portal:Quality"]').parentElement.hidden = true;
    }
  });
}

// KBBH Help Center homepage
const portalHome = () => {
  const imageList = [
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/IT.svg", 
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/Credible.svg", 
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/Reporting.svg", 
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/Maintenance.svg",
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/Compliance.svg",
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/HR.svg",
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/Quality.svg",
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/Communications.svg",
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/SystemsSupport.svg",
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/Concerns.svg",
    "https://raw.githubusercontent.com/KlamathBasinBehavioralHealth/images/main/HelpCenterIcons/Projects/Payroll.svg",
  ];
  let css = "div[data-testid='portal-cards-list-item']{transition: background-color 0.25s ease-out;} a[data-test-id]:hover{background-color: #efefef}";
  
  portalContainerStyle();
  hidePortalTitle();
  createPortalCards(buildIcons(imageList));
  cssWrapper(css);
  qualityHide();
}

// Portal Detail page
const portalDetail = () => {
  setTimeout(() => {
    document.querySelectorAll('a[data-test-id]').forEach(x => {
      x.style.fontSize = "1.2em";
    });
  }, 800);
}


// main function
const kbbhPortal = () => {
  if (/(\/customer\/portals)+$/.test(window.location.href)){
    portalHome();
  }
  else if(/(\/customer\/portal\/[1-9]?[1-9])+$/.test(window.location.href)){
    portalDetail();
    console.log('moved')
  }
}


let currentUrl = location.href;
const checkPageTransition = () => {
    requestAnimationFrame(() => {
        if (currentUrl !== location.href) {
          kbbhPortal();
        }
        currentUrl = location.href;
    }, true);
};

// Check for clicks, refresh, and browser navigation; check url if triggered
document.body.addEventListener("click", checkPageTransition);
document.body.addEventListener("load", checkPageTransition);
window.onpopstate = checkPageTransition;

kbbhPortal();
