// index.js

// page elements that will be changed when user is loaded
const userImage = document.querySelector(".user-card__user-image");
const userName = document.querySelector(".user-card__user-name");
const userID = document.querySelector(".user-card__user-id");
const joinedDate = document.querySelector(".user-card__joined-date");
const userBio = document.querySelector(".user-card__user-bio");
const statsRepos = document.querySelector(".user-card__stats-repos");
const statsFollowers = document.querySelector(".user-card__stats-followers");
const statsFollowing = document.querySelector(".user-card__stats-following");
const locationPhysical = document.querySelector(".user-card__location-physical");
const locationWebsite = document.querySelector(".user-card__location-website");
const locationTwitter = document.querySelector(".user-card__location-twitter");
const locationCompany = document.querySelector(".user-card__location-company");

// searchbar elements
const inputSearch = document.querySelector(".searchbar__input");
const errorMessage = document.querySelector(".searchbar__error-msg");
const buttonSearch = document.querySelector(".searchbar__button");

// dark/light toggle button
const modeToggle = document.querySelector(".mode-toggle");

// *******************
// get Octokit from github and initialize
import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
const octokit = new Octokit();

// SIMULATION
// when DOM content is loaded, load and parse data
window.addEventListener('DOMContentLoaded', (e) => {

  fetch("data/data.json")
    .then(response => {
      if (response.status >= 200 && response.status <=299) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => parseData(data))
  .catch((error) => {
      console.log("There was an error loading data.");
      console.log(error);
  })
});



// * async function to grab a user by name
async function getUser(username) {
  try {
    const response = await octokit.request('GET /users/{username}', {
      username: username
    });
    // if we got a user, go to parseData
    parseData(response.data);
  } catch(err) {
    console.log("Error:", err.status);
    if (err.status == 404) {
      // if no user was found, update the error message text
      // with "No results"
      errorMessage.textContent = "No results";
    } else {
      // if there was some other error, just say "Error!"
      errorMessage.textContent = "Error!";
    }
    // and make sure the error message shows
    errorMessage.classList.add("show");
  }
}

/*
// * always begin by displaying "octocat"
getUser("octocat");
*/

//  * on loading get the user's prefered color scheme 
//    - if it's set to dark, then add the dark class to :root
//    - if it's not set to dark, default to light, add light class to :root
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.className = "dark";
} else {
  document.documentElement.className = "light";
}

// * dark/light toggle function
modeToggle.addEventListener("click", function() {
  if (document.documentElement.className == "light") {
    document.documentElement.className = "dark";
    this.classList.add("status-dark");
    this.classList.remove("status-light");
  } else {
    document.documentElement.className = "light";
    this.classList.add("status-light");
    this.classList.remove("status-dark");
  }
});

// * search button functionality
buttonSearch.addEventListener("click", function(event) {
  event.preventDefault();
  // only perform a search if the input is non-empty
  if (inputSearch.value != "") {
    getUser(inputSearch.value);
  }
});

// * clear any error message when input changes
inputSearch.addEventListener('input', function() {
  errorMessage.classList.remove("show");
});




// * parse the data and insert it into the relevent elements
function parseData(data) {
  userImage.src = data.avatar_url;

  userName.textContent = ((data.name == null) ? data.login : data.name);
  userID.textContent = data.login;

  // get the date joined string, parse it, and turn it into a date object
  const joined = new Date (Date.parse(data.created_at));
  // then return it to a string in day month year format
  joinedDate.textContent = joined.toLocaleString('en-GB', {year: 'numeric', month: 'short', day: 'numeric'});

  if (data.bio == null) {
    userBio.textContent = "This profile has no bio";
    userBio.classList.add("transparency");
  } else {
    userBio.textContent = data.bio;
    userBio.classList.remove("transparency");
  };

  statsRepos.textContent = data.public_repos;
  statsFollowers.textContent = data.followers;
  statsFollowing.textContent = data.following;

  if (data.location == null) {
    locationPhysical.textContent = "Not Available";
    locationPhysical.classList.add("transparency");
    locationPhysical.previousElementSibling.classList.add("transparency");
  } else {
    locationPhysical.textContent = data.location;
    locationPhysical.classList.remove("transparency");
    locationPhysical.previousElementSibling.classList.remove("transparency");
  };

  if ((data.blog == null) || (data.blog == "")) {
    locationWebsite.removeAttribute("href");
    locationWebsite.textContent = "Not Available";
    locationWebsite.classList.add("transparency");
    locationWebsite.previousElementSibling.classList.add("transparency");
  } else {
    locationWebsite.textContent = data.blog;
    locationWebsite.href = data.blog;
    locationWebsite.classList.remove("transparency");
    locationWebsite.previousElementSibling.classList.remove("transparency");
  };

  if (data.twitter_username == null) {
    locationTwitter.removeAttribute("href");
    locationTwitter.textContent = "Not Available";
    locationTwitter.classList.add("transparency");
    locationTwitter.previousElementSibling.classList.add("transparency");
  } else {
    let twitterName = data.twitter_username;
    if (twitterName[0] == "@") {
      twitterName = data.twitter_username.split("@")[1];
    };
    locationTwitter.textContent = "@" + twitterName;
    locationTwitter.href = "https://twitter.com/" + twitterName;
    locationTwitter.classList.remove("transparency");
    locationTwitter.previousElementSibling.classList.remove("transparency");
  };

  if (data.company == null) {
    locationCompany.textContent = "Not Available";
    locationCompany.classList.add("transparency");
    locationCompany.previousElementSibling.classList.add("transparency");
  } else {
    // According to the challenge specs, this field should contain a company name
    // beginning with the @ symbol, and that should be turned into a link
    // beginning with "https://github.com/".
    // However, I noticed some users put extra text into the this field,
    // thus I attempted to separate out only the "@..." portion for creating
    // the href for the anchor element.
    const regexp = /(\w|-)*/;
    let companyName = data.company;
    if (companyName[0] == "@") {
      locationCompany.href = "https://github.com/" + companyName.split("@")[1].match(regexp)[0];
    } else {
      locationCompany.removeAttribute("href");
    }
    locationCompany.textContent = companyName;
    locationCompany.classList.remove("transparency");
    locationCompany.previousElementSibling.classList.remove("transparency");
  }
}
  

