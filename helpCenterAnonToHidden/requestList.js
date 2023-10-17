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

const requestDetailView = () => {
  // const requester = document.querySelector("div[role]").firstChild.firstChild;
  waitForElement(document, "div[role]").then(requester => {
    anonymousToHidden(requester.firstChild.firstChild);
  });
};

const requestListView = () => {
  const selector = "td[data-testid='request-list.request-list-table-v2--cell-5']";
  waitForElement(document, selector).then(() => {
    document.querySelectorAll(selector).forEach(requester => {
      anonymousToHidden(requester);
    });
  });
};

requestListView();
