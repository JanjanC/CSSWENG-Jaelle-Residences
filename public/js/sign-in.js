$(document).ready(function () {
    //disable the sign in button if the username or password is empty
    $('#username, #password').keyup(function(){
        //both the username and password is not empty
        if($('#username').val() != '' && $('#password').val() != '') {
            //enable sign in button
            $('#signinbtn').prop('disabled', false);
        } else {
            //disable sign in button
            $('#signinbtn').prop('disabled', true);
        }
    })
});
