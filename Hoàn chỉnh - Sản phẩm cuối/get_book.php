<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Thông tin kết nối cơ sở dữ liệu
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "bookstore";

    // Tạo kết nối
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Kiểm tra kết nối
    if ($conn->connect_error) {
        throw new Exception("Không thể kết nối cơ sở dữ liệu.");
    }

    // Kiểm tra tham số id
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception("ID sách không hợp lệ.");
    }

    $bookId = intval($_GET['id']);

    // Truy vấn để lấy thông tin sách
    $sql = "SELECT id, name, category, quantity, price, image_data FROM books WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Lỗi chuẩn bị truy vấn SQL.");
    }

    $stmt->bind_param("i", $bookId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result === false) {
        throw new Exception("Lỗi thực thi truy vấn SQL.");
    }

    if ($result->num_rows > 0) {
        $book = $result->fetch_assoc();

        // Lưu ảnh ra file nếu có dữ liệu ảnh
        if (!empty($book['image_data'])) {
            $imageFileName = 'images/book_' . $book['id'] . '.jpg'; // Đường dẫn file ảnh
            if (!is_dir('images')) {
                mkdir('images', 0777, true); // Tạo thư mục nếu chưa tồn tại
            }
            file_put_contents($imageFileName, $book['image_data']); // Lưu dữ liệu ảnh ra file
            $book['image_url'] = 'http://yourdomain.com/' . $imageFileName; // URL ảnh
        } else {
            $book['image_url'] = null;
        }

        unset($book['image_data']); // Loại bỏ trường image_data khỏi phản hồi
        echo json_encode($book);
    } else {
        throw new Exception("Không tìm thấy sách với ID: $bookId");
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    // Trả về lỗi dưới dạng JSON
    echo json_encode(["error" => true, "message" => $e->getMessage()]);
    exit;
}
?>