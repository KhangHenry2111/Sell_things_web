<?php
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

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["id"])) {
    $bookId = $_GET["id"];

    //câu lệnh SQL để xóa sách theo ID
    $sql = "DELETE FROM books WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $bookId); 

    if ($stmt->execute()) {
        echo "Xóa sách thành công.";
    } else {
        echo "Lỗi khi xóa sách: " . $stmt->error;
    }

    $stmt->close();
} else {
    echo "Yêu cầu không hợp lệ hoặc thiếu ID sách.";
}

$conn->close();
?>