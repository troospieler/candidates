const utilsSrc = chrome.runtime.getURL("utils.js");
const utils = await import(utilsSrc);

export const prefillCandidateEmailValue = async (email) => {
  const emailInput = document.querySelector("#candidateInfoEmail");
  if (emailInput && emailInput instanceof HTMLInputElement) {
    emailInput.value = email;
    utils.sendCustomDocumentEvent("formUtilsMessage", { emails: [email] });
  }
};

export const prefillCandidatePhoneValue = (phoneNumber) => {
  const phoneInput = document.querySelector("#candidateInfoPhone");
  if (phoneInput && phoneInput instanceof HTMLInputElement) {
    phoneInput.value = phoneNumber;
    utils.sendCustomDocumentEvent("formUtilsMessage", { phones: [phoneNumber] });
  }
};

export const prefillCandidateNameValue = (name) => {
  const candidateName = document.querySelector("#candidateInfoName");
  if (candidateName && candidateName instanceof HTMLInputElement) {
    candidateName.value = name;
    utils.sendCustomDocumentEvent("formUtilsMessage", { name });
  }
};

export async function patchSelectWithProjects(token, phones = null, emails = null) {
  const appearance = await utils.getAtsAppearance(document.location.href, {
    token,
    phones,
    emails,
  });
  if (appearance instanceof Object && !!appearance && !!appearance.projects) {
    const userInfo = utils.parseJwt(token);
    const isMain = userInfo.RoleId === "1";
    const selectItem = document.querySelector(".ats-destination-select");
    const inBase = document.querySelector(".already-in-base-notification");
    if (appearance.isExistsInCandidatesDatabase) {
      inBase.classList.remove("hide");
      const link = document.querySelector(".ats-in-base-link");
      link.href = appearance.candidateInDatabaseUrl;
    } else {
      inBase.classList.add("hide");
    }
    if (Array.isArray(appearance.projects)) {
      // leaving default options only
      selectItem.length = 3;
      // patching with projects
      appearance.projects.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.title = item.name;
        const optionInfo = document.createElement("div");
        const projectName = document.createElement("div");
        projectName.innerHTML = item.name;
        const projectAdditionalInfo = document.createElement("div");
        projectAdditionalInfo.innerHTML = ", " + item.cityName + (isMain ? ", " + item.ownerName : "");
        optionInfo.classList.add("select-project-option-item");
        optionInfo.appendChild(projectName);
        optionInfo.appendChild(projectAdditionalInfo);
        option.appendChild(optionInfo);
        selectItem.add(option);
      });
    }
  }
}

export function cleanupFormErrors() {
  const incorrectEmail = document.querySelector("#incorrectEmail");
  const incorrectPhone = document.querySelector("#incorrectPhone");
  const noContactsFound = document.querySelector(".no-contacts-on-page");
  const inBase = document.querySelector(".already-in-base-notification");
  incorrectEmail?.classList?.add("hide");
  incorrectPhone?.classList?.add("hide");
  noContactsFound?.classList?.add("hide");
  inBase?.classList?.add("hide");
  // if will be needed to hide info about not picked destination
  // const notPicked = document.querySelector("#destinationNotPicked");
  // notPicked.classList.add("hide");
}

export function getFormItemValueByKey(key) {
  return getFormValue()[key] ?? null;
}

export function getFormValue() {
  const formElement = document.querySelector(".candidate-form");
  const formData = new FormData(formElement);
  const formValue = {};
  for (var [key, value] of formData.entries()) {
    formValue[key] = value;
  }
  return formValue;
}

export function cleanupForm() {
  prefillCandidateEmailValue(null);
  prefillCandidatePhoneValue(null);
  prefillCandidateNameValue(null);
  cleanupFormErrors();
}
