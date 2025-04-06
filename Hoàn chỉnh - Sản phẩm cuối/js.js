let registeredBooks = []; // Khởi tạo mảng rỗng
let cart = [];

function loadBooks() {
    fetch('get_all_books.php') // Gọi file PHP để lấy dữ liệu sách
        .then(response => response.json())
        .then(data => {
            registeredBooks = data; // Gán dữ liệu sách từ PHP vào registeredBooks
            displayBooks(registeredBooks); // Hiển thị sách
            displayRegisteredBooks(); // Cập nhật danh sách sách đã đăng 
        })
        .catch(error => {
            console.error('Lỗi khi tải sách:', error);
            document.getElementById('book-display-section').innerHTML = '<p class="error-message">Không thể tải danh sách sách.</p>';
        });
}

// Gọi loadBooks khi trang được tải
document.addEventListener('DOMContentLoaded', loadBooks);

// Hiển thị sách trong mục "Sách"
function displayBooks(books) {
    const bookDisplaySection = document.getElementById('book-display-section');
    bookDisplaySection.innerHTML = '';

    if (books.length === 0) {
        document.getElementById('no-books-message').style.display = 'block';
    } else {
        document.getElementById('no-books-message').style.display = 'none';
    }

    books.forEach((book, displayIndex) => {
        const bookItem = document.createElement('div');
        bookItem.classList.add('book-item');
        bookItem.innerHTML = `
            ${book.image_url ? `<img src="${book.image_url}" alt="${book.name}" style="max-width: 100px;">` : ''}
            <p>Tên: ${book.name}</p>
            <p>Thể loại: ${book.category}</p>
            <p>Giá: ${book.price.toLocaleString()} VND</p>
            <p>Số lượng: ${book.quantity}</p>
            <input type="number" id="quantity-${book.id}" placeholder="Số lượng" min="1" max="${book.quantity}">
            <button class="add-to-cart-button" data-id="${book.id}">Thêm vào giỏ hàng</button>
        `;
        bookDisplaySection.appendChild(bookItem);
    });

    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const bookId = parseInt(this.dataset.id);
            addToCart(bookId); // Truyền bookId vào hàm addToCart
        });
    });
}

function addToCart(bookId) {
    console.log("Hàm addToCart được gọi với bookId:", bookId);
    console.log("Danh sách sách hiện tại (registeredBooks):", registeredBooks);
    console.log("Giỏ hàng hiện tại (cart):", cart);

    const bookToAdd = registeredBooks.find(book => book.id === bookId);

    if (bookToAdd) {
        const quantityInput = document.getElementById(`quantity-${bookId}`); // Sử dụng bookId để lấy input
        let quantityToAdd = parseInt(quantityInput.value);

        // Kiểm tra nếu giá trị nhập vào không hợp lệ, mặc định là 1
        if (isNaN(quantityToAdd) || quantityToAdd < 1 || quantityToAdd > bookToAdd.quantity) {
            quantityToAdd = 1;
            alert(`Vui lòng nhập số lượng hợp lệ (từ 1 đến ${bookToAdd.quantity}). Số lượng mặc định là 1.`);
            quantityInput.value = 1;
            return;
        }

        const existingItem = cart.find(item => item.name === bookToAdd.name);
        if (existingItem) {
            existingItem.quantity += quantityToAdd;
            existingItem.totalPrice = existingItem.quantity * existingItem.price;
        } else {
            cart.push({
                name: bookToAdd.name,
                quantity: quantityToAdd,
                price: bookToAdd.price,
                totalPrice: quantityToAdd * bookToAdd.price
            });
        }

        displayCart();
        alert(`Đã thêm ${quantityToAdd} quyển "${bookToAdd.name}" vào giỏ hàng!`);
    } else {
        console.error("Không tìm thấy sách với ID:", bookId);
    }
}
function displayCart() {
    const cartTable = document.getElementById('cart-table').getElementsByTagName('tbody')[0];
    cartTable.innerHTML = '';

    cart.forEach((item, index) => {
        const rowHTML = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} VND</td>
                <td>${item.totalPrice.toLocaleString()} VND</td>
            </tr>
        `;
        cartTable.innerHTML += rowHTML;
    });

    // Tính và hiển thị tổng số tiền
    const totalAmount = calculateCartTotal();
    const totalDisplay = document.getElementById('total-amount'); 
    if (totalDisplay) {
        totalDisplay.textContent = totalAmount.toLocaleString() + ' VND';
    }
}

let placedOrders = [];

function placeOrder() {
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerAddress = document.getElementById('customer-address').value;

    if (!customerName || !customerPhone || !customerAddress) {
        alert('Vui lòng nhập đầy đủ thông tin khách hàng.');
        return;
    }

    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống.');
        return;
    }

    const order = {
        id: Date.now(),
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        items: [...cart] // Sao chép mảng giỏ hàng
    };

    placedOrders.push(order);
    displayPlacedOrders();

    // Cập nhật số lượng sách sau khi đặt hàng
    cart.forEach(cartItem => {
        const bookToUpdateIndex = registeredBooks.findIndex(
            book => book.name === cartItem.name
        );
        if (bookToUpdateIndex !== -1) {
            registeredBooks[bookToUpdateIndex].quantity -= cartItem.quantity;

            // Kiểm tra nếu số lượng sách <= 0 thì xóa sách khỏi danh sách
            if (registeredBooks[bookToUpdateIndex].quantity <= 0) {
                registeredBooks.splice(bookToUpdateIndex, 1);
            }
        }
    });

    // Cập nhật giao diện sách
    displayBooks(registeredBooks); // Hiển thị lại danh sách sách
    displayRegisteredBooks(); // Cập nhật danh sách sách đã đăng

    alert('Đặt hàng thành công!');
    cart = []; // Xóa giỏ hàng
    displayCart(); // Cập nhật giỏ hàng trống
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-address').value = '';

    showSection('orders'); // Chuyển đến mục "Đơn hàng"
}
function displayPlacedOrders() {
    const orderTableBody = document.getElementById('order-table').getElementsByTagName('tbody')[0];
    orderTableBody.innerHTML = ''; // Xóa nội dung hiện tại

    placedOrders.forEach((order, index) => {
        let itemsHTML = ''; // Hiển thị các sản phẩm trong đơn hàng
        order.items.forEach(item => {
            itemsHTML += `<p>${item.name} - SL: ${item.quantity} - Giá: ${item.totalPrice.toLocaleString()} VND</p>`;
        });
        const rowHTML = `
            <tr>
                <td>${order.id}</td>
                <td>
                    <p>Tên khách hàng: ${order.customerName}</p>
                    <p>SĐT: ${order.customerPhone}</p>
                    <p>Địa chỉ: ${order.customerAddress}</p>
                    <div>${itemsHTML}</div>
                </td>
                <td><button onclick="cancelOrder(${index})">Hủy đơn hàng</button></td>
            </tr>
        `;
        orderTableBody.innerHTML += rowHTML;
    });
}

function cancelOrder(orderIndex) {
    placedOrders.splice(orderIndex, 1); // Xóa đơn hàng
    displayPlacedOrders(); // Cập nhật lại hiển thị
}

function sortBooks(order) {
    const books = registeredBooks.slice(); // Sao chép danh sách sách

    if (order === 'asc') {
        books.sort((a, b) => a.price - b.price); // Sắp xếp tăng dần
        document.getElementById('sort-desc').disabled = false;
        document.getElementById('sort-asc').disabled = true;
    } else {
        books.sort((a, b) => b.price - a.price); // Sắp xếp giảm dần
        document.getElementById('sort-asc').disabled = false;
        document.getElementById('sort-desc').disabled = true;
    }

    displayBooks(books); // Hiển thị lại sách
}

function editBook(bookId) {
    fetch(`get_book.php?id=${bookId}`) // Gọi file PHP để lấy thông tin sách
        .then(response => response.json())
        .then(book => {
            document.getElementById('book-name').value = book.name;
            document.getElementById('book-category-input').value = book.category;
            document.getElementById('book-quantity').value = book.quantity;
            document.getElementById('book-price').value = book.price;

            // Thay đổi nút submit để gọi hàm saveBookChanges
            const submitButton = document.getElementById('book-submit');
            submitButton.textContent = 'Lưu thay đổi';
            submitButton.onclick = function () {
                saveBookChanges(book.id); // Truyền ID của sách cần sửa
            };
        })
        .catch(error => {
            console.error('Lỗi khi tải thông tin sách để sửa:', error);
            alert('Đã xảy ra lỗi khi tải thông tin sách.');
        });
}

// Lưu thay đổi sách
function saveBookChanges(bookId) {
    const bookName = document.getElementById('book-name').value;
    const bookCategory = document.getElementById('book-category-input').value;
    const bookQuantity = document.getElementById('book-quantity').value;
    const bookPrice = document.getElementById('book-price').value;

    const formData = new FormData();
    formData.append('book-id', bookId); // Thêm ID vào dữ liệu gửi đi
    formData.append('book-name', bookName);
    formData.append('book-category-input', bookCategory);
    formData.append('book-quantity', bookQuantity);
    formData.append('book-price', bookPrice);

    fetch('Sua.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(message => {
            alert(message);
            // Reset nút submit về trạng thái thêm sách mới
            const submitButton = document.getElementById('book-submit');
            submitButton.textContent = 'Thêm sách mới';
            submitButton.onclick = function () {
                document.getElementById('upload-form').dispatchEvent(new Event('submit')); // Gọi sự kiện submit của form
            };
            loadBooks(); // Tải lại danh sách sách sau khi sửa thành công
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật sách:', error);
            alert('Đã xảy ra lỗi khi cập nhật sách.');
        });
}

// Thêm sách mới (hàm này sẽ được gọi khi nhấn nút "Thêm sách mới")
function uploadBook(event) {
    event.preventDefault(); // Ngăn chặn form tải lại trang

    const form = document.getElementById('upload-form');
    const formData = new FormData(form); // Sử dụng FormData để gửi dữ liệu file

    fetch('Them.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json()) // Chuyển đổi phản hồi thành JSON
        .then(data => {
            if (data.status === "success") {
                alert(data.message); // Hiển thị thông báo thành công
                form.reset(); // Reset form sau khi thêm thành công
                loadBooks(); // Tải lại danh sách sách
            } else {
                alert(data.message); // Hiển thị thông báo lỗi
            }
        })
        .catch(error => {
            console.error('Lỗi khi thêm sách:', error);
            alert('Đã xảy ra lỗi khi thêm sách.');
        });
}

// Hàm để hiển thị section tương ứng
function showSection(sectionId) {
    // Ẩn tất cả các section
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Hiển thị section được chọn
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase(); // Lấy từ khóa tìm kiếm
    const filteredBooks = registeredBooks.filter(book => book.name.toLowerCase().includes(searchTerm));

    if (filteredBooks.length > 0) {
        displayBooks(filteredBooks); // Hiển thị sách theo kết quả tìm kiếm
    } else {
        alert('Không tìm thấy sách với từ khóa đã nhập.');
        displayBooks([]); // Hiển thị danh sách trống
    }
}

function filterBooksByCategory() {
    const selectedCategory = document.getElementById('category-filter').value;
    let filteredBooks;

    if (selectedCategory === 'all') {
        filteredBooks = registeredBooks; // Hoặc books
    } else {
        filteredBooks = registeredBooks.filter(book => book.category === selectedCategory); // Hoặc books
    }

    displayBooks(filteredBooks);
}

function displayRegisteredBooks() {
    const booksContainer = document.getElementById('book-list');
    console.log("Giá trị của booksContainer trước khi xóa:", booksContainer);
    if (booksContainer) {
        booksContainer.innerHTML = ''; 

        registeredBooks.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.name}</td>
                <td>${book.category}</td>
                <td>${book.quantity}</td>
                <td>${book.price} VND</td>
                <td><img src="${book.image_url}" alt="${book.name}" width="50"></td>
                <td>
                    <button onclick="editBook(${book.id})">Sửa</button>
                    <button onclick="deleteBook(${book.id})">Xóa</button>
                </td>
            `;
            booksContainer.appendChild(row);
        });
    } else {
        console.error("Không tìm thấy phần tử book-list!");
    }
}

function calculateCartTotal() {
    let total = 0;
    cart.forEach(item => {
        total += item.quantity * item.price;
    });
    return total;
}

function deleteBook(bookId) {
    if (confirm('Bạn có chắc chắn muốn xóa cuốn sách này?')) {
        fetch(`Xoa.php?id=${bookId}`)
            .then(response => response.text())
            .then(message => {
                alert(message);
                loadBooks(); // Tải lại danh sách sách sau khi xóa thành công
            })
            .catch(error => {
                console.error('Lỗi khi xóa sách:', error);
                alert('Đã xảy ra lỗi khi xóa sách.');
            });
    }
}