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

const hideCreate = () => {
  waitForElement(document, 'button[id="createGlobalItem"]').then(create => create.remove());
};

let currentUrl = location.href;
const checkPageTransition = () => {
    requestAnimationFrame(() => {
        if (currentUrl !== location.href) {
          hideCreate();
        }
        currentUrl = location.href;
    }, true);
};

// Check for clicks, refresh, and browser navigation; check url if triggered
document.body.addEventListener("click", checkPageTransition);
document.body.addEventListener("load", checkPageTransition);
window.onpopstate = checkPageTransition;

hideCreate();
