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
  // find "Anonymous" reporter and change to "Hidden"
  const selector = "div[data-testid='ref-spotlight-target-reporter-spotlight']"
  waitForElement(document, selector).then(requester => {
    anonymousToHidden(requester.querySelector('div').firstChild.firstChild.nextElementSibling);
  });
  
  // Look for Created item and hide it
  const history = 'button[data-testid="issue-activity-feed.ui.buttons.History"]';
  const created = 'div[data-testid="issue-history.ui.history-items.issue-created-history-item.history-item"]';
  // Handle History click
  waitForElement(document, history).then(button => {
    button.onclick = () => {
      waitForElement(document, created).then(create => {
        create.remove();
      });
    }
  });
  // Handle regular load
  waitForElement(document, created).then(create => {
    create.remove();
  });
};

document.onload = issueView();
