(async () => {
  const currentUrl = window.location.href;

  const workUrlMatch = currentUrl.match(/^https:\/\/www\.work\.ua(\/\w{0,})?\/resumes\/(\d+)\/?(?:\?.*)?$/);
  const olxResumeUrlMatch = currentUrl.match(/^https:\/\/www\.olx\.ua((\/\w{0,}){1,})?\/obyavlenie\/\w{1,}/);
  const olxApplyUrlMatch = currentUrl.match(/^https:\/\/www\.olx\.ua((\/\w{0,}){1,})?\/myaccount\/ep\/ad\/[\w\/]{1,}/);

  // try if needed to open only on opened apply, but need to update logic
  // cause after first page open the check might not find mathces and extension wont work after apply selected
  // const olxApplyUrlMatch = currentUrl.match(/^https:\/\/www\.olx\.ua((\/\w{0,}){1,})?\/myaccount\/ep\/ad\/\w{1,}\/\?applicationId.{1,}/);

  // prevent plugin open/functionality if not correct url
  if (!workUrlMatch && !olxResumeUrlMatch && !olxApplyUrlMatch) {
    return;
  }

  let currentResumeId = null;
  let currentCandidate = null;
  let token = null;
  let hasNoContactsError = false;
  let hasCandidateEmailError = false;
  let hasAtsDestinationError = false;
  let hasCandidatePhoneError = false;
  let isInDataBase = false;
  let isPluginWindowOpen = false;
  let hasAtsAccess = true;

  const PHONE_PATTERN = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  const EMAIL_PATTERN = /^[\w-]+[_.\-\w]*@\w+([.-]?\w+)*(\.\w{2,15})+$/;

  // get access to other modules
  const utilsSrc = chrome.runtime.getURL("utils.js");
  const utils = await import(utilsSrc);
  const formUtilsSrc = chrome.runtime.getURL("form-utils.js");
  const formUtils = await import(formUtilsSrc);
  const olxApplyPageHelpersSrc = chrome.runtime.getURL("olx-apply-page-helpers.js");
  const olxApplyPageHelpers = await import(olxApplyPageHelpersSrc);
  const olxResumePageHelpersSrc = chrome.runtime.getURL("olx-resume-page-helpers.js");
  const olxResumePageHelpers = await import(olxResumePageHelpersSrc);
  const workResumePageHelpersSrc = chrome.runtime.getURL("work-resume-page-helpers.js");
  const workResumePageHelpers = await import(workResumePageHelpersSrc);

  //injecting popup.html to current web page
  await fetch(chrome.runtime.getURL("popup.html"))
    .then((response) => response.text())
    .then(async (html) => {
      const manifest = chrome.runtime.getManifest();
      console.log(
        `%cHelper ${manifest.version}`,
        "color: white; background-color: #ff5252; text-shadow: 0 0 15px rgba(25,255,25,.5), 0 0 10px rgba(255,255,255,.5); padding: 3px 9px; border-radius: 5px; font-family:monospace; font-size: 20px; font-weight: bold;"
      );
      const wrapper = document.createElement("div");
      wrapper.classList.add("plugin-window-wrapper");
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);

      // get reference to all 5 states of plugin
      const entranceWindowBlock = document.querySelector(".entrance-window");
      const fetchingStateBlock = document.querySelector(".fetching-state");
      const candidateInfoBlock = document.querySelector(".candidate-info");
      const successBlock = document.querySelector(".add-success");

      //listen to loginBtn on init
      const loginBtn = document.querySelector(".login-btn");
      loginBtn.addEventListener("click", () => {
        const env = utils.getEnvQueryParam(document.location.href);
        window.open(`https://helper.${env ? env + "." : ""}${utils.DOMAIN}/login`);
        triggerAppearance();
      });

      chrome.runtime.onMessage.addListener(async (message) => {
        const { type } = message;
        // TOKEN_INFO -- listening for token info appearance in cookie storage
        if (type === "TOKEN_INFO") {
          // adding some animation for loading time before hiding cta-btn
          const ctaBtn = document.querySelector(".cta-button");
          ctaBtn.classList.add("fetching-btn-state");

          // prepeare view before opening plugin window based on token in cookies
          entranceWindowBlock.classList.add("hide");
          fetchingStateBlock.classList.add("hide");
          candidateInfoBlock.classList.add("hide");
          setToken(message);
          if (!token) {
            triggerUserInfoBlockAppearance(false);
            entranceWindowBlock.classList.remove("hide");
          } else {
            hasAtsAccess = await utils.checkAccess(token, utils.getEnvQueryParam(document.location.href));
            if (!hasAtsAccess) {
              triggerUserInfoBlockAppearance(false);
              entranceWindowBlock.classList.remove("hide");
            } else if (!currentCandidate) {
              triggerUserInfoBlockAppearance(true);
              fetchingStateBlock.classList.remove("hide");
            } else {
              triggerUserInfoBlockAppearance(true);
              candidateInfoBlock.classList.remove("hide");
            }
          }
          chrome.runtime.sendMessage({
            type: "VIEW_READY",
          });
        }
        if (type === "TRIGGER_PLUGIN") {
          triggerAppearance();
          prefillCandidateInfo();
        }
        if (type === "ICON_CLICKED") {
          const successBlock = document.querySelector(".add-success");
          if (!successBlock.classList.contains("hide") && isPluginWindowOpen) {
            hideSuccess();
          }
          proceedPLuginTriggered();
        }

        if (type === "READY_TO_SUBMIT") {
          setToken(message);
          await sumbitCandidate();
        }

        // trigger currentCandidate changes events
        document.addEventListener("formUtilsMessage", function (event) {
          onFormUtilsMessageEvent(event.detail);
        });

        document.addEventListener("resumeChangeMessage", function (event) {
          onResumeChangeMessageEvent(event.detail);
        });

        // USE FOR LOGGING DATA FROM BACKGROUND CONTEXT
        if (type === "LOGGING_DATA_TO_CONSOLE") {
          console.log(message);
        }
      });

      const ctaBtn = document.querySelector(".cta-button");
      ctaBtn.addEventListener("click", () => {
        proceedPLuginTriggered();
      });

      const closeOnEntranceButton = document.querySelector(".close-on-entrance-plugin-btn");
      closeOnEntranceButton.addEventListener("click", () => {
        proceedPLuginTriggered();
      });

      const generalCloseButton = document.querySelector(".close-plugin-btn");
      generalCloseButton.addEventListener("click", () => {
        proceedPLuginTriggered();

        // condition of click on close when we are on success page
        if (!successBlock.classList.contains("hide")) {
          hideSuccess();
        }
      });

      listenToClose();
    })
    .catch((error) => console.error(error));

  // changing view ==> hide cta and show plugin / show cta and hide plugin
  const triggerAppearance = () => {
    isPluginWindowOpen = !isPluginWindowOpen;
    const ctaBtn = document.querySelector(".cta-button");
    const pluginWindow = document.querySelector(".plugin-window");

    ctaBtn.classList.toggle("hide");
    pluginWindow.classList.toggle("hide");

    // delete animation from cta button on plugin window open
    if (!isPluginWindowOpen) {
      ctaBtn.classList.remove("fetching-btn-state");
    }

    // corner case if plugin was opened on olx apply page before apply info was rendered in view
    // changing currentCandidate to null so that form prefilling will be triggered again
    if (!isPluginWindowOpen && !currentCandidate?.name) {
      currentCandidate = null;
    }
  };

  const hideSuccess = () => {
    const candidateInfoBlock = document.querySelector(".candidate-info");
    const successBlock = document.querySelector(".add-success");
    candidateInfoBlock.classList.remove("hide");
    successBlock.classList.add("hide");
  };

  function proceedPLuginTriggered() {
    const env = utils.getEnvQueryParam(document.location.href);
    !isPluginWindowOpen
      ? chrome.runtime.sendMessage({
          type: "GET_JWT_TOKEN",
          env,
        })
      : triggerAppearance();
  }

  async function prefillCandidateInfo() {
    if (token) {
      const userInfo = utils.parseJwt(token);
      const userName = userInfo.CompanyName;
      const companyName = userInfo.UserName;
      const company = document.querySelector(".user-company");
      company.innerText = companyName + ", ";
      const user = document.querySelector(".user-name");
      user.innerText = userName;
    }

    if (!hasAtsAccess || !token) {
      return;
    }
    // CHECK IF NEEDED
    triggerUserInfoBlockAppearance(!!token);

    if (!currentCandidate) {
      currentCandidate = {};

      // SPLIT BY URL CONDITION
      // WORK RESUME PAGE
      if (workUrlMatch) {
        await workResumePageHelpers.onWorkResumePageScenario(token);
      }
      // OLX RESUME PAGE
      if (olxResumeUrlMatch) {
        await olxResumePageHelpers.onOlxResumePageScenario(currentCandidate, token);
      }

      // OLX APPLY PAGE
      if (olxApplyUrlMatch) {
        await olxApplyPageHelpers.onOlxApplyPageScenario(currentCandidate, token);
      }
      console.log(currentCandidate);

      if (
        (!currentCandidate.phones || !currentCandidate.phones.length) &&
        (!currentCandidate.emails || !currentCandidate.emails.length)
      ) {
        const noContactsWarning = document.querySelector(".no-contacts-on-page");
        noContactsWarning.classList.remove("hide");
        highlightInput();
      }

      const select = document.querySelector(".ats-destination-select");
      const notPicked = document.querySelector("#destinationNotPicked");
      select.addEventListener("change", () => {
        notPicked.classList.add("hide");
      });

      const candidateForm = document.querySelector(".candidate-form");
      candidateForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        sendSubmitRequestMessage();
      });
      onCandidateFound();
    }
  }

  function sendSubmitRequestMessage() {
    const env = utils.getEnvQueryParam(document.location.href);
    // sending message to catch it in background.js and check ats accessibility
    chrome.runtime.sendMessage({
      type: "SUBMIT_REQUEST",
      env,
    });
  }

  async function sumbitCandidate() {
    const notPicked = document.querySelector("#destinationNotPicked");
    const candidateForm = document.querySelector(".candidate-form");
    const noContactsWarning = document.querySelector(".no-contacts-on-page");

    hasNoContactsError = false;
    hasAtsDestinationError = false;
    hasCandidateEmailError = false;
    hasCandidatePhoneError = false;

    const incorrectEmail = document.querySelector("#incorrectEmail");
    const incorrectPhone = document.querySelector("#incorrectPhone");
    const formValue = utils.getFormValue(candidateForm);

    // checking validity
    if (!formValue["ats-destination"]) {
      hasAtsDestinationError = true;
      notPicked.classList.remove("hide");
    }

    if (!formValue["candidate-phones"] && !formValue["candidate-emails"]) {
      hasNoContactsError = true;
      noContactsWarning.classList.remove("hide");
      highlightInput();
    }

    if (!!formValue["candidate-emails"] && !EMAIL_PATTERN.test(formValue["candidate-emails"])) {
      hasCandidateEmailError = true;
      incorrectEmail.classList.remove("hide");
    }

    if (!!formValue["candidate-phones"] && !PHONE_PATTERN.test(cleanedUpPhoneValue(formValue["candidate-phones"]))) {
      hasCandidatePhoneError = true;
      incorrectPhone.classList.remove("hide");
    }

    if (!hasCandidateEmailError) {
      incorrectEmail.classList.add("hide");
    }

    if (!hasCandidatePhoneError) {
      incorrectPhone.classList.add("hide");
    }

    if (!hasNoContactsError) {
      noContactsWarning.classList.add("hide");
    }

    if (hasNoContactsError || hasCandidateEmailError || hasCandidatePhoneError || hasAtsDestinationError) {
      return;
    }

    const submitInput = getInputForCandidateImport(formValue);

    const cta = document.querySelector(".add-candidate-cta");
    cta.classList.add("processing");
    const result = await utils.addCandidate({ ...submitInput }, utils.getEnvQueryParam(document.location.href), token);

    if (!result?.ok && (result?.status === 403 || result?.status === 401)) {
      hasAtsAccess = false;
      const candidateInfoBlock = document.querySelector(".candidate-info");
      const entranceWindowBlock = document.querySelector(".entrance-window");

      triggerUserInfoBlockAppearance(false);
      candidateInfoBlock.classList.add("hide");
      entranceWindowBlock.classList.remove("hide");
      cta.classList.remove("processing");
      return;
    }

    if (!!result && result instanceof Object) {
      const nameContainer = document.querySelector(".added-candidate-name");
      nameContainer.innerHTML = result.candidate?.fullName;
      const goToCandidate = document.querySelector(".go-to-candidate-link");
      goToCandidate.href = result.candidate?.url;
      const successBlock = document.querySelector(".add-success");
      const candidateInfoBlock = document.querySelector(".candidate-info");
      successBlock.classList.remove("hide");
      candidateInfoBlock.classList.add("hide");
    } else {
      const errorOnAdding = document.querySelector("#errorOnAdding");
      errorOnAdding.classList.remove("hide");
    }
    cta.classList.remove("processing");
  }

  function listenToClose() {
    const closeBtn = document.querySelector(".close-on-success-btn");
    closeBtn.addEventListener("click", async () => {
      hideSuccess();
      triggerAppearance();
      if (!isInDataBase) {
        isInDataBase = true;
        await formUtils.patchSelectWithProjects(currentCandidate.phones, currentCandidate.emails);
      }
    });
  }

  function triggerUserInfoBlockAppearance(shouldOpen) {
    const info = document.querySelector(".ats-user-info");
    shouldOpen ? info.classList.remove("hide") : info.classList.add("hide");
  }

  function onCandidateFound() {
    const fetchingStateBlock = document.querySelector(".fetching-state");
    fetchingStateBlock.classList.add("hide");
    const candidateInfoBlock = document.querySelector(".candidate-info");
    candidateInfoBlock.classList.remove("hide");
  }

  function highlightInput() {
    const email = document.querySelector("#candidateInfoEmail");
    const phone = document.querySelector("#candidateInfoPhone");
    email.classList.add("highlighting-input");
    phone.classList.add("highlighting-input");
    email.addEventListener("animationend", (e) => {
      if (e.animationName === "highlighting") {
        email.classList.remove("highlighting-input");
      }
    });
    phone.addEventListener("animationend", (e) => {
      if (e.animationName === "highlighting") {
        phone.classList.remove("highlighting-input");
      }
    });
  }

  function setToken(message) {
    token = message.jwtToken ? "Bearer " + message.jwtToken : null;
  }

  function cleanedUpPhoneValue(input) {
    return input.replace(/[\(\)\+\s-]/gm, "");
  }

  const getInputForCandidateImport = (formValue) => {
    const { text, resumePhotoLink, resumeTitle } = currentCandidate;
    const baseInput = {
      fullName: formValue["candidate-name"]?.length ? formValue["candidate-name"] : null,
      phones: [cleanedUpPhoneValue(formValue["candidate-phones"])],
      emails: [formValue["candidate-emails"]],
      ...(formValue["ats-destination"] === "db" ? {} : { projectId: formValue["ats-destination"] }),
      ...(resumePhotoLink ? { photoUrl: resumePhotoLink } : {}),
      ...(resumeTitle ? { position: resumeTitle } : {}),
      ...(text ? { text } : {}),
      ...(currentResumeId ? { id: currentResumeId } : {}),
    };

    if (workUrlMatch) {
      const source = "Work";
      return { ...baseInput, source };
    }
    if (olxResumeUrlMatch || olxApplyUrlMatch) {
      const source = "Olx";
      const externalUrl = window.location.href;
      return { ...baseInput, source, externalUrl };
    }
  };

  const onFormUtilsMessageEvent = (data) => {
    if (!data) {
      return;
    }
    const { name, phones, emails } = data;
    switch (true) {
      case !!name:
        if (currentCandidate?.name !== name) {
          currentCandidate.name = name;
        }
        break;
      case !!phones:
        currentCandidate.phones = phones;
        break;
      case !!emails:
        currentCandidate.emails = emails;
        break;
    }
  };

  const onResumeChangeMessageEvent = (data) => {
    if (!data) {
      return;
    }
    const { text, resumeId, resumePhotoLink, resumeTitle } = data;
    switch (true) {
      case !!text:
        currentCandidate.text = text;
        break;
      case !!resumeId:
        currentResumeId = resumeId;
        break;
      case !!resumePhotoLink:
        currentCandidate.resumePhotoLink = resumePhotoLink;
        break;
      case !!resumeTitle:
        currentCandidate.resumeTitle = resumeTitle;
        break;
    }
  };
})();
