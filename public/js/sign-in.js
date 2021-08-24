$(document).ready(function () {
    $('#username, #password').keyup(function(){
        if($('#username').val() != '' && $('#password').val() != '')
            $('#signinbtn').prop('disabled', false);
        else
            $('#signinbtn').prop('disabled', true);
    })
});