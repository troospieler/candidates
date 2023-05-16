const formUtilsSrc = chrome.runtime.getURL("form-utils.js");
const formUtils = await import(formUtilsSrc);
const utilsSrc = chrome.runtime.getURL("utils.js");
const utils = await import(utilsSrc);
const possiblePhoneWords = ["номер телефону", "номер телефона"];
const possibleEmailWords = ["электронная почта", "електронна пошта"];

const getOlxApplyApplicantName = () => {
  return (
    document.querySelector('article[data-testid="application-details"] div div h4[data-testid="application-title"]')
      ?.innerText ?? null
  );
};

const prefillFormWithApplyInfo = async (currentCandidate, token) => {
  formUtils.prefillCandidateNameValue(getOlxApplyApplicantName());
  const contactInfoContainer = document.querySelector(
    'article[data-testid="application-details"] div section dl[data-testid="profile-asic-info-grid"]'
  );
  const childrenArray = Array.from(contactInfoContainer?.children ?? []);

  const phone = childrenArray.find((el) => possiblePhoneWords.includes(el.innerText?.toLowerCase()))?.nextElementSibling
    .innerText;
  if (typeof phone === "string" && phone !== (currentCandidate.phones ?? [])[0]) {
    formUtils.prefillCandidatePhoneValue(phone);
  }
  const email = childrenArray.find((el) => possibleEmailWords.includes(el.innerText?.toLowerCase()))?.nextElementSibling
    .innerText;
  if (typeof email === "string" && email !== (currentCandidate.emails ?? [])[0]) {
    formUtils.prefillCandidateEmailValue(email);
  }

  await formUtils.patchSelectWithProjects(token, [phone], [email]);
};

export const onOlxApplyPageScenario = async (currentCandidate, token) => {
  await prefillFormWithApplyInfo(currentCandidate, token);

  const resumeTitle = document.querySelector('h3[data-testid="job-ad-title"]')?.innerText ?? null;
  utils.sendCustomDocumentEvent("resumeChangeMessage", { resumeTitle });

  const apply = document.querySelector('article[data-testid="application-details"]');
  if (apply) {
    const observer = new MutationObserver(async (mutationsList) => {
      let initialValue = "";
      for (const mutation of mutationsList) {
        if (
          (mutation.type === "childList" &&
            (possiblePhoneWords.find((item) => mutation.target.innerText?.toLowerCase().includes(item)) ||
              possibleEmailWords.find((item) => mutation.target.innerText?.toLowerCase().includes(item)))) ||
          mutation.type === "characterData"
        ) {
          if (!!mutation.target.innerText && mutation.target.innerText !== initialValue) {
            initialValue = mutation.target.innerText;
          }
          await prefillFormWithApplyInfo(currentCandidate, token);
        }
      }
    });
    const config = {
      childList: true,
      characterData: true,
      subtree: true,
    };
    observer.observe(apply, config);
  }
};
