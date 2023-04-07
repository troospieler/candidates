export async function getTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export async function getAllTabs() {
  let tabs = await chrome.tabs.query({
    url: ["https://www.work.ua/resumes/*", "https://rabota.ua/*"],
  });
  return tabs;
}

export const loginToAts = async (input) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    operationName: "login",
    variables: {
      input,
    },
    query: `
      mutation login($input: LoginInput!) {
        login(input: $input) {
          loginResult {
            bearerToken
          }
          errors {
            ... on CompanyHasNoAccessToAtsError {
              message
              __typename
            }
            ... on CredentialsAreInvalidError {
              message
              __typename
            }
            ... on UserHasNoAccessToAtsError {
              message
              __typename
            }
          }
        }
      }`,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://ats-api.dev.rabota.ua/graphql/",
      requestOptions
    );
    const result = response.json()
    return result;
  } catch (error) {
    console.log("error on login", error);
    return null;
    // return error;
  }
};

export const addCandidate = async (input) => {
  const { resumeId, resumeText, token } = input;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", token);
  const raw = JSON.stringify({
    source: "Work",
    id: resumeId,
    text: resumeText,
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  try {
    const response = await fetch(
      "https://ats-api.dev.rabota.ua/resume/import",
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("error on login", error);
    return error;
  }
};

export const proceedErrors = (errors) => {
  console.log(errors);
  // here will be logic for handling errors
};
