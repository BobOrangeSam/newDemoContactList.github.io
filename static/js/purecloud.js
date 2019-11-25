//#region set const and variables

const clientId = "5c33c2ef-9b33-4236-b4e1-69a18841b7f1"; // Create a new "Token Implicit Grant (Browser)" OAuth credential in your PureCloud org and paste the Client Id here. See README.md for details
const redirectUrl = "https://boborangesam.github.io/newDemoContactList.github.io/index.html"; // Update this variable to your web server URL (e.g. http://localhost:8080/index.html). The value should reflect your "Redirect URL" setting in your OAuth credentials
const environment = "mypurecloud.ie"; // Your PureCloud environment (e.g. mypurecloud.ie, mypurecloud.de, mypurecloud.com, mypurecloud.com.au, mypurecloud.jp)

const platformClient = require("platformClient");
const client = platformClient.ApiClient.instance;
client.setPersistSettings(true);

const _token = client.authentications["PureCloud Auth"].accessToken;

//#endregion

// Set Environment (in case page reloaded)
client.setEnvironment(environment);

//#region Hanlde Init & signIn to obtain valid Token

function signIn() {
  console.log("signIn");
  client
    .loginImplicitGrant(clientId, redirectUrl)
    .then(function() {
      // Wait for PageReload.
      console.log("logged in");
    })
    .catch(function(err) {
      console.log(err);
    });
}

signIn();

//#endregion

//#region API Calls

/**
 *
 * @returns {object} current user details
 */
function getCurrentUser() {
  return new Promise(function(resolve, reject) {
    try {
		var apiInstance = new platformClient.UsersApi();
		let opts = { 
			'expand': ["routingStatus, presence"] // routingStatus, presence, conversationSummary, outOfOffice, geolocation, station, authorization, authorization.unusedRoles, profileSkills, certifications, locations, groups, skills, languages, languagePreference, employerInfo, biography, date, geolocationsettings, organization, presencedefinitions, locationdefinitions, orgauthorization, orgproducts, favorites, superiors, directreports, adjacents, routingskills, routinglanguages, fieldconfigs, token, trustors
		};

        apiInstance
			.getUsersMe(opts)
			.then(function(data) {
				//console.log("getUsersMe start");
				//console.log(data);
				//console.log("getUsersMe done");
				resolve(data);
			})
			.catch(function(err) {
				console.log("There was a failure calling getUsersMe");
				console.error(err);
				reject(err);
			});
    } catch (err) {
      console.log(err);
      reject();
    }
  });
}

/**
 *
 * @param {string} listname Name of the new contact list
 *
 * @returns {object} contact list information
 */
function createContactList(listname) {
  return new Promise(function(resolve, reject) {
    try {
		var apiInstance = new platformClient.OutboundApi();
		var body = {
		   "name": listname,
		   "columnNames": ["uniqueid","firstName","lastName","Telephone"],
		   "phoneColumns": [
			  {
				 "columnName": "Telephone",
				 "type": "cell",
				 "callableTimeColumn": ""
			  }
		   ]
		};

        apiInstance
			.postOutboundContactlists(body)
			.then(function(data) {
				console.log("createContactList start");
				console.log(data);
				console.log("createContactList done");
				resolve(data);
			})
			.catch(function(err) {
				console.log("There was a failure calling createContactList");
				console.error(err);
				reject(err);
			});
    } catch (err) {
      console.log(err);
      reject();
    }
  });
}

/**
 *
 * @param {string} uniqueId Unique ID for this item
 * @param {string} contactListId ID of the contact list
 *
 * @returns {object} contact list information
 */
function addContactInList(uniqueId,contactListId,firstName,lastName,telephone) {
  return new Promise(function(resolve, reject) {
    try {
		var apiInstance = new platformClient.OutboundApi();
		
		var body = [{ 
		  "id": "", 
		  "contactListId": contactListId, 
		  "data": {"uniqueid":uniqueId,"firstName":firstName,"lastName":lastName,"Telephone":telephone}
		}];
		var opts = {
			'priority': false, // True means the contact(s) will be dialed next; false means the contact will go to the end of the contact queue.
			'clearSystemData': true, // Boolean | Clear system data. True means the system columns (attempts, callable status, etc) stored on the contact will be cleared if the contact already exists; false means they won't.
			'doNotQueue': true // Boolean | Do not queue. True means that updated contacts will not have their positions in the queue altered, so contacts that have already been dialed will not be redialed. For new contacts they will not be called until a campaign recycle; False means that updated contacts will be re-queued, according to the 'priority' parameter.
		};

        apiInstance
			.postOutboundContactlistContacts(contactListId, body, opts)
			.then(function(data) {
				console.log("addContactInList start");
				console.log(data);
				console.log("addContactInList done");
				resolve(data);
			})
			.catch(function(err) {
				console.log("There was a failure calling addContactInList");
				console.error(err);
				reject(err);
			});
    } catch (err) {
      console.log(err);
      reject();
    }
  });
}

/**
 *
 * @param {string} listname Name of the contact list
 *
 * @returns {object} contact list information
 */
function getContactListByName(listname) {
  return new Promise(function(resolve, reject) {
    try {
		var apiInstance = new platformClient.OutboundApi();
		
		var opts = { 
			'includeImportStatus': false, // Boolean | Include import status
			'includeSize': false, // Boolean | Include size
			'pageSize': 25, // Number | Page size. The max that will be returned is 100.
			'pageNumber': 1, // Number | Page number
			'filterType': 'Prefix', // String | Filter type
			'name': listname, // String | Name
			'sortOrder': 'ascending' // String | Sort order
		};
		
		apiInstance
			.getOutboundContactlists(opts)
			.then(function(data) {
				console.log("getContactListByName start");
				console.log(data);
				console.log("getContactListByName done");
				resolve(data);
			})
			.catch(function(err) {
				console.log("There was a failure calling getContactListByName");
				console.error(err);
				reject(err);
			});
    } catch (err) {
      console.log(err);
      reject();
    }
  });
}

/**
 *
 * @param {string} listid ID of the contact list
 * @param {string} nbOccurence Nb of items to be added in contact list
 * @param {string} firstName Fist name of any item
 * @param {string} lastName Last name of any item
 * @param {string} telephone Telephone number of any item
 *
 * @returns {object} contact list information
 */
function fillMultipleContactListById(listid,nbOccurence,firstName,lastName,telephone) {
	var nbContact = 0;
	if (nbOccurence>99) nbOccurence = 99; // On restreint à 99 elements
	for (let i = 1; i <= 10; i++) {
		var uid = '00'+i;
		if (uid>=10) {
			uid = '0'+i;
		}
		
		console.log('uid : '+uid);
		addContactInList(uid,listid,firstName,lastName,telephone).then((listitem) => {
			nbContact++;
		}).catch((error) => {
			console.error(error);
		});
	}
}

/**
 *
 * @param {string} listid ID of the contact list
 *
 * @returns {object} contact list information
 */
function emptyContactList(listid) {
	// apiInstance.postOutboundContactlistClear(contactListId)
	return new Promise(function(resolve, reject) {
		try {
			var apiInstance = new platformClient.OutboundApi();
			
			apiInstance
				.postOutboundContactlistClear(listid)
				.then(function(data) {
				//console.log("emptyContactList start");
				//console.log(data);
				//console.log("emptyContactList done");
				resolve(data);
			})
			.catch(function(err) {
				console.log("There was a failure calling emptyContactList");
				console.error(err);
				reject(err);
			});
		} catch (err) {
			console.log(err);
			reject();
		}
	});
}

//#endregion
