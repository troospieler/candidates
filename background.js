const NEW_DOMAIN = "robota.ua";
const OLD_DOMAIN = "rabota.ua";

chrome.action.onClicked.addListener(async (tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "ICON_CLICKED" });
});

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (message) => {
    const { env } = message;
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);

    if (message.type === "GET_JWT_TOKEN") {
      proceedActionWithCookie(tab.id, env, "retrieve");
    }

    if (message.type === "VIEW_READY") {
      chrome.tabs.sendMessage(tab.id, {
        type: "TRIGGER_PLUGIN",
      });
    }

    if (message.type === "SUBMIT_REQUEST") {
      proceedActionWithCookie(tab.id, env, "refresh");
    }
  });
});

function proceedActionWithCookie(id, env, actionType) {
  const cookieSettingsByNewDomain = {
    url: `https://${env ? env + "." : ""}${NEW_DOMAIN}`,
    name: "jwt-token",
  };
  const cookieSettingsByOldDomain = {
    url: `https://${env ? env + "." : ""}${OLD_DOMAIN}`,
    name: "jwt-token",
  };
  chrome.cookies.get(cookieSettingsByNewDomain, (newDomainCookie) => {
    if (!newDomainCookie) {
      chrome.cookies.get(cookieSettingsByOldDomain, (oldDomainCookie) => {
        sendLoggingDataMessageToTab(id, oldDomainCookie);
        sendCookieMessageToTab(id, oldDomainCookie, env, actionType);
      });
    } else {
      sendCookieMessageToTab(id, newDomainCookie, env, actionType);
    }
  });
}

function isCookieApplicable(env, domain) {
  if (!domain) {
    return false;
  }
  //prod
  if (!env && domain.startsWith(".")) {
    return true;
  }
  //other
  return domain.startsWith("." + env);
}

function sendCookieMessageToTab(id, cookie, env, actionType) {
  const isApplicable = isCookieApplicable(env, cookie ? cookie.domain : null);
  let type;
  switch (actionType) {
    case "retrieve":
      type = "TOKEN_INFO";
      break;
    case "refresh":
      type = "READY_TO_SUBMIT";
      break;
  }
  chrome.tabs.sendMessage(id, {
    type,
    jwtToken: cookie && isApplicable ? cookie.value : null,
  });
}

// USE FOR LOGGING DATA FROM BACKGROUND CONTEXT TO BROWSER CONSOLE
function sendLoggingDataMessageToTab(id, data) {
  chrome.tabs.sendMessage(id, {
    type: "LOGGING_DATA_TO_CONSOLE",
    data,
  });
}
