<?php
// Hiển thị lỗi (chỉ dùng trong môi trường phát triển)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Thông tin kết nối cơ sở dữ liệu
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bookstore";

// Tạo kết nối
$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die("Kết nối cơ sở dữ liệu thất bại: " . $conn->connect_error);
}

// Truy vấn để lấy tất cả sách
$sql = "SELECT id, name, category, quantity, price, image_data FROM books";
$result = $conn->query($sql); // Thực hiện truy vấn SQL

// Kiểm tra kết quả truy vấn
if (!$result) {
    die("Lỗi truy vấn SQL: " . $conn->error);
}

$books = array();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id']; // Ép kiểu id thành số nguyên
        $row['image_url'] = $row['image_data'] ? 'data:image/jpeg;base64,' . base64_encode($row['image_data']) : null;
        unset($row['image_data']); // Loại bỏ dữ liệu ảnh gốc
        $books[] = $row;
    }
} else {
    $books = []; // Trả về mảng rỗng nếu không có sách
}

// Trả về dữ liệu dưới dạng JSON
header('Content-Type: application/json');
$json = json_encode($books);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Lỗi khi mã hóa JSON: ' . json_last_error_msg()]);
} else {
    echo $json;
}

$conn->close();
?>