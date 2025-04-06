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
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Lấy dữ liệu từ form
    $bookId = $_POST["book-id"];
    $bookName = $_POST["book-name"];
    $bookCategory = $_POST["book-category-input"];
    $bookQuantity = $_POST["book-quantity"];
    $bookPrice = $_POST["book-price"];

    // Câu lệnh SQL để cập nhật thông tin sách
    $sql = "UPDATE books SET name = ?, category = ?, quantity = ?, price = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssidi", $bookName, $bookCategory, $bookQuantity, $bookPrice, $bookId);
    if ($stmt->execute()) {
        echo "Cập nhật thông tin sách thành công.";
    } else {
        echo "Lỗi khi cập nhật thông tin sách: " . $stmt->error;
    }
    $stmt->close();
} else {
    echo "Yêu cầu không hợp lệ.";
}
$conn->close();
?>