<?php
header('Content-Type: application/json; charset=utf-8'); 
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Thông tin kết nối cơ sở dữ liệu
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bookstore";

// Tạo kết nối
$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Lỗi kết nối cơ sở dữ liệu: " . $conn->connect_error], JSON_UNESCAPED_UNICODE));
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Lấy dữ liệu từ form
    $bookName = $_POST["book-name"];
    $bookCategory = $_POST["book-category-input"];
    $bookQuantity = intval($_POST["book-quantity"]);
    $bookPrice = floatval($_POST["book-price"]);

    $imageData = null; // Khởi tạo biến để lưu dữ liệu ảnh

    if (isset($_FILES['book-image']) && $_FILES['book-image']['error'] == 0) {
        $imageTmpName = $_FILES['book-image']['tmp_name'];
        $imageData = file_get_contents($imageTmpName);
    }

    //câu lệnh SQL để chèn dữ liệu
    $sql = "INSERT INTO books (name, category, quantity, price, image_data) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        echo json_encode(["status" => "error", "message" => "Lỗi chuẩn bị câu lệnh SQL: " . $conn->error], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt->bind_param("ssids", $bookName, $bookCategory, $bookQuantity, $bookPrice, $imageData);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Thông tin sách đã được lưu vào cơ sở dữ liệu thành công."], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi khi lưu thông tin sách vào cơ sở dữ liệu: " . $stmt->error], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
}

$conn->close();
?>