//Reuse Vandy Testing Environment

//Create a mock DB
userDB = new Array();

userDB[0] = new Array("geoffrey.e.anapolle@vanderbilt.edu", "#GeoffreyA123", "ABCD1234", "Active");
userDB[1] = new Array("carter.g.caldwell@vanderbilt.edu", "#CarterC123", "1234ABCD", "Pending");


//Login Testing
function loginTest(email, password, user) {

    var userFound = 0;
    //Searches DB for user with email
    for (let i = 0; i < 2; i++) {
        if (userDB[i][0] == email) {

            //Pass
            userFound = 1;
        }
    }

    if (userFound = 0) {
        //Failure
        return false;
    }

    //User account Active
    if (userDB[user][3] == 'Pending') {

        //Failure
        return false;
    }

    //Check Password
    if (userDB[user][1] == password) {

        //Pass
        return true;
    } else {

        //Failure
        return false;
    }
}

//Sign-Up Testing
function testSignup(email, password, password2, user) {

    //Some important constants
    const emailHandle = "@vanderbilt.edu";
    const symbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    //Checks valid vanderbilt email handle was entered
    if (!(email.endsWith(emailHandle))) {
        //not a vanderbilt email

        //Failure
        return false;
    }

    //Checks Password meets Certain Strength Requirements
    else if (password.length < 8 || password.length > 25 || !(hasNumber(password)) || !(symbols.test(password))) {

        //Failure
        return false;
    }

    //Confirms Password matches Re-Typed Version
    else if (password !== password2) {

        //Failure
        return false;
    } else {
        //Pass
        return true;
    }

};


console.log("==============================================")
console.log("============Start of Test Suite===============")
console.log("==============================================")
console.log("\n\n")

const numTests = 11;
var sum = 0;

//Testing Login Functionalities
console.log("Beginning of Login Functionaly Tests\n")

//Test 1: Handling of an invalid email entered onto login page - Expect Failure
console.log("Begin Test 1: Handling of an invalid email entered onto login page - Expect Failure")
if (!loginTest("clay.wright@gmail.com", "Ovaltine123", 0)) {
    console.log("Test 1 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 1 Failed.\n")
}

//Test 2: Handling of an invalid password entered onto login page - Expect Failure
console.log("Begin Test 2: Handling of an invalid password entered onto login page - Expect Failure")
if (!loginTest("geoffrey.e.anapolle@vanderbilt.edu", "GeoffreyA123", 0)) {
    console.log("Test 2 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 2 Failed.\n")
}

//Test 3: Handling of a Pending Account - Expect Failure
console.log("Begin Test 3: Handling of a Pending Account - Expect Failure")
if (!loginTest("carter.g.caldwell@vanderbilt.edu", "#CarterC123", 1)) {
    console.log("Test 3 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 3 Failed.\n")
}

//Test 4: Handling of a Correct Login - Expect Pass
console.log("Begin Test 4: Handling of a Correct Login - Expect Pass")
if (loginTest("geoffrey.e.anapolle@vanderbilt.edu", "#GeoffreyA123", 0)) {
    console.log("Test 4 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 4 Failed.\n")
}

//Testing Sign-Up Functionalities
console.log("\nBeginning of Sign-Up Functionaly Tests\n")

//Test 5: Handling a non-Vanderbilt email being entered - Expect Failure
console.log("Begin Test 5: Handling a non-Vanderbilt email being entered - Expect Failure")
if (!testSignup("clay.wright@gmail.com", "", "")) {
    console.log("Test 5 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 5 Failed.\n")
}

//Test 6: Handling an invalid password; No Symbol - Expect Failure
console.log("Begin Test 6: Handling an invalid password; No Symbol - Expect Failure")
if (!testSignup("geoffrey.e.anapolle@vanderbilt.edu", "GeoffreyA123", "#GeoffreyA123")) {
    console.log("Test 6 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 6 Failed.\n")
}

//Test 7: Handling an invalid password; No Number - Expect Failure
console.log("Begin Test 7: Handling an invalid password; No Number - Expect Failure")
if (!testSignup("geoffrey.e.anapolle@vanderbilt.edu", "#GeoffreyA", "GeoffreyA")) {
    console.log("Test 7 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 7 Failed.\n")
}

//Test 8: Handling an invalid password; Too Short - Expect Failure
console.log("Begin Test 8: Handling an invalid password; Too Short - Expect Failure")
if (!testSignup("geoffrey.e.anapolle@vanderbilt.edu", "a", "a")) {
    console.log("Test 8 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 8 Failed.\n")
}

//Test 9: Handling an invalid password; Too Long - Expect Failure
console.log("Begin Test 9: Handling an invalid password; Too Long - Expect Failure")
if (!testSignup("geoffrey.e.anapolle@vanderbilt.edu", "aabcdefghijklmnopqrstuvwxy", "aabcdefghijklmnopqrstuvwy")) {
    console.log("Test 9 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 9 Failed.\n")
}

//Test 10: Handling non-matching password entries - Expect Failure
console.log("Begin Test 10: Handling non-matching password entries - Expect Failure")
if (!testSignup("geoffrey.e.anapolle@vanderbilt.edu", "#ThesePasswords1", "#DoNotMatch2")) {
    console.log("Test 10 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 10 Failed.\n")
}

//Test 11: Handling a valid email and password entry - Expect Pass
console.log("Begin Test 11: Handling a valid email and password entry - Expect Pass")
if (testSignup("geoffrey.e.anapolle@vanderbilt.edu", "#GeoffreyA123", "#GeoffreyA123")) {
    console.log("Test 11 Passed!\n")
    sum = sum + 1;
} else {
    console.log("Test 11 Failed.\n")
}


console.log("\n\n")
console.log("Total Number of Tests Ran: ", numTests)
console.log("Total Number of Tests Passed: ", sum)
console.log("\n\n")

if (sum == numTests) {
    console.log("Successful Testing Environment")
} else {
    console.log("Unsuccssful Testing Environment. Debugging Required")
}

console.log("\n\n")
console.log("==============================================")
console.log("============End of Test Suite=================")
console.log("==============================================")


//Helper Function from app.js
//For Testing Password Contains a Number
function hasNumber(myString) {
    return /\d/.test(myString);
}