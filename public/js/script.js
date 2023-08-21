// script for hamburger to hide or show

let users_window = document.querySelector(".users-window");

function show_hide() {
  if (users_window.style.display == "block") {
    users_window.style.display = "none";
  } else {
    users_window.style.display = "block";
  }
}

// script for printing users on UI

const auth = firebase.auth();
const database = firebase.firestore();
let current_location = window.location;

let myUsersList = document.getElementById("users_list");
let user_lenght = document.getElementById("user_lenght");
let currentUser = JSON.parse(localStorage.getItem("currentLoggedInUser"));
let allUsers = [];

window.addEventListener("load", function () {
  auth.onAuthStateChanged((user) => {
    if (user) {
      var uid = user.uid;
      database
        .collection("users")
        .where("user_uid", "!=", uid)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            printUsersList(doc.data());
          });
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  });
});

function printUsersList(userData) {
  let wrapper = document.createElement("li");
  let userImage = document.createElement("img");
  let wrapperForUserName = document.createElement("div");
  let userName = document.createElement("h2");
  userImage.setAttribute("src", userData?.profile_image);
  userImage.setAttribute("alt", "user_image");
  userName.innerHTML = userData?.name;
  wrapperForUserName.appendChild(userName);
  wrapper.setAttribute("id", userData?.user_uid);
  wrapper.setAttribute("onclick", "getCurrentUserData(this)");
  wrapper.appendChild(userImage);
  wrapper.appendChild(wrapperForUserName);
  myUsersList.appendChild(wrapper);
  allUsers.push(userData);
  // script for showing number of people in user box
  if (myUsersList) {
    user_lenght.innerHTML = myUsersList.children.length;
  }
}

function getCurrentUserData(currentHighlightedArea) {
  const currentUserId = currentHighlightedArea?.id;
  const getCurrentUser = allUsers?.filter(
    (user) => user?.user_uid == currentUserId
  )[0];
  printCurrentFocusUserHead(getCurrentUser);
  show_hide()
}

let senderListener;
let receiverListener;

function printCurrentFocusUserHead(userForChatting) {
  let wrapper = document.getElementById("current_user_identification");

  // for replacing different user messages

  let wrapperForMessages = document.getElementById("chat_messages");

  let getSiblingMessage = wrapperForMessages.children;
  // console.log("wrapperForMessages", getSiblingMessage);

  while (getSiblingMessage.length) {
    if (getSiblingMessage?.length > 0) {
      wrapperForMessages.removeChild(getSiblingMessage[0]);
    }
  }

  // for replacing different user name and images
  let getSiblingElement = wrapper.children;
  if (getSiblingElement?.length > 0) {
    wrapper.removeChild(getSiblingElement[0]);
  }
  if (getSiblingElement?.length > 0) {
    wrapper.removeChild(getSiblingElement[0]);
  }
  let userImage = document.createElement("img");
  let userName = document.createElement("h4");
  userImage.setAttribute("src", userForChatting?.profile_image);
  userImage.setAttribute("alt", "user_image");
  userName.innerHTML = userForChatting?.name;
  wrapper.appendChild(userImage);
  wrapper.appendChild(userName);
  localStorage.setItem(
    "currentUserForChatting",
    JSON.stringify(userForChatting)
  );

  // remove existing listeners before setting up new ones
  if (senderListener) senderListener();
  if (receiverListener) receiverListener();

  senderListener = database
    .collection("chats")
    .where("sender_id", "==", currentUser?.user_uid)
    .where("reciever_id", "==", userForChatting?.user_uid)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("all Messages: ", change.doc.data());
          if (change.doc.data()?.sender_id == currentUser?.user_uid) {
            showMessages("isMine", change.doc.data());
          }
        }
      });
    });

  receiverListener = database
    .collection("chats")
    .where("sender_id", "==", userForChatting?.user_uid)
    .where("reciever_id", "==", currentUser?.user_uid)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("all Messages: ", change.doc.data());
          if (change.doc.data()?.sender_id == userForChatting?.user_uid) {
            console.log("notMine: ", change.doc.data());
            showMessages("notMine", change.doc.data());
          }
        }
      });
    });
}

// Function to scroll the container to the bottom

function scrollToBottom() {
  const chatMessages = document.querySelector('#chat_messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showMessages(message_type, message) {
  if (message_type == "isMine") {
    let wrapperForMessages = document.getElementById("chat_messages");
    let wrapper = document.createElement("div");
    wrapper.setAttribute("class", "message outgoing-message");
    let userName = document.createElement("h5");
    userName.innerHTML = message?.sender_name;
    let currentMessage = document.createElement("p");
    currentMessage.innerHTML = message?.chatMessage;
    wrapper.appendChild(userName);
    wrapper.appendChild(currentMessage);
    wrapperForMessages.appendChild(wrapper);
    scrollToBottom()
  } else {
    let wrapperForMessages = document.getElementById("chat_messages");
    let wrapper = document.createElement("div");
    wrapper.setAttribute("class", "message incoming-message");
    let userName = document.createElement("h5");
    userName.innerHTML = message?.sender_name;
    let currentMessage = document.createElement("p");
    currentMessage.innerHTML = message?.chatMessage;
    wrapper.appendChild(userName);
    wrapper.appendChild(currentMessage);
    wrapperForMessages.appendChild(wrapper);
    scrollToBottom()
  }
}

document.querySelector("form").addEventListener("submit", function (event) {
  // prevent default form submission
  event.preventDefault();
  let getCurrentMsg = document.getElementById("getCurrentTypedMsg");
  let getUserForMessaging = JSON.parse(
    localStorage.getItem("currentUserForChatting")
  );
  console.log("currentUser", currentUser);
  database
    .collection("chats")
    .add({
      chatMessage: getCurrentMsg.value,
      sender_id: currentUser?.user_uid,
      reciever_id: getUserForMessaging?.user_uid,
      isSeen: false,
      currentTimeStamp: new Date(),
      sender_name: currentUser?.name,
      reciever_name: getUserForMessaging?.name,
    })
    .then((doc) => {
      console.log("doc is", doc);
      getCurrentMsg.value = "";
    })
    .catch((error) => {
      console.log("error is", error);
    });
  // do something with the form data
});

const signOut = () => {
  auth.signOut().then(function () {
    localStorage.clear();
    current_location.href = "index.html";
  });
};
