<?php
header("Content-type:application/json");

function clear_data($value):string
{
    $value = trim($value);
    $value = stripslashes($value);
    $value = strip_tags($value);

    return htmlspecialchars($value);
}

$firstName = clear_data($_POST['firstName']);
$lastName = clear_data($_POST['lastName']);
$email = clear_data($_POST['email']);
$phone = clear_data($_POST['phone']);
$formName = clear_data($_POST['formName']);
$date = date('d.m.Y / H:i');

$pattern_phone = '/^[+][0-9]{10,12}+$/';
$pattern_name = '/[a-zA-Z]{2,40}+$/';

$errors = [];
$flag = 0;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($formName)) {
        $flag = 1;
    }

    if (!preg_match($pattern_name, $firstName)) {
        $errors[] = 'firstName';
        $flag = 1;
    }

    if (!preg_match($pattern_name, $lastName)) {
        $errors[] = 'lastName';
        $flag = 1;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'email';
        $flag = 1;
    }

    if (!preg_match($pattern_phone, $phone)) {
        $errors[] = 'phone';
        $flag = 1;
    }
}

if ($flag) {
    echo json_encode(array(
        'success' => false,
        'errors' => $errors,
        'msg' => 'Form is invalid'
    ));
    die();
}

//-------------------------------------------------------------
$token = "6443720824:AAEimeBRmyiLLGN69diNf1bnZCc4a-G---w";
$chat_id = "-1001971554336";

// Compose the message
$telegramMessage = "New form submission: $formName\nfirstName: $firstName\nLast name: $lastName\nEmail: $email\nPhone: $phone\nDate: $date";

// API URL
$apiUrl = "https://api.telegram.org/bot$token/sendMessage";

// Send the message
$response = file_get_contents($apiUrl . "?chat_id=$chat_id&text=" . urlencode($telegramMessage));

if ($response) {
    echo json_encode(array(
        'success' => true,
        'errors' => $errors,
        'msg' => 'Form data sent successfully!'
    ));
} else {
    echo json_encode(array(
        'success' => false,
        'errors' => $errors,
        'msg' => 'Failed to send form data.'
    ));
}
die();
