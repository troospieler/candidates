import { getTab, getAllTabs, loginToAts, proceedErrors } from "./utils.js";

const sendMessage = async (resumeId) => {
  const tab = await getTab();
  chrome.tabs.sendMessage(tab.id, {
    type: "SEND",
    resumeId,
  });
};

const sendLogout = async () => {
  const tabs = await getAllTabs();
  console.log(tabs);
  tabs.forEach((tab) =>
    chrome.tabs.sendMessage(tab.id, {
      type: "LOGOUT",
    })
  );
};

const showLogoutBlock = (resumeId) => {
  const logoutContainer = document.querySelector("#logOut");
  logoutContainer.style.display = "block";
  const logoutTitle = document.querySelector(".logout-title");
  logoutTitle.innerHTML = "Ви в системі";
  const logoutText = document.querySelector(".logout-text");
  logoutText.innerHTML = "Вийти";

  sendMessage(resumeId);

  const logoutBtn = document.querySelector("#logoutBtn");
  logoutBtn.addEventListener("click", () => {
    chrome.storage.local.remove("atsToken", async () => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      } else {
        logoutContainer.classList.add("processing");
        await sendLogout();
        window.close();
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const currentTab = await getTab();
  // CHECK IF CANDIDATE EXISTS --> by getting contacts from ui
  if (currentTab.url.includes("work.ua/resumes/")) {
    const firstPart = currentTab.url.split("resumes/")[1]
    const id = firstPart.slice(0, firstPart.indexOf('/'));

    const form = document.querySelector("#loginForm");
    const formTitle = document.querySelector(".form-title");
    formTitle.innerHTML = "Логін в ats";
    const loginBtn = document.querySelector(".login-btn");
    loginBtn.innerHTML = "Логін";

    chrome.storage.local.get("atsToken", (data) => {
      const token = data["atsToken"];
      if (!token && form instanceof HTMLElement) {
        form.style.display = "block";
        form.addEventListener("submit", async (event) => {
          event.preventDefault();

          form.classList.add("processing");
          const formData = new FormData(form);
          const input = {};
          for (var [key, value] of formData.entries()) {
            input[key] = value;
          }
          console.log(input)
          const loginResponse = await loginToAts(input);
          console.log(loginResponse)
          const token =
            loginResponse?.data?.login?.loginResult?.bearerToken ?? null;
          if (token) {
            form.style.display = "none";
            chrome.storage.local.set({
              atsToken: token,
            });
            showLogoutBlock(id);
          } else {
            //implement errors handling
            proceedErrors(loginResponse?.data?.login?.errors ?? null);
          }

          form.classList.remove("processing");
        });
      } else {
        showLogoutBlock(id);
      }
    });
  } else {
    const container = document.querySelector(".container");

    container.innerHTML =
      '<div class="title">Перейдіть на сторінку резюме на бажаному ресурсі</div>';
  }
});
