
var url = "";
const todoresp = {todo: "showPageAction"};

chrome.runtime.sendMessage(todoresp);

main();

function main() {

  var sliderInnerHTMLString = "\
  <!-- HEADER IS HERE -->\
  <div id='sheader'>\
  <div id='sheaderheader'></div>\
  <div id='scancontainer'>\
  <label id='scanlabel' for='scan'><h1 name='scan' id='scan' value='LinkedIn Scrapper'/>LinkedIn Scrapper</h1></label>\
  </div>\
  <div class='internal_button sticky_buttons' id='clear_text_button'>Clear Text?</div>\
  <br/>\
  </div>\
  <br/>\
  \
  \
  <!-- THE BODY CONTAINER IS HERE -->\
  <div id='sbodycontainer'>\
  <h2>Profile<h2/>\
  <textarea id='basicprofile' style='height: 200px;'></textarea>\
  <br/>\
  <h2> Experience Section </h2>\
  <br/>\
  <textarea id='experiencetext' style='height: 200px;'></textarea>\
  <br/>\
  <div class='internal_button' id='experience_extract_button'>Extract Work Ex</div>\
  <hr/>\
  <h2> Licenses and Certifications </h2>\
  <br/>\
  <textarea id='certificationstext' style='height: 200px;'></textarea>\
  <br/>\
  <div class='internal_button' id='certification_extract_button'>Extract Certifications</div>\
  \
  <hr>\
  <h2> Skills </h3>\
  <br/>\
  <textarea id='skillstext' style='height: 200px;'></textarea>\
  <br/>\
  <div class='internal_button' id='skills_extract_button'>Extract Skills</div>\
  </div>\
  <br/>\
  <br/>\
  \
  \
  <!-- THE FOOTER IS HERE -->\
  <div id='sfooter'><hr/>\
  <div class='internal_button' id='save_profile_data_button'>Save Profile Data</div>\
  </div>\
  ";
  

    sliderGen(sliderInnerHTMLString);

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      if(msg.todo == "toggle") {
        slider();
      }
    });
    
  document.getElementById('clear_text_button').addEventListener("click", function() {
    var ids = ['basicprofile', 'experiencetext', 'skillstext', 'certificationstext' ];
    for(var i=0; i<ids.length; i++) {
        document.getElementById(ids[i]).value = "";
      }
  });


  document.getElementById("slider").onscroll = function () {
    printName();
    document.getElementById('basicprofile').value = JSON.stringify(extract());
  }

  //deploying listeners for `manual extraction` buttons feature
  document.getElementById('certification_extract_button').addEventListener("click", extractCert);
  document.getElementById('skills_extract_button').addEventListener("click", extractSkills);
  document.getElementById('experience_extract_button').addEventListener("click", getexperiencecode);
  
  //save data button
  document.getElementById('save_profile_data_button').addEventListener("click", saveProfileData);

} //MAIN FUNCTION ENDS HERE //


function saveProfileData() {
  var textBoxIds = ['basicprofile',  'experiencetext', 'skillstext', 'certificationstext'];
  var profileData = {};
  for(var i=0; i<textBoxIds.length; i++) {
    var tempid = textBoxIds[i];
    if(tempid.includes("text"))
      tempid = tempid.replace("text", "")
    
    if(document.getElementById(textBoxIds[i]).value)
      profileData[tempid] = JSON.parse(document.getElementById(textBoxIds[i]).value);
    else
      profileData[tempid] = "No data";
  }

   // download file code
   var filename = prompt("Enter file Name:");
   var data = new Blob([JSON.stringify(profileData)], {type: "application/json"});
   var a = document.createElement("a"), url= URL.createObjectURL(data);
   a.href = url;
   a.download = filename+".txt";
   document.body.appendChild(a);
   a.click();
   setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
   }, 0);
} // save profile data ends here

function printName() {
  var uname = document?.querySelector('div.pv-text-details__left-panel > div > h1') || document?.getElementsByClassName('artdeco-entity-lockup__title ember-view')[0] || null;
    uname = uname?.textContent || "";
    uname = getCleanText(uname);
    document.getElementById('slider').querySelector('#sheaderheader').innerHTML = "<h1>" + uname + "</h1>";
}

//slider window element generator
function sliderGen(sliderInnerHTMLString) {
    var slider = document.createElement("div");
    slider.id = "slider";
    var sliderDivInnerHTML = sliderInnerHTMLString;

    slider.innerHTML += sliderDivInnerHTML;

    document.body.prepend(slider);
}

//slider function to toggle the slider frame
function slider() {
    var slider = document.getElementById("slider");

    var styler = slider.style;
    if(styler.width == "0px") {
        styler.width = "400px";
    } else {
        styler.width = "0px";
    }
}

function extract() {
  const profileSection = document.querySelector(".mt2.relative");

  const fullNameElement = profileSection?.querySelector('h1.text-heading-xlarge');
  const fullName = fullNameElement?.textContent.trim() || null;

  const titleElement = profileSection?.querySelector('.text-body-medium');
  const title = titleElement?.textContent.trim() || null;

  const locationElement = profileSection?.querySelector('.text-body-small.inline.t-black--light.break-words');
  const location = locationElement?.textContent.trim() || null;

  const descriptionElement = profileSection?.querySelector('.text-body-medium.break-words');
  const description = descriptionElement?.textContent.trim() || null;

  // Email and contact number extraction
  const contactInfoButton = document.querySelector('#top-card-text-details-contact-info');
  let email = null;
  let phoneNumber = null;

  if (contactInfoButton) {
    contactInfoButton.click();
    const contactInfoContainer = document.querySelector('.ObOKhpbzfIzCNdaAxuAeRrPFInfHeZwSWhYGEQ JBzfZnjXmAffqkeJgEyDdmsZezObjFVVNAwjE artdeco-container-card');
    email = contactInfoContainer?.querySelector('.nezhvbSwImffRzmYLnQgdlTIMdjPWMVJs link-without-visited-state t-14')?.textContent.trim() || null;
    phoneNumber = contactInfoContainer?.querySelector('.t-14 t-black t-normal')?.textContent.trim() || null;
  }

  const url = window.location.href;

  const rawProfileData = {
    fullName,
    title,
    location,
    description,
    email,
    phoneNumber,
    url
  };

  const profileData = {
    fullName: getCleanText(rawProfileData.fullName),
    title: getCleanText(rawProfileData.title),
    location: getCleanText(rawProfileData.location),
    description: getCleanText(rawProfileData.description),
    email: getCleanText(rawProfileData.email),
    phoneNumber: getCleanText(rawProfileData.phoneNumber),
    url: rawProfileData.url
  };

  return profileData;
}

document.getElementById("slider").onscroll = function () {
  printName();
  document.getElementById('basicprofile').value = JSON.stringify(extract(), null, 2);
};

// Extract license and certifications
function extractCert() {
  var anchor1 = document.getElementById('licenses_and_certifications');
  var anchor2 = document.querySelector('.pvs-list');

  var list = null;
  var certs = [];

  if(anchor1) {
    anchor1 = anchor1.nextElementSibling.nextElementSibling
    list = anchor1.querySelector('ul').children;
  }

  if(anchor2 && document.getElementById('scan').checked && location.href.includes('certifications')) {
    list = anchor2.children;
  }

  if(list) { //if the anchor exists
    for(i=0; i<list.length; i++) {
      var elem = null;
      var firstdiv = null;
      var url = "";

      if(anchor1 && !document.getElementById('scan').checked) {
        //alert("anchor1");
        elem = list[i].firstElementChild.firstElementChild.nextElementSibling
                        .querySelectorAll('div');
        
        if(elem[0].querySelector('a')){
          firstdiv = elem[0].querySelector('a').children;
        } else {
          firstdiv = elem[1].children;
        }
        
        url = elem[4]?.querySelector('a')?.href || "";
        //if anchor1
      } 
      else if ((anchor1 == null) && anchor2 && document.getElementById('scan').checked  && location.href.includes('certifications')) {
        //alert("anchor2s");
        elem = list[i].querySelector('div > div').firstElementChild.nextElementSibling;
        firstdiv = elem.firstElementChild.firstElementChild.children;

        url = elem.firstElementChild.nextElementSibling?.querySelector('a').href || "";
      } //if anchor2
      else {
        break;
      }
      
     var name = getCleanText(firstdiv[0].querySelector('span > span')?.textContent || "");
     var issuedby = getCleanText(firstdiv[1].querySelector('span > span')?.textContent || "");
     var issuedon = getCleanText(firstdiv[2]?.querySelector('span > span')?.textContent || "");
     var expiration = issuedon? issuedon.split('·')[1] : "";
     var issuedon = issuedon? issuedon.split('·')[0]?.split('Issued ')[1] || "" : "";

      

      var temp = {
        'id': i,
        'title': name,
        'issuer':issuedby,
        'date':issuedon,
        'expiration': expiration,
        'link': url
      };

      certs.push(temp);

    } //for loop to scrape through the list 
  }
  var objtemp = {
    'name': 'licenses',
    'data': certs
  }

  document.getElementById('certificationstext').value = JSON.stringify(objtemp);
} //license extraction ends here


// Extract Skills 
function extractSkills() {
  try {
    // Defining anchors (roots from where scraping starts)
    var anchor1 = document.getElementById("skills");
    var anchor2 = document.querySelector('.pvs-list');
    var list = null;
    var skills = [];

    // Determine which anchor to use based on the checkbox state
    if (anchor1 && !document.getElementById('scan').checked) {
      anchor1 = anchor1.nextElementSibling.nextElementSibling;
      if (anchor1) {
        list = anchor1.querySelector('ul')?.children;
      }
    }

    if (anchor2 && document.getElementById('scan').checked && location.href.includes('skills')) {
      list = anchor2.children;
    }

    // Extract skills from the list if it exists
    if (list) {
      for (var i = 0; i < list.length; i++) {
        var elem = '';

        if (anchor1 && !document.getElementById('scan').checked) {
          var divElements = list[i].querySelector('.display-flex.full-width .display-flex.align-items-center.mr1.hoverable-link-text.t-bold');
          elem = getCleanText(divElements?.textContent || "");
        } else if (!anchor1 && anchor2 && document.getElementById('scan').checked && location.href.includes('skills')) {
          var childElements = list[i].querySelector('.display-flex.full-width .display-flex.align-items-center.mr1.hoverable-link-text.t-bold');
          elem = getCleanText(childElements?.textContent || "");
        } else {
          break;
        }

        skills.push({
          'id': i,
          'title': elem
        });
      }
    }

    var objtemp = {
      'name': 'skills',
      'data': skills
    };

    document.getElementById('skillstext').value = JSON.stringify(objtemp);
  } catch (error) {
    console.error("Error extracting skills:", error);
  }
}

function getCleanText(text) {
  return text.trim();
}


// Extract Experience //
function getexperiencecode() {
  var exp = [];
  var list = document.querySelector('#experience').nextElementSibling.nextElementSibling;
  
  if (list) {
    var listItems = list.querySelectorAll('ul > li');
    
    listItems.forEach((item, index) => {
      var companyElement = item.querySelector('.t-14.t-normal');
      var company = companyElement ? companyElement.textContent.trim() : null;
      
      var rolesElements = item.querySelectorAll('.display-flex.full-width > .mr1');
      var roles = [];
      
      rolesElements.forEach(roleElem => {
        var titleElem = roleElem.querySelector('.t-14.t-normal');
        var durationElem = roleElem.querySelector('.t-14.t-normal.t-black--light');
        
        var title = titleElem ? titleElem.textContent.trim() : null;
        var duration = durationElem ? durationElem.textContent.trim() : null;
        
        roles.push({
          title: title,
          duration: duration
        });
      });
      
      exp.push({
        company: company,
        roles: roles
      });
    });
  }
  
  document.getElementById('experiencetext').value = JSON.stringify(exp, null, 2);
}


document.getElementById('experience_extract_button').addEventListener("click", getexperiencecode);

function getCleanText(text) {
  const regexRemoveMultipleSpaces = / +/g;
  const regexRemoveLineBreaks = /(\r\n\t|\n|\r\t)/gm;

  if (!text) return null;

  const cleanText = text.toString()
    .replace(regexRemoveLineBreaks, '')
    .replace(regexRemoveMultipleSpaces, ' ')
    .replace('...', '')
    .replace('See more', '')
    .replace('See less', '')
    .trim();

  return cleanText;
}



$(document).ready(function(){
  $("#save_profile_data_button").click(function()
  {
    console.log( document.getElementById('basicprofile').value)
    });
  });