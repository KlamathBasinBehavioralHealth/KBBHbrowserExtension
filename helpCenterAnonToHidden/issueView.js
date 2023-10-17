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


const anonymousToHidden = (requester) => {
  if (requester.textContent == "Anonymous"){
    requester.textContent = "Hidden";
  }
};


const issueView = () => {
  const selector = "div[data-testid='ref-spotlight-target-reporter-spotlight']"
  waitForElement(document, selector).then(requester => {
    anonymousToHidden(requester.querySelector('div').firstChild.firstChild.nextElementSibling);
  });
};

issueView();
