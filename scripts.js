let households = [];
let individuals = [];

function showAddHouseholdForm() {
    document.getElementById('householdForm').style.display = 'block';
}

function hideHouseholdForm() {
    document.getElementById('householdForm').style.display = 'none';
    clearHouseholdForm();
}

function clearHouseholdForm() {
    document.getElementById('soHoKhau').value = '';
    document.getElementById('tenChuHo').value = '';
    document.getElementById('diaChi').value = '';
}

function addHousehold() {
    const soHoKhau = document.getElementById('soHoKhau').value.trim();
    const tenChuHo = document.getElementById('tenChuHo').value.trim();
    const diaChi = document.getElementById('diaChi').value.trim();

    // Input validation
    if (!soHoKhau) {
        showNotification("Vui lòng nhập số hộ khẩu.", true);
        return;
    }
    if (!tenChuHo) {
        showNotification("Vui lòng nhập tên chủ hộ.", true);
        return;
    }
    if (!diaChi) {
        showNotification("Vui lòng nhập địa chỉ.", true);
        return;
    }

    const household = { soHoKhau, tenChuHo, diaChi };
    households.push(household);
    showNotification("Đã thêm hộ khẩu: " + JSON.stringify(household));
    hideHouseholdForm();
}

function showAddIndividualForm() {
    document.getElementById('individualForm').style.display = 'block';
}

function hideIndividualForm() {
    document.getElementById('individualForm').style.display = 'none';
    clearIndividualForm();
}

function clearIndividualForm() {
    document.getElementById('hoTen').value = '';
    document.getElementById('ngaySinh').value = '';
    document.getElementById('ngheNghiep').value = '';
    document.getElementById('cmnd').value = '';
    document.getElementById('moiQuanHe').value = '';
}

function addIndividual() {
    const hoTen = document.getElementById('hoTen').value.trim();
    const ngaySinh = document.getElementById('ngaySinh').value;
    const ngheNghiep = document.getElementById('ngheNghiep').value.trim();
    const cmnd = document.getElementById('cmnd').value.trim();
    const moiQuanHe = document.getElementById('moiQuanHe').value.trim();

    // Input validation
    if (!hoTen) {
        showNotification("Vui lòng nhập họ tên.", true);
        return;
    }
    if (!ngaySinh) {
        showNotification("Vui lòng chọn ngày sinh.", true);
        return;
    }
    if (!ngheNghiep) {
        showNotification("Vui lòng nhập nghề nghiệp.", true);
        return;
    }
    if (!cmnd) {
        showNotification("Vui lòng nhập số CMND.", true);
        return;
    }
    if (!moiQuanHe) {
        showNotification("Vui lòng nhập mối quan hệ với chủ hộ.", true);
        return;
    }

    const individual = { hoTen, ngaySinh, ngheNghiep, cmnd, moiQuanHe };
    individuals.push(individual);
    showNotification("Đã thêm nhân khẩu: " + JSON.stringify(individual));
    hideIndividualForm();
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

function logout() {
    // Clear any session data if applicable
    // Redirect to login page
    window.location.href = 'TrangChu.html'; // Change to your login page
}

function showEditIndividualForm() {
    // Logic to show edit form and populate it with existing data
    alert("Chức năng sửa đổi thông tin nhân khẩu chưa được triển khai.");
}

function deleteIndividual() {
    // Logic to delete an individual
    alert("Chức năng xóa nhân khẩu chưa được triển khai.");
}

function generateReport() {
    alert("Thống kê nhân khẩu");
}

function exportReport() {
    alert("Xuất báo cáo");
}
