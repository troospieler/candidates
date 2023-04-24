(async () => {
  let currentResumeId = "";
  let resumeContainer = null;
  let isResumeFound = false;
  let currentCandidate = null;
  let token = null;
  let hasCandidateEmailError = false;
  let hasAtsDestinationError = false;
  let isInDataBase = false;
  let isMain = false;
  // const PHONE_PATTERN =
  //   /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
  const EMAIL_PATTERN = /^[\w-]+[_.\-\w]*@\w+([.-]?\w+)*(\.\w{2,15})+$/;

  // get access to utils methods
  const src = chrome.runtime.getURL("utils.js");
  const utils = await import(src);

  //injecting popup.html to current web page
  await fetch(chrome.runtime.getURL("popup.html"))
    .then((response) => response.text())
    .then((html) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("plugin-window-wrapper");
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);
    })
    .catch((error) => console.error(error));

  // changing view ==> hide cta and show plugin / show cta and hide plugin
  const triggerAppearance = () => {
    const ctaBtn = document.querySelector(".cta-button");
    const pluginWindow = document.querySelector(".plugin-window");

    ctaBtn.classList.toggle("hide");
    pluginWindow.classList.toggle("hide");
  };

  const hideSuccess = () => {
    const candidateInfoBlock = document.querySelector(".candidate-info");
    const successBlock = document.querySelector(".add-success");
    candidateInfoBlock.classList.remove("hide");
    successBlock.classList.add("hide");
  };

  // listening for events to trigger actions
  chrome.runtime.onMessage.addListener((message) => {
    const { type } = message;
    if (type === "ICON_CLICKED") {
      triggerAppearance();
      onPluginOpen();
    }
    if (type === "LOGOUT") {
      //if logout will be necessary use this message event
    }
  });

  //waiting for dom to bo loaded and then implement logic
  document.addEventListener("DOMContentLoaded", async () => {
    const tokenFromStorage = utils.localstorageToken();
    token = tokenFromStorage ?? null;

    // get reference to all 4 states of plugin
    const entranceWindowBlock = document.querySelector(".entrance-window");
    const fetchingStateBlock = document.querySelector(".fetching-state");
    const candidateInfoBlock = document.querySelector(".candidate-info");
    const successBlock = document.querySelector(".add-success");

    const firstPart = document.location.href.split("resumes/")[1];
    currentResumeId = firstPart.slice(0, firstPart.indexOf("/"));

    // INITIALIZING VIEW ON PAGE START
    if (!token) {
      entranceWindowBlock.classList.remove("hide");
    } else if (!currentCandidate) {
      fetchingStateBlock.classList.remove("hide");
    } else {
      candidateInfoBlock.classList.remove("hide");
    }

    //listening for cta button click to show popup and implement logic
    const ctaBtn = document.querySelector(".cta-button");
    ctaBtn.addEventListener("click", () => {
      triggerAppearance();
      onPluginOpen();
    });

    const closeOnEntranceButton = document.querySelector(
      ".close-on-entrance-plugin-btn"
    );
    closeOnEntranceButton.addEventListener("click", () => {
      triggerAppearance();
    });

    const generalCloseButton = document.querySelector(".close-plugin-btn");
    generalCloseButton.addEventListener("click", () => {
      triggerAppearance();
      // condition of click on close when we are on success page
      if (!successBlock.classList.contains("hide")) {
        hideSuccess();
      }
    });

    listenToClose();
  });

  function onPluginOpen() {
    if (token) {
      prefillCandidateForm(currentResumeId);
    } else {
      const loginForm = document.querySelector("#loginForm");
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        loginForm.classList.add("processing");
        const credentialsError = document.querySelector(".invalid-creds");
        credentialsError.classList.add("hide");
        const input = utils.getFormValue(loginForm);
        const loginResponse = await utils.login(document.location.href, input);
        const token =
          loginResponse?.data?.login?.loginResult?.bearerToken ?? null;
        if (token) {
          const tokenValueForStorage = `Bearer ${token}`;
          localStorage.setItem("atsToken", tokenValueForStorage);
          const entranceWindowBlock =
            document.querySelector(".entrance-window");
          entranceWindowBlock.classList.add("hide");
          const fetchingStateBlock = document.querySelector(".fetching-state");
          fetchingStateBlock.classList.remove("hide");
          prefillCandidateForm(currentResumeId);
        } else {
          const errors = loginResponse?.data?.login?.errors ?? [];
          if (
            errors.length &&
            errors.find(
              (errorItem) =>
                errorItem.__typename === "CredentialsAreInvalidError"
            )
          ) {
            credentialsError.classList.remove("hide");
          }
        }

        loginForm.classList.remove("processing");
      });
    }
  }

  async function prefillCandidateForm(resumeId) {
    if (!currentCandidate) {
      resumeContainer = await utils.getWorkResumeContainer(resumeId);
      const resume = getCandidateInfo(resumeContainer);
      if (resume && !isResumeFound) {
        isResumeFound = true;

        currentCandidate = {};
        currentCandidate.text = resume.text;

        const name =
          document.querySelector(`#resume_${resumeId} div.row div h1`)
            ?.innerText ?? null;
        if (name) {
          currentCandidate.name = name;
          const candidateName = document.querySelector("#candidateInfoName");
          if (candidateName && candidateName instanceof HTMLInputElement) {
            candidateName.value = name;
          }
        }

        const contacts = resume?.children?.find(
          (el) =>
            el.text.toLowerCase().includes("телефон") ||
            el.text.toLowerCase().includes("пошта")
        )?.children;
        if (contacts) {
          const phone = contacts.find((el) =>
            el.text.toLowerCase().includes("телефон")
          );
          if (phone) {
            const indexOfPhone = contacts.indexOf(phone);
            const phoneNumber =
              typeof indexOfPhone === "number"
                ? contacts[indexOfPhone + 1].text
                : null;
            const phoneInput = document.querySelector("#candidateInfoPhone");
            if (phoneInput && phoneInput instanceof HTMLInputElement) {
              phoneInput.value = phoneNumber;
            }
            currentCandidate.phones = [phoneNumber];
          }
          const email = contacts.find((el) =>
            el.text.toLowerCase().includes("пошта")
          );
          if (email) {
            const indexOfEmail = contacts.indexOf(email);
            const emailValue =
              typeof indexOfEmail === "number"
                ? contacts[indexOfEmail + 1].text
                : null;
            const emailInput = document.querySelector("#candidateInfoEmail");
            if (emailInput && emailInput instanceof HTMLInputElement) {
              emailInput.value = emailValue;
            }
            currentCandidate.emails = [emailValue];
          }
        }

        token = utils.localstorageToken() ?? null;
        if (token) {
          const userInfo = utils.parseJwt(token);
          isMain = userInfo.RoleId === "1";
          const userName = userInfo.CompanyName;
          const companyName = userInfo.UserName;
          const company = document.querySelector(".user-company");
          company.innerText = companyName + ", ";
          const user = document.querySelector(".user-name");
          user.innerText = userName;
          const info = document.querySelector(".ats-user-info");
          info.classList.remove("hide");
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
          hasAtsDestinationError = false;
          hasCandidateEmailError = false;

          const obligatoryEmail = document.querySelector("#obligatoryEmail");
          const incorrectEmail = document.querySelector("#incorrectEmail");

          const formValue = utils.getFormValue(candidateForm);

          // checking validity
          if (!formValue["ats-destination"]) {
            hasAtsDestinationError = true;
            notPicked.classList.remove("hide");
          }

          if (!formValue["candidate-emails"]) {
            hasCandidateEmailError = true;
            obligatoryEmail.classList.remove("hide");
            incorrectEmail.classList.add("hide");
          } else if (!EMAIL_PATTERN.test(formValue["candidate-emails"])) {
            hasCandidateEmailError = true;
            incorrectEmail.classList.remove("hide");
            obligatoryEmail.classList.add("hide");
          }

          if (!hasCandidateEmailError) {
            obligatoryEmail.classList.add("hide");
            incorrectEmail.classList.add("hide");
          }

          if (hasCandidateEmailError || hasAtsDestinationError) {
            return;
          }
          const submitInput = {
            source: "Work",
            id: currentResumeId,
            text: currentCandidate.text,
            fullName: formValue["candidate-name"]?.length
              ? formValue["candidate-name"]
              : null,
            phones: [formValue["candidate-phones"]],
            emails: [formValue["candidate-emails"]],
            ...(formValue["ats-destination"] === "db"
              ? {}
              : { projectId: formValue["ats-destination"] }),
          };

          const cta = document.querySelector(".add-candidate-cta");
          cta.classList.add("processing");
          const result = await utils.addCandidate(
            { ...submitInput },
            utils.getEnvQueryParam(document.location.href),
            token
          );

          if (result && !result.errors) {
            const nameContainer = document.querySelector(
              ".added-candidate-name"
            );
            nameContainer.innerHTML = result.parsedResume?.fullName;
            const goToCandidate = document.querySelector(
              ".go-to-candidate-link"
            );
            goToCandidate.href = result.candidate?.url;
            const successBlock = document.querySelector(".add-success");
            const candidateInfoBlock =
              document.querySelector(".candidate-info");
            successBlock.classList.remove("hide");
            candidateInfoBlock.classList.add("hide");
          } else {
            const errorOnAdding = document.querySelector("#errorOnAdding");
            errorOnAdding.classList.remove("hide");
          }
          cta.classList.remove("processing");
        });
        onCandidateFound();
      }
    }
  }

  async function patchSelectWithProjects(selectItem) {
    const appearance = await utils.getAtsAppearance(document.location.href, {
      token,
      phones: currentCandidate.phones,
      emails: currentCandidate.emails,
    });
    if (appearance) {
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
          projectAdditionalInfo.innerHTML =
            ", " + item.cityName + (isMain ? ", " + item.ownerName : "");
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

  function onCandidateFound() {
    const fetchingStateBlock = document.querySelector(".fetching-state");
    fetchingStateBlock.classList.add("hide");
    const candidateInfoBlock = document.querySelector(".candidate-info");
    candidateInfoBlock.classList.remove("hide");
  }

  const getCandidateInfo = (element = resumeContainer) => {
    if (element && element instanceof HTMLElement) {
      const data = {
        tag: element.tagName.toLowerCase(),
        text: element.innerText
          ? element.innerText.replace(/\t|\s{3,}/gm, "  ").trim()
          : "",
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
})();
