const formUtilsSrc = chrome.runtime.getURL("form-utils.js");
const formUtils = await import(formUtilsSrc);
const utilsSrc = chrome.runtime.getURL("utils.js");
const utils = await import(utilsSrc);
let resumeContainer = null;
let name = null;
let photoContainerParent = null;

export const onWorkResumePageScenario = async (token) => {
  const firstPartOfUrl = document.location.href.split("resumes/")[1];
  const resumeId = firstPartOfUrl.slice(0, firstPartOfUrl.indexOf("/"));
  utils.sendCustomDocumentEvent("resumeChangeMessage", { resumeId });
  resumeContainer = getWorkResumeContainer(resumeId);
  const resume = getCandidateInfo(resumeContainer);
  if (resume) {
    utils.sendCustomDocumentEvent("resumeChangeMessage", { text: resume.text });
    name = document.querySelector(`#resume_${resumeId} div.row div h1`)?.innerText ?? null;
    formUtils.prefillCandidateNameValue(name);
    photoContainerParent = document.querySelector(`#resume_${resumeId} div.row`)?.outerHTML ?? null;
    if (photoContainerParent) {
      const imgSrcMatch = photoContainerParent.match(/<img[^>]*?src="([^"]*)"[^>]*?>/i);
      if (imgSrcMatch) {
        const resumePhotoLink = imgSrcMatch[1] ? "https:" + imgSrcMatch[1] : null;
        utils.sendCustomDocumentEvent("resumeChangeMessage", { resumePhotoLink });
      }
    }

    const contacts = resume?.children?.find((el) => phonesInResume(el) || emailsInResume(el))?.children;
    let phoneNumber = null;
    let emailValue = null;
    if (contacts) {
      const phone = contacts.find((el) => phonesInResume(el));
      if (phone) {
        const indexOfPhone = contacts.indexOf(phone);
        phoneNumber = typeof indexOfPhone === "number" ? contacts[indexOfPhone + 1].text : null;
        formUtils.prefillCandidatePhoneValue(phoneNumber);
      }
      const email = contacts.find((el) => emailsInResume(el));
      if (email) {
        const indexOfEmail = contacts.indexOf(email);
        emailValue = typeof indexOfEmail === "number" ? contacts[indexOfEmail + 1].text : null;
        formUtils.prefillCandidateEmailValue(emailValue);
      }
    }
    await formUtils.patchSelectWithProjects(token, [phoneNumber], [emailValue]);
  }
};

const getWorkResumeContainer = (resumeId) => {
  return document.getElementById(`resume_${resumeId}`);
};

const getCandidateInfo = (element = resumeContainer) => {
  if (element && element instanceof HTMLElement) {
    const data = {
      tag: element.tagName.toLowerCase(),
      text: element.innerText ? element.innerText.replace(/\t|\s{3,}/gm, "  ").trim() : "",
      children: [],
    };

    const attributes = element.attributes;

    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      data[attribute.name] = attribute.value;
    }

    const children = element.children;
    if (children.length > 0) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        data.children.push(getCandidateInfo(child));
      }
    }
    return data;
  }
};
function phonesInResume(el) {
  const phonePossibleWordOptions = ["телефон", "phone"];
  return phonePossibleWordOptions.find((word) => el.text.toLowerCase().includes(word));
}

function emailsInResume(el) {
  const emailPossibleWordOptions = ["пошта", "почта", "email"];
  return emailPossibleWordOptions.find((word) => el.text.toLowerCase().includes(word));
}
