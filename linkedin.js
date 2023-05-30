// const params = {
//   decorationId: "com.linkedin.voyager.dash.deco.identity.profile.WebTopCardCore-6",
//   memberIdentity: "alina-gopkalo-524523160",
//   q: "memberIdentity",
// };
// const queryString = new URLSearchParams(data).toString();
// const requestUrl = `${url}?${queryString}`;
// const headerToFetch = {
// accept: "application/vnd.linkedin.normalized+json+2.1",
// "Csrf-Token": "ajax:8156276041996836978",
// cookie:
//   'Csrf-Token="ajax:8156276041996836978"; JSESSIONID="ajax:8156276041996836978"; li_at=AQEDARxmrecDweSpAAABiEIn6moAAAGIinIvLk0ATxTyPMliE3TOPNdicxcVOF9tQAu9kwAs8CPzZms2ysiAeHZ5QsZhXaeB8oaWRz8I5ojrzbhkSuSYQlyrsG93oNtj4Q7sEZ2l9J9K-6euj81boH2e',
// };

// SELECTOR for person name
const heading = document.querySelector("h1.text-heading-xlarge");
console.log({ name: heading?.innerText });

const URL = "https://www.linkedin.com/voyager/api/identity/profiles";
const csrfToken = document.cookie
  .split(";")
  .find((item) => item.includes("JSESSIONID="))
  ?.split("=")?.[1]
  ?.replace(/\"/g, "");
const candidateId = window.location.pathname.split("/in/")[1]?.split("/")?.[0];

async function getProfileInfo(url) {
  if (!!csrfToken && !!candidateId) {
    const requestUrl = `${url}/${candidateId}/profileContactInfo`;
    const headers = { "Csrf-Token": csrfToken, accept: "application/vnd.linkedin.normalized+json+2.1" };
    const response = await fetch(requestUrl, {
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    return await response.json();
  }
}

async function getProfilePDF(url) {
  if (!!csrfToken && !!candidateId) {
    const requestUrl = `${url}/${candidateId}/profileActions?action=saveToPdf`;
    const headers = { "Csrf-Token": csrfToken };
    const response = await fetch(requestUrl, {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const result = await response.json();
    const pdfLink = result.value;
    await getPdf(pdfLink, headers);
    return result;
  }
}

console.log("sending request to Server:\n");
getProfilePDF(URL)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
getProfileInfo(URL)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });

async function getPdf(url, headers) {
  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }
  const file = await response.blob();
  const objectUrl = window.URL.createObjectURL(file);
  window.open(objectUrl);
  return file;
}

const a = {
  data: {
    entityUrn: "urn:li:collectionResponse:xjcmyovQAhrx4l79v7+gx4NEtlMHjj+AL2T6let+oOU=",
    paging: { count: 10, start: 0, links: [] },
    "*elements": ["urn:li:fsd_profile:ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk"],
    $type: "com.linkedin.restli.common.CollectionResponse",
  },
  meta: {
    microSchema: {
      version: "2",
      types: {
        "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2": {
          fields: {
            textDirection: { type: "string" },
            text: { type: "string" },
            attributesV2: { type: { array: "com.linkedin.voyager.dash.deco.common.text.TextAttributeV2" } },
            accessibilityTextAttributesV2: {
              type: { array: "com.linkedin.voyager.dash.deco.common.text.TextAttributeV2" },
            },
            accessibilityText: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.common.text.TextViewModel",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1080314395": {
          fields: {
            ringContentType: { type: "string" },
            actionTarget: { type: "string" },
            preDashEntityUrn: { type: "string" },
            entityUrn: { type: "string" },
            emphasized: { type: "boolean" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.RingStatus",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1529112441": {
          fields: {
            originalImageUrl: { type: "string" },
            originalHeight: { type: "int" },
            url: { type: "string" },
            originalWidth: { type: "int" },
          },
          baseType: "com.linkedin.voyager.dash.common.ImageUrl",
        },
        "com.linkedin.voyager.dash.deco.relationships.ProfileWithEmailRequired": {
          fields: {
            memorialized: { type: "boolean" },
            lastName: { type: "string" },
            firstName: { type: "string" },
            tempStatus: { type: "string" },
            entityUrn: { type: "string" },
            tempStatusEmoji: { type: "string" },
            publicIdentifier: { type: "string" },
            headline: { type: "string" },
            emailRequired: { type: "boolean" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.deco.recipe.anonymous.Anon377984030": {
          fields: {
            professionalEvent: {
              type: "com.linkedin.deco.recipe.anonymous.Anon1213723597",
              resolvedFrom: "professionalEventUrn",
            },
            vectorImage: { type: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution" },
            professionalEventUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.NonEntityProfessionalEventLogo",
        },
        "com.linkedin.deco.recipe.anonymous.Anon929195650": {
          fields: { entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.organization.School",
        },
        "com.linkedin.voyager.dash.deco.common.image.Company": {
          fields: {
            logo: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            entityUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.organization.Company",
        },
        "com.linkedin.voyager.dash.deco.common.ux.LabelViewModel": {
          fields: {
            colorStyle: { type: "string" },
            text: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
          },
          baseType: "com.linkedin.voyager.dash.common.ux.label.LabelViewModel",
        },
        "com.linkedin.deco.recipe.anonymous.Anon405167834": {
          fields: {
            name: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            nameSupplementaryInfo: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            imageUnion: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            headline: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            subHeadline: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
          },
          baseType: "com.linkedin.voyager.dash.common.media.StickerLinkMediumTemplateView",
        },
        "com.linkedin.deco.recipe.anonymous.Anon409680083": {
          fields: { type: { type: "string" }, index: { type: "int" } },
          baseType: "com.linkedin.voyager.dash.common.text.ListItemStyle",
        },
        "com.linkedin.voyager.dash.deco.relationships.Invitation": {
          fields: {
            inviteeMemberResolutionResult: {
              type: "com.linkedin.deco.recipe.anonymous.Anon336652209",
              resolvedFrom: "inviteeMember",
            },
            invitationType: { type: "string" },
            inviteeMember: { type: "string" },
            entityUrn: { type: "string" },
            invitationState: { type: "string" },
            invitationId: { type: "long" },
            sharedSecret: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.relationships.invitation.Invitation",
        },
        "com.linkedin.deco.recipe.anonymous.Anon918376989": {
          fields: {
            title: { type: "string" },
            invitationRelationshipOptions: { type: { array: "com.linkedin.deco.recipe.anonymous.Anon934606613" } },
            subtitle: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.relationships.invitation.InvitationRelationshipForm",
        },
        "com.linkedin.voyager.dash.deco.common.Locale": {
          fields: { variant: { type: "string" }, country: { type: "string" }, language: { type: "string" } },
          baseType: "com.linkedin.common.Locale",
        },
        "com.linkedin.deco.recipe.anonymous.Anon732397008": {
          fields: {
            headlineVersion: { type: "com.linkedin.voyager.dash.deco.common.ux.LabelViewModel" },
            dismissCta: { type: "com.linkedin.voyager.dash.deco.common.ux.ButtonAppearance" },
            primaryCtaAccessibilityText: { type: "string" },
            dismissCtaButton: { type: "com.linkedin.deco.recipe.anonymous.Anon1528523240" },
            description: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            legoTrackingToken: { type: "string" },
            primaryCta: { type: "com.linkedin.voyager.dash.deco.common.ux.ButtonAppearance" },
            primaryCtaButtonV2: { type: "com.linkedin.voyager.dash.deco.identity.profile.tetris.NavigationAction" },
            headline: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            dismissCtaAccessibilityText: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.ProfileGeneratedSuggestionPromoCard",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1247784858": {
          fields: { badgeIcon: { type: "string" }, badgeText: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.identity.profile.TopVoiceBadge",
        },
        "com.linkedin.deco.recipe.anonymous.Anon934606613": {
          fields: { type: { type: "string" }, name: { type: "string" }, controlName: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.relationships.invitation.InvitationRelationshipOption",
        },
        "com.linkedin.voyager.dash.deco.common.TapTargetWithoutEntity": {
          fields: {
            stickerLinkViewUnion: {
              type: {
                union: {
                  mediumTemplate: "com.linkedin.deco.recipe.anonymous.Anon405167834",
                  largeTemplate: "com.linkedin.deco.recipe.anonymous.Anon173266477",
                  smallTemplate: "com.linkedin.deco.recipe.anonymous.Anon655007389",
                },
              },
            },
            stickerLinkTemplateSize: { type: "string" },
            firstCornerXOffsetPercentage: { type: "float" },
            type: { type: "string" },
            thirdCornerYOffsetPercentage: { type: "float" },
            url: { type: "string" },
            urn: { type: "string" },
            thirdCornerXOffsetPercentage: { type: "float" },
            secondCornerYOffsetPercentage: { type: "float" },
            fourthCornerXOffsetPercentage: { type: "float" },
            firstCornerYOffsetPercentage: { type: "float" },
            untaggable: { type: "boolean" },
            rank: { type: "int" },
            text: { type: "string" },
            fourthCornerYOffsetPercentage: { type: "float" },
            secondCornerXOffsetPercentage: { type: "float" },
          },
          baseType: "com.linkedin.voyager.dash.common.TapTarget",
        },
        "com.linkedin.voyager.dash.deco.common.text.LearningCourse": {
          fields: { title: { type: "string" }, entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.learning.LearningCourse",
        },
        "com.linkedin.deco.recipe.anonymous.Anon50101142": {
          fields: {
            ringStatus: { type: "com.linkedin.deco.recipe.anonymous.Anon1320789737" },
            profileUrn: { type: "string" },
            vectorImage: { type: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution" },
            profile: { type: "com.linkedin.deco.recipe.anonymous.Anon587401631", resolvedFrom: "profileUrn" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.NonEntityProfilePicture",
        },
        "com.linkedin.voyager.dash.deco.common.text.ProfileForFamiliarName": {
          fields: { lastName: { type: "string" }, firstName: { type: "string" }, entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.deco.recipe.anonymous.Anon173266477": {
          fields: {
            nameSupplementaryInfo: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            footerText: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            imageUnion: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            subHeadline: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            name: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            insightText: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            headline: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            backgroundImageUnion: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
          },
          baseType: "com.linkedin.voyager.dash.common.media.StickerLinkLargeTemplateView",
        },
        "com.linkedin.voyager.dash.deco.common.image.OrganizationalPage": {
          fields: {
            entityUrn: { type: "string" },
            pageType: { type: "string" },
            logoV2: { type: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution" },
          },
          baseType: "com.linkedin.voyager.dash.organization.OrganizationalPage",
        },
        "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecEditableProfilePicture": {
          fields: {
            displayImageWithFrameReferenceUnion: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            originalImageUrn: { type: "string" },
            originalImageReference: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            a11yText: { type: "string" },
            displayImageReference: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            frameType: { type: "string" },
            photoFilterEditInfo: { type: "com.linkedin.deco.recipe.anonymous.Anon1309211116" },
            displayImageUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture",
        },
        "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecReadOnlyProfilePicture": {
          fields: {
            displayImageWithFrameReferenceUnion: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            frameType: { type: "string" },
            a11yText: { type: "string" },
            displayImageUrn: { type: "string" },
            displayImageReference: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1967775378": {
          fields: {
            paging: { type: "com.linkedin.voyager.dash.deco.common.FullPaging" },
            elements: { type: { array: "com.linkedin.deco.recipe.anonymous.Anon732397008" } },
          },
          baseType: "com.linkedin.restli.common.CollectionResponse",
        },
        "com.linkedin.voyager.dash.deco.common.Link": {
          fields: { type: { type: "string" }, rel: { type: "string" }, href: { type: "string" } },
          baseType: "com.linkedin.restli.common.Link",
        },
        "com.linkedin.voyager.dash.deco.common.LocaleExtensionsFull": {
          fields: { x: { type: "string" }, t: { type: "string" }, u: { type: "string" } },
          baseType: "com.linkedin.common.LocaleExtensions",
        },
        "com.linkedin.deco.recipe.anonymous.Anon858976209": {
          fields: { type: { type: "string" }, epochAt: { type: "long" } },
          baseType: "com.linkedin.voyager.dash.common.text.EpochTime",
        },
        "com.linkedin.voyager.dash.deco.common.image.School": {
          fields: {
            logo: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            entityUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.organization.School",
        },
        "com.linkedin.voyager.dash.deco.common.image.ImageAttribute": {
          fields: {
            detailData: {
              type: {
                union: {
                  profilePictureWithoutFrame: "com.linkedin.voyager.dash.deco.common.image.ProfileWithoutFrame",
                  profilePicture: "com.linkedin.voyager.dash.deco.common.image.Profile",
                  profilePictureWithRingStatus: "com.linkedin.voyager.dash.deco.common.image.ProfileWithRingStatus",
                  companyLogo: "com.linkedin.voyager.dash.deco.common.image.Company",
                  professionalEventLogo: "com.linkedin.voyager.dash.deco.common.image.ProfessionalEvent",
                  organizationalPageLogo: "com.linkedin.voyager.dash.deco.common.image.OrganizationalPage",
                  schoolLogo: "com.linkedin.voyager.dash.deco.common.image.School",
                  groupLogo: "com.linkedin.voyager.dash.deco.common.image.Group",
                },
              },
              resolvedFrom: "detailDataUnion",
            },
            tintColor: { type: "string" },
            detailDataUnion: {
              type: {
                union: {
                  profilePictureWithoutFrame: "string",
                  profilePictureWithRingStatus: "string",
                  companyLogo: "string",
                  icon: "string",
                  systemImage: "string",
                  nonEntityGroupLogo: "com.linkedin.deco.recipe.anonymous.Anon1436383648",
                  organizationalPageLogo: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                  nonEntityProfessionalEventLogo: "com.linkedin.deco.recipe.anonymous.Anon377984030",
                  profilePicture: "string",
                  imageUrl: "com.linkedin.deco.recipe.anonymous.Anon1529112441",
                  professionalEventLogo: "string",
                  nonEntitySchoolLogo: "com.linkedin.deco.recipe.anonymous.Anon1568806612",
                  nonEntityCompanyLogo: "com.linkedin.deco.recipe.anonymous.Anon648914460",
                  schoolLogo: "string",
                  groupLogo: "string",
                  ghostImage: "string",
                  nonEntityProfilePicture: "com.linkedin.deco.recipe.anonymous.Anon50101142",
                },
              },
            },
            tapTargets: { type: { array: "com.linkedin.voyager.dash.deco.common.TapTargetWithoutEntity" } },
            scalingType: { type: "string" },
            displayAspectRatio: { type: "double" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.ImageAttribute",
        },
        "com.linkedin.voyager.dash.deco.common.ux.ButtonAppearance": {
          fields: {
            premiumStyle: { type: "boolean" },
            size: { type: "string" },
            icon: { type: "string" },
            text: { type: "string" },
            iconAfterText: { type: "boolean" },
            emphasize: { type: "boolean" },
            category: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.common.ux.button.ButtonAppearance",
        },
        "com.linkedin.voyager.dash.deco.identity.profile.tetris.NavigationAction": {
          fields: {
            buttonPlacement: { type: "string" },
            legoTrackingId: { type: "string" },
            buttonAppearance: { type: "com.linkedin.voyager.dash.deco.common.ux.ButtonAppearance" },
            icon: { type: "com.linkedin.voyager.dash.deco.common.image.ImageViewModel" },
            actionControlName: { type: "string" },
            text: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            actionTarget: { type: "string" },
            accessibilityText: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.tetris.NavigationAction",
        },
        "com.linkedin.voyager.dash.deco.common.Coordinate2DFull": {
          fields: { x: { type: "double" }, y: { type: "double" } },
          baseType: "com.linkedin.common.Coordinate2D",
        },
        "com.linkedin.voyager.dash.deco.common.image.ProfileWithRingStatus": {
          fields: {
            ringStatus: { type: "com.linkedin.deco.recipe.anonymous.Anon1080314395", isInjection: true },
            profilePicture: { type: "com.linkedin.voyager.dash.deco.common.image.PhotoFilterPicture" },
            entityUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.voyager.dash.deco.relationships.Connection": {
          fields: {
            createdAt: { type: "long" },
            connectedMemberResolutionResult: {
              type: "com.linkedin.deco.recipe.anonymous.Anon336652209",
              resolvedFrom: "connectedMember",
            },
            connectedMember: { type: "string" },
            entityUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.relationships.Connection",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1140274151": {
          fields: {
            creatorWebsite: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            associatedHashtagsCopy: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            associatedHashtag: {
              type: { map: "com.linkedin.deco.recipe.anonymous.Anon462674420" },
              resolvedFrom: "associatedHashtagUrns",
            },
            associatedHashtagUrns: { type: { array: "string" } },
            creatorPostAnalytics: { type: "com.linkedin.deco.recipe.anonymous.Anon1253450705" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.CreatorInfo",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1253450705": {
          fields: {
            description: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            totalCount: { type: "long" },
            title: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            percentageChange: { type: "double" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.CreatorPostAnalytics",
        },
        "com.linkedin.voyager.dash.deco.common.image.PhotoFilterPicture": {
          fields: {
            displayImageWithFrameReferenceUnion: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            a11yText: { type: "string" },
            displayImageReference: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1309211116": {
          fields: {
            saturation: { type: "double" },
            bottomLeft: { type: "com.linkedin.voyager.dash.deco.common.Coordinate2DFull" },
            vignette: { type: "double" },
            brightness: { type: "double" },
            photoFilterType: { type: "string" },
            bottomRight: { type: "com.linkedin.voyager.dash.deco.common.Coordinate2DFull" },
            topLeft: { type: "com.linkedin.voyager.dash.deco.common.Coordinate2DFull" },
            contrast: { type: "double" },
            topRight: { type: "com.linkedin.voyager.dash.deco.common.Coordinate2DFull" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.PhotoFilterEditInfo",
        },
        "com.linkedin.voyager.dash.deco.common.image.Group": {
          fields: {
            logo: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            entityUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.groups.Group",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1918694303": {
          fields: { entityUrn: { type: "string" }, defaultLocalizedName: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.common.Geo",
        },
        "com.linkedin.voyager.dash.deco.common.text.Company": {
          fields: { name: { type: "string" }, entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.organization.Company",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1213723597": {
          fields: { entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.events.ProfessionalEvent",
        },
        "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecEditableBackgroundPicture": {
          fields: {
            originalImageUrn: { type: "string" },
            originalImageReference: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            photoFilterEditInfo: { type: "com.linkedin.deco.recipe.anonymous.Anon1309211116" },
            displayImageUrn: { type: "string" },
            displayImageReference: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture",
        },
        "com.linkedin.deco.recipe.anonymous.Anon655007389": {
          fields: {
            name: { type: "com.linkedin.voyager.dash.deco.common.text.TextViewModelV2" },
            imageUnion: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
          },
          baseType: "com.linkedin.voyager.dash.common.media.StickerLinkSmallTemplateView",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1745422644": {
          fields: {
            countryUrn: { type: "string" },
            country: { type: "com.linkedin.deco.recipe.anonymous.Anon1918694303", resolvedFrom: "countryUrn" },
            defaultLocalizedNameWithoutCountryName: { type: "string" },
            entityUrn: { type: "string" },
            defaultLocalizedName: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.common.Geo",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1251747613": {
          fields: {
            urn: { type: "string" },
            modelName: { type: "string" },
            fieldName: { type: "string" },
            value: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.common.StringFieldReference",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1927941263": {
          fields: { entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.organization.Company",
        },
        "com.linkedin.voyager.dash.deco.common.image.ProfileWithoutFrame": {
          fields: {
            profilePicture: { type: "com.linkedin.voyager.dash.deco.common.image.PhotoFilterPicture" },
            entityUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.deco.recipe.anonymous.Anon587401631": {
          fields: { entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.voyager.dash.deco.common.text.OrganizationalPage": {
          fields: { entityUrn: { type: "string" }, localizedName: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.organization.OrganizationalPage",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1869367056": {
          fields: { entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.groups.Group",
        },
        "com.linkedin.deco.recipe.anonymous.Anon462674420": {
          fields: {
            actionTarget: { type: "string" },
            entityUrn: { type: "string" },
            displayName: { type: "string" },
            trackingUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.feed.Hashtag",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1031101697": {
          fields: {
            targetInviteeResolutionResult: {
              type: "com.linkedin.voyager.dash.deco.relationships.ProfileWithEmailRequired",
              resolvedFrom: "targetInvitee",
            },
            inviter: { type: "string" },
            targetInvitee: { type: "string" },
            invitationRelationshipForm: { type: "com.linkedin.deco.recipe.anonymous.Anon918376989" },
            inviterResolutionResult: {
              type: "com.linkedin.voyager.dash.deco.relationships.ProfileWithIweWarned",
              resolvedFrom: "inviter",
            },
          },
          baseType: "com.linkedin.voyager.dash.relationships.invitation.NoInvitation",
        },
        "com.linkedin.voyager.dash.deco.identity.profile.WebTopCardCore": {
          fields: {
            birthDateOn: { type: "com.linkedin.voyager.dash.deco.common.Date" },
            lastName: { type: "string" },
            memorialized: { type: "boolean" },
            objectUrn: { type: "string" },
            multiLocaleLastName: { type: { map: "string" } },
            showPremiumSubscriberBadge: { type: "boolean" },
            tempStatusEmoji: { type: "string" },
            pronounUnion: { type: { union: { customPronoun: "string", standardizedPronoun: "string" } } },
            tempStatusExpiredAtUnion: {
              type: { union: { customizedExpiredAt: "long", standardizedExpiration: "string" } },
            },
            multiLocaleFirstName: { type: { map: "string" } },
            premium: { type: "boolean" },
            influencer: { type: "boolean" },
            entityUrn: { type: "string" },
            multiLocaleTempStatus: { type: { map: "string" } },
            experienceCardUrn: { type: "string" },
            headlineGeneratedSuggestionDelegateUrn: { type: "string" },
            experienceCard: {
              type: "com.linkedin.deco.recipe.anonymous.Anon1052602939",
              resolvedFrom: "experienceCardUrn",
            },
            headline: { type: "string" },
            publicIdentifier: { type: "string" },
            topVoiceBadge: { type: "com.linkedin.deco.recipe.anonymous.Anon1247784858" },
            trackingId: { type: "string" },
            creator: { type: "boolean" },
            supportedLocales: { type: { array: "com.linkedin.voyager.dash.deco.common.Locale" } },
            educationCard: {
              type: "com.linkedin.deco.recipe.anonymous.Anon1052602939",
              resolvedFrom: "educationCardUrn",
            },
            creatorInfo: { type: "com.linkedin.deco.recipe.anonymous.Anon1140274151" },
            versionTag: { type: "string" },
            privacySettings: {
              type: "com.linkedin.voyager.dash.deco.identity.profile.ViewerPrivacySettingsForInjection",
              isInjection: true,
            },
            firstName: { type: "string" },
            profilePicture: {
              type: "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecEditableProfilePicture",
            },
            geoLocation: { type: "com.linkedin.deco.recipe.anonymous.Anon2049076601" },
            multiLocaleMaidenName: { type: { map: "string" } },
            tempStatus: { type: "string" },
            memberRelationship: {
              type: "com.linkedin.voyager.dash.deco.relationships.MemberRelationshipV2ForInjection",
              isInjection: true,
            },
            profileGeneratedSuggestionPromo: {
              type: "com.linkedin.deco.recipe.anonymous.Anon1967775378",
              isInjection: true,
            },
            multiLocaleHeadline: { type: { map: "string" } },
            primaryLocale: { type: "com.linkedin.voyager.dash.deco.common.LocaleFull" },
            educationCardUrn: { type: "string" },
            backgroundPicture: {
              type: "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecEditableBackgroundPicture",
            },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1320789737": {
          fields: {
            ringContentType: { type: "string" },
            actionTarget: { type: "string" },
            preDashEntityUrn: { type: "string" },
            entityUrn: { type: "string" },
            emphasized: { type: "boolean" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.RingStatus",
        },
        "com.linkedin.deco.recipe.anonymous.Anon163061530": {
          fields: { name: { type: "string" }, entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.groups.Group",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1568806612": {
          fields: {
            school: { type: "com.linkedin.deco.recipe.anonymous.Anon929195650", resolvedFrom: "schoolUrn" },
            vectorImage: { type: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution" },
            schoolUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.NonEntitySchoolLogo",
        },
        "com.linkedin.voyager.dash.deco.common.text.ProfileForFullName": {
          fields: { lastName: { type: "string" }, firstName: { type: "string" }, entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.voyager.dash.deco.common.image.Profile": {
          fields: {
            profilePicture: { type: "com.linkedin.voyager.dash.deco.common.image.PhotoFilterPicture" },
            entityUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.voyager.dash.deco.common.text.JobPosting": {
          fields: { title: { type: "string" }, entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.jobs.JobPosting",
        },
        "com.linkedin.voyager.dash.deco.relationships.MemberRelationshipV2ForInjection": {
          fields: {
            memberRelationshipData: {
              type: {
                union: {
                  noInvitation: "com.linkedin.deco.recipe.anonymous.Anon1031101697",
                  invitation: "com.linkedin.voyager.dash.deco.relationships.Invitation",
                  connection: "com.linkedin.voyager.dash.deco.relationships.Connection",
                },
              },
            },
            entityUrn: { type: "string" },
            memberRelationshipUnion: {
              type: {
                union: {
                  self: "com.linkedin.restli.common.EmptyRecord",
                  connection: "com.linkedin.voyager.dash.deco.relationships.Connection",
                  noConnection: "com.linkedin.voyager.dash.deco.relationships.NoConnection",
                },
              },
            },
          },
          baseType: "com.linkedin.voyager.dash.relationships.MemberRelationship",
        },
        "com.linkedin.voyager.dash.deco.relationships.ProfileWithIweWarned": {
          fields: {
            memorialized: { type: "boolean" },
            lastName: { type: "string" },
            firstName: { type: "string" },
            tempStatus: { type: "string" },
            entityUrn: { type: "string" },
            tempStatusEmoji: { type: "string" },
            iweWarned: { type: "boolean" },
            publicIdentifier: { type: "string" },
            headline: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.voyager.dash.deco.common.LocaleFull": {
          fields: {
            variant: { type: "string" },
            country: { type: "string" },
            language: { type: "string" },
            extensions: { type: "com.linkedin.voyager.dash.deco.common.LocaleExtensionsFull" },
            script: { type: "string" },
          },
          baseType: "com.linkedin.common.Locale",
        },
        "com.linkedin.voyager.dash.deco.identity.profile.ViewerPrivacySettingsForInjection": {
          fields: {
            fullLastNameShown: { type: "boolean" },
            requireReferral: { type: "boolean" },
            showPublicProfile: { type: "boolean" },
            formerNameVisibilitySetting: { type: "string" },
            messagingSeenReceipts: { type: "string" },
            discloseAsProfileViewer: { type: "string" },
            allowProfileEditBroadcasts: { type: "boolean" },
            messagingTypingIndicators: { type: "string" },
            allowOpenProfile: { type: "boolean" },
            profilePictureVisibilitySetting: { type: "string" },
            entityUrn: { type: "string" },
            publicProfilePictureVisibilitySetting: { type: "string" },
            namePronunciationVisibilitySetting: { type: "string" },
            pronounVisibilitySetting: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.PrivacySettings",
        },
        "com.linkedin.voyager.dash.deco.common.image.ImageViewModel": {
          fields: {
            attributes: { type: { array: "com.linkedin.voyager.dash.deco.common.image.ImageAttribute" } },
            actionTarget: { type: "string" },
            totalCount: { type: "int" },
            accessibilityTextAttributes: {
              type: { array: "com.linkedin.voyager.dash.deco.common.text.TextAttributeV2" },
            },
            accessibilityText: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.ImageViewModel",
        },
        "com.linkedin.voyager.dash.deco.common.text.TextAttributeV2": {
          fields: {
            start: { type: "int" },
            length: { type: "int" },
            detailData: {
              type: {
                union: {
                  jobPostingName: "com.linkedin.voyager.dash.deco.common.text.JobPosting",
                  profileFamiliarName: "com.linkedin.voyager.dash.deco.common.text.ProfileForFamiliarName",
                  groupName: "com.linkedin.deco.recipe.anonymous.Anon163061530",
                  profileFullName: "com.linkedin.voyager.dash.deco.common.text.ProfileForFullName",
                  learningCourseName: "com.linkedin.voyager.dash.deco.common.text.LearningCourse",
                  companyName: "com.linkedin.voyager.dash.deco.common.text.Company",
                  profileMention: "com.linkedin.voyager.dash.deco.common.text.ProfileForMention",
                  schoolName: "com.linkedin.voyager.dash.deco.common.text.School",
                  organizationalPageName: "com.linkedin.voyager.dash.deco.common.text.OrganizationalPage",
                  hashtag: "com.linkedin.voyager.dash.deco.common.text.Hashtag",
                },
              },
              resolvedFrom: "detailDataUnion",
            },
            detailDataUnion: {
              type: {
                union: {
                  jobPostingName: "string",
                  profileFamiliarName: "string",
                  hyperlink: "string",
                  color: "string",
                  companyName: "string",
                  icon: "string",
                  systemImage: "string",
                  epoch: "com.linkedin.deco.recipe.anonymous.Anon858976209",
                  organizationalPageName: "string",
                  textLink: "com.linkedin.deco.recipe.anonymous.Anon1465360068",
                  listItemStyle: "com.linkedin.deco.recipe.anonymous.Anon409680083",
                  hyperlinkOpenExternally: "string",
                  listStyle: "string",
                  groupName: "string",
                  profileFullName: "string",
                  stringFieldReference: "com.linkedin.deco.recipe.anonymous.Anon1251747613",
                  learningCourseName: "string",
                  profileMention: "string",
                  style: "string",
                  schoolName: "string",
                  hashtag: "string",
                },
              },
            },
          },
          baseType: "com.linkedin.voyager.dash.common.text.TextAttribute",
        },
        "com.linkedin.deco.recipe.anonymous.Anon648914460": {
          fields: {
            companyUrn: { type: "string" },
            company: { type: "com.linkedin.deco.recipe.anonymous.Anon1927941263", resolvedFrom: "companyUrn" },
            vectorImage: { type: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.NonEntityCompanyLogo",
        },
        "com.linkedin.voyager.dash.deco.relationships.NoConnection": {
          fields: {
            memberDistance: { type: "string" },
            invitationUnion: {
              type: {
                union: {
                  noInvitation: "com.linkedin.deco.recipe.anonymous.Anon1031101697",
                  invitation: "com.linkedin.voyager.dash.deco.relationships.Invitation",
                },
              },
            },
          },
          baseType: "com.linkedin.voyager.dash.relationships.NoConnection",
        },
        "com.linkedin.voyager.dash.deco.common.text.ProfileForMention": {
          fields: { entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1052602939": {
          fields: { entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.identity.profile.tetris.Card",
        },
        "com.linkedin.voyager.dash.deco.common.text.Hashtag": {
          fields: { entityUrn: { type: "string" }, trackingUrn: { type: "string" }, actionTarget: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.feed.Hashtag",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1465360068": {
          fields: { viewingBehavior: { type: "string" }, url: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.common.text.TextLink",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1528523240": {
          fields: {
            controlName: { type: "string" },
            accessibilityText: { type: "string" },
            appearance: { type: "com.linkedin.voyager.dash.deco.common.ux.ButtonAppearance" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.ProfileGeneratedSuggestionButton",
        },
        "com.linkedin.deco.recipe.anonymous.Anon2049076601": {
          fields: {
            geo: { type: "com.linkedin.deco.recipe.anonymous.Anon1745422644", resolvedFrom: "geoUrn" },
            geoUrn: { type: "string" },
            postalCode: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.ProfileGeoLocation",
        },
        "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution": {
          fields: {
            attribution: { type: "string" },
            rootUrl: { type: "string" },
            artifacts: { type: { array: "com.linkedin.voyager.dash.deco.common.VectorArtifact" } },
          },
          baseType: "com.linkedin.common.VectorImage",
        },
        "com.linkedin.voyager.dash.deco.common.FullPaging": {
          fields: {
            start: { type: "int" },
            count: { type: "int" },
            total: { type: "int" },
            links: { type: { array: "com.linkedin.voyager.dash.deco.common.Link" } },
          },
          baseType: "com.linkedin.restli.common.CollectionMetadata",
        },
        "com.linkedin.voyager.dash.deco.common.image.ProfessionalEvent": {
          fields: {
            logoImage: {
              type: {
                union: {
                  url: "string",
                  vectorImage: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution",
                },
              },
            },
            entityUrn: { type: "string" },
          },
          baseType: "com.linkedin.voyager.dash.events.ProfessionalEvent",
        },
        "com.linkedin.deco.recipe.anonymous.Anon336652209": {
          fields: {
            profilePicture: {
              type: "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecReadOnlyProfilePicture",
            },
            memorialized: { type: "boolean" },
            lastName: { type: "string" },
            firstName: { type: "string" },
            tempStatus: { type: "string" },
            entityUrn: { type: "string" },
            tempStatusEmoji: { type: "string" },
            publicIdentifier: { type: "string" },
            headline: { type: "string" },
            tempStatusExpiredAtUnion: {
              type: { union: { customizedExpiredAt: "long", standardizedExpiration: "string" } },
            },
          },
          baseType: "com.linkedin.voyager.dash.identity.profile.Profile",
        },
        "com.linkedin.deco.recipe.anonymous.Anon1436383648": {
          fields: {
            groupUrn: { type: "string" },
            vectorImage: { type: "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution" },
            group: { type: "com.linkedin.deco.recipe.anonymous.Anon1869367056", resolvedFrom: "groupUrn" },
          },
          baseType: "com.linkedin.voyager.dash.common.image.NonEntityGroupLogo",
        },
        "com.linkedin.voyager.dash.deco.common.VectorArtifact": {
          fields: {
            width: { type: "int" },
            fileIdentifyingUrlPathSegment: { type: "string" },
            expiresAt: { type: "long" },
            height: { type: "int" },
          },
          baseType: "com.linkedin.common.VectorArtifact",
        },
        "com.linkedin.voyager.dash.deco.common.text.School": {
          fields: { name: { type: "string" }, entityUrn: { type: "string" } },
          baseType: "com.linkedin.voyager.dash.organization.School",
        },
        "com.linkedin.voyager.dash.deco.common.Date": {
          fields: { month: { type: "int" }, year: { type: "int" }, day: { type: "int" } },
          baseType: "com.linkedin.common.Date",
        },
      },
    },
  },
  included: [
    {
      paging: {
        start: 0,
        count: 10,
        links: [],
        $recipeTypes: ["com.linkedin.voyager.dash.deco.common.FullPaging"],
        $type: "com.linkedin.restli.common.CollectionMetadata",
      },
      entityUrn: "urn:li:collectionResponse:usL9wYqOmTAsoF0KrzhdjCCF7pg4TGlySqPnDt0uEGc=",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1967775378"],
      elements: [],
      $type: "com.linkedin.restli.common.CollectionResponse",
    },
    {
      countryUrn: "urn:li:fsd_geo:103644278",
      defaultLocalizedNameWithoutCountryName: "Westerville, Огайо",
      "*country": "urn:li:fsd_geo:103644278",
      entityUrn: "urn:li:fsd_geo:104002166",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1745422644"],
      defaultLocalizedName: "Westerville, Огайо, Соединенные Штаты Америки",
      $type: "com.linkedin.voyager.dash.common.Geo",
    },
    {
      entityUrn: "urn:li:fsd_geo:103644278",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1918694303"],
      defaultLocalizedName: "Соединенные Штаты Америки",
      $type: "com.linkedin.voyager.dash.common.Geo",
    },
    {
      entityUrn: "urn:li:fsd_hashtag:AaJmusic",
      displayName: "##music",
      trackingUrn: "urn:li:hashtag:AaJmusic",
      actionTarget: "https://www.linkedin.com/feed/hashtag/AaJmusic",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon462674420"],
      $type: "com.linkedin.voyager.dash.feed.Hashtag",
    },
    {
      entityUrn: "urn:li:fsd_hashtag:AaJmusicproduction",
      displayName: "##musicproduction",
      trackingUrn: "urn:li:hashtag:AaJmusicproduction",
      actionTarget: "https://www.linkedin.com/feed/hashtag/AaJmusicproduction",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon462674420"],
      $type: "com.linkedin.voyager.dash.feed.Hashtag",
    },
    {
      entityUrn: "urn:li:fsd_hashtag:AaJmotivational",
      displayName: "##motivational",
      trackingUrn: "urn:li:hashtag:AaJmotivational",
      actionTarget: "https://www.linkedin.com/feed/hashtag/AaJmotivational",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon462674420"],
      $type: "com.linkedin.voyager.dash.feed.Hashtag",
    },
    {
      entityUrn: "urn:li:fsd_hashtag:AaJsynclicensing",
      displayName: "##synclicensing",
      trackingUrn: "urn:li:hashtag:AaJsynclicensing",
      actionTarget: "https://www.linkedin.com/feed/hashtag/AaJsynclicensing",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon462674420"],
      $type: "com.linkedin.voyager.dash.feed.Hashtag",
    },
    {
      entityUrn: "urn:li:fsd_hashtag:AaJmusiclicensing",
      displayName: "##musiclicensing",
      trackingUrn: "urn:li:hashtag:AaJmusiclicensing",
      actionTarget: "https://www.linkedin.com/feed/hashtag/AaJmusiclicensing",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon462674420"],
      $type: "com.linkedin.voyager.dash.feed.Hashtag",
    },
    {
      fullLastNameShown: true,
      showPremiumSubscriberBadge: null,
      formerNameVisibilitySetting: "CONNECTIONS",
      discloseAsProfileViewer: "DISCLOSE_FULL",
      messagingSeenReceipts: null,
      allowProfileEditBroadcasts: null,
      messagingTypingIndicators: null,
      entityUrn: "urn:li:fsd_privacySettings:singleton",
      publicProfilePictureVisibilitySetting: "PUBLIC",
      pronounVisibilitySetting: "MEMBERS",
      requireReferral: null,
      showPublicProfile: true,
      $recipeTypes: ["com.linkedin.voyager.dash.deco.identity.profile.ViewerPrivacySettingsForInjection"],
      $type: "com.linkedin.voyager.dash.identity.profile.PrivacySettings",
      allowOpenProfile: false,
      profilePictureVisibilitySetting: "PUBLIC",
      namePronunciationVisibilitySetting: "MEMBERS",
    },
    {
      birthDateOn: null,
      lastName: "Bowie",
      memorialized: false,
      "*experienceCard": "urn:li:fsd_profileCard:(ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk,EXPERIENCE,ru_RU)",
      objectUrn: "urn:li:member:879515382",
      $anti_abuse_metadata: {
        "/phoneticFirstName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/headlineGeneratedSuggestionDelegateUrn": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" },
        },
        "/industryV2Urn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/tempStatus": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/defaultToActivityTab": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/companyNameOnProfileTopCardShown": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" },
        },
        "/summary": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/influencer": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/trackingId": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/address": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/objectUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/emailRequired": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/geoLocationBackfilled": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/versionTag": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/premium": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/headline": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/showPremiumSubscriberBadge": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" },
        },
        "/educationCardUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/experienceCardUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/locationName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/industryUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/educationOnProfileTopCardShown": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" },
        },
        "/trackingMemberId": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/lastName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/memorialized": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/tempStatusEmoji": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/entityUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/lastNamePronunciationHint": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" },
        },
        "/firstName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/firstNamePronunciationHint": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" },
        },
        "/phoneticLastName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/endorsementsEnabled": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/maidenName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/creator": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/student": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/iweWarned": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
        "/imFollowsPromoLegoTrackingId": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" },
        },
        "/publicIdentifier": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:879515382" } },
      },
      multiLocaleLastName: { en_US: "Bowie" },
      showPremiumSubscriberBadge: false,
      tempStatusEmoji: null,
      pronounUnion: null,
      "*educationCard": "urn:li:fsd_profileCard:(ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk,EDUCATION,ru_RU)",
      tempStatusExpiredAtUnion: null,
      multiLocaleFirstName: { en_US: "Walter" },
      premium: false,
      influencer: false,
      entityUrn: "urn:li:fsd_profile:ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk",
      multiLocaleTempStatus: null,
      experienceCardUrn: "urn:li:fsd_profileCard:(ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk,EXPERIENCE,ru_RU)",
      headlineGeneratedSuggestionDelegateUrn: "urn:li:fsu_profileActionDelegate:-1254396847",
      headline: "Music Producer/Composer",
      publicIdentifier: "walter-bowie-98666a206",
      trackingId: "xuIgymdHRF+IjnEVjXIqHw==",
      topVoiceBadge: null,
      creator: true,
      supportedLocales: [
        {
          country: "US",
          language: "en",
          $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Locale"],
          $type: "com.linkedin.common.Locale",
        },
      ],
      "*memberRelationship": "urn:li:fsd_memberRelationship:ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk",
      creatorInfo: {
        associatedHashtagsCopy: {
          textDirection: "USER_LOCALE",
          text: "Темы публикаций: ##music, ##motivational, ##synclicensing, ##musiclicensing и ##musicproduction",
          attributesV2: [],
          accessibilityTextAttributesV2: [],
          accessibilityText:
            "Рассказывает о hashtag hashtag music, hashtag hashtag motivational, hashtag hashtag synclicensing, hashtag hashtag musiclicensing и hashtag hashtag musicproduction",
          $recipeTypes: ["com.linkedin.voyager.dash.deco.common.text.TextViewModelV2"],
          $type: "com.linkedin.voyager.dash.common.text.TextViewModel",
        },
        associatedHashtag: {
          "*urn:li:fsd_hashtag:AaJsynclicensing": "urn:li:fsd_hashtag:AaJsynclicensing",
          "*urn:li:fsd_hashtag:AaJmusic": "urn:li:fsd_hashtag:AaJmusic",
          "*urn:li:fsd_hashtag:AaJmotivational": "urn:li:fsd_hashtag:AaJmotivational",
          "*urn:li:fsd_hashtag:AaJmusiclicensing": "urn:li:fsd_hashtag:AaJmusiclicensing",
          "*urn:li:fsd_hashtag:AaJmusicproduction": "urn:li:fsd_hashtag:AaJmusicproduction",
        },
        associatedHashtagUrns: [
          "urn:li:fsd_hashtag:AaJmusic",
          "urn:li:fsd_hashtag:AaJmotivational",
          "urn:li:fsd_hashtag:AaJsynclicensing",
          "urn:li:fsd_hashtag:AaJmusiclicensing",
          "urn:li:fsd_hashtag:AaJmusicproduction",
        ],
        creatorWebsite: {
          textDirection: "USER_LOCALE",
          text: "https://imdb.to/38DerHD",
          attributesV2: [
            {
              detailDataUnion: { style: "BOLD" },
              start: 0,
              length: 23,
              $recipeTypes: ["com.linkedin.voyager.dash.deco.common.text.TextAttributeV2"],
              $type: "com.linkedin.voyager.dash.common.text.TextAttribute",
            },
            {
              detailDataUnion: { hyperlinkOpenExternally: "https://imdb.to/38DerHD" },
              start: 0,
              length: 23,
              $recipeTypes: ["com.linkedin.voyager.dash.deco.common.text.TextAttributeV2"],
              $type: "com.linkedin.voyager.dash.common.text.TextAttribute",
            },
          ],
          $recipeTypes: ["com.linkedin.voyager.dash.deco.common.text.TextViewModelV2"],
          $type: "com.linkedin.voyager.dash.common.text.TextViewModel",
        },
        $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1140274151"],
        $type: "com.linkedin.voyager.dash.identity.profile.CreatorInfo",
      },
      versionTag: "2740531676",
      $recipeTypes: [
        "com.linkedin.voyager.dash.deco.relationships.ProfileWithEmailRequired",
        "com.linkedin.voyager.dash.deco.identity.profile.WebTopCardCore",
      ],
      $type: "com.linkedin.voyager.dash.identity.profile.Profile",
      firstName: "Walter",
      profilePicture: {
        a11yText: "Walter Bowie",
        displayImageReference: {
          vectorImage: {
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution"],
            rootUrl: "https://media.licdn.com/dms/image/C4D03AQHvHNPjD-G7UA/profile-displayphoto-shrink_",
            artifacts: [
              {
                width: 100,
                $recipeTypes: ["com.linkedin.voyager.dash.deco.common.VectorArtifact"],
                fileIdentifyingUrlPathSegment:
                  "100_100/0/1620097284876?e=1691020800&amp;v=beta&amp;t=pw58WZQ2TzklyywjIuLW4kN1jwC2jioF6IUb8qm6pcM",
                expiresAt: 1691020800000,
                height: 100,
                $type: "com.linkedin.common.VectorArtifact",
              },
              {
                width: 200,
                $recipeTypes: ["com.linkedin.voyager.dash.deco.common.VectorArtifact"],
                fileIdentifyingUrlPathSegment:
                  "200_200/0/1620097284876?e=1691020800&amp;v=beta&amp;t=ddkypiWaPenUhI7aRABUtMy8vv-qNoQ9P_j1wcIS7TI",
                expiresAt: 1691020800000,
                height: 200,
                $type: "com.linkedin.common.VectorArtifact",
              },
              {
                width: 400,
                $recipeTypes: ["com.linkedin.voyager.dash.deco.common.VectorArtifact"],
                fileIdentifyingUrlPathSegment:
                  "400_400/0/1620097284876?e=1691020800&amp;v=beta&amp;t=mh-jqCDOsbhIanfRJND231ABqRqQomhopqzraqSx-lY",
                expiresAt: 1691020800000,
                height: 400,
                $type: "com.linkedin.common.VectorArtifact",
              },
              {
                width: 800,
                $recipeTypes: ["com.linkedin.voyager.dash.deco.common.VectorArtifact"],
                fileIdentifyingUrlPathSegment:
                  "800_800/0/1620097284876?e=1691020800&amp;v=beta&amp;t=ezTv58zgXyN9WTofSdAT_VVZWyFSEpEWgNkXGTZvDfM",
                expiresAt: 1691020800000,
                height: 800,
                $type: "com.linkedin.common.VectorArtifact",
              },
            ],
            $type: "com.linkedin.common.VectorImage",
          },
        },
        $recipeTypes: ["com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecEditableProfilePicture"],
        displayImageUrn: "urn:li:digitalmediaAsset:C4D03AQHvHNPjD-G7UA",
        photoFilterEditInfo: {
          bottomLeft: {
            x: 0.033613445378151204,
            y: 1.0,
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Coordinate2DFull"],
            $type: "com.linkedin.common.Coordinate2D",
          },
          vignette: 0.0,
          bottomRight: {
            x: 1.0,
            y: 1.0,
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Coordinate2DFull"],
            $type: "com.linkedin.common.Coordinate2D",
          },
          topRight: {
            x: 1.0,
            y: 0.0,
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Coordinate2DFull"],
            $type: "com.linkedin.common.Coordinate2D",
          },
          $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1309211116"],
          $type: "com.linkedin.voyager.dash.identity.profile.PhotoFilterEditInfo",
          saturation: 0.0,
          brightness: 0.0,
          photoFilterType: "ORIGINAL",
          contrast: 0.0,
          topLeft: {
            x: 0.033613445378151204,
            y: 0.0,
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Coordinate2DFull"],
            $type: "com.linkedin.common.Coordinate2D",
          },
        },
        $type: "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture",
      },
      geoLocation: {
        "*geo": "urn:li:fsd_geo:104002166",
        $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon2049076601"],
        geoUrn: "urn:li:fsd_geo:104002166",
        $type: "com.linkedin.voyager.dash.identity.profile.ProfileGeoLocation",
      },
      "*privacySettings": "urn:li:fsd_privacySettings:singleton",
      tempStatus: null,
      multiLocaleMaidenName: null,
      "*profileGeneratedSuggestionPromo": "urn:li:collectionResponse:usL9wYqOmTAsoF0KrzhdjCCF7pg4TGlySqPnDt0uEGc=",
      emailRequired: false,
      multiLocaleHeadline: { en_US: "Music Producer/Composer" },
      primaryLocale: {
        country: "US",
        language: "en",
        $recipeTypes: ["com.linkedin.voyager.dash.deco.common.LocaleFull"],
        $type: "com.linkedin.common.Locale",
      },
      backgroundPicture: {
        displayImageReference: {
          vectorImage: {
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution"],
            rootUrl: "https://media.licdn.com/dms/image/C4D16AQFn6xfwmr43IA/profile-displaybackgroundimage-shrink_",
            artifacts: [
              {
                width: 800,
                $recipeTypes: ["com.linkedin.voyager.dash.deco.common.VectorArtifact"],
                fileIdentifyingUrlPathSegment:
                  "200_800/0/1613004227318?e=1691020800&amp;v=beta&amp;t=tSMr3MI_aDvK2oJWPcx-jYpPksv6H7bHU1of4Mecubc",
                expiresAt: 1691020800000,
                height: 200,
                $type: "com.linkedin.common.VectorArtifact",
              },
              {
                width: 1400,
                $recipeTypes: ["com.linkedin.voyager.dash.deco.common.VectorArtifact"],
                fileIdentifyingUrlPathSegment:
                  "350_1400/0/1613004227318?e=1691020800&amp;v=beta&amp;t=VaxeF_tB2y_AU8vIKX0HlPleW88swUKcbp-YBNzbIbo",
                expiresAt: 1691020800000,
                height: 350,
                $type: "com.linkedin.common.VectorArtifact",
              },
            ],
            $type: "com.linkedin.common.VectorImage",
          },
        },
        $recipeTypes: ["com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecEditableBackgroundPicture"],
        displayImageUrn: "urn:li:digitalmediaAsset:C4D16AQFn6xfwmr43IA",
        photoFilterEditInfo: {
          bottomLeft: {
            x: 8.167157882300002e-17,
            y: 0.7,
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Coordinate2DFull"],
            $type: "com.linkedin.common.Coordinate2D",
          },
          vignette: 0.0,
          bottomRight: {
            x: 1.0,
            y: 0.7,
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Coordinate2DFull"],
            $type: "com.linkedin.common.Coordinate2D",
          },
          topRight: {
            x: 1.0,
            y: 0.3,
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Coordinate2DFull"],
            $type: "com.linkedin.common.Coordinate2D",
          },
          $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1309211116"],
          $type: "com.linkedin.voyager.dash.identity.profile.PhotoFilterEditInfo",
          saturation: 0.0,
          brightness: 0.0,
          photoFilterType: "ORIGINAL",
          contrast: 0.0,
          topLeft: {
            x: 8.167157882300002e-17,
            y: 0.3,
            $recipeTypes: ["com.linkedin.voyager.dash.deco.common.Coordinate2DFull"],
            $type: "com.linkedin.common.Coordinate2D",
          },
        },
        $type: "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture",
      },
      educationCardUrn: "urn:li:fsd_profileCard:(ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk,EDUCATION,ru_RU)",
    },
    {
      lastName: "Petrenko",
      memorialized: false,
      $anti_abuse_metadata: {
        "/phoneticFirstName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/headlineGeneratedSuggestionDelegateUrn": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" },
        },
        "/industryV2Urn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/tempStatus": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/defaultToActivityTab": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/companyNameOnProfileTopCardShown": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" },
        },
        "/summary": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/influencer": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/trackingId": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/address": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/objectUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/emailRequired": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/geoLocationBackfilled": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/versionTag": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/premium": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/headline": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/showPremiumSubscriberBadge": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" },
        },
        "/educationCardUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/experienceCardUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/locationName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/industryUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/educationOnProfileTopCardShown": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" },
        },
        "/trackingMemberId": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/lastName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/memorialized": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/tempStatusEmoji": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/entityUrn": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/lastNamePronunciationHint": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" },
        },
        "/firstName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/firstNamePronunciationHint": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" },
        },
        "/phoneticLastName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/endorsementsEnabled": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/maidenName": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/creator": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/student": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/iweWarned": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
        "/imFollowsPromoLegoTrackingId": {
          sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" },
        },
        "/publicIdentifier": { sourceUrns: { "com.linkedin.common.urn.MemberUrn": "urn:li:member:476491239" } },
      },
      iweWarned: false,
      tempStatusEmoji: null,
      $recipeTypes: ["com.linkedin.voyager.dash.deco.relationships.ProfileWithIweWarned"],
      $type: "com.linkedin.voyager.dash.identity.profile.Profile",
      firstName: "Sergii",
      entityUrn: "urn:li:fsd_profile:ACoAABxmrecBbJawAFzEAlLtt-HdpA7MeXSPn8U",
      tempStatus: null,
      headline: "Frontend developer",
      publicIdentifier: "sergii-petrenko-2b36ab113",
    },
    {
      entityUrn: "urn:li:fsd_profileCard:(ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk,EXPERIENCE,ru_RU)",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1052602939"],
      $type: "com.linkedin.voyager.dash.identity.profile.tetris.Card",
    },
    {
      entityUrn: "urn:li:fsd_profileCard:(ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk,EDUCATION,ru_RU)",
      $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1052602939"],
      $type: "com.linkedin.voyager.dash.identity.profile.tetris.Card",
    },
    {
      memberRelationshipUnion: {
        noConnection: {
          memberDistance: "DISTANCE_2",
          $recipeTypes: ["com.linkedin.voyager.dash.deco.relationships.NoConnection"],
          invitationUnion: {
            noInvitation: {
              "*targetInviteeResolutionResult": "urn:li:fsd_profile:ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk",
              inviter: "urn:li:fsd_profile:ACoAABxmrecBbJawAFzEAlLtt-HdpA7MeXSPn8U",
              targetInvitee: "urn:li:fsd_profile:ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk",
              $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1031101697"],
              $type: "com.linkedin.voyager.dash.relationships.invitation.NoInvitation",
              "*inviterResolutionResult": "urn:li:fsd_profile:ACoAABxmrecBbJawAFzEAlLtt-HdpA7MeXSPn8U",
            },
          },
          $type: "com.linkedin.voyager.dash.relationships.NoConnection",
        },
      },
      entityUrn: "urn:li:fsd_memberRelationship:ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk",
      memberRelationshipData: {
        noInvitation: {
          "*targetInviteeResolutionResult": "urn:li:fsd_profile:ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk",
          inviter: "urn:li:fsd_profile:ACoAABxmrecBbJawAFzEAlLtt-HdpA7MeXSPn8U",
          targetInvitee: "urn:li:fsd_profile:ACoAADRsVvYB76d0v3bYYgOwC3OJCrVJiMYmIjk",
          $recipeTypes: ["com.linkedin.deco.recipe.anonymous.Anon1031101697"],
          $type: "com.linkedin.voyager.dash.relationships.invitation.NoInvitation",
          "*inviterResolutionResult": "urn:li:fsd_profile:ACoAABxmrecBbJawAFzEAlLtt-HdpA7MeXSPn8U",
        },
      },
      $recipeTypes: ["com.linkedin.voyager.dash.deco.relationships.MemberRelationshipV2ForInjection"],
      $type: "com.linkedin.voyager.dash.relationships.MemberRelationship",
    },
  ],
};
