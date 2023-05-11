const formUtilsSrc = chrome.runtime.getURL("form-utils.js");
const formUtils = await import(formUtilsSrc);
const utilsSrc = chrome.runtime.getURL("utils.js");
const utils = await import(utilsSrc);
let candidatePhoneNumber = null;

export const onOlxResumePageScenario = async (currentCandidate, token) => {
  const { phones, emails } = currentCandidate;
  const descriptionHeaderText = "ОПИС";

  const descriptionHeader = Array.from(document.querySelectorAll("h3:not([hidden])")).find((el) =>
    el.innerText.includes(descriptionHeaderText)
  );

  if (descriptionHeader) {
    const nextElement = descriptionHeader.nextElementSibling;
    const textContent = nextElement ? nextElement.innerText.trim() : "";
    utils.sendCustomDocumentEvent("resumeChangeMessage", { text: textContent });
  }

  const resumeTitle = document.querySelector('h1[data-cy="ad_title"]')?.innerText ?? null;
  utils.sendCustomDocumentEvent("resumeChangeMessage", { resumeTitle });
  const resumePhotoLink = document.querySelector('div[data-cy="adPhotos-swiperSlide"] div img')?.src ?? null;
  utils.sendCustomDocumentEvent("resumeChangeMessage", { resumePhotoLink });

  const name = document.querySelector("a[data-testid='user-profile-link'][name='user_ads'] h4")?.innerText ?? null;
  formUtils.prefillCandidateNameValue(name);

  patchPhoneInputValue(token);
  await formUtils.patchSelectWithProjects(
    token,
    candidatePhoneNumber ? [candidatePhoneNumber] : phones ?? null,
    emails ?? null
  );

  // uncomment if open phone action should be applied on plugin open
  // const button = document.querySelector('[data-testid="show-phone"]');
  // button.click()
};

const patchPhoneInputValue = (token) => {
  const container = document.querySelector('[data-testid="phones-container"]');
  if (!!container) {
    const phoneLink = document.querySelector('a[data-testid="contact-phone"]');
    const noContactsWarning = document.querySelector(".no-contacts-on-page");
    if (phoneLink) {
      const phoneNumberInLink = phoneLink.innerText;
      candidatePhoneNumber = phoneNumberInLink;
      noContactsWarning.classList.add("hide");
      // prefillCandidatePhoneValue(phoneNumber);
      formUtils.prefillCandidatePhoneValue(phoneNumberInLink);
    } else {
      const callback = async function (mutationsList, observer) {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList" && mutation.addedNodes.length) {
            const phoneLinkAfterMutation = mutation.addedNodes[0].querySelector('a[data-testid="contact-phone"]');
            if (phoneLinkAfterMutation) {
              const phoneNumberAfterChange = phoneLinkAfterMutation.innerText;
              noContactsWarning.classList.add("hide");
              formUtils.prefillCandidatePhoneValue(phoneNumberAfterChange);
              await formUtils.patchSelectWithProjects(token, [phoneNumberAfterChange]);
              observer.disconnect();
            }
          }
        }
      };
      const observer = new MutationObserver(callback);
      const config = {
        childList: true,
        subtree: true,
      };
      observer.observe(container, config);
    }
  }
};
