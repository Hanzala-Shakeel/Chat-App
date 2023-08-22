const database = firebase.firestore();

const storage = firebase.storage();

const auth = firebase.auth();

let myName = document.getElementById("name");
let email = document.getElementById("email");
let password = document.getElementById("password");
let profile_image = document.getElementById("profile_image");
let submit_btn = document.getElementById("submit-btn");
let current_location = window.location;

const signupUser = () => {
  if (myName.value === "") {
    alert("Please enter your name");
    return;
  }
  if (email.value === "") {
    alert("Please enter your email");
    return;
  }
  if (password.value === "") {
    alert("Please enter your password");
    return;
  }
  if (profile_image.files[0] !== null) {
    alert("Please select profile picture");
    return;
  }

  // Regular expression to check if the email format is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    swal("Invalid Email", "Please enter a valid email address", "warning");
    return;
  }

  const getFiles = profile_image.files[0];
  const imagesRef = storage.ref().child("profile_images/" + getFiles.name);
  auth
    .createUserWithEmailAndPassword(email.value, password.value)
    .then((userCredential) => {
      var user = userCredential.user;
      let user_uid = user.uid;
      console.log("Signup User", user);
      imagesRef.put(getFiles).then((data) => {
        data.ref.getDownloadURL().then((url) => {
          // do whatever you want with url
          console.log("url=>", url);
          database
            .collection("users")
            .doc(user_uid)
            .set({
              name: myName.value,
              user_email: email.value,
              user_uid: user_uid,
              profile_image: url,
            })
            .then((doc) => {
              localStorage.setItem(
                "currentLoggedInUser",
                JSON.stringify({
                  name: myName.value,
                  user_email: email.value,
                  user_uid: user_uid,
                  profile_image: url,
                })
              );
              myName.value = "";
              email.value = "";
              password.value = "";
              console.log("error is", doc);
              swal(
                {
                  title: "Congrats!",
                  text: "SignUp Succesfully!",
                  type: "success",
                },
                function () {
                  current_location.href = "home.html";
                }
              );
            })
            .catch((error) => {
              console.log("error is", error);
            });
        });
      });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (error.code === "auth/email-already-in-use") {
        swal(
          "Email Already in Use",
          "Please use a different email address.",
          "warning"
        );
      } else {
        swal("Error!", "An error occurred. Please try again later.", "error");
      }
    })
};
// })};

const loginUser = () => {

  if (email.value == "") {
    alert("Please enter your email");
    return;
  }
  if (password.value == "") {
    alert("Please enter your password");
    return;
  }

  // Regular expression to check if the email format is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    swal("Invalid Email", "Please enter a valid email address", "warning");
    return;
  }
  auth
    .signInWithEmailAndPassword(email.value, password.value)
    .then((userCredential) => {
      var user = userCredential.user;
      console.log("Login User", user);
      database
        .collection("users")
        .where("user_uid", "==", user?.uid)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            localStorage.setItem(
              "currentLoggedInUser",
              JSON.stringify(doc.data())
            );
            swal(
              {
                title: "Congrats!",
                text: "Login Succesfully!",
                type: "success",
              },
              function () {
                current_location.href = "home.html";
              }
            );
          });
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // If account not found (email or password incorrect), show the appropriate message
      if (errorCode === "auth/user-not-found") {
        swal(
          {
            title: "Account Not Found!",
            text: "Please register to create an account",
            type: "warning",
          },
          function () {
            window.location.href = "signup.html";
          }
        );
      } else if (errorCode === "auth/wrong-password") {
        swal(
          "Incorrect Password",
          "Please check your password and try again",
          "error"
        );
      } else {
        // Handle other error scenarios
        swal("Error!", "An error occurred. Please try again later.", "error");
      }
    });
};
