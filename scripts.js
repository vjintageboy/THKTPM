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
    const soHoKhau = document.getElementById('soHoKhau').value;
    const tenChuHo = document.getElementById('tenChuHo').value;
    const diaChi = document.getElementById('diaChi').value;

    if (soHoKhau && tenChuHo && diaChi) {
        const household = { soHoKhau, tenChuHo, diaChi };
        households.push(household);
        alert("Đã thêm hộ khẩu: " + JSON.stringify(household));
        hideHouseholdForm();
    } else {
        alert("Vui lòng nhập đầy đủ thông tin.");
    }
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
    const hoTen = document.getElementById('hoTen').value;
    const ngaySinh = document.getElementById('ngaySinh').value;
    const ngheNghiep = document.getElementById('ngheNghiep').value;
    const cmnd = document.getElementById('cmnd').value;
    const moiQuanHe = document.getElementById('moiQuanHe').value;

    if (hoTen && ngaySinh && ngheNghiep && cmnd && moiQuanHe) {
        const individual = { hoTen, ngaySinh, ngheNghiep, cmnd, moiQuanHe };
        individuals.push(individual);
        alert("Đã thêm nhân khẩu: " + JSON.stringify(individual));
        hideIndividualForm();
    } else {
        alert("Vui lòng nhập đầy đủ thông tin.");
    }
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
