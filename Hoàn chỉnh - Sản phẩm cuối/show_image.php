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

if (isset($_GET['id'])) {
    $bookId = $_GET['id'];

    // Lấy dữ liệu ảnh từ database
    $sql = "SELECT image_data FROM books WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $bookId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        header("Content-Type: image/png");
        echo $row['image_data'];
    } else {
        echo "Không tìm thấy ảnh.";
    }

    $stmt->close();
} else {
    echo "ID sách không hợp lệ.";
}

$conn->close();
?>