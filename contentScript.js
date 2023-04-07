(() => {
  let currentResumeId = "";
  let resumeContainer = null;

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    console.log(obj)
    console.log(sender)
    const { type, resumeId } = obj;
    if (type === "SEND") {
      currentResumeId = resumeId;
      newResumeOpened(currentResumeId);
    }
    if (type === "LOGOUT") {
      const btn = document.querySelector(".add-candidate-btn");
      btn?.remove();
    }
  });

  const getStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (v) => {
        resolve(v);
      });
    });
  };

  // retrieve resume
  // left for further implementation
  const getResumeFromStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get([currentResumeId], (obj) => {
        resolve(obj[currentResumeId] ? JSON.parse(obj[currentResumeId]) : null);
      });
    });
  };

  const newResumeOpened = async (resumeId) => {
    // resumeInStorage left for further implementation
    const resumeInStorage = await getResumeFromStorage();
    const currentResumeContainer = document.getElementById(
      `resume_${resumeId}`
    );
    console.log({currentResumeContainer})

    if (
      currentResumeContainer &&
      !document.querySelector(".add-candidate-btn")
    ) {
      resumeContainer = currentResumeContainer;
      const addCandidateBtn = document.createElement("img");

      addCandidateBtn.src = chrome.runtime.getURL("assets/send.png");
      addCandidateBtn.className = "add-candidate-btn";
      addCandidateBtn.title = "натисніть, щоб додати кандидата до ats";
      // resumeContainer.prepend(addCandidateBtn); -- used it previously, now appending to body
      // left for further consideration based on design of CTA
      document.body.prepend(addCandidateBtn)
      addCandidateBtn.addEventListener("click", async () => {
        addCandidateBtn.classList.add('processing')
        const resume = getCandidateInfo(resumeContainer);
        const valueForStorage = { resumeId, resumeText: resume.text };

        chrome.storage.local.set({
          [resumeId]: JSON.stringify(valueForStorage),
        });
        const storage = await getStorage();
        const input = {
          ...valueForStorage,
          token: "Bearer " + storage.atsToken,
        };

        const src = chrome.runtime.getURL("utils.js");
        const utils = await import(src);
        const result = await utils.addCandidate(input);

        console.log(result);
        addCandidateBtn.classList.remove('processing')
        // from this moment --  we will try to send resume to api to be added to ats
        // in case of success
        // -- will maybe use chrome.storage.local.remove(resumeId)
        // -- or check for existence resumeId in storage and if present -- show some notification before api call
      });
    }
  };

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
  // uncomment if newResumeOpened should be called on new 'work.ua/resumes/...' page open
  // left for further consideration based on requirements
  // newResumeOpened(currentResumeId)
})();
