const sampleHouseholds = [
    { soHoKhau: "HK001", tenChuHo: "Nguyễn Văn A", diaChi: "123 Đường ABC, Quận 1, TP.HCM" },
    { soHoKhau: "HK002", tenChuHo: "Trần Thị B", diaChi: "456 Đường XYZ, Quận 2, TP.HCM" }
];

const sampleIndividuals = [
    { hoTen: "Nguyễn Văn A", ngaySinh: "1980-01-01", ngheNghiep: "Kỹ sư", cmnd: "123456789", moiQuanHe: "Chủ hộ" },
    { hoTen: "Nguyễn Thị X", ngaySinh: "1985-05-05", ngheNghiep: "Giáo viên", cmnd: "987654321", moiQuanHe: "Vợ" },
    { hoTen: "Trần Thị B", ngaySinh: "1975-12-31", ngheNghiep: "Bác sĩ", cmnd: "456789123", moiQuanHe: "Chủ hộ" }
];

let households = [];
let individuals = [];

// Thêm log vào đầu file
console.log('scripts.js loaded');

// Thêm log vào hàm readData
async function readData() {
    console.log('readData called');
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        console.log('Data loaded:', data);
        households = data.households && data.households.length > 0 ? data.households : sampleHouseholds;
        individuals = data.individuals && data.individuals.length > 0 ? data.individuals : sampleIndividuals;
    } catch (error) {
        console.error('Lỗi khi đọc dữ liệu:', error);
        households = sampleHouseholds;
        individuals = sampleIndividuals;
    }
    updateHouseholdList();
    updateIndividualList();
}

// Ghi dữ liệu vào file JSON
async function writeData() {
    try {
        const data = { households, individuals };
        const response = await fetch('save_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Lỗi khi ghi dữ liệu');
        }
    } catch (error) {
        console.error('Lỗi khi ghi dữ liệu:', error);
        alert('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
    }
}

// Gọi hàm readData khi trang web được tải
window.addEventListener('load', readData);

// Thêm các hàm mới và cập nhật các hàm hiện có

function updateHouseholdList() {
    console.log('updateHouseholdList called');
    const householdList = document.getElementById('householdList');
    if (!householdList) {
        console.error('Không tìm thấy phần tử có id "householdList"');
        return;
    }
    householdList.innerHTML = '';
    households.forEach((household, index) => {
        const li = document.createElement('li');
        li.className = 'household-item';
        li.innerHTML = `
            <div class="household-info">
                <h4>${household.soHoKhau}</h4>
                <p><strong>Địa chỉ:</strong> ${household.diaChiThuongTru}</p>
                <p><strong>Ngày cấp:</strong> ${household.ngayCapHoKhau}</p>
            </div>
            <div class="action-buttons">
                <button onclick="showEditHouseholdForm(${index})">Sửa</button>
                <button onclick="deleteHousehold(${index})">Xóa</button>
            </div>
        `;
        householdList.appendChild(li);
    });
}

function updateIndividualList() {
    console.log('updateIndividualList called');
    const individualList = document.getElementById('individualList');
    if (!individualList) {
        console.error('Không tìm thấy phần tử có id "individualList"');
        return;
    }
    individualList.innerHTML = '';
    individuals.forEach((individual, index) => {
        const li = document.createElement('li');
        li.className = 'individual-item';
        li.innerHTML = `
            <div class="individual-info">
                <h4>${individual.hoTen} ${individual.laChuHo ? '(Chủ hộ)' : ''}</h4>
                <p><strong>Ngày sinh:</strong> ${individual.ngaySinh}</p>
                <p><strong>CMND:</strong> ${individual.cmnd}</p>
                <p><strong>Nghề nghiệp:</strong> ${individual.ngheNghiep}</p>
            </div>
            <div class="action-buttons">
                <button onclick="showEditIndividualForm(${index})">Sửa</button>
                <button onclick="deleteIndividual(${index})">Xóa</button>
            </div>
        `;
        individualList.appendChild(li);
    });
}

function showEditHouseholdForm(index) {
    const household = households[index];
    document.getElementById('editHouseholdIndex').value = index;
    document.getElementById('editSoHoKhau').value = household.soHoKhau;
    document.getElementById('editDiaChiThuongTru').value = household.diaChiThuongTru;
    document.getElementById('editNgayCapHoKhau').value = household.ngayCapHoKhau;
    showModal('editHouseholdModal');
}

async function updateHousehold() {
    const index = document.getElementById('editHouseholdIndex').value;
    const soHoKhau = document.getElementById('editSoHoKhau').value;
    const diaChiThuongTru = document.getElementById('editDiaChiThuongTru').value;
    const ngayCapHoKhau = document.getElementById('editNgayCapHoKhau').value;

    households[index] = { soHoKhau, diaChiThuongTru, ngayCapHoKhau };
    await writeData();
    updateHouseholdList();
    closeModal('editHouseholdModal');
    showNotification('Cập nhật hộ khẩu thành công!');
}

async function deleteHousehold(index) {
    if (confirm('Bạn có chắc chắn muốn xóa hộ khẩu này?')) {
        households.splice(index, 1);
        await writeData();
        updateHouseholdList();
        showNotification('Đã xóa hộ khẩu thành công!');
    }
}

function showEditIndividualForm(index) {
    const individual = individuals[index];
    document.getElementById('editIndividualIndex').value = index;
    document.getElementById('editHoTen').value = individual.hoTen;
    document.getElementById('editBiDanh').value = individual.biDanh;
    document.getElementById('editNgaySinh').value = individual.ngaySinh;
    document.getElementById('editNoiSinh').value = individual.noiSinh;
    document.getElementById('editNguyenQuan').value = individual.nguyenQuan;
    document.getElementById('editDanToc').value = individual.danToc;
    document.getElementById('editNgheNghiep').value = individual.ngheNghiep;
    document.getElementById('editNoiLamViec').value = individual.noiLamViec;
    document.getElementById('editCmnd').value = individual.cmnd;
    document.getElementById('editNgayCapCMND').value = individual.ngayCapCMND;
    document.getElementById('editNoiCapCMND').value = individual.noiCapCMND;
    document.getElementById('editNgayDangKyThuongTru').value = individual.ngayDangKyThuongTru;
    document.getElementById('editDiaChiTruocKhiChuyenDen').value = individual.diaChiTruocKhiChuyenDen;
    document.getElementById('editQuanHeVoiChuHo').value = individual.quanHeVoiChuHo;
    document.getElementById('editLaChuHo').checked = individual.laChuHo;
    showModal('editIndividualModal');
}

async function updateIndividual() {
    const index = document.getElementById('editIndividualIndex').value;
    const hoTen = document.getElementById('editHoTen').value;
    const biDanh = document.getElementById('editBiDanh').value;
    const ngaySinh = document.getElementById('editNgaySinh').value;
    const noiSinh = document.getElementById('editNoiSinh').value;
    const nguyenQuan = document.getElementById('editNguyenQuan').value;
    const danToc = document.getElementById('editDanToc').value;
    const ngheNghiep = document.getElementById('editNgheNghiep').value;
    const noiLamViec = document.getElementById('editNoiLamViec').value;
    const cmnd = document.getElementById('editCmnd').value;
    const ngayCapCMND = document.getElementById('editNgayCapCMND').value;
    const noiCapCMND = document.getElementById('editNoiCapCMND').value;
    const ngayDangKyThuongTru = document.getElementById('editNgayDangKyThuongTru').value;
    const diaChiTruocKhiChuyenDen = document.getElementById('editDiaChiTruocKhiChuyenDen').value;
    const quanHeVoiChuHo = document.getElementById('editQuanHeVoiChuHo').value;
    const laChuHo = document.getElementById('editLaChuHo').checked;

    individuals[index] = {
        hoTen,
        biDanh,
        ngaySinh,
        noiSinh,
        nguyenQuan,
        danToc,
        ngheNghiep,
        noiLamViec,
        cmnd,
        ngayCapCMND,
        noiCapCMND,
        ngayDangKyThuongTru,
        diaChiTruocKhiChuyenDen,
        quanHeVoiChuHo,
        laChuHo
    };
    await writeData();
    updateIndividualList();
    closeModal('editIndividualModal');
    showNotification('Cập nhật nhân khẩu thành công!');
}

async function deleteIndividual(index) {
    if (confirm('Bạn có chắc chắn muốn xóa nhân khẩu này?')) {
        individuals.splice(index, 1);
        await writeData();
        updateIndividualList();
        showNotification('Đã xóa nhân khẩu thành công!');
    }
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Thêm log vào hàm showAddHouseholdForm
function showAddHouseholdForm() {
    console.log('showAddHouseholdForm called');
    showModal('householdModal');
}

function hideHouseholdForm() {
    hideModal('householdModal');
    clearHouseholdForm();
}

function showAddIndividualForm() {
    showModal('individualModal');
}

function hideIndividualForm() {
    hideModal('individualModal');
    clearIndividualForm();
}

// Thêm hàm mới để xử lý việc đóng modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Cập nhật event listener để xử lý việc đóng modal
window.addEventListener('load', function() {
    var modals = document.getElementsByClassName('modal');
    var closes = document.getElementsByClassName('close');

    for (var i = 0; i < closes.length; i++) {
        closes[i].onclick = function() {
            var modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        }
    }

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    }
});

function clearHouseholdForm() {
    document.getElementById('soHoKhau').value = '';
    document.getElementById('diaChiThuongTru').value = '';
    document.getElementById('ngayCapHoKhau').value = '';
}

// Thêm log vào hàm addHousehold
async function addHousehold() {
    console.log('addHousehold called');
    const soHoKhau = document.getElementById('soHoKhau').value;
    const diaChiThuongTru = document.getElementById('diaChiThuongTru').value;
    const ngayCapHoKhau = document.getElementById('ngayCapHoKhau').value;

    console.log('Household data:', { soHoKhau, diaChiThuongTru, ngayCapHoKhau });

    const householdData = {
        soHoKhau,
        diaChiThuongTru,
        ngayCapHoKhau
    };

    households.push(householdData);
    await writeData();
    updateHouseholdList();
    showNotification('Thêm hộ khẩu thành công!');
    closeModal('householdModal');
    clearHouseholdForm();
}

function clearIndividualForm() {
    document.getElementById('hoTen').value = '';
    document.getElementById('biDanh').value = '';
    document.getElementById('ngaySinh').value = '';
    document.getElementById('noiSinh').value = '';
    document.getElementById('nguyenQuan').value = '';
    document.getElementById('danToc').value = '';
    document.getElementById('ngheNghiep').value = '';
    document.getElementById('noiLamViec').value = '';
    document.getElementById('cmnd').value = '';
    document.getElementById('ngayCapCMND').value = '';
    document.getElementById('noiCapCMND').value = '';
    document.getElementById('ngayDangKyThuongTru').value = '';
    document.getElementById('diaChiTruocKhiChuyenDen').value = '';
    document.getElementById('quanHeVoiChuHo').value = '';
    document.getElementById('laChuHo').checked = false;
}

// Cập nhật hàm addIndividual
async function addIndividual() {
    const hoTen = document.getElementById('hoTen').value;
    const biDanh = document.getElementById('biDanh').value;
    const ngaySinh = document.getElementById('ngaySinh').value;
    const noiSinh = document.getElementById('noiSinh').value;
    const nguyenQuan = document.getElementById('nguyenQuan').value;
    const danToc = document.getElementById('danToc').value;
    const ngheNghiep = document.getElementById('ngheNghiep').value;
    const noiLamViec = document.getElementById('noiLamViec').value;
    const cmnd = document.getElementById('cmnd').value;
    const ngayCapCMND = document.getElementById('ngayCapCMND').value;
    const noiCapCMND = document.getElementById('noiCapCMND').value;
    const ngayDangKyThuongTru = document.getElementById('ngayDangKyThuongTru').value;
    const diaChiTruocKhiChuyenDen = document.getElementById('diaChiTruocKhiChuyenDen').value;
    const quanHeVoiChuHo = document.getElementById('quanHeVoiChuHo').value;
    const laChuHo = document.getElementById('laChuHo').checked;

    const individual = {
        hoTen,
        biDanh,
        ngaySinh,
        noiSinh,
        nguyenQuan,
        danToc,
        ngheNghiep,
        noiLamViec,
        cmnd,
        ngayCapCMND,
        noiCapCMND,
        ngayDangKyThuongTru,
        diaChiTruocKhiChuyenDen,
        quanHeVoiChuHo,
        laChuHo
    };

    individuals.push(individual);
    await writeData();
    updateIndividualList();
    showNotification('Thêm nhân khẩu thành công!');
    closeModal('individualModal');
    clearIndividualForm();
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

function generateReport() {
    const totalHouseholds = households.length;
    const totalIndividuals = individuals.length;
    const ageGroups = {
        'Dưới 18 tuổi': 0,
        '18-60 tuổi': 0,
        'Trên 60 tuổi': 0
    };
    const occupations = {};

    individuals.forEach(individual => {
        // Tính tuổi
        const age = new Date().getFullYear() - new Date(individual.ngaySinh).getFullYear();
        if (age < 18) ageGroups['Dưới 18 tuổi']++;
        else if (age <= 60) ageGroups['18-60 tuổi']++;
        else ageGroups['Trên 60 tuổi']++;

        // Đếm nghề nghiệp
        occupations[individual.ngheNghiep] = (occupations[individual.ngheNghiep] || 0) + 1;
    });

    const report = `
        <h3>Báo cáo thống kê dân cư</h3>
        <p>Tổng số hộ khẩu: ${totalHouseholds}</p>
        <p>Tổng số nhân khẩu: ${totalIndividuals}</p>
        <h4>Phân bố độ tuổi:</h4>
        <ul>
            ${Object.entries(ageGroups).map(([group, count]) => `<li>${group}: ${count} người</li>`).join('')}
        </ul>
        <h4>Thống kê nghề nghiệp:</h4>
        <ul>
            ${Object.entries(occupations).map(([job, count]) => `<li>${job}: ${count} người</li>`).join('')}
        </ul>
    `;

    showModal('reportModal');
    document.getElementById('reportContent').innerHTML = report;
}

function exportReport() {
    const reportContent = document.getElementById('reportContent').innerText;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bao_cao_dan_cu.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function generateReport() {
    const totalHouseholds = households.length;
    const totalIndividuals = individuals.length;
    const ageGroups = {
        'Dưới 18 tuổi': 0,
        '18-60 tuổi': 0,
        'Trên 60 tuổi': 0
    };
    const occupations = {};

    individuals.forEach(individual => {
        // Tính tuổi
        const age = new Date().getFullYear() - new Date(individual.ngaySinh).getFullYear();
        if (age < 18) ageGroups['Dưới 18 tuổi']++;
        else if (age <= 60) ageGroups['18-60 tuổi']++;
        else ageGroups['Trên 60 tuổi']++;

        // Đếm nghề nghiệp
        occupations[individual.ngheNghiep] = (occupations[individual.ngheNghiep] || 0) + 1;
    });

    const report = `
        <h3>Báo cáo thống kê dân cư</h3>
        <p>Tổng số hộ khẩu: ${totalHouseholds}</p>
        <p>Tổng số nhân khẩu: ${totalIndividuals}</p>
        <h4>Phân bố độ tuổi:</h4>
        <ul>
            ${Object.entries(ageGroups).map(([group, count]) => `<li>${group}: ${count} người</li>`).join('')}
        </ul>
        <h4>Thống kê nghề nghiệp:</h4>
        <ul>
            ${Object.entries(occupations).map(([job, count]) => `<li>${job}: ${count} người</li>`).join('')}
        </ul>
    `;

    showModal('reportModal');
    document.getElementById('reportContent').innerHTML = report;
}

function exportReport() {
    const reportContent = document.getElementById('reportContent').innerText;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bao_cao_dan_cu.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
