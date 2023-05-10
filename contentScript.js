(async () => {
  const currentUrl = window.location.href;

  const workUrlMatch = currentUrl.match(/^https:\/\/www\.work\.ua(\/\w{0,})?\/resumes\/(\d+)\/?(?:\?.*)?$/);

  const olxResumeUrlMatch = currentUrl.match(/^https:\/\/www\.olx\.ua((\/\w{0,}){1,})?\/obyavlenie\/\w{1,}/);
  const olxApplyUrlMatch = currentUrl.match(/^https:\/\/www\.olx\.ua((\/\w{0,}){1,})?\/myaccount\/ep\/ad\/[\w\/]{1,}/);
  // const olxApplyUrlMatch = currentUrl.match(/^https:\/\/www\.olx\.ua((\/\w{0,}){1,})?\/myaccount\/ep\/ad\/\w{1,}\/\?applicationId.{1,}/);

  // ADD MATCH FOR OTHER PLATFORMS
  // NEXT IN LINE -- OLX.UA

  // prevent plugin open/functionality if not correct url
  if (!workUrlMatch && !olxResumeUrlMatch && !olxApplyUrlMatch) {
    return;
  }

  let currentResumeId = null;
  let resumeContainer = null;
  // let isResumeFound = false;
  let currentCandidate = null;
  let token = null;
  let hasNoContactsError = false;
  let hasCandidateEmailError = false;
  let hasAtsDestinationError = false;
  let hasCandidatePhoneError = false;
  let isInDataBase = false;
  let isMain = false;
  let isPluginWindowOpen = false;
  let hasAtsAccess = true;

  const PHONE_PATTERN = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  const EMAIL_PATTERN = /^[\w-]+[_.\-\w]*@\w+([.-]?\w+)*(\.\w{2,15})+$/;

  // get access to utils methods
  const utilsSrc = chrome.runtime.getURL("utils.js");
  const utils = await import(utilsSrc);

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
          prefillCandidateForm(currentResumeId);
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
        // USING FOR LOGGING DATA FROM BACKGROUND CONTEXT
        if (type === "LOGGING_DATA_TO_CONSOLE") {
          console.log(message);
        }
      });

      // currentResumeId by url
      if (workUrlMatch) {
        const firstPartOfUrl = document.location.href.split("resumes/")[1];
        currentResumeId = firstPartOfUrl.slice(0, firstPartOfUrl.indexOf("/"));
      }

      //listening for cta button click to show popup and implement logic
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

  async function prefillCandidateForm(resumeId) {
    if (token) {
      const userInfo = utils.parseJwt(token);
      isMain = userInfo.RoleId === "1";
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
        resumeContainer = utils.getWorkResumeContainer(resumeId);
        const resume = getCandidateInfo(resumeContainer);
        if (resume) {
          currentCandidate.text = resume.text;
          const name = document.querySelector(`#resume_${resumeId} div.row div h1`)?.innerText ?? null;
          prefillCandidateNameValue(name);

          const contacts = resume?.children?.find((el) => phonesInResume(el) || emailsInResume(el))?.children;
          if (contacts) {
            const phone = contacts.find((el) => phonesInResume(el));
            if (phone) {
              const indexOfPhone = contacts.indexOf(phone);
              const phoneNumber = typeof indexOfPhone === "number" ? contacts[indexOfPhone + 1].text : null;
              prefillCandidatePhoneValue(phoneNumber);
            }
            const email = contacts.find((el) => emailsInResume(el));
            if (email) {
              const indexOfEmail = contacts.indexOf(email);
              const emailValue = typeof indexOfEmail === "number" ? contacts[indexOfEmail + 1].text : null;
              const emailInput = document.querySelector("#candidateInfoEmail");
              if (emailInput && emailInput instanceof HTMLInputElement) {
                emailInput.value = emailValue;
              }
              currentCandidate.emails = [emailValue];
            }
          }
        }
      }
      // OLX RESUME PAGE
      if (olxResumeUrlMatch) {
        const descriptionHeaderText = "ОПИС";

        const descriptionHeader = Array.from(document.querySelectorAll("h3:not([hidden])")).find((el) =>
          el.innerText.includes(descriptionHeaderText)
        );

        if (descriptionHeader) {
          const nextElement = descriptionHeader.nextElementSibling;
          const textContent = nextElement ? nextElement.innerText.trim() : "";
          currentCandidate.text = textContent;
          extractEmails(currentCandidate.text);
        }
        const nameContainer = document.querySelector("a[data-testid='user-profile-link'][name='user_ads'] h4");
        const name = nameContainer.innerText;
        prefillCandidateNameValue(name);

        //check if email is being found by Adam to know if parsing email in text is needed

        patchPhoneInputValue();

        // uncomment if open phone action should be applied on plugin open
        // const button = document.querySelector('[data-testid="show-phone"]');
        // button.click()
      }

      // OLX APPLY PAGE
      if (olxApplyUrlMatch) {
        prefillFormWithApplyInfo();
        const apply = document.querySelector('article[data-testid="application-details"]');
        if (apply) {
          const observer = new MutationObserver((mutationsList) => {
            let initialValue = "";
            const possiblePhoneWords = ["Номер телефону", "Номер телефона"];
            const possibleEmailWords = ["Электронная почта", "Електронна пошта"];
            for (const mutation of mutationsList) {
              if (
                (mutation.type === "childList" &&
                  (possiblePhoneWords.find((item) => mutation.target.innerText.includes(item)) ||
                    possibleEmailWords.find((item) => mutation.target.innerText.includes(item)))) ||
                mutation.type === "characterData"
              ) {
                if (!!mutation.target.innerText && mutation.target.innerText !== initialValue) {
                  initialValue = mutation.target.innerText;
                }
                prefillFormWithApplyInfo();
              }
            }
          });
          const config = {
            childList: true,
            subtree: true,
            characterData: true,
            // attributes: true,
          };
          observer.observe(apply, config);
        }
      }

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

      await patchSelectWithProjects(select);

      const candidateForm = document.querySelector(".candidate-form");
      candidateForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        sendSubmitRequestMessage();
      });
      onCandidateFound();
      // resumeContainer = getResumeContainerByCurrentUrlMatch(resumeId)
      // const resume = getCandidateInfo(resumeContainer);
      // if (resume) { // && !isResumeFound

      //   isResumeFound = true;

      //   currentCandidate = {};
      //   currentCandidate.text = resume.text;

      //   const name =
      //     document.querySelector(`#resume_${resumeId} div.row div h1`)
      //       ?.innerText ?? null;
      //   if (name) {
      //     currentCandidate.name = name;
      //     const candidateName = document.querySelector("#candidateInfoName");
      //     if (candidateName && candidateName instanceof HTMLInputElement) {
      //       candidateName.value = name;
      //     }
      //   }

      //   const contacts = resume?.children?.find(
      //     (el) => phonesInResume(el) || emailsInResume(el)
      //   )?.children;
      //   if (contacts) {
      //     const phone = contacts.find((el) => phonesInResume(el));
      //     if (phone) {
      //       const indexOfPhone = contacts.indexOf(phone);
      //       const phoneNumber =
      //         typeof indexOfPhone === "number"
      //           ? contacts[indexOfPhone + 1].text
      //           : null;
      //       const phoneInput = document.querySelector("#candidateInfoPhone");
      //       if (phoneInput && phoneInput instanceof HTMLInputElement) {
      //         phoneInput.value = phoneNumber;
      //       }
      //       currentCandidate.phones = [phoneNumber];
      //     }
      //     const email = contacts.find((el) => emailsInResume(el));
      //     if (email) {
      //       const indexOfEmail = contacts.indexOf(email);
      //       const emailValue =
      //         typeof indexOfEmail === "number"
      //           ? contacts[indexOfEmail + 1].text
      //           : null;
      //       const emailInput = document.querySelector("#candidateInfoEmail");
      //       if (emailInput && emailInput instanceof HTMLInputElement) {
      //         emailInput.value = emailValue;
      //       }
      //       currentCandidate.emails = [emailValue];
      //     }
      //   }

      //   if (
      //     (!currentCandidate.phones || !currentCandidate.phones.length) &&
      //     (!currentCandidate.emails || !currentCandidate.emails.length)
      //   ) {
      //     const noContactsWarning = document.querySelector(
      //       ".no-contacts-on-page"
      //     );
      //     noContactsWarning.classList.remove("hide");
      //     highlightInput();
      //   }

      //   const select = document.querySelector(".ats-destination-select");
      //   const notPicked = document.querySelector("#destinationNotPicked");
      //   select.addEventListener("change", () => {
      //     notPicked.classList.add("hide");
      //   });

      //   await patchSelectWithProjects(select);

      //   const candidateForm = document.querySelector(".candidate-form");
      //   candidateForm.addEventListener("submit", async (event) => {
      //     event.preventDefault();
      //     sendSubmitRequestMessage();
      //   });
      //   onCandidateFound();
      // }
    }
  }

  function sendSubmitRequestMessage() {
    const env = utils.getEnvQueryParam(document.location.href);
    // sending message to catch it in background.js
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

  async function patchSelectWithProjects(selectItem) {
    const appearance = await utils.getAtsAppearance(document.location.href, {
      token,
      phones: currentCandidate.phones,
      emails: currentCandidate.emails,
    });
    if (appearance instanceof Object && !!appearance && !!appearance.projects) {
      if (appearance.isExistsInCandidatesDatabase) {
        const inBase = document.querySelector(".already-in-base-notification");
        inBase.classList.remove("hide");
        const link = document.querySelector(".ats-in-base-link");
        link.href = appearance.candidateInDatabaseUrl;
      }
      if (Array.isArray(appearance.projects)) {
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

  function listenToClose() {
    const closeBtn = document.querySelector(".close-on-success-btn");
    const select = document.querySelector(".ats-destination-select");
    closeBtn.addEventListener("click", async () => {
      hideSuccess();
      triggerAppearance();
      if (!isInDataBase) {
        isInDataBase = true;
        const selectOptions = select.options;
        for (let i = selectOptions.length - 1; i >= 3; i--) {
          selectOptions[i].remove();
        }
        await patchSelectWithProjects(select);
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

  function phonesInResume(el) {
    const phonePossibleWordOptions = ["телефон", "phone"];
    return phonePossibleWordOptions.find((word) => el.text.toLowerCase().includes(word));
  }

  function emailsInResume(el) {
    const emailPossibleWordOptions = ["пошта", "почта", "email"];
    return emailPossibleWordOptions.find((word) => el.text.toLowerCase().includes(word));
  }

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

  const prefillCandidateNameValue = (name) => {
    if (name && currentCandidate.name !== name) {
      currentCandidate.name = name;
      const candidateName = document.querySelector("#candidateInfoName");
      if (candidateName && candidateName instanceof HTMLInputElement) {
        candidateName.value = name;
      }
    }
  };

  const patchPhoneInputValue = () => {
    const container = document.querySelector('[data-testid="phones-container"]');
    const phoneLink = document.querySelector('a[data-testid="contact-phone"]');
    const noContactsWarning = document.querySelector(".no-contacts-on-page");
    if (phoneLink) {
      const phoneNumber = phoneLink.innerText;
      noContactsWarning.classList.add("hide");
      prefillCandidatePhoneValue(phoneNumber);
    } else {
      const callback = function (mutationsList, observer) {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList" && mutation.addedNodes.length) {
            const phoneLinkAfterMutation = mutation.addedNodes[0].querySelector('a[data-testid="contact-phone"]');
            if (phoneLinkAfterMutation) {
              const phoneNumber = phoneLinkAfterMutation.innerText;
              noContactsWarning.classList.add("hide");
              prefillCandidatePhoneValue(phoneNumber);
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
  };

  const prefillCandidatePhoneValue = (phoneNumber) => {
    const phoneInput = document.querySelector("#candidateInfoPhone");
    if (phoneInput && phoneInput instanceof HTMLInputElement) {
      phoneInput.value = phoneNumber;
    }
    currentCandidate.phones = [phoneNumber];
  };

  const prefillCandidateEmailValue = (email) => {
    const emailInput = document.querySelector("#candidateInfoEmail");
    if (emailInput && emailInput instanceof HTMLInputElement) {
      emailInput.value = email;
    }
    currentCandidate.emails = [email];
  };

  const extractEmails = (text) => {
    const multiLineEmail = new RegExp(EMAIL_PATTERN, "gm");
    const multiLinePhone = new RegExp(PHONE_PATTERN, "gm");
    console.log(text.match(multiLineEmail));
    console.log(text.match(multiLinePhone));
    return text.match(multiLineEmail);
    // return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
  };

  const getInputForCandidateImport = (formValue) => {
    const baseInput = {
      id: currentResumeId,
      text: currentCandidate.text ?? "",
      fullName: formValue["candidate-name"]?.length ? formValue["candidate-name"] : null,
      phones: [cleanedUpPhoneValue(formValue["candidate-phones"])],
      emails: [formValue["candidate-emails"]],
      ...(formValue["ats-destination"] === "db" ? {} : { projectId: formValue["ats-destination"] }),
    };
    console.log(baseInput);

    if (workUrlMatch) {
      const source = "Work";
      return { ...baseInput, source };
    }
    if (olxResumeUrlMatch || olxApplyUrlMatch) {
      const source = "Olx";
      const externalUrl = currentUrl;
      return { ...baseInput, source, externalUrl };
    }
  };

  const prefillFormWithApplyInfo = () => {
    prefillCandidateNameValue(getOlxApplyApplicantName());
    const contactInfoContainer = document.querySelector(
      'article[data-testid="application-details"] div section dl[data-testid="profile-asic-info-grid"]'
    );
    const childrenArray = Array.from(contactInfoContainer?.children ?? []);
    const possiblePhoneWords = ["Номер телефону", "Номер телефона"];
    const possibleEmailWords = ["Электронная почта", "Електронна пошта"];
    const phone = childrenArray.find((el) => possiblePhoneWords.includes(el.innerText))?.nextElementSibling.innerText;
    if (typeof phone === "string" && phone !== (currentCandidate.phones ?? [])[0]) {
      prefillCandidatePhoneValue(phone);
    }
    const email = childrenArray.find((el) => possibleEmailWords.includes(el.innerText))?.nextElementSibling.innerText;
    if (typeof email === "string" && email !== (currentCandidate.emails ?? [])[0]) {
      prefillCandidateEmailValue(email);
    }
    const noContactsWarning = document.querySelector(".no-contacts-on-page");
    // (typeof phone === "string" && phone) || (typeof email === "string" && email)
    currentCandidate.name ? noContactsWarning.classList.add("hide") : noContactsWarning.classList.remove("hide");
  };

  const getOlxApplyApplicantName = () => {
    return (
      document.querySelector('article[data-testid="application-details"] div div h4[data-testid="application-title"]')
        ?.innerText ?? null
    );
  };
})();
