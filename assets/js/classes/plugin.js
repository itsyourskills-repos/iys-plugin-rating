var isLoginUser = JSON?.parse(localStorage?.getItem("loginUserDetail"))
  ? true
  : false;
const ENDPOINT_URL =
  "https://lambdaapi.iysskillstech.com/latest/dev-api/";
const loggedInUserApiEndpoint = `https://api.myskillsplus.com/get-skills/`;
const loggedInUserAddSkill = `https://api.myskillsplus.com/add-skills/`;
const deleteSkillApiEndpoint = `https://api.myskillsplus.com/delete-skill/`;
const getaccessYokenEndpoint =
  "https://api.myskillsplus.com/api/token/refresh/";
const getAccessToken = JSON.parse(localStorage.getItem("tokenData"));

function fetchData(url, method) {
  return fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken?.access}`,
    },
  })
    .then((response) => {
      if (response.status === 429) {
        // Redirect to /limit-exceeded/ page
        window.location.href = "/limit-exceeded/";
      }
      return response.json();
    })
    .then((data) => {
      // You can perform additional operations with the data here if needed
      return data;
    })
    .catch((err) => {
      console.log(err);
    });
}

function groupByTagsName(data) {
  const groupedData = {};

  data.forEach((item) => {
    const tagTitle = item.tags[0]?.title;

    if (!tagTitle) {
      if (!groupedData["Other"]) {
        groupedData["Other"] = [];
      }
      groupedData["Other"].push(item);
    } else {
      if (!groupedData[tagTitle]) {
        groupedData[tagTitle] = [];
      }
      groupedData[tagTitle].push(item);
    }
  });

  return groupedData;
}

function addTosessionStorage(item) {
  // Get the existing list from local storage
  const existingList = JSON.parse(sessionStorage.getItem("items") || "[]");

  // Check if the item already exists in the list
  const isDuplicate = existingList.some(
    (existingItem) =>
      existingItem.path_addr === item.path_addr &&
      existingItem.path_addr === item.path_addr
  );

  // If the item is not a duplicate, add it to the list
  if (!isDuplicate) {
    const newList = [...existingList, item];
    sessionStorage.setItem("items", JSON.stringify(newList));
  }
}

// check selected childId is exist in  the whole localStorage data
function findObjectByIsotFileId(array, isotFileId) {
  // Iterate through each object in the array
  for (const obj of array) {
    // Check if the RatedSkils array exists in the object
    if (obj.RatedSkills) {
      // Use the find method to search for the object with the specified isot_file_id
      const foundObject = obj.RatedSkills.find(
        (skill) => skill.isot_file_id === isotFileId
      );

      // If found, return the object
      if (foundObject) {
        return foundObject;
      }
    }
  }

  // If no match is found, return null or handle as needed
  return null;
}

// check selected parentId is exist in the whole local storage data
function isParentIdAvailable(array, parentIdToCheck) {
  for (let i = 0; i < array.length; i++) {
    if (array[i]?.parentID && array[i]?.parentID === parentIdToCheck) {
      return array[i]; // ParentId found
    }
  }
  return null; // ParentId not found
}

// change the format of localstorage data
function sortRatingByLocalStorage() {
  let output = {},
    inputArray;
  const getLoggedInUser = getLoggedInUserListFromlocalStorage();
  if (getLoggedInUser && getLoggedInUser.length > 0) {
    inputArray = getLoggedInUser;
  } else {
    inputArray = getListFromlocalStorage();
  }
  inputArray?.forEach((item) => {
    const parentID = item?.ancestors
      ? item?.ancestors[0]?.path_addr
      : item?.parentSkillDetailId;
    // if (parentID) {
    if (!output[parentID]) {
      output[parentID] = {
        parentID,
        RatedSkills: [],
      };
    }
    const ratedSkill = {
      id: item?.id,
      comment:
        item?.rating && item?.rating?.length > 0
          ? item?.rating[0]?.comment
          : item.ratings && item.ratings.length > 0
            ? item.ratings[0].comment
            : item?.comment,
      rating: item?.rating || (item?.ratings[0] && item?.ratings[0].rating),
      isot_file_id: item?.isot_file_id || item?.isot_path_addr,
      isot_file: item?.isot_file || item?.isot_skill,
      parentSkillDetailId: item?.parentSkillDetailId
        ? item?.parentSkillDetailId
        : item?.ancestors && item?.ancestors[0]?.path_addr,
    };
    output[parentID].RatedSkills.push(ratedSkill);
    // }
  });
  const finalResultArray = Object.values(output);
  return finalResultArray;
}

// display selected skill on accordion
function displaySelctedSkills() {
  const userSkillDetail = sortRatingByLocalStorage();
  for (let item = 0; userSkillDetail.length > item; item++) {
    const childDivId = document.getElementById(
      "child-" + userSkillDetail[item].parentID
    );
    if (childDivId) {
      childDivId.innerHTML = "";
      // // Inner loop for iterating over RatedSkills array
      // for (
      //   let obj = 0;
      //   obj < 3 && userSkillDetail[item].RatedSkills.length > obj;
      //   obj++
      // ) {
      //   // Access the isot_file object
      //   const isotFile = userSkillDetail[item].RatedSkills[obj].isot_file;
      //   const skillid = userSkillDetail[item]?.RatedSkills[obj]?.id;

      //   // Check if isot_file exists and has a name property
      //   if (isotFile && isotFile.name) {
      //     // Create a div element to display the name
      //     const nameDiv = document.createElement("div");
      //     nameDiv.setAttribute(
      //       "id",
      //       `selectedRating-${userSkillDetail[item].parentID}`
      //     );
      //     const nameDivCrossButton = document.createElement("i");
      //     nameDivCrossButton.id = `cross-btn-child-${
      //       skillid ? skillid : isotFile.path_addr
      //     }`;
      //     nameDivCrossButton.setAttribute("class", "fa fa-close");
      //     nameDivCrossButton.style.color = "red";
      //     nameDivCrossButton.style.marginLeft = "5px";
      //     nameDivCrossButton.style.cursor = "pointer";
      //     nameDivCrossButton.style.padding = "5px";
      //     nameDivCrossButton.style.zIndex = "10";
      //     console.log(
      //       userSkillDetail[item].RatedSkills,
      //       "userSkillDetail[item].RatedSkills"
      //     );
      //     nameDivCrossButton.addEventListener("click", () => {
      //       delete_skill(skillid ? skillid : isotFile.path_addr);
      //       if (userSkillDetail[item].RatedSkills.length === 1) {
      //         document.getElementById(
      //           `selectedRating-${userSkillDetail[item].parentID}`
      //         ).style.display = "none";
      //       }
      //     });
      //     nameDiv.textContent = isotFile.name;
      //     nameDiv.style.background = "white";
      //     nameDiv.style.display = "flex";
      //     nameDiv.style.zIndex = "9";
      //     nameDiv.style.border = "0.5px solid rgba(0, 125, 252, 0.2)";
      //     nameDiv.style.padding = "0px 14px";
      //     nameDiv.style.borderRadius = "30px";
      //     nameDiv.style.marginRight = "10px";
      //     nameDiv.style.width = "fit-content";
      //     // Append the div to the childDivId
      //     nameDiv.appendChild(nameDivCrossButton);
      //     childDivId.appendChild(nameDiv);
      //   }
      // }
      // if (userSkillDetail[item].RatedSkills.length > 3) {
      manageModalOnPlusOne(childDivId, userSkillDetail[item]);
      // }
    }
  }

  const resetChangesButton = document.getElementById("Reset Changes");

  if (userSkillDetail.length > 0) {
    console.log(userSkillDetail.length > 0, "getdataaa");
    ResetButton(resetChangesButton, false);
  } else {
    ResetButton(resetChangesButton, true);
  }
}

// function to caluclate all the ratings
function sumRatings(data) {
  let totalRating = 0;

  data.forEach((item) => {
    if (
      // item.parentID &&
      item.RatedSkills &&
      Array.isArray(item.RatedSkills)
    ) {
      totalRating += item.RatedSkills.length;
    }
  });
  return totalRating;
}

// display all the elements count
function createSelectedSkillsCount() {
  const htmlElementCount = sortRatingByLocalStorage();
  const sumofAllRatings = sumRatings(htmlElementCount);
  var elementCountLabel = document.querySelector(".elementCountLabel");
  elementCountLabel.style.width = "fit-content";
  elementCountLabel.style.padding = "10px 30px";
  elementCountLabel.style.margin = "20px auto";
  elementCountLabel.style.borderRadius = "30px";

  // elementCountLabel.style.zIndex = 99;
  if (htmlElementCount && sumofAllRatings) {
    elementCountLabel.style.border = "0.4px solid #21965333";
    elementCountLabel.style.background = "#2196531A";
    elementCountLabel.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#219653" class="bi bi-check-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" >
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
</svg>  ${sumofAllRatings} element added to your profile <a href='/profile'> Check your profile </a> `;
  } else {
    elementCountLabel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#F2994A" class="bi bi-info-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" >
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg> There are no details added to your profile yet`;
    elementCountLabel.style.border = "0.4px solid #F2994A33";
    elementCountLabel.style.background = "#F2994A1A";
  }
}

// Function to create subString of child label
function createSubString(originalText) {
  let words = originalText.split(" ");
  let firstTwoWords = words.slice(0, 2).join(" ");
  return firstTwoWords;
}

// function to count first 2 words
function wordCount(str) {
  return str.split(" ").length;
}

// Function to manage tooltip
function manageTooltip(htmlElement, content) {
  htmlElement.addEventListener("mouseover", function () {
    const popover = new mdb.Popover(htmlElement, {
      container: "body",
      placement: "top",
      content: content,
      html: true,
      trigger: "hover",
    });

    popover.show();

    setTimeout(() => {
      popover.hide();
    }, 1700);
  });
}

// get data from parentid
function findObjectByParentID(data, parentID) {
  return data.filter((obj) => obj.parentID === parentID);
}

// check string for rate button
function searchByName(searchName) {
  const data = sortRatingByLocalStorage();
  const searchResult = [];
  data.forEach((item) => {
    item.RatedSkills.forEach((skill) => {
      if (
        skill.isot_file.name.toLowerCase().includes(searchName.toLowerCase())
      ) {
        searchResult.push(skill);
      }
    });
  });
  return searchResult;
}

// created modal on +1 button
function manageModalOnPlusOne(htmlElementForPlusOne, contentToShowInModal) {
  console.log(contentToShowInModal, "222222222222");
  const plusOneBtn = document.createElement("buttom");
  plusOneBtn.id = "plusOneBtn";
  plusOneBtn.innerHTML = `${contentToShowInModal?.RatedSkills?.length} Selected skills`;
  plusOneBtn.style.background = "none";
  plusOneBtn.style.border = "none";
  plusOneBtn.style.color = "#007DFC";
  plusOneBtn.style.cursor = "pointer";
  plusOneBtn.style.fontSize = "16px";
  htmlElementForPlusOne.append(plusOneBtn);
  // Create the modal container
  const modalContainer = document.createElement("div");
  modalContainer.id = "plusOneButtonModal";
  modalContainer.style.display = "none";
  modalContainer.style.position = "fixed";
  modalContainer.style.top = "0";
  modalContainer.style.left = "0";
  modalContainer.style.width = "100%";
  modalContainer.style.height = "100%";
  modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modalContainer.style.justifyContent = "center";
  modalContainer.style.alignItems = "center";
  modalContainer.style.zIndex = "99";
  document.body.appendChild(modalContainer);
  // Create the modal content
  const modalContent = document.createElement("div");
  modalContent.style.width = "50%";
  modalContent.style.background = "#fff";
  modalContent.style.padding = "32px";
  modalContent.style.borderRadius = "4px";
  modalContainer.appendChild(modalContent);
  // Create the modal header
  const modalHeader = document.createElement("div");
  modalHeader.style.display = "flex";
  modalHeader.style.justifyContent = "space-between";
  modalHeader.style.borderBottom = "1px solid #ddd";
  modalHeader.style.marginBottom = "10px";
  modalHeader.style.paddingBottom = "5px";
  modalContent.appendChild(modalHeader);
  // Create the header content
  const headerContent = document.createElement("div");
  headerContent.style.display = "flex";
  headerContent.style.alignItems = "center";
  modalHeader.appendChild(headerContent);
  // Create the modal title
  const modalTitle = document.createElement("span");
  modalTitle.style.fontSize = "16px";
  modalTitle.style.fontWeight = 600;
  modalTitle.style.color = "#333333";
  modalTitle.innerHTML =
    contentToShowInModal.RatedSkills[0].isot_file.tags[0].title;
  headerContent.appendChild(modalTitle);
  // Create the dot separator
  const modalDotHeader = document.createElement("div");
  modalDotHeader.style.width = "8px";
  modalDotHeader.style.height = "8px";
  modalDotHeader.style.background = "#BDBDBD";
  modalDotHeader.style.borderRadius = "50%";
  modalDotHeader.style.margin = "0 10px";
  headerContent.appendChild(modalDotHeader);
  // Create the count of elements selected
  const modalTitleElementCount = document.createElement("span");
  modalTitleElementCount.id = "rating-modal-element-count";
  modalTitleElementCount.setAttribute(
    "data-count",
    contentToShowInModal?.RatedSkills?.length
  );
  modalTitleElementCount.style.fontWeight = 600;
  modalTitleElementCount.style.color = "#828282";
  modalTitleElementCount.style.fontSize = "14px";
  modalTitleElementCount.innerHTML =
    contentToShowInModal?.RatedSkills?.length + " " + "elements selected";
  headerContent.appendChild(modalTitleElementCount);
  // Create the main content of modal
  const modalContentMainParent = document.createElement("div");
  modalContentMainParent.id = "modalContentMainParent";
  modalContentMainParent.style.height = "427px";
  modalContentMainParent.style.overflow = "auto";
  // Clear existing content
  modalContentMainParent.innerHTML = "";

  for (const obj of contentToShowInModal.RatedSkills) {
    console.log(obj);
    const ratingGet = obj?.isot_file.ratings[0]?.rating_scale_label;
    const modalContentParent = document.createElement("div");
    modalContentParent.id = `modalContentParent-${obj?.isot_file.path_addr}`;
    modalContentParent.setAttribute(
      "class",
      `modalContentParent-${obj?.id ? obj.id : obj?.isot_file.path_addr}`
    );

    modalContentParent.style.display = "flex";
    modalContentParent.style.justifyContent = "space-between";
    modalContentParent.style.border = "1px solid #E6E6E6";
    modalContentParent.style.padding = "12px";
    modalContentParent.style.borderRadius = "4px";
    modalContentParent.style.margin = "15px 0px";

    const modalLeftContent = document.createElement("div");
    modalLeftContent.id = "modalLeftContent";
    modalLeftContent.style.width = "80%";

    const modalLeftFirstContent = document.createElement("span");
    modalLeftFirstContent.id = "modalLeftFirstContent";
    modalLeftFirstContent.innerHTML = obj?.isot_file.name;
    modalLeftFirstContent.style.fontWeight = 500;
    modalLeftFirstContent.style.fontSize = "14px";
    modalLeftFirstContent.style.color = "#828282";
    modalLeftFirstContent.setAttribute("data-label", obj?.isot_file.name);
    modalLeftContent.appendChild(modalLeftFirstContent);

    const modalLeftSecondContent = document.createElement("span");
    modalLeftSecondContent.id = "modalLeftSecondContent";
    modalLeftSecondContent.innerHTML =
      ratingGet[
      obj?.rating.length > 0 ? obj?.rating[0]?.rating - 1 : obj?.rating - 1
      ];
    modalLeftSecondContent.style.margin = "0 0 0 10px";
    modalLeftSecondContent.style.padding = "4px 12px";
    modalLeftSecondContent.style.borderRadius = "100px";
    modalLeftSecondContent.style.border = "1px solid #F2994A33";
    modalLeftSecondContent.style.fontSize = "12px";
    modalLeftSecondContent.style.fontWeight = 500;
    modalLeftContent.appendChild(modalLeftSecondContent);

    const modalRightContent = document.createElement("div");
    modalRightContent.id = "modalRightContent";
    modalRightContent.style.width = "20%";
    modalRightContent.style.textAlign = "right";

    const modalRightFirstContent = document.createElement("span");
    modalRightFirstContent.id = "modalRightFirstContent";
    modalRightFirstContent.textContent = "View Details";

    modalRightFirstContent.style.display =
      obj?.comment !== "" ? "initial" : "none";
    modalRightFirstContent.style.fontWeight = 500;
    modalRightFirstContent.style.fontSize = "12px";
    modalRightFirstContent.style.color = "#007DFC";
    modalRightFirstContent.style.cursor = "pointer";

    manageTooltip(modalRightFirstContent, obj?.comment);

    modalRightContent.appendChild(modalRightFirstContent);

    const modalRightSecondContent = document.createElement("button");
    modalRightSecondContent.id = `modalRightSecondContent-${obj?.id ? obj.id : obj?.isot_file.path_addr
      }`;
    modalRightSecondContent.style.background = "transparent";
    modalRightSecondContent.style.border = "none";
    modalRightSecondContent.style.margin = "0px 0px 0px 10px";
    modalRightSecondContent.innerHTML =
      '<i class="fa fa-trash" style="color:red"></i>';

    modalRightSecondContent.addEventListener("click", () => {
      const userSkillDetail = sortRatingByLocalStorage();
      delete_skill(obj?.id ? obj.id : obj?.isot_file.path_addr, "modal");
      const result = findObjectByParentID(
        userSkillDetail,
        contentToShowInModal.parentID
      );
      if (result.length === 0) {
        // Find the element with the class "accordion accordion-true"
        const accordionElement = document.querySelector(
          ".accordion.accordion-true"
        );

        // Check if the element is found
        if (accordionElement) {
          // Update the class to "accordion accordion-false"
          accordionElement.click();
        }

        document.getElementById(
          `selectedRating-${contentToShowInModal.parentID}`
        ).style.display = "none";

        modalContainer.style.display = "none";
      }
      if (!isLoginUser) {
        document.getElementById(
          `modalContentParent-${obj?.isot_file.path_addr}`
        ).style.display = "none";
      }
    });
    modalRightContent.appendChild(modalRightSecondContent);

    modalContentParent.appendChild(modalLeftContent);
    modalContentParent.appendChild(modalRightContent);
    modalContentMainParent.appendChild(modalContentParent);
  }

  modalContent.appendChild(modalContentMainParent);

  // Create the close button for the modal
  const closeModalBtn = document.createElement("button");
  closeModalBtn.id = "closeModal";
  closeModalBtn.style.background = "none";
  closeModalBtn.style.border = "none";
  closeModalBtn.style.fontSize = "25px";
  closeModalBtn.innerHTML = "&times;";
  modalHeader.appendChild(closeModalBtn);

  // Event listener for the +1 button to show the modal
  plusOneBtn.addEventListener("click", () => {
    modalContainer.style.display = "flex";
  });

  // Event listener for the close button to hide the modal
  closeModalBtn.addEventListener("click", () => {
    modalContainer.style.display = "none";
    const accordionElement = document.querySelector(
      ".accordion.accordion-true"
    );

    // Check if the element is found
    if (accordionElement) {
      // Update the class to "accordion accordion-false"
      accordionElement.click();
    }
  });
}

// create label
function createLabel(content) {
  const inputLabel = document.createElement("label");
  inputLabel.innerHTML = content;
  inputLabel.style.fontWeight = 500;
  return inputLabel;
}

// create Input field
function createInput(type, placeholder) {
  const inputField = document.createElement("input");
  inputField.type = type;
  inputField.placeholder = placeholder;
  inputField.style.width = "calc(100%)";
  inputField.style.border = "none";
  inputField.style.padding = "13px 16px 13px 16px";

  return inputField;
}

// Helper function to create error message
function createErrorMessage() {
  const errorMessage = document.createElement("div");
  errorMessage.style.color = "red";
  errorMessage.style.marginTop = "5px";
  errorMessage.style.display = "none";
  return errorMessage;
}

// Helper function to display error message
function displayErrorMessage(errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// Helper function to hide error message
function hideErrorMessage(errorElement) {
  errorElement.textContent = "";
  errorElement.style.display = "none";
}

// Helper function to create the dropdown (select element)
function createDropdown() {
  const dropdown = document.createElement("select");
  dropdown.style.width = "100%";
  dropdown.style.padding = "13px";
  dropdown.style.border = "1px solid #E6E6E6";
  dropdown.style.borderRadius = "4px";
  dropdown.style.marginBottom = "10px";
  dropdown.style.background = "white";
  dropdown.style.fontSize = "1em";
  dropdown.style.appearance = "none";
  dropdown.style.backgroundImage = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;
  dropdown.style.backgroundRepeat = "no-repeat";
  dropdown.style.backgroundPosition = "right 9px center";
  dropdown.style.backgroundSize = "1em";

  const defaultOption = document.createElement("option");
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.value = "";
  defaultOption.text = "Select Category";
  dropdown.appendChild(defaultOption);

  const optionsArray = [
    "Profile and Occupation",
    "Knowledge and Skills",
    "Tools and Technologies",
    "Activities",
    "Domain or Context",
  ];
  const options = {};

  optionsArray.forEach((optionText, index) => {
    options[index + 1] = createDropdownOption(optionText);
    dropdown.appendChild(options[index + 1]);
  });

  return dropdown;
}

// helper function to create dropdown options
function createDropdownOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.text = value;
  return option;
}

// validation for email
function isValidEmail(email) {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return emailRegex.test(email);
}

function transformDataFromLocalStorage(originalData) {
  const transformedData = { skills: [] };
  const ratingsMap = new Map();
  originalData?.forEach((skill) => {
    const { isot_file_id, rating, comment } = skill;
    const { _id: isot_rating_id } = skill.isot_file.ratings[0];

    if (!ratingsMap.has(isot_file_id)) {
      ratingsMap.set(isot_file_id, []);
    }

    ratingsMap.get(isot_file_id).push({ isot_rating_id, rating, comment });
  });

  for (const [path_addr, ratings] of ratingsMap) {
    transformedData.skills.push({ path_addr, ratings });
  }

  return transformedData;
}

function addTolocalStorage(userRatedSkill) {
  // Get the existing list from local storage
  const existingList = JSON.parse(
    localStorage.getItem("userRatedSkills") || "[]"
  );

  // Check if the userRatedSkill already exists in the list
  const index = existingList.findIndex(
    (existingItem) =>
      existingItem.isot_file_id === userRatedSkill.isot_file_id &&
      existingItem.isot_file_id === userRatedSkill.isot_file_id
  );

  if (index !== -1) {
    // Remove the existing element from the list
    existingList.splice(index, 1);
  }

  // Add the new userRatedSkill to the list
  const newList = [...existingList, userRatedSkill];

  // Save the updated list in localStorage
  localStorage.setItem("userRatedSkills", JSON.stringify(newList));
}

function getListFromlocalStorage() {
  if (localStorage.getItem("userRatedSkills")) {
    return JSON.parse(localStorage.getItem("userRatedSkills"));
  } else {
    return [];
  }
}

function getLoggedInUserListFromlocalStorage() {
  if (localStorage.getItem("logginUserRatedSkills")) {
    return JSON.parse(localStorage.getItem("logginUserRatedSkills"));
  } else {
    return [];
  }
}

async function getListFromLoggedInUser(loaderIdentifier) {
  const getElementByClass = document.querySelector(".elementCountLabel");
  const previousContent = getElementByClass.innerHTML;
  const loader = document.createElement("div");
  if (loaderIdentifier !== "notLoadded") {
    // Create and append the loader
    loader.className = "loader";
    loader.style.margin = "20px auto";
    getElementByClass.appendChild(loader);
  }
  if (getAccessToken) {
    try {
      let response = [];
      response = await fetch(loggedInUserApiEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken.access}`,
        },
      });
      if (!response.ok && response.status === 401) {
        //throw new Error(`HTTP error! Status: ${response.status}`);
        const refreshtoken = JSON.parse(
          localStorage.getItem("tokenData")
        )?.refresh;
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
          refresh: refreshtoken,
        });
        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
        };
        try {
          fetch(getaccessYokenEndpoint, requestOptions)
            .then((response) => response.text())
            .then(async (result) => {
              localStorage.setItem(
                "tokenData",
                JSON.stringify({
                  refresh: refreshtoken,
                  access: JSON.parse(result)?.access,
                })
              );
              const Retreyresponse = await fetch(loggedInUserApiEndpoint, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${JSON.parse(result)?.access}`,
                },
              });
              const data = await Retreyresponse.json();
              if (loaderIdentifier !== "notLoadded") {
                getElementByClass.removeChild(loader);
                getElementByClass.innerHTML = previousContent;
              }
              localStorage.setItem(
                "logginUserRatedSkills",
                JSON.stringify(data.data)
              );
              createSelectedSkillsCount();
              return data;
            })
            .catch((error) => console.log("error", error));
        } catch (error) {
          console.log("Error occurred:", error);
        }
      } else {
        const data = await response.json();
        if (loaderIdentifier !== "notLoadded") {
          getElementByClass.removeChild(loader);
          getElementByClass.innerHTML = previousContent;
        }
        localStorage.setItem(
          "logginUserRatedSkills",
          JSON.stringify(data.data)
        );
        createSelectedSkillsCount();
        return data;
      }
    } catch (error) {
      if (loaderIdentifier !== "notLoadded") {
        getElementByClass.removeChild(loader);
        getElementByClass.innerHTML = previousContent;
      }
      console.error("Error occurred:", error);
      return { error: error.message };
    }
  } else {
    if (loaderIdentifier !== "notLoadded") {
      getElementByClass.removeChild(loader);
      getElementByClass.innerHTML = previousContent;
    }
    return [];
  }
}

// remove item from local storage when the skill isot_file_id is given
function removeItemFromlocalStorage(isot_file_id) {
  const existingList = JSON.parse(
    localStorage.getItem("userRatedSkills") || "[]"
  );
  const index = existingList.findIndex(
    (existingItem) => existingItem.isot_file_id === isot_file_id
  );
  if (index !== -1) {
    // Remove the existing element from the list
    existingList.splice(index, 1);
  }
  // Save the updated list in localStorage
  localStorage.setItem("userRatedSkills", JSON.stringify(existingList));
}

function clearlocalStorage() {
  if (localStorage.getItem("userRatedSkills")) {
    localStorage.removeItem("userRatedSkills");
  }
}

function clearloggedlocalStorage() {
  if (localStorage.getItem("logginUserRatedSkills")) {
    localStorage.removeItem("logginUserRatedSkills");
  }
}

function getListFromsessionStorage() {
  if (sessionStorage.getItem("items")) {
    return JSON.parse(sessionStorage.getItem("items"));
  } else {
    return [];
  }
}

function clearsessionStorage() {
  sessionStorage.removeItem("items");
}

const removeItemsFromSessionStorageAfterIndex = (index) => {
  const list = getListFromsessionStorage();
  const newList = list.slice(0, index + 1); // Keep the elements up to and including the specified index
  saveListToSessionStorage(newList);
};

const saveListToSessionStorage = (list) => {
  sessionStorage.setItem("items", JSON.stringify(list));
};

// Helper function to create a button with an icon

function ResetButton(htmlElement, disabled) {
  const getResetModalContainer = document.querySelector(".modal-container");

  htmlElement.innerHTML = `<i class="fas fa-undo"></i> Reset Changes`;
  htmlElement.id = "ResetChanges";
  htmlElement.style.padding = "5px 15px";
  htmlElement.style.borderRadius = "5px";
  htmlElement.style.border = disabled ? "" : "1px solid #007DFC";
  htmlElement.style.background = "transparent";
  htmlElement.style.color = disabled ? "" : "#007DFC";
  htmlElement.style.float = "right";
  htmlElement.disabled = disabled;

  if (!disabled) {
    htmlElement.addEventListener("click", (event) => {
      event.preventDefault();
      getResetModalContainer.style.display = "flex";
      // Open the modal when the button is clicked
      const confirmModal = document.getElementById("confirmModal");
      confirmModal.style.display = "block";
      confirmModal.style.borderRadius = "5px";
      confirmModal.style.padding = "20px";
      confirmModal.style.width = "80%";
      confirmModal.style.maxWidth = "400px";
      confirmModal.style.background = "white";

      // Handle modal close button
      const closeModalButton = document.getElementById("closeModal");
      closeModalButton.onclick = function () {
        getResetModalContainer.style.display = "none";
        confirmModal.style.display = "none";
      };

      // Handle reset confirmation
      const confirmResetButton = document.getElementById("confirmReset");
      confirmResetButton.onclick = function () {
        getResetModalContainer.style.display = "none";
        htmlElement.disabled = true;
        htmlElement.style.border = "";
        htmlElement.style.color = "";
        const elements = document.querySelectorAll('[id^="selectedRating-"]');
        const plusOneBtnElements =
          document.querySelectorAll('[id^="plusOneBtn"]');
        elements.forEach((element) => {
          element.style.display = "none";
        });

        plusOneBtnElements.forEach((element) => {
          element.style.display = "none";
        });

        const accordionElement = document.querySelector(
          ".accordion.accordion-true"
        );
        if (accordionElement) {
          accordionElement.click();
        }

        clearlocalStorage();
        createSelectedSkillsCount();

        // Close the modal
        confirmModal.style.display = "none";
      };
    });
  }

  return htmlElement;
}

// Function to handle API calling for  "Add Skill" button click
function addSkillToApi(payload) {
  // API endpoint (replace with your actual API endpoint)
  const apiEndpoint = `https://lambdaapi.iysskillstech.com/v2/add/skills?name=${payload.name}&cat=${payload.cat}&email=${payload.email}`;
  // Make the API call using the fetch API
  return fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any additional headers if needed
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Handle the API response data as needed

      document.getElementById("plugin-search-id-close-button").click();
      toastr.success("New skill element added!");
      return data;
    })
    .catch((error) => {
      toastr.error("Skill element not added");
      throw error;
    });
}

function delete_skill(skill_id, deleteIconIdentifier) {
  let getElementByIdData;
  if (isLoginUser) {
    if (deleteIconIdentifier !== "modal") {
      getElementByIdData = document.getElementById(
        `cross-btn-child-${skill_id}`
      );
    } else {
      getElementByIdData = document.getElementById(
        `modalRightSecondContent-${skill_id}`
      );
    }

    const previousContent = getElementByIdData.innerHTML;
    // Create and append the loader
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.id = "small-loader-for-content";
    loader.style.width = "15px";
    loader.style.height = "15px";
    loader.style.margin = "auto";
    if (deleteIconIdentifier !== "modal") {
      getElementByIdData.setAttribute("class", "");
    } else {
      getElementByIdData.innerHTML = "";
    }
    getElementByIdData.appendChild(loader);

    let url = `${deleteSkillApiEndpoint}${skill_id}/`;

    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken?.access}`,
      },
    })
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then(async (response) => {
        if (isLoginUser) {
          await getListFromLoggedInUser("notLoadded", getElementByIdData);
          if (deleteIconIdentifier === "modal") {
            getElementByIdData.removeChild(loader);
          }
          getElementByIdData.innerHTML = previousContent;

          const ratingModalElementCount = document.getElementById(
            "rating-modal-element-count"
          );
          const getAttributeValue =
            ratingModalElementCount.getAttribute("data-count") - 1;
          ratingModalElementCount.innerHTML =
            getAttributeValue + " " + "elements selected";
          ratingModalElementCount.setAttribute("data-count", getAttributeValue);
          if (getAttributeValue === 0) {
            document.getElementById("closeModal").click();
          }
          document.querySelector(
            `.modalContentParent-${skill_id}`
          ).style.display = "none";
        }
        const deleteRowData = document.getElementById("modalLeftFirstContent");
        if (deleteRowData) {
          const SelectedRowData = deleteRowData.getAttribute("data-label");

          toastr.success(`Remove Skill ${SelectedRowData} from profile`);
        }
        displaySelctedSkills();
        createSelectedSkillsCount();

        // this.createSkillPath(cardBodyDiv, response.ancestors);delete
        // if (response.siblings.length > 0) {
        //   this.createSelectSkillsChildBox(this.cardBodyDiv, response.siblings);
        // } else {
        //   this.childrenSkillAPI(skillId);
        // }
      })
      .catch((err) => {
        console.error(err);
        if (isLoginUser) {
          if (deleteIconIdentifier === "modal") {
            getElementByIdData.removeChild(loader);
          }
          getElementByIdData.innerHTML = previousContent;
        }
      });
  } else {
    removeItemFromlocalStorage(skill_id);
    toastr.success(`Remove selected skill`);
    displaySelctedSkills();
    createSelectedSkillsCount();

    // // TODO: delete skill from local storage FOR NOT login user
    // console.log("delete_skill",skill_id)
    // let skill_list = JSON.parse(localStorage.getItem("skill_list"));
    // console.log("delete_skill",skill_list)
    // let new_skill_list = skill_list.filter((skill) => skill.id !== skill_id);
    // console.log("delete_skill",new_skill_list)
    // localStorage.setItem("skill_list", JSON.stringify(new_skill_list));
  }
}
class IysSearchPlugin {
  constructor(config) {
    this.config = config;
    this.options = {
      ApiKey: null,
      divID: null,
      searchIimit: 10,
      onSearchSkillClick: null,
      selectedSkilldiv: null,
    };
    this.selectedSkills = [];
    if (typeof config == "object") {
      this.options = {
        ...this.options,
        ...config,
      };
    }
    if (this.options.divID) {
      this.selectedDiv = document.getElementById(this.options.divID);
      this.searchValue = "";
      this.searchResultsList = [];
    } else {
      console.error("ApiKey  divID not set correctly ");
    }
  }
  //initi fuctions
  init() {
    this.createSearchBox();
    this.setupCreateSearchTriggers();
    // this.createSkillSearchList([]);
    // this.SelectSkill();
    // this.funtional
  }
  createSearchBox() {
    const div = document.createElement("div");
    div.classList.add("input-group", "input-group-lg", "shadow");
    div.style.display = "flex";
    div.style.flexDirection = "row";
    div.style.borderRadius = "30px";
    div.style.border = "1px solid #007DFC1A";

    const input = document.createElement("input");
    this.searchInputBox = input;
    input.id = "plugin-search-id";
    input.classList.add("form-control");
    input.setAttribute("aria-label", "Sizing example input");
    input.setAttribute(
      "placeholder",
      "Search Profile / Skill / Technology / Domain / Activity"
    );
    input.setAttribute("aria-describedby", "inputGroup-sizing-lg");
    input.style.fontSize = "1rem";
    input.style.height = "auto";
    input.style.borderRadius = "30px";
    input.style.border = "none";
    input.style.padding = "15px";
    input.type = "search";
    div.appendChild(input);

    // Create the clear icon
    const clearIcon = document.createElement("span");
    clearIcon.id = "plugin-search-id-close-button";
    clearIcon.innerHTML = "&times;";
    clearIcon.style.position = "absolute";
    clearIcon.style.right = "10px";
    clearIcon.style.top = "50%";
    clearIcon.style.transform = "translateY(-50%)";
    clearIcon.style.cursor = "pointer";
    clearIcon.style.color = "rgb(255 0 0)";
    clearIcon.style.fontSize = "25px";
    clearIcon.style.display = "none"; // Initially hide the clear icon

    // Create a container for the input and clear icon
    const inputContainer = document.createElement("div");
    inputContainer.style.position = "relative";
    inputContainer.style.flex = "1"; // Take up remaining space in the flex container
    div.appendChild(inputContainer);

    // Append the input and clear icon to the container
    inputContainer.appendChild(input);
    inputContainer.appendChild(clearIcon);

    // Add click event to clear the input field
    clearIcon.addEventListener("click", () => {
      input.value = "";
      divDropDown.style.display = "none";
      button.style.display = "block";
      this.selectedASkillBox.style.display = "none";
      clearIcon.style.display = "none"; // Hide the clear icon after clearing input
    });

    // Append the clear icon to the search box div
    div.appendChild(clearIcon);

    // Format the search text to Title Case
    const searchText = "search"; // Replace with your desired text
    const formattedText =
      searchText.charAt(0).toUpperCase() + searchText.slice(1).toLowerCase();

    // Create the search button
    const button = document.createElement("button");
    button.style.padding = "0px 14px";
    button.style.borderRadius = "30px";
    button.style.margin = "6px";
    button.style.border = "none";
    button.style.background = "#007DFC";
    button.style.color = "white";
    button.style.position = "absolute";
    button.style.right = "0";
    button.style.height = "78%";
    button.style.top = "0px";
    button.classList.add("d-none", "d-lg-block");

    button.innerHTML = `<i class="fas fa-search" style="margin-right: 8px;"></i> ${formattedText}`; // Add your icon HTML here
    button.setAttribute("aria-label", "Search");

    // Add click event to trigger the searchAPI method
    button.addEventListener("click", () => {
      if (input.value !== "") {
        this.searchAPI();
      }
    });

    div.appendChild(button);

    // Event listener to toggle search button and clear icon based on input content
    input.addEventListener("input", () => {
      const hasInput = input.value.trim() !== "";
      clearIcon.style.display = hasInput ? "block" : "none";
      button.style.display = hasInput ? "none" : "block";
      divDropDown.style.display = hasInput ? "block" : "none";
      this.selectedASkillBox.style.display = hasInput ? "none" : "block";
    });

    // Initial check to hide search button if the input has content
    if (input.value.trim() !== "") {
      clearIcon.style.display = "block";
      button.style.display = "none";
      divDropDown.style.display = "none";
      this.selectedASkillBox.style.display = "none";
    }

    this.selectedDiv.appendChild(div);
    const divDropDown = document.createElement("div");
    divDropDown.id = "dropdown-plugin-div";
    divDropDown.style.height = "auto";
    divDropDown.style.boxShadow = "0px 0px 12px 0px #0000000F";
    divDropDown.style.marginTop = "12px";
    divDropDown.style.borderRadius = "12px";
    divDropDown.style.width = "94.5%";
    divDropDown.style.position = "absolute";
    divDropDown.style.zIndex = "9";
    divDropDown.style.background = "#fff";

    this.selectedDiv.appendChild(divDropDown);
  }

  setupCreateSearchTriggers() {
    const searchBoxElement = document.getElementById("plugin-search-id");
    searchBoxElement.addEventListener("input", (event) => {
      event.preventDefault();
      this.searchValue = searchBoxElement.value;
      if (this.searchValue?.length > 1) {
        this.searchAPI(this.searchValue);
      }
    });
  }

  getSkillName(skillObject) {
    return skillObject.term;
  }

  skillClick(skillListId) {
    //add to selected skill to list
    // add json stringfly
    let arrayKey = JSON.stringify(this.searchResultsList[skillListId]);

    if (!this.selectedSkills.includes(arrayKey)) {
      this.selectedSkills.push(
        JSON.stringify(this.searchResultsList[skillListId])
      );
    }
    if (this.options.onSearchSkillClick) {
      this.options.onSearchSkillClick(this.searchResultsList[skillListId]);
    } else {
      console.info("You can use 'onSearchSkillClick' to capture the skill");
    }
    this.createSkillSearchList([]);
    if (this.options.selectedSkilldiv) {
      this.createSelectedSkillList();
    }
  }

  deleteSelectedSkill(skillListId) {
    this.selectedSkills.splice(skillListId, 1);
    this.createSelectedSkillList();
  }

  createSelectedSkillList() {
    const div = document.getElementById(this.options.selectedSkilldiv);
    div.innerHTML = "";

    const ul = document.createElement("ul");
    ul.classList.add("list-group");

    for (let i = 0; i < this.selectedSkills.length; i++) {
      let button = document.createElement("button");
      button.classList.add("btn-close");
      button.type = "button";
      button.setAttribute("aria-label", "Close");
      button.addEventListener("click", (event) => {
        this.deleteSelectedSkill(i);
      });
    }
    div.appendChild(ul);
  }

  createSkillSearchList(searchResultsList, searchText) {
    const div = document.getElementById("dropdown-plugin-div");
    div.style.textAlign = "center";
    div.style.padding = "30px";
    div.style.marginBottom = "30px";
    this.searchResultsList = searchResultsList;
    if (searchResultsList.length > 0) {
      const ul = document.createElement("ul");
      // Create buttons after the unordered list
      ul.style.padding = "30px";
      ul.classList.add("dropdown-menu");
      // create the list item elements and append them to the unordered list
      for (let i = 0; i < searchResultsList.length; i++) {
        const li = document.createElement("li");
        li.style.borderBottom = "1px solid #E0E0E0";
        li.addEventListener("click", (event) => {
          this.skillClick(i);
          div.style.display = "none";
          this.selectedASkillBox.style.display = "block";
          // remove local storages
          // clearlocalStorage();
        });
        const addMorePlusIcon =
          searchResultsList[i]?.skills[0]?.child_count > 0
            ? '<i class="fa fa-plus"></i>'
            : "";
        const a = document.createElement("a");
        a.classList.add("dropdown-item");
        a.style.wordWwrap = "break-word";
        a.style.whiteSpace = "pre-wrap";
        a.href = "#";
        a.innerHTML =
          addMorePlusIcon +
          " " +
          this.searchHighlight(
            this.searchValue,
            this.getSkillName(searchResultsList[i])
          );
        li.appendChild(a);
        ul.appendChild(li);
        // Append buttons to the main div
      }
      ul.style.display = "contents";
      ul.style.width = "100%";
      div.innerHTML = "";

      div.appendChild(ul);
    } else {
      div.innerHTML = "";
      // Create the first paragraph
      const paragraph1 = document.createElement("p");
      const icon1 = document.createElement("i");
      icon1.classList.add("far", "fa-frown"); //  frown icon in Font Awesome
      icon1.style.padding = "0 10px";
      paragraph1.appendChild(icon1);
      paragraph1.innerHTML += " No search results found!";
      paragraph1.style.fontSize = "16px";
      paragraph1.style.fontWeight = 500;
      paragraph1.style.color = "#828282";

      // Create the second paragraph
      const paragraph2 = document.createElement("p");
      paragraph2.innerHTML =
        "Click on the <strong>“Add skill icon”</strong> to add this new skill to your profile";
      div.innerHTML = "";
      // Append paragraphs to the main div
      div.appendChild(paragraph1);
      div.appendChild(paragraph2);

      // Create a button with an icon
      const button = document.createElement("button");
      button.innerHTML = '<i class="fas fa-plus"></i> Add Skill'; // Add your icon HTML here
      button.style.padding = "5px 15px";
      button.style.borderRadius = "5px";
      button.style.border = "1px solid #007DFC";
      button.style.background = "transparent";
      button.style.color = "#007DFC";

      // Add event listener to the button
      button.addEventListener("click", () => {
        this.openAddSkillModal(searchText);
      });

      // Append the button to the main div
      div.appendChild(button);
    }
  }

  // Function to open the Add Skill modal with two inputs and labels
  openAddSkillModal(searchText) {
    const modalDiv = document.createElement("div");
    modalDiv.classList.add("modal", "fade", "show");
    modalDiv.style.display = "flex";
    modalDiv.style.alignItems = "center";
    modalDiv.style.justifyContent = "center";
    modalDiv.style.position = "fixed";
    modalDiv.style.top = "0";
    modalDiv.style.left = "0";
    modalDiv.style.width = "100%";
    modalDiv.style.height = "100%";
    modalDiv.style.overflow = "auto";
    modalDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Light black overlay
    modalDiv.style.zIndex = "1000";

    // Create the modal content
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    modalContent.style.width = "40%"; // Set modal width to 40%
    modalContent.style.background = "#fff";
    modalContent.style.padding = "20px";
    modalDiv.appendChild(modalContent);

    // Create a container for label and close button
    const headerContainer = document.createElement("div");
    headerContainer.style.display = "flex";
    headerContainer.style.justifyContent = "space-between";
    headerContainer.style.alignItems = "center";
    modalContent.appendChild(headerContainer);

    // Add label
    const label = document.createElement("div");
    label.textContent = "Add New Element";
    label.style.fontSize = "18px";
    label.style.fontWeight = 600;
    headerContainer.appendChild(label);

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;"; // Using the "times" symbol (X) for the close button
    closeButton.style.fontSize = "20px";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", () => {
      modalDiv.style.display = "none";
    });
    headerContainer.appendChild(closeButton);

    // Add horizontal line
    const hr = document.createElement("hr");
    hr.style.marginTop = "5px";
    hr.style.marginBottom = "15px";
    modalContent.appendChild(hr);

    const emailInputLabel = createLabel(
      'Email <span style="color:red">*</span>'
    );
    modalContent.appendChild(emailInputLabel);

    const emailFieldContainer = document.createElement("div");
    emailFieldContainer.style.position = "relative";
    emailFieldContainer.style.marginBottom = "10px";
    modalContent.appendChild(emailFieldContainer);

    const emailInputField = createInput("text", "Enter Your Email");
    emailInputField.style.width = "calc(100%)";
    emailInputField.style.border = "1px solid #E6E6E6";
    emailInputField.style.borderRadius = "4px";
    emailInputField.style.padding = "13px 16px 13px 16px";
    emailFieldContainer.appendChild(emailInputField);

    // Create the first input field with label
    const elementInputLabel = createLabel(
      'Element <span style="color:red">*</span>'
    );
    modalContent.appendChild(elementInputLabel);

    const elementFieldContainer = document.createElement("div");
    elementFieldContainer.style.position = "relative";
    elementFieldContainer.style.marginBottom = "10px";
    modalContent.appendChild(elementFieldContainer);

    const elementInputField = createInput("text", "Enter Your Name");
    elementInputField.value = searchText;
    elementInputField.style.width = "calc(100%)";
    elementInputField.style.border = "1px solid #E6E6E6";
    elementInputField.style.borderRadius = "4px";
    elementInputField.style.padding = "13px 16px 13px 16px";
    elementInputField.addEventListener("input", () => {
      // Show or hide the clear icon based on input content
      elementClearIcon.style.display = elementInputField.value
        ? "block"
        : "none";
    });
    elementFieldContainer.appendChild(elementInputField);

    // Create the container for dropdown
    const inputContainer2 = createInputContainer(
      'Category <span style="color:red">*</span>'
    );
    // Create the dropdown (select element)
    const dropdown = createDropdown();
    inputContainer2.appendChild(dropdown);

    // Create error messages
    const emailError = createErrorMessage();
    emailFieldContainer.appendChild(emailError);

    const elementError = createErrorMessage();
    elementFieldContainer.appendChild(elementError);

    const categoryError = createErrorMessage();
    inputContainer2.appendChild(categoryError);

    // Add cross icon to clear input field
    const elementClearIcon = document.createElement("span");
    elementClearIcon.innerHTML = "&times;";
    elementClearIcon.style.position = "absolute";
    elementClearIcon.style.right = "10px";
    elementClearIcon.style.top = "9px";
    elementClearIcon.style.cursor = "pointer";
    elementClearIcon.style.color = "rgb(255 0 0)";
    elementClearIcon.style.fontSize = "20px";
    elementClearIcon.style.zIndex = "9";

    elementClearIcon.addEventListener("click", () => {
      elementInputField.value = "";

      displayErrorMessage(elementError, "Element name is required");

      elementClearIcon.style.display = "none"; // Hide the clear icon after clearing input
    });
    elementFieldContainer.appendChild(elementClearIcon);

    // Event listener for input fields
    emailInputField.addEventListener("input", () => {
      const emailValue = emailInputField.value.trim();

      if (emailValue === "") {
        displayErrorMessage(emailError, "Email is required");
      } else if (emailValue) {
        if (isValidEmail(emailValue)) {
          hideErrorMessage(emailError);
        } else {
          displayErrorMessage(emailError, "Enter a valid email address");
        }
      } else {
        hideErrorMessage(emailError);
      }
    });

    elementInputField.addEventListener("input", () => {
      const elementValue = elementInputField.value.trim();

      if (elementValue === "") {
        displayErrorMessage(elementError, "Element name is required");
      } else {
        hideErrorMessage(elementError);
      }
    });

    dropdown.addEventListener("change", () => {
      const selectedCategory = dropdown.value;

      if (!selectedCategory) {
        displayErrorMessage(categoryError, "Category is required");
      } else {
        hideErrorMessage(categoryError);
      }
    });

    // Create a button inside the modal
    const modalButton = document.createElement("button");
    modalButton.innerHTML = "Add";
    modalButton.style.width = "fit-content";
    modalButton.style.padding = "5px 15px";
    modalButton.style.borderRadius = "5px";
    modalButton.style.border = "1px solid #007DFC";
    modalButton.style.background = "#007DFC";
    modalButton.style.color = "#fff";
    modalButton.style.cursor = "pointer";
    modalButton.style.alignSelf = "flex-end";
    modalButton.addEventListener("click", () => {
      // Get the values from elementInputField and dropdownButton
      const emailValue = emailInputField.value.trim();
      const elementValue = elementInputField.value.trim();
      const selectedCategory = dropdown.value;

      const reqData = {
        name: elementValue,
        cat: selectedCategory,
        email: emailValue,
      };

      // Check Validate email
      if (emailValue === "") {
        displayErrorMessage(emailError, "Email is required");
      } else if (emailValue) {
        if (isValidEmail(emailValue)) {
          hideErrorMessage(emailError);
        } else {
          displayErrorMessage(emailError, "Enter a valid email address");
        }
      } else {
        hideErrorMessage(emailError);
      }

      // Validate element
      if (elementValue === "") {
        displayErrorMessage(elementError, "Element name is required");
      } else {
        hideErrorMessage(elementError);
      }

      // Validate category
      if (selectedCategory === "") {
        displayErrorMessage(categoryError, "Category is required");
      } else {
        hideErrorMessage(categoryError);
      }

      // Check if any error exists
      if (
        emailValue === "" ||
        elementValue === "" ||
        selectedCategory === "" ||
        emailError.textContent !== ""
      ) {
        return; // Do not proceed if there are errors
      }

      // Call the API function with the payload
      addSkillToApi(reqData)
        .then((data) => {
          // Optionally, you can close the modal or perform other actions
          modalDiv.style.display = "none";
        })
        .catch((error) => {
          // Handle errors, show an alert, or perform other actions
        });
    });

    modalContent.appendChild(modalButton);

    // Append the modal to the document body
    document.body.appendChild(modalDiv);

    function createInputContainer(labelText) {
      const container = document.createElement("div");
      container.style.position = "relative";
      modalContent.appendChild(container);

      const label = createLabel(labelText);
      container.appendChild(label);

      return container;
    }
  }

  searchHighlight(searched, text) {
    if (searched !== "") {
      const searchTerms = searched.split(" ");
      const newText = text.replace(
        new RegExp(searchTerms.join("|"), "gi"),
        (match) => `<b>${match}</b>`
      );
      return newText;
    }
    return text;
  }

  searchAPI() {
    // this.searchInputBox.classList.add("loading");
    this.searchInputBox.type = "text";

    const div = document.getElementById("dropdown-plugin-div");
    div.style.padding = "30px";
    div.style.minHeight = "auto";
    div.style.maxHeight = "400px";
    div.style.overflow = "auto";

    // Create and append the loader while waiting for the API response

    const loader = document.createElement("div");
    loader.className = "loader";

    div.innerHTML = ""; // Clear previous content
    div.appendChild(loader);

    if (isLoginUser && this.searchValue.length > 0) {
      fetch(`https://api.myskillsplus.com/api-search/?q=${this.searchValue}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken?.access}`,
        },
      })
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          if (this.searchValue == response.query) {
            this.createSkillSearchList(response.matches, this.searchValue);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => {
          // Remove the loader when the API call is complete
          // div.removeChild(loader);
        });
    } else if (this.searchValue.length > 0) {
      fetch(`${ENDPOINT_URL}?q=${this.searchValue}&limit=10`)
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          if (this.searchValue == response.query) {
            this.createSkillSearchList(response.matches, this.searchValue);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => {
          // Remove the loader when the API call is complete
          // div.removeChild(loader);
        });
    } else {
      this.createSkillSearchList([], this.searchValue);
    }
  }
}
class IysFunctionalAreasPlugin extends IysSearchPlugin {
  constructor(config) {
    super(config);
    this.options.skillPlayground = document.getElementById(
      this.options.skillPlayground
    );

    this.ratedSkillEvent = this.options.ratedSkillEvent;
    this.options.skilFunctionalAreaDiv = document.getElementById(
      this.options.skilFunctionalAreaDiv
    );
    this.options.skillSoftSkillsDiv = document.getElementById(
      this.options.skillSoftSkillsDiv
    );
    this.options.experienceProfilerAreaBox = document.getElementById(
      this.options.experienceProfilerAreaBox
    );
    this.fillStarImageUrl =
      "https://i.ibb.co/zxrDfTN/Screenshot-from-2023-04-29-09-48-17.png";
    this.emptyStarImageUrl =
      "https://i.ibb.co/XC1pj0h/Screenshot-from-2023-04-29-09-49-11.png";

    this.ratedSelectedSkills = [];
  }

  async init() {
    if (isLoginUser) {
      //  For rating saved
      const transformSkillList = transformDataFromLocalStorage(
        getListFromlocalStorage()
      );

      if (transformSkillList?.skills?.length > 0) {
        console.log("adding some saved slikks ", transformSkillList);
        fetch(loggedInUserAddSkill, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken.access}`,
          },
          body: JSON.stringify(transformSkillList),
        }).then(async (response) => {
          // Handle the response from the server
          if (response.ok) {
            // Successful response
            console.log("Skill added successfully!");
            clearlocalStorage();
            await getListFromLoggedInUser();
          } else {
            // Handle errors
            console.error(
              "Failed to add skill:",
              response.status,
              response.statusText
            );
          }

          this.createListProfileSkills();
        });
      } else {
        await getListFromLoggedInUser();
      }
    }
    createSelectedSkillsCount();
    this.createSearchBox();
    this.setupCreateSearchTriggers();
    this.createPlayground();
    // this.createAreaBox();
    // this.crea
    this.createRateSelectedSkills(this.options.skillPlayground);
    this.createListProfileSkills();
  }
  createPlayground() {
    this.selectedASkillBox = document.createElement("div");
    this.selectedASkillBox.classList.add("selected-skill-div");
    this.selectedASkillBox.id = "selected-skill-div";
    this.options.skillPlayground.appendChild(this.selectedASkillBox);
  }

  skillClick(skillListId) {
    clearsessionStorage(skillListId);
    this.createSkillSelectBox(this.searchResultsList[skillListId]);
    this.createSkillSearchList([]);
  }

  createSelectedSkillList(htmlElement) {
    const div = document.getElementById(this.options.selectedSkilldiv);
    div.innerHTML = "";

    const ul = document.createElement("ul");
    ul.classList.add("list-group");

    for (let i = 0; i < this.ratedSelectedSkills.length; i++) {
      let button = document.createElement("button");
      button.classList.add("btn-close");
      button.type = "button";
      button.setAttribute("aria-label", "Close");
      button.addEventListener("click", (event) => {
        this.deleteSelectedSkill(i);
      });

      let li = document.createElement("li");
      li.classList.add("list-group-item", "me-1");
      li.appendChild(button);

      let label = document.createElement("label");
      label.classList.add("form-check-label");
      label.textContent = this.getSkillName(this.ratedSelectedSkills[i]);

      li.appendChild(label);
      ul.appendChild(li);
    }
    div.appendChild(ul);

    htmlElement.appendChild(div);
  }

  SkillChildrenAPI(skillFileId) {
    let url;
    if (isLoginUser) {
      url = `https://api.myskillsplus.com/api-child/?path_addr=${skillFileId}`;
    } else {
      url = `${ENDPOINT_URL}children/?path_addr=${skillFileId}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        this.createSkillSearchList(response);
      })
      .catch((err) => console.error(err));
  }

  /**
   * creating accordion **/

  createSkillButton(
    htmlElement,
    skillDetail,
    isFuncSkill,
    identifier,
    uniqueIdentifier
  ) {
    const userSkillDetail = sortRatingByLocalStorage();
    const isParentAvailable = isParentIdAvailable(
      userSkillDetail,
      skillDetail.path_addr
    );
    var parentDiv = document.createElement("div");
    parentDiv.style.width = "100%";
    parentDiv.setAttribute("class", "parent-accordion");
    // parentDiv.setAttribute("id", "parent-" + skillDetail.path_addr);

    var subDivIdForPlusAndElement = document.createElement("div");
    subDivIdForPlusAndElement.style.textAlign = "left";
    parentDiv.style.display = "flex";
    parentDiv.style.justifyContent = "space-between";
    parentDiv.style.flexWrap = "wrap";
    subDivIdForPlusAndElement.setAttribute("class", "child-accordion");
    // subDivIdForPlusAndElement.setAttribute("id", "parent-" + skillDetail.path_addr);

    var childDiv = document.createElement("div");

    childDiv.setAttribute("id", "child-" + skillDetail.path_addr);
    childDiv.style.display = "flex";
    childDiv.style.flexWrap = "wrap";

    if (isParentAvailable) {
      manageModalOnPlusOne(childDiv, isParentAvailable);
    }
    console.log(
      isParentAvailable,
      "skillDetail.ratingsskillDeskillDetail.ratingsskillDetail.ratings",
      uniqueIdentifier
    );

    if (identifier === "accordionChild") {
      console.log(skillDetail, "skillDetail", identifier);
      htmlElement.innerHTML = "";
      var skilldetailKey = document.getElementById(uniqueIdentifier);
      const foundObject = findObjectByIsotFileId(
        userSkillDetail,
        skillDetail.path_addr
      );

      var panelDiv = document.createElement("button");
      panelDiv.setAttribute("class", skillDetail.path_addr);
      panelDiv.setAttribute("data-name", skillDetail.name);
      if (skillDetail.child_count > 0) {
        panelDiv.setAttribute("row-data", JSON.stringify(skillDetail));
      }

      panelDiv.style.border = "1px solid #E6E6E6";
      panelDiv.style.borderRadius = "100px";
      panelDiv.style.margin = "5px";
      panelDiv.style.padding = "6px 12px";
      panelDiv.style.background = "white";
      panelDiv.style.cursor = "pointer";
      panelDiv.style.color = "#4F4F4F";
      panelDiv.style.fontSize = "14px";

      panelDiv.addEventListener("mouseover", function () {
        // Add a 1px border when the mouse is over the element
        panelDiv.style.border = "1px solid #4F4F4F";
      });

      panelDiv.addEventListener("mouseout", function () {
        // Remove the border when the mouse is no longer over the element
        panelDiv.style.border = "1px solid #E6E6E6";
      });

      var infoDesBtn = document.createElement("i");

      if (foundObject) {
        console.log("if working");
        panelDiv.style.border = "0.4px solid #21965333";
        panelDiv.setAttribute(
          "class",
          `${skillDetail.path_addr} selected-skills`
        );
        const wordCounting = wordCount(skillDetail.name);
        if (wordCounting > 2) {
          panelDiv.innerHTML = `<i class="fa fa-check"></i> ${skillDetail.name} `;
        } else {
          panelDiv.innerHTML = `<i class="fa fa-check"></i> ${skillDetail.name}`;
        }

        infoDesBtn.setAttribute("class", "infoSelectedSkill");
        infoDesBtn.innerHTML =
          ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#007DFC" class="bi bi-info-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" > <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
        infoDesBtn.style.cursor = "pointer";
        if (skillDetail) {
          manageTooltip(
            infoDesBtn,
            `<div>
          ${skillDetail.description !== null
              ? `<p>${skillDetail.description}</p>`
              : ""
            }
        </div>`
          );
        }
      } else {
        console.log("else working");
        const wordCounting = wordCount(skillDetail.name);
        if (skillDetail.child_count > 0) {
          panelDiv.innerHTML = `<span >${skillDetail.name}</span>
          <span style="border-radius: 50%;width: 5px;height: 5px;margin-bottom: 3px;background-color: #828282;display: inline-block;"></span>
          <span style="color:#828282">${skillDetail.child_count} sub categories </span>`;

          panelDiv.id = `haveChild-${skillDetail.path_addr}`;
        } else if (wordCounting > 2) {
          panelDiv.innerHTML = skillDetail.name;
        } else {
          panelDiv.innerHTML = `${skillDetail.name}`;
        }
      }

      const getidparent = document.getElementById("accordion-parent");

      if (getidparent) {
        getidparent.addEventListener("click", () => {
          skilldetailKey.innerHTML = "";
          this.childrenSkillAPI(uniqueIdentifier, "accordionChild");
        });
      }
      panelDiv.addEventListener("click", () => {
        const buttonId = panelDiv?.id;
        const buttonClass = panelDiv?.className;
        if (buttonId) {
          console.log(buttonId, "rerere");
          skilldetailKey.innerHTML = "";
          const subChildBreadcrumbs = document.createElement("div");
          subChildBreadcrumbs.style.width = "100%";
          subChildBreadcrumbs.style.textAlign = "left";
          subChildBreadcrumbs.style.marginBottom = "10px";
          const subParentChildBreadcrumbsSpan = document.createElement("span");
          subParentChildBreadcrumbsSpan.id = "accordion-parent";
          subParentChildBreadcrumbsSpan.setAttribute("class", "cursor-pointer");
          subParentChildBreadcrumbsSpan.textContent = `${skilldetailKey.getAttribute(
            "data-name"
          )} `;
          subParentChildBreadcrumbsSpan.style.fontSize = "14px";
          subParentChildBreadcrumbsSpan.style.color = "#828282";

          const hirarchyArrowIcon = document.createElement("span");
          hirarchyArrowIcon.textContent = ">";
          hirarchyArrowIcon.style.fontSize = "14px";
          hirarchyArrowIcon.style.color = "#828282";

          const hirarchyLevelSpan = document.createElement("span");
          hirarchyLevelSpan.innerHTML = ` ${panelDiv.getAttribute(
            "data-name"
          )} `;
          hirarchyLevelSpan.className = "hirarchyLevel cursor-pointer";
          hirarchyLevelSpan.style.fontSize = "14px";
          hirarchyLevelSpan.style.color = "#333333";
          hirarchyLevelSpan.setAttribute("get-that-id", buttonClass);
          hirarchyLevelSpan.setAttribute(
            "row-data",
            JSON.stringify(skillDetail)
          );

          const hirarchyLevelSpanPlusIcon = document.createElement("i");
          hirarchyLevelSpanPlusIcon.className = "fa fa-plus cursor-pointer";
          hirarchyLevelSpanPlusIcon.style.color = "#007DFC";

          const subParentChildBreadcrumbsSpanForCount =
            document.createElement("span");
          subParentChildBreadcrumbsSpanForCount.id = "accordion-parent-count";
          subParentChildBreadcrumbsSpanForCount.textContent = `${skillDetail.child_count} sub categories`;
          subParentChildBreadcrumbsSpanForCount.style.float = "right";
          subParentChildBreadcrumbsSpanForCount.style.fontSize = "14px";
          subParentChildBreadcrumbsSpanForCount.style.color = "#BDBDBD";

          subChildBreadcrumbs.appendChild(subParentChildBreadcrumbsSpan);
          subChildBreadcrumbs.appendChild(hirarchyArrowIcon);
          subChildBreadcrumbs.appendChild(hirarchyLevelSpan);
          subChildBreadcrumbs.appendChild(hirarchyLevelSpanPlusIcon);

          subChildBreadcrumbs.appendChild(
            subParentChildBreadcrumbsSpanForCount
          );

          skilldetailKey.appendChild(subChildBreadcrumbs);
          this.childrenSkillAPI(
            buttonClass,
            "accordionChild",
            uniqueIdentifier
          );
        } else {
          console.log("going thsat");
          if (skillDetail.ratings && skillDetail.ratings.length > 0) {
            this.changeRateModelElement(skillDetail, uniqueIdentifier);
          }
        }
      });
      skillDetail.description !== null ? panelDiv.appendChild(infoDesBtn) : "";
      skilldetailKey.appendChild(panelDiv);
      var hirarchyLevelSpan = document.getElementsByClassName("hirarchyLevel");
      if (hirarchyLevelSpan) {
        for (const element of hirarchyLevelSpan) {
          const selectedHirarchyRating = JSON.parse(
            element.getAttribute("row-data")
          );

          element.addEventListener("mouseover", function () {
            element.style.color = "#007DFC";
          });

          element.addEventListener("mouseout", function () {
            element.style.color = "#333333";
          });
          console.log(
            isParentAvailable,
            "skillDetail.ratingsskillDeskillDetail.ratingsskillDetail.ratings",
            uniqueIdentifier
          );
          element.addEventListener("click", () => {
            if (selectedHirarchyRating) {
              this.changeRateModelElement(
                selectedHirarchyRating,
                uniqueIdentifier
              );
            }
          });
        }
      }
    } else {
      var subElementSpan = document.createElement("span");
      subElementSpan.setAttribute(
        "class",
        "accordion accordion-false cursor-pointer"
      );
      subElementSpan.setAttribute("id", "parent-" + skillDetail.path_addr);
      subElementSpan.style.width = "calc(100% - 150px)";
      subElementSpan.style.textAlign = "left";
      subElementSpan.style.fontSize = "16px";
      subElementSpan.style.color = "#333333";

      if (isFuncSkill) {
        subElementSpan.innerHTML = `<i class="fas fa-plus mr-1"  style="color:#007DFC; padding-left:5px;"></i>`;
      } else if (skillDetail.child_count > 0) {
        subElementSpan.innerHTML = `<i class="fas fa-plus mr-1"  style="color:#007DFC;  padding:0px 10px;" ></i>${skillDetail.name}`;
      } else {
        subElementSpan.textContent = skillDetail.name;
      }

      subElementSpan.addEventListener("click", async (event) => {
        if (isFuncSkill) {
          console.log("if function");
          // clearsessionStorage();
          addTosessionStorage(skillDetail);

          this.funcSkillCard.classList.remove("active");
          this.softSkillCard.classList.remove("active");
          this.experienceProfileCard.classList.remove("active");
          this.createSkillSelectBox(skillDetail);
        } else if (skillDetail.child_count > 0) {
          addTosessionStorage(skillDetail);

          const isExpanded =
            subElementSpan.getAttribute("class") ===
            "accordion accordion-false cursor-pointer";

          if (isExpanded) {
            this.childrenSkillAPI(skillDetail.path_addr, "accordionChild");
            const allAccordionTrueElements = document.querySelectorAll(
              ".accordion.accordion-true.cursor-pointer"
            );
            if (allAccordionTrueElements) {
              const removeThatPanelData = document.querySelectorAll(".panel");
              allAccordionTrueElements.forEach((element) => {
                element.classList.remove(
                  "accordion",
                  "accordion-true",
                  "cursor-pointer"
                );
                element.classList.add(
                  "accordion",
                  "accordion-false",
                  "cursor-pointer"
                );
                removeThatPanelData.forEach((element) => {
                  if (element.id !== skillDetail.path_addr) {
                    element.innerHTML = "";
                  }
                });

                const iconElement = element.querySelector("i"); // Assuming the <i> tag is directly inside the element
                if (iconElement) {
                  iconElement.classList.remove("fa-minus");
                  iconElement.classList.add("fa-plus");
                }
              });
            }
            subElementSpan.classList.remove(
              "accordion",
              "accordion-false",
              "cursor-pointer"
            );
            subElementSpan.classList.add(
              "accordion",
              "accordion-true",
              "cursor-pointer"
            );
          } else {
            document.getElementById(skillDetail.path_addr).innerHTML = "";
            subElementSpan.classList.remove(
              "accordion",
              "accordion-true",
              "cursor-pointer"
            );
            subElementSpan.classList.add(
              "accordion",
              "accordion-false",
              "cursor-pointer"
            );
          }

          //this.createSkillSelectBox(skillDetail,"accordionChild");

          const returnAccordionIcon =
            subElementSpan &&
              subElementSpan.classList.contains("accordion-true")
              ? "fas fa-minus"
              : "fas fa-plus";

          if (isFuncSkill) {
            subElementSpan.innerHTML = `<i class=${returnAccordionIcon} mr-1"  style="color:#007DFC; padding-left:5px;"></i>`;
          } else if (skillDetail.child_count > 0) {
            subElementSpan.innerHTML = `<i class="${returnAccordionIcon} mr-1" style="color:#007DFC;  padding:0px 10px;" ></i>${skillDetail.name}`;
          } else {
            subElementSpan.textContent = skillDetail.name;
          }

          if (isLoginUser) {
            await getListFromLoggedInUser("notLoadded");
          }
        } else {
          this.changeRateModelElement(skillDetail);
        }
      });

      subElementSpan.setAttribute("data-mdb-toggle", "popover");
      subElementSpan.setAttribute("data-mdb-content", "its mdb content");
      subElementSpan.setAttribute("data-mdb-trigger", "hover");

      if (skillDetail.description) {
        subElementSpan.addEventListener("mouseover", function () {
          const popover = new mdb.Popover(subElementSpan, {
            container: "body",
            placement: "top",
            content: skillDetail.description,
            trigger: "hover",
          });

          popover.show();

          setTimeout(() => {
            popover.hide();
          }, 700);
        });
      }

      parentDiv.style.color = "#333333";
      parentDiv.style.background =
        isFuncSkill || skillDetail.child_count > 0
          ? "rgba(0, 125, 252, 0.1)"
          : "white";
      parentDiv.style.borderRadius = "4px 4px 0px 0px";
      parentDiv.style.border = "0.5px solid #007DFC33";
      parentDiv.style.padding = "10px 12px";
      parentDiv.style.fontSize = "105%";

      parentDiv.appendChild(subElementSpan);
      parentDiv.appendChild(childDiv);
      childDiv.appendChild(subDivIdForPlusAndElement);
      htmlElement.appendChild(parentDiv);

      var skillDetailChild = document.createElement("div");
      skillDetailChild.style.padding = "10px";
      skillDetailChild.classList.add("panel");
      // skillDetailChild.style.justifyContent = "space-around";
      skillDetailChild.style.display = "flex";
      skillDetailChild.style.flexWrap = "wrap";
      skillDetailChild.setAttribute("id", skillDetail.path_addr);
      skillDetailChild.setAttribute("data-name", skillDetail.name);

      parentDiv.after(skillDetailChild);
    }
  }

  createSkillSearchButtonList(
    htmlElement,
    fuctionalAreasList,
    isFuncSkill,
    identifier,
    skillId
  ) {
    htmlElement.innerHTML = "";

    if (fuctionalAreasList.length > 0) {
      if (isFuncSkill) {
        for (let i = 0; i < fuctionalAreasList.length; i++) {
          this.createSkillButton(
            htmlElement,
            fuctionalAreasList[i],
            isFuncSkill,
            identifier,
            skillId
          );
        }
      } else {
        let groupedTagsData = groupByTagsName(fuctionalAreasList);
        for (const tagTitle in groupedTagsData) {
          // htmlElement.innerHTML += tagTitleDiv;

          const items = groupedTagsData[tagTitle];
          for (const item of items) {
            this.createSkillButton(
              htmlElement,
              item,
              isFuncSkill,
              identifier,
              skillId
            );
          }
        }
      }
    }
  }

  //################################################################    save skill rating details        #################################################################
  saveTheSkillComment(
    commentValue,
    ratingValue,
    skillDetail,
    parentSkillDetailId
  ) {
    let userRatedSkill = {
      skills: [
        {
          path_addr: skillDetail?.path_addr,
          ratings: ratingValue,
        },
      ],
    };

    const myrate = () => {
      if (parentSkillDetailId === undefined) {
        var ratedButton = document.getElementById("rateBtn");
        ratedButton.style.backgroundColor = "#21965333";
        ratedButton.textContent = "rated";
        ratedButton.innerHTML += `  <i class="fas fa-star"></i>`;
        ratedButton.style.color = "black";
        ratedButton.style.fontWeight = "normal";
      }
    };

    if (isLoginUser) {
      const saveButtonElement = document.getElementById("saveChangesButton");
      // Check if the element exists
      console.log(saveButtonElement, "saveButtonElement");
      if (saveButtonElement) {
        const previousContent = saveButtonElement.innerHTML;
        // Create and append the loader
        const loader = document.createElement("div");

        loader.className = "loader rate";
        loader.style.width = "20px";
        loader.style.height = "20px";
        saveButtonElement.textContent = "";
        saveButtonElement.appendChild(loader);
        fetch(loggedInUserAddSkill, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken.access}`,
          },
          body: JSON.stringify(userRatedSkill),
        })
          .then(async (response) => {
            if (response.ok) {
              // Successful response
              toastr.success(
                `Adding Skill ${skillDetail.name}  Added to profile`
              );
              await getListFromLoggedInUser("notLoadded");
              myrate();
              if (skillDetail?.path_addr) {
                const elements = document.getElementsByClassName(
                  skillDetail?.path_addr
                );
                console.log(elements, "ratedBtn");
                for (const element of elements) {
                  element.innerHTML = `<i class="fa fa-check"></i> ${skillDetail?.name}`;
                  element.classList.add(
                    skillDetail?.path_addr,
                    "selected-skills"
                  );
                }
              }
              saveButtonElement.removeChild(loader);
              saveButtonElement.innerHTML = previousContent;

              displaySelctedSkills();
              // this.ratedSkillEvent(skillDetail);
            } else {
              // Handle errors
              toastr.success(`Remove Skill ${skillDetail.name} from profile`);

              saveButtonElement.removeChild(loader);
              saveButtonElement.innerHTML = previousContent;
            }
          })
          .catch((error) => {
            if (loader && saveButtonElement) {
              saveButtonElement.removeChild(loader);
              saveButtonElement.innerHTML = previousContent;
            }
            // Handle network errors
            console.error("Error:", error);
          });
      }
    } else {
      fetchData(
        `${ENDPOINT_URL}details/?path_addrs=${skillDetail?.path_addr}`,
        "GET"
      )
        .then((response) => {
          addTolocalStorage({
            comment: commentValue,
            rating: ratingValue,
            isot_file_id: skillDetail?.path_addr,
            isot_file: response[0],
            parentSkillDetailId: parentSkillDetailId,
          });
          toastr.success(`Adding Skill ${skillDetail.name}  Added to profile`);
          myrate();
          // document.getElementById(parentSkillDetailId).innerHTML = "";
          // document.getElementById("parent-" + parentSkillDetailId).click();
          if (skillDetail?.path_addr) {
            const elements = document.getElementsByClassName(
              skillDetail?.path_addr
            );
            console.log(elements, "ratedBtn");
            for (const element of elements) {
              element.innerHTML = `<i class="fa fa-check"></i> ${skillDetail?.name}`;
              element.classList.add(skillDetail?.path_addr, "selected-skills");
            }
          }
          createSelectedSkillsCount();
          displaySelctedSkills();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  //#####################   create a html rating model box   ############s###########
  changeRateModelElement(skillDetail, parentSkillDetailId) {
    const RateSkillModel = document.getElementById("RateSkillModel");
    const RateSkillModelLabel = document.getElementById("RateSkillModelLabel");
    const spanElementForStar = document.getElementById("spanElementForStar");
    spanElementForStar.innerHTML = "";
    spanElementForStar.style.borderRadius = "10px";
    const rateSkillCommentBox = document.getElementById("rateSkillCommentBox");
    const spanElementForSaveButton = document.getElementById(
      "spanElementForSaveButton"
    );
    spanElementForSaveButton.innerHTML = "";
    // Create the button element
    var button = document.createElement("button");
    // Set the button attributes
    button.setAttribute("type", "button");
    button.setAttribute("class", "btn btn-primary");
    button.style.textTransform = "none";
    button.style.background = "#007DFC";
    button.style.fontSize = "inherit";
    button.style.borderRadius = "6px";
    button.setAttribute("id", "saveChangesButton");
    // Set the button content
    button.textContent = "Save Changes";
    // Append the button to the document body or any desired parent element
    spanElementForSaveButton.appendChild(button);
    let titleText;
    if (skillDetail?.term) {
      titleText = skillDetail?.term;
      skillDetail = skillDetail;
    } else {
      if (skillDetail) {
        titleText = skillDetail.name;
      }
    }
    const modalContent = RateSkillModel.querySelector(".modal-content");
    if (modalContent) {
      modalContent.style.padding = "20px"; // Adjust the border style as needed
    }
    const modalHeader = RateSkillModel.querySelector(".modal-header");
    if (modalHeader) {
      modalHeader.style.borderBottom = "1px solid #ccc"; // Adjust the border style as needed
    }
    rateSkillCommentBox.value = "";
    const modalEl = new mdb.Modal(RateSkillModel);
    RateSkillModelLabel.style.fontSize = "17px";
    RateSkillModelLabel.innerHTML = `<span style="color: #333333; font-weight:600">Ratings </span>
    <svg height="8" width="8" style="margin: 0px 15px;">
    <circle cx="4" cy="4" r="5" stroke="white" stroke-width="3" fill="#4F4F4F" />
  </svg> <span style="color:#4F4F4F"> ${titleText} </span>`;
    this.createRatingElement(
      spanElementForStar,
      skillDetail,
      parentSkillDetailId
    );
    button.removeEventListener("click", this.saveTheSkillComment);

    button.addEventListener("click", (event) => {
      modalEl.hide();
    });
    modalEl.show();
  }

  createSelectSkillsChildBox(htmlElement, skillList, identifier, skillId) {
    const cardBody = document.createElement("div");
    if (skillList.length > 0) {
      cardBody.classList.add("card-body-accordion");
      this.createSkillSearchButtonList(
        cardBody,
        skillList,
        "",
        identifier,
        skillId
      );
      // Create the three buttons in the card-body using a parent div
      const cardBodyButtonDiv = document.createElement("div");
      const getdata = sortRatingByLocalStorage();
      if (!identifier) {
        const button = document.createElement("button");
        const resetChangesButton = ResetButton(
          button,
          getdata?.length > 0 ? false : true
        );
        cardBodyButtonDiv.appendChild(resetChangesButton);
      }
      // Append buttons to the card body
      cardBody.appendChild(cardBodyButtonDiv);
    } else {
      cardBody.innerHTML = "";
    }
    htmlElement.appendChild(cardBody);
  }

  createSkillPath(htmlElement, skillList) {
    const ol = document.createElement("ol");
    ol.setAttribute("class", "breadcrumb");

    skillList.forEach((skill, index) => {
      const li = document.createElement("li");
      li.setAttribute("class", "breadcrumb-item");
      if (index === skillList.length - 1) {
        li.setAttribute("class", "breadcrumb-item active");
        li.setAttribute("aria-current", "page");
        li.textContent = skill.name;
      } else {
        li.addEventListener("click", (event) => {
          removeItemsFromSessionStorageAfterIndex(index);
          this.createSkillSelectBox(skill);
        });

        const link = document.createElement("a");
        link.setAttribute("href", `#`);
        link.textContent = skill.name;
        li.appendChild(link);
      }

      ol.appendChild(li);
    });

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "breadcrumb");
    nav.setAttribute("class", "breadcrumb-nav");
    nav.appendChild(ol);
    htmlElement.appendChild(nav);
  }

  //###############################################################       get Rating model section data   #############################
  createRatingElement(htmlElement, skillDetail, parentSkillDetailId) {
    // add exception for rating
    try {
      htmlElement.noUiSlider.destroy();
    } catch (error) {
      console.log("error in destroying slider", error);
    }
    if (skillDetail?.ratings.length > 0) {
      let ratingOptions = skillDetail?.ratings;
      var arbitraryValuesForSlider = ratingOptions;
      const modalBodyGet = document.getElementById("spanElementForStar");
      arbitraryValuesForSlider.forEach((sliderObj) => {
        let spanSliderInnerDiv = document.createElement("div");
        spanSliderInnerDiv.className = "slider-container";
        spanSliderInnerDiv.style.display = "flex";
        // spanSliderInnerDiv.style.gap = "15px";
        spanSliderInnerDiv.style.flexWrap = "wrap";
        let htmlElementLabel = document.createElement("label");
        htmlElementLabel.className = "rating-label";
        htmlElementLabel.style.fontWeight = "bold";
        htmlElementLabel.style.marginBottom = "5px";
        htmlElementLabel.style.marginTop = "15px";
        htmlElementLabel.textContent = sliderObj.rating_category;
        const options = sliderObj.rating_scale_label;
        spanSliderInnerDiv.id = `spanElementForStar-${sliderObj._id}`;
        if (options.length === 2) {
          // Creating radio buttons
          options.forEach((option, index) => {
            let radioContainer = document.createElement("div");
            radioContainer.className = "radio-container";
            radioContainer.style.marginRight = "10px";
            let radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = `rating-${sliderObj._id}`;
            radioInput.value = index + 1;
            radioInput.checked = index === 0;
            radioInput.id = `${sliderObj._id}-${index}`;
            radioInput.className = "radio-input";
            let radioLabel = document.createElement("label");
            radioLabel.htmlFor = `${sliderObj._id}-${index}`;
            radioLabel.textContent = option;
            radioLabel.className = "radio-label";
            radioLabel.style.marginLeft = "5px";
            radioContainer.appendChild(radioInput);
            radioContainer.appendChild(radioLabel);
            spanSliderInnerDiv.appendChild(radioContainer);
          });
        } else {
          // Creating a slider
          var format = {
            to: function (value) {
              return options[Math.round(value - 1)];
            },
            from: function (value) {
              return options.indexOf(value);
            },
          };
          const connectArray = new Array(options.length).fill(false);
          connectArray[0] = true;
          noUiSlider.create(spanSliderInnerDiv, {
            start: options[0],
            range: {
              min: 1,
              max: options.length,
            },
            step: 1,
            format: format,
            pips: { mode: "steps", format: format, density: 50 },
            connect: "lower",
          });
          spanSliderInnerDiv.classList.add("slider");
        }
        modalBodyGet.appendChild(htmlElementLabel);
        modalBodyGet.appendChild(spanSliderInnerDiv);
      });
      var sliderStyleConnect = document.createElement("style");
      sliderStyleConnect.innerHTML =
        ".noUi-connect { background-color: #007DFC; }";
      document.head.appendChild(sliderStyleConnect);
      const sliderHandleConnects = htmlElement.querySelector(".noUi-connects");
      sliderHandleConnects.style.borderRadius = "10px";
      // slider hright
      var nouiHorizontalSliderHeight = document.createElement("style");
      nouiHorizontalSliderHeight.innerHTML =
        ".noUi-horizontal { height: 10px; }";
      document.head.appendChild(nouiHorizontalSliderHeight);
      var sliderHandleContentTouch = document.createElement("style");
      sliderHandleContentTouch.innerHTML =
        ".noUi-handle:after, .noUi-handle:before { content: none; }";
      document.head.appendChild(sliderHandleContentTouch);
      var sliderHandleLabelLines = document.createElement("style");
      sliderHandleLabelLines.innerHTML =
        ".noUi-marker-large .noUi-marker-sub { display: none; }";
      document.head.appendChild(sliderHandleLabelLines);
      // slider point circle
      var sliderStyleHorizontalAndHandle = document.createElement("style");
      sliderStyleHorizontalAndHandle.innerHTML =
        ".noUi-horizontal .noUi-handle { height: 22px !important; width: 22px; border-radius: 50%; background-color: #007DFC;border :5px solid white;box-shadow:none;}";
      document.head.appendChild(sliderStyleHorizontalAndHandle);
      const sliderHandle = htmlElement.querySelector(".noUi-handle-lower");
      sliderHandle.style.background = "#007DFC";
      sliderHandle.style.border = "5px solid white";
      sliderHandle.style.borderRadius = "50%";
      sliderHandle.style.content = "none";
      var nouiHorizontalSliderHeight = document.createElement("style");

      // Rest of your code...
    }
    // remove a model box child element after close the model box
    const closeButton = document.getElementById("RateSkillModelBtn");
    // Add an id to the button

    var modalBody = document.getElementsByClassName("modal-body")[0];
    closeButton.addEventListener("click", () => {
      const parentIDByDynamicIDGet = document.getElementById(
        "parent-" + closeButton.getAttribute("data-panel-id")
      );
      if (parentIDByDynamicIDGet) {
        parentIDByDynamicIDGet.click();
      }
      modalBody.querySelector("#spanElementForStar").innerHTML = "";
    });
    // getting data from clicking saveChangesButton
    const saveButton = document.getElementById("saveChangesButton");
    saveButton.addEventListener("click", () => {
      let inputData = [];
      const comment = document.getElementById("rateSkillCommentBox").value;
      // Retrieving data value from the radio buttons and sliders
      arbitraryValuesForSlider.forEach((sliderObj) => {
        if (sliderObj.rating_scale_label.length === 2) {
          const radioInputs = document.getElementsByName(
            `rating-${sliderObj._id}`
          );
          radioInputs.forEach((input) => {
            if (input.checked) {
              inputData.push({
                isot_rating_id: input?.id,
                rating: parseInt(input.value),
                comment: comment,
              });
            }
          });
        } else {
          const sliderValue = document.getElementById(
            `spanElementForStar-${sliderObj._id}`
          ).noUiSlider;
          const handlerValue = sliderValue.get();
          const indexValue =
            sliderObj?.rating_scale_label.indexOf(handlerValue);
          inputData.push({
            isot_rating_id: sliderObj._id,
            rating: indexValue + 1,
            comment: comment,
          });
        }
      });
      this.saveTheSkillComment(
        comment,
        inputData,
        skillDetail,
        parentSkillDetailId
      );
    });
  }

  generateRatingStars(ratingNumber) {
    let stars = "<span>";
    for (let i = 0; i < ratingNumber; i++) {
      stars +=
        '<span style="font-size:120%" class="fa fa-star checkedstar"></span> ';
    }
    for (let i = ratingNumber; i < 4; i++) {
      stars += '<span style="font-size:120%" class="fa fa-star"></span> ';
    }
    return stars + "</span>";
  }

  createListProfileSkills() {
    if (isLoginUser) {
      fetchData(loggedInUserApiEndpoint, "GET")
        .then((response) => {
          if (response !== undefined) {
            let skillList = response?.data;

            this.selectedRateSkillDiv.innerHTML = "";

            this.rateNumber.innerHTML = skillList.length;

            // loop through the array of list item texts and create a list item for each
            for (let i = 0; i < skillList.length; i++) {
              let skill = skillList[i];

              let button = document.createElement("button");
              let ratePercentage =
                (skill.rating / skill.isot_file.rating.options.length) * 100;
              let messageIcon = "";
              if (skill.comment) {
                messageIcon = `<i class="fas fa-message" style="color:#3b71ca0;margin-left:10px;margin-right:10px"  ></i>`;
              } else {
                messageIcon = `<i class="far fa-message" style="color:#3b71ca0;margin-left:10px;margin-right:10px"  ></i>`;
              }

              button.innerHTML = `${skill.isot_file.name}  ${messageIcon}
            <div style="width: 25px; height: 25px; border-radius: 50%; background: radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#2C58A0 ${ratePercentage}%, pink 0);">
            <progress value="${ratePercentage}" min="0" max="100" style="visibility:hidden;height:0;width:0;">75%</progress>
          </div>
   
           `;

              let iElement = document.createElement("i");
              iElement.classList.add("fas", "fa-xmark");
              iElement.style.color = "#a22525";
              iElement.style.marginLeft = "10px";
              iElement.style.fontSize = "170%";

              iElement.addEventListener("click", () => {
                console.log("delete the skill", skill);
                iElement.parentElement.remove();
                delete_skill(skill.id);
                console.log("refess the connect");
                this.createListProfileSkills();
              });
              button.appendChild(iElement);

              button.style.display = "inline-flex";
              button.style.alignItems = "center";

              // Number from 0.0 to 1.0
              button.setAttribute("type", "button");
              button.setAttribute("class", "btn btn-secondary btn-rounded");
              button.setAttribute("data-mdb-toggle", "popover");
              button.setAttribute(
                "data-mdb-content",
                "nknjdnfdfbhjvbhjfb ndn jhnndjfgdjhnfnh hjdghj"
              );
              button.setAttribute("data-mdb-trigger", "hover");

              button.style.border = "solid 2px #000000a6";
              button.style.color = "rgb(33, 36, 41)";
              button.style.background = "white";
              button.style.borderRadius = "10px";

              // add text rasfrom to buuton
              button.style.fontSize = "105%";
              button.style.textTransform = "capitalize";
              button.style.marginLeft = "5px";
              button.style.marginTop = "5px";
              button.style.fontFamily =
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

              button.addEventListener("mouseover", function () {
                const popoverContent = skill.comment;

                const popover = new mdb.Popover(button, {
                  container: "body",
                  placement: "top",
                  content: popoverContent,
                  trigger: "hover",
                });

                popover.show();

                setTimeout(() => {
                  popover.hide();
                }, 700);
              });

              this.selectedRateSkillDiv.appendChild(button);
            }
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the fetch request
          console.error(error);
        });
    } else {
      let skillList = getListFromlocalStorage();
      this.selectedRateSkillDiv.innerHTML = "";
      this.rateNumber.innerHTML = skillList.length;

      // loop through the array of list item texts and create a list item for each
      for (let i = 0; i < skillList.length; i++) {
        let skill = skillList[i];

        let button = document.createElement("button");
        let ratePercentage =
          (skill.rating / skill.isot_file.rating.options.length) * 100;
        button.innerHTML = `${skill.isot_file.name}  <i class="fas fa-message" style="color:#3b71ca0;margin-left:10px;margin-right:10px"  ></i>
            
            <div style="width: 25px; height: 25px; border-radius: 50%; background: radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#2C58A0 ${ratePercentage}%, pink 0);">
            <progress value="${ratePercentage}" min="0" max="100" style="visibility:hidden;height:0;width:0;">75%</progress>
          </div>
   `;

        var iElement = document.createElement("i");
        iElement.classList.add("fas", "fa-xmark");
        iElement.style.color = "#a22525";
        iElement.style.marginLeft = "10px";
        iElement.style.fontSize = "170%";

        iElement.addEventListener("click", () => {
          iElement.parentElement.remove();
          console.log("delted the skill", skill, skill.isot_file_id);
          delete_skill(skill.isot_file_id);
          console.log("refess the connect");
          // this.createListProfileSkills();
        });
        button.appendChild(iElement);

        button.style.display = "inline-flex";
        button.style.alignItems = "center";

        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-secondary btn-rounded");
        button.setAttribute("data-mdb-toggle", "popover");
        button.setAttribute(
          "data-mdb-content",
          "nknjdnfdfbhjvbhjfb ndn jhnndjfgdjhnfnh hjdghj"
        );
        button.setAttribute("data-mdb-trigger", "hover");

        button.style.border = "solid 2px #000000a6";
        button.style.color = "rgb(33, 36, 41)";
        button.style.background = "white";
        button.style.borderRadius = "10px";

        // add text rasfrom to buuton
        button.style.fontSize = "105%";
        button.style.textTransform = "capitalize";
        button.style.marginLeft = "5px";
        button.style.marginTop = "5px";
        button.style.fontFamily =
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

        button.addEventListener("mouseover", function () {
          const popoverContent = skill.comment;

          const popover = new mdb.Popover(button, {
            container: "body",
            placement: "top",
            content: popoverContent,
            trigger: "hover",
          });

          popover.show();

          setTimeout(() => {
            popover.hide();
          }, 700);
        });

        this.selectedRateSkillDiv.appendChild(button);
      }
    }
  }

  createRateSelectedSkills(htmlElement) {
    const div = document.createElement("div");

    htmlElement.appendChild(div);
  }

  createSkillSelectBox(skillDetail, identifier) {
    const skillDetailArray = JSON.parse(sessionStorage.getItem("items"));
    this.searchInputBox.value =
      skillDetailArray !== null ? skillDetailArray[0].name : skillDetail.term;
    this.selectedASkillBox.innerHTML = "";
    const cardDiv = document.createElement("div");
    document.getElementById("replaceholder").innerHTML = "";
    cardDiv.classList.add("card");
    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.classList.add("card-body");
    cardBodyDiv.id = "card-body-accordion";
    const cardTitleH4 = document.createElement("h4");
    cardTitleH4.classList.add("card-title");
    const rateButton = document.createElement("button");
    rateButton.classList.add(
      "btn",
      "btn-secondary",
      "float-end",
      "btn-rounded"
    );
    rateButton.setAttribute("type", "button");
    rateButton.setAttribute("id", "rateBtn");
    rateButton.style.fontWeight = "bolder";
    rateButton.style.fontSize = "14px";
    rateButton.textContent = "Rate";
    rateButton.addEventListener("click", () => {
      this.changeRateModelElement(skillDetail.skills[0]);
    });
    console.log(skillDetail, "skillDetail");
    rateButton.innerHTML += `  <i class="fas fa-star"></i>`;
    const localdata = sortRatingByLocalStorage();
    const searchText = searchByName(skillDetail.term);
    if (searchText.length > 0) {
      rateButton.style.backgroundColor = "#21965333";
      rateButton.textContent = "rated";
      rateButton.innerHTML += `  <i class="fas fa-star"></i>`;
      rateButton.style.color = "black";
      rateButton.style.fontWeight = "normal";
    }
    this.cardBodyDiv = cardBodyDiv;
    if (skillDetail?.term) {
      addTosessionStorage(skillDetail.skills[0]);
    }
    if (skillDetail.rating_type > 0) {
      cardTitleH4.appendChild(rateButton);
    } else if (
      skillDetail?.skills?.length > 0 &&
      skillDetail?.skills[0]?.ratings[0]?.rating_scale_label.length > 0
    ) {
      cardTitleH4.appendChild(rateButton);
    }
    cardBodyDiv.appendChild(cardTitleH4);
    this.createSkillPath(cardBodyDiv, getListFromsessionStorage());
    if (skillDetail?.skills?.length > 0) {
      skillDetail.skills.forEach((skill) => {
        // clearsessionStorage();
        this.treeSkillAPI(cardBodyDiv, skill.path_addr);
        // this.createSkillPath(cardBodyDiv, getListFromsessionStorage());
      });
    } else {
      this.childrenSkillAPI(skillDetail.path_addr, identifier);
    }
    cardDiv.appendChild(cardBodyDiv);
    this.selectedASkillBox.appendChild(cardDiv);
  }

  createAreaBox() {
    // Create the tab navigation ul element
    const tabNavUl = document.createElement("ul");
    tabNavUl.classList.add("nav", "nav-tabs", "nav-fill", "mb-3");
    tabNavUl.id = "ex1";
    tabNavUl.setAttribute("role", "tablist");

    // Create the tab navigation li elements
    const tabNavLi1 = document.createElement("li");
    tabNavLi1.classList.add("nav-item");
    tabNavLi1.setAttribute("role", "presentation");

    const tabNavLi2 = document.createElement("li");
    tabNavLi2.classList.add("nav-item");
    tabNavLi2.setAttribute("role", "presentation");

    const tabNavLi3 = document.createElement("li");
    tabNavLi3.classList.add("nav-item");
    tabNavLi3.setAttribute("role", "presentation");

    // Create the tab navigation link elements
    const tabNavLink1 = document.createElement("a");
    tabNavLink1.classList.add("nav-link", "fw-bold");
    tabNavLink1.id = "ex2-tab-1";
    tabNavLink1.setAttribute("data-mdb-toggle", "tab");
    tabNavLink1.href = "#ex2-tabs-1";
    tabNavLink1.setAttribute("role", "tab");
    tabNavLink1.setAttribute("aria-controls", "ex2-tabs-1");
    tabNavLink1.setAttribute("aria-selected", "true");
    tabNavLink1.textContent = " Functional Areas";
    tabNavLink1.style.fontSize = "130%";

    const tabNavLink2 = document.createElement("a");
    tabNavLink2.classList.add("nav-link", "fw-bold");
    tabNavLink2.id = "ex2-tab-2";
    tabNavLink2.setAttribute("data-mdb-toggle", "tab");
    tabNavLink2.href = "#ex2-tabs-2";
    tabNavLink2.setAttribute("role", "tab");
    tabNavLink2.setAttribute("aria-controls", "ex2-tabs-2");
    tabNavLink2.setAttribute("aria-selected", "false");
    tabNavLink2.textContent = "Soft Skills";
    tabNavLink2.style.fontSize = "130%";

    const tabNavLink3 = document.createElement("a");
    tabNavLink3.classList.add("nav-link", "fw-bold");
    tabNavLink3.id = "ex2-tab-3";
    tabNavLink3.setAttribute("data-mdb-toggle", "tab");
    tabNavLink3.href = "#ex2-tabs-3";
    tabNavLink3.setAttribute("role", "tab");
    tabNavLink3.setAttribute("aria-controls", "ex2-tabs-3");
    tabNavLink3.setAttribute("aria-selected", "false");
    tabNavLink3.textContent = "Experience Profile";
    tabNavLink3.style.fontSize = "130%";

    // Append the tab navigation links to the respective list items
    tabNavLi1.appendChild(tabNavLink1);
    tabNavLi2.appendChild(tabNavLink2);
    tabNavLi3.appendChild(tabNavLink3);

    // Append the list items to the tab navigation ul element
    tabNavUl.appendChild(tabNavLi1);
    tabNavUl.appendChild(tabNavLi2);
    tabNavUl.appendChild(tabNavLi3);

    // Create the tab content div element
    const tabContentDiv = document.createElement("div");
    tabContentDiv.classList.add("tab-content");
    tabContentDiv.id = "ex2-content";

    // Create the tab content div elements
    const tabContentDiv1 = document.createElement("div");
    tabContentDiv1.classList.add("tab-pane", "fade");
    tabContentDiv1.id = "ex2-tabs-1";
    tabContentDiv1.setAttribute("role", "tabpanel");
    tabContentDiv1.setAttribute("aria-labelledby", "ex2-tab-1");
    tabContentDiv1.innerHTML = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
    this.funcSkillCard = tabContentDiv1;

    const tabContentDiv2 = document.createElement("div");
    tabContentDiv2.classList.add("tab-pane", "fade");
    tabContentDiv2.id = "ex2-tabs-2";
    tabContentDiv2.setAttribute("role", "tabpanel");
    tabContentDiv2.setAttribute("aria-labelledby", "ex2-tab-2");
    tabContentDiv2.innerHTML = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
    this.softSkillCard = tabContentDiv2;

    const tabContentDiv3 = document.createElement("div");
    tabContentDiv3.classList.add("tab-pane", "fade");
    tabContentDiv3.id = "ex2-tabs-3";
    tabContentDiv3.setAttribute("role", "tabpanel");
    tabContentDiv3.setAttribute("aria-labelledby", "ex2-tab-3");
    tabContentDiv3.innerHTML = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
    this.experienceProfileCard = tabContentDiv3;

    // Append the tab content div elements to the tab content div
    tabContentDiv.appendChild(tabContentDiv1);
    tabContentDiv.appendChild(tabContentDiv2);
    tabContentDiv.appendChild(tabContentDiv3);

    this.options.skilFunctionalAreaDiv.appendChild(tabNavUl);
    this.options.skilFunctionalAreaDiv.appendChild(tabContentDiv);
  }

  functionalAreaAPI() {
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-popular-categories/";
    } else {
      url = `${ENDPOINT_URL}popular-categories/`;
    }

    fetch(url)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.log(response);

        this.createSkillSearchButtonList(this.funcSkillCard, response, true);
      })
      .catch((err) => console.error(err));
  }

  softLanguageProficiencySkillAPI() {
    let skillId = "files/a54b2fe8-dfce-4ff8-977d-af63d7777e89";
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-child/?path_addr=" + skillId;
    } else {
      url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
    }
    fetch(url, this.rapidAPIheaders)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.warn("children", response, this.softSkillCard);
        this.createSkillSearchButtonList(this.softSkillCard, response, true);

        // this.createSelectSkillsChildBox(this.cardBodyDiv, response);
      })
      .catch((err) => console.error(err));
  }

  ExperienceProfileAPI() {
    let skillId = "files/fe2f048a-aa8c-4e16-9f51-378a18a2b17a";
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-child/?path_addr=" + skillId;
    } else {
      url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
    }
    fetch(url, this.rapidAPIheaders)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        this.createSkillSearchButtonList(
          this.experienceProfileCard,
          response,
          true
        );

        // this.createSelectSkillsChildBox(this.cardBodyDiv, response);
      })
      .catch((err) => console.error(err));
  }

  childrenSkillAPI(skillId, identifier, parentIdOfHirarchy = "") {
    // Get the element with the class ".card-body"
    const skillIdElement = document.getElementById(
      parentIdOfHirarchy !== "" ? parentIdOfHirarchy : skillId
    );
    const selectedSkillDiv = document.querySelector(".breadcrumb-nav");
    console.log(
      skillId,
      identifier,
      "skillIdElement",
      skillIdElement,
      parentIdOfHirarchy
    );
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.style.margin = "100px auto";

    // Check if the element exists
    if (skillIdElement) {
      const previousContent = skillIdElement.innerHTML;
      // Create and append the loader
      skillIdElement.appendChild(loader);

      let url = "";
      if (isLoginUser) {
        url = `https://api.myskillsplus.com/api-child/?path_addr=${skillId}`;
      } else {
        url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
      }

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken?.access}`,
        },
      })
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          skillIdElement.removeChild(loader);

          skillIdElement.innerHTML = previousContent;
          this.createSelectSkillsChildBox(
            this.cardBodyDiv,
            response,
            identifier,
            parentIdOfHirarchy !== "" ? parentIdOfHirarchy : skillId
          );
        })
        .catch((err) => {
          console.error(err);
          skillIdElement.removeChild(loader);
          skillIdElement.innerHTML = previousContent;
        })
        .finally((err) => { });
    } else {
      const previousContent = selectedSkillDiv.innerHTML;
      // Create and append the loader
      selectedSkillDiv.appendChild(loader);
      let url = "";
      if (isLoginUser) {
        url = `https://api.myskillsplus.com/api-child/?path_addr=${skillId}`;
      } else {
        url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
      }

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken?.access}`,
        },
      })
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          selectedSkillDiv.removeChild(loader);
          selectedSkillDiv.innerHTML = previousContent;

          const url = `${ENDPOINT_URL}get-recommendations/?path_addr=${skillId}`;
          fetchData(url, "GET")
            .then((response) => {
              if (response !== undefined) {
                console.log("get-recommendations", response);

                if (response.length > 0) {

                  const h5 = document.createElement("div");
                  h5.setAttribute("class", "card-title text-start");
                  h5.style.margin = "30px 0px";
                  h5.textContent = "Related Skills";

                  this.cardBodyDiv.appendChild(h5);
                  
                  this.createSelectSkillsChildBox(
                    this.cardBodyDiv,
                    response,
                    "Related Skills",
                    skillId
                  );

                }

                // if (response.length > 0) {

                //   const h5 = document.createElement("h3");
                //   h5.setAttribute("class", "card-title");
                //   h5.style.margin = "30px 0px";
                //   h5.textContent = "Related Skills";

                //   const recCon = document.createElement("div");
                //   recCon.setAttribute("class", "recommended-container");
                //   recCon.style.textAlign = "left";

                //   const recFlex = document.createElement("div");
                //   recFlex.setAttribute("class", "recommended-flex");
                //   recFlex.style.marginBottom = "30px";
                //   recFlex.style.display = "flex";
                //   recFlex.style.flexWrap = "wrap";
                //   recFlex.style.gap = "10px";

                //   recCon.appendChild(h5);

                //   response.forEach((element) => {
                //     const button = document.createElement("button");
                //     button.setAttribute("class", "btn btn-outline-primary");
                //     button.style.textTransform = "none";
                //     button.style.fontSize = "inherit";
                //     button.style.borderRadius = "30px";
                //     button.style.marginRight = "10px";
                //     button.style.marginBottom = "10px";
                //     button.textContent = element.name;
                //     button.addEventListener("mouseover", () => {
                //       button.style.background = "#007DFC";
                //       button.style.color = "white";
                //     });
                //     button.addEventListener("mouseout", () => {
                //       button.style.background = "white";
                //       button.style.color = "#007DFC";
                //     });
                //     recFlex.appendChild(button);
                //   });


                //   recCon.appendChild(recFlex);

                //   this.cardBodyDiv.appendChild(recCon);
                // }
              }
            })
            .catch((error) => {
              console.error(error);
            });


          this.createSelectSkillsChildBox(
            this.cardBodyDiv,
            response,
            identifier,
            skillId
          );
        })
        .catch((err) => {
          selectedSkillDiv.removeChild(loader);
          selectedSkillDiv.innerHTML = previousContent;

          console.error(err);
        });
    }
  }

  treeSkillAPI(cardBodyDiv, skillId) {
    let url = "";
    if (isLoginUser) {
      url = `https://api.myskillsplus.com/api-tree/?path_addr=${skillId}`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken?.access}`,
        },
      })
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          // this.createSkillPath(cardBodyDiv, response.ancestors);
          if (response.siblings.length > 0) {
            this.createSelectSkillsChildBox(
              this.cardBodyDiv,
              response.siblings
            );
          } else {
            this.childrenSkillAPI(skillId);
          }
          setTimeout(() => {
            document.getElementById("rateBtn").click();
          }, 3000);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      url = `${ENDPOINT_URL}tree/?path_addr=${skillId}`;
      fetch(url, this.rapidAPIheaders)
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          // this.createSkillPath(cardBodyDiv, response.ancestors);
          if (response.siblings.length > 0) {
            this.createSelectSkillsChildBox(
              this.cardBodyDiv,
              response.siblings
            );
          } else {
            this.childrenSkillAPI(skillId);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }
}
