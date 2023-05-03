// chrome.tabs only available from popup.js script
// consider moving getTab() logic to popup.js
// and maybe move getAllTabs() logic to popup.js too

// export const DOMAIN = "robota.ua";
export const DOMAIN = "rabota.ua";

export async function getTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export async function getAllTabs() {
  let tabs = await chrome.tabs.query({
    url: ["https://www.work.ua/resumes/*", `https://${DOMAIN}/*`],
  });
  return tabs;
}

export function getEnvQueryParam(url) {
  return (
    url
      .split("?")[1]
      ?.split("&")
      ?.find((el) => el.startsWith("env="))
      ?.split("=")[1] ?? null
  );
}

export const checkAccess = async (token,env) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", token);
  var graphql = JSON.stringify({
    query: `
    mutation checkAccess {
      validateCurrentUser {
        user {
          id
          __typename
        }
        errors {
          ... on CompanyHasNoAccessToAtsError {
            message
            __typename
          }
          ... on UserHasNoAccessToAtsError {
            message
            __typename
          }
          __typename
        }
        __typename
      }
    }`,
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: graphql,
    redirect: 'follow'
  };

  try {
    const response = await fetch(
      `https://ats-api${env ? "." + env : ""}.${DOMAIN}/graphql/`,
      requestOptions
    );
    if (response.ok) {
      const result = await response.json();
      return !!result?.data?.validateCurrentUser?.user && !result?.data?.validateCurrentUser?.errors;
    } else {
      if (response.status === 403) {
        return false;
      } else {
        return null;
      }
    }
  } catch (error) {
    console.log("ERROR on CHECK ACCESS", error);
    return error;
  }
};

export const addCandidate = async (input, env, token) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", token);
  const raw = JSON.stringify({
    source: "Work",
    ...input,
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  try {
    const response = await fetch(
      `https://ats-api${env ? "." + env : ""}.${DOMAIN}/resume/import`,
      requestOptions
    );
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      if (response.status === 403) {
        return response;
      } else {
        return null;
      }
    }
  } catch (error) {
    console.log("ERROR on ADDING CANDIDATE", error);
    return error;
  }
};

export async function getAtsAppearance(url, input) {
  const env = getEnvQueryParam(url);
  const { phones, emails, token } = input;
  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", token);

  const getString = (arr, prefix) => {
    return (arr ?? []).reduce(
      (acc, item) => `${acc}${acc.length ? "&" : ""}${prefix}=${item}`,
      ""
    );
  };

  const emailsString = getString(emails, "emails");
  const phonesString = getString(phones, "phones");
  const query = `?${emailsString}${
    phonesString.length ? `&${phonesString}` : ""
  }`;

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  try {
    const response = await fetch(
      `https://ats-api${
        env ? "." + env : ""
      }.${DOMAIN}/candidate/connections/${query}`,
      requestOptions
    );
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.log("ERROR on GETTING PROJECTS", error);
    return null;
  }
}

export const getWorkResumeContainer = (resumeId) => {
  return document.getElementById(`resume_${resumeId}`);
};

export function parseJwt(userToken) {
  var base64Url = userToken.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  // console.log(JSON.parse(jsonPayload));
  return JSON.parse(jsonPayload);
}

export function getFormValue(formElement) {
  const formData = new FormData(formElement);
  const formValue = {};
  for (var [key, value] of formData.entries()) {
    formValue[key] = value;
  }
  return formValue;
}

//DELETE LOGIN
// export const login = async (url, input) => {
//   const env = getEnvQueryParam(url);
//   const myHeaders = new Headers();
//   myHeaders.append("Content-Type", "application/json");

//   const raw = JSON.stringify({
//     operationName: "login",
//     variables: {
//       input,
//     },
//     query: `
//       mutation login($input: LoginInput!) {
//         login(input: $input) {
//           loginResult {
//             bearerToken
//           }
//           errors {
//             ... on CompanyHasNoAccessToAtsError {
//               message
//               __typename
//             }
//             ... on CredentialsAreInvalidError {
//               message
//               __typename
//             }
//             ... on UserHasNoAccessToAtsError {
//               message
//               __typename
//             }
//           }
//         }
//       }`,
//   });

//   const requestOptions = {
//     method: "POST",
//     headers: myHeaders,
//     body: raw,
//     redirect: "follow",
//   };

//   try {
//     const response = await fetch(
//       `https://ats-api${env ? "." + env : ""}.rabota.ua/graphql/`,
//       requestOptions
//     );
//     const result = response.json();
//     return result;
//   } catch (error) {
//     console.log("ERROR on LOGIN", error);
//     return result;
//   }
// };

// DELETE REFRESH TOKEN
// export const refreshToken = async (url) => {
//   const env = getEnvQueryParam(url);
//   var myHeaders = new Headers();
//   myHeaders.append("Content-Type", "application/json");

//   var graphql = JSON.stringify({
//     query: `
//       mutation refresh {
//         refresh {
//           refreshResult {
//             bearerToken
//             hasForwardedSetCookieHeader
//             __typename
//           }
//           errors {
//             ... on TokenCanNotBeRefreshedError {
//               message
//               __typename
//             }
//             __typename
//           }
//           __typename
//         }
//       }`,
//     // variables: {},
//   });
//   var requestOptions = {
//     method: "POST",
//     headers: myHeaders,
//     body: graphql,
//     redirect: "follow",
//   };

//   try {
//     const response = await fetch(
//       `https://ats-api${env ? "." + env : ""}.rabota.ua/graphql/`,
//       requestOptions
//     );
//     const result = response.json();
//     return result;
//   } catch (error) {
//     console.log("ERROR on REFRESH TOKEN", error);
//     return result;
//   }
// };
