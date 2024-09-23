let households = [];
let individuals = [];
// lsof -i :5500
// kill -9 <PID>
// Thêm log vào đầu file
console.log('scripts.js loaded');

const API_BASE_URL = 'http://127.0.0.1:5500';

async function readData() {
    console.log('readData called');
    try {
        const [householdsResponse, individualsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/households`),
            fetch(`${API_BASE_URL}/api/individuals`)
        ]);
        
        if (!householdsResponse.ok) {
            throw new Error(`HTTP error! status: ${householdsResponse.status}`);
        }
        if (!individualsResponse.ok) {
            throw new Error(`HTTP error! status: ${individualsResponse.status}`);
        }
        
        households = await householdsResponse.json();
        individuals = await individualsResponse.json();
        
        console.log('Households data:', households);
        console.log('Individuals data:', individuals);

        if (households.length === 0 && individuals.length === 0) {
            console.warn('Không có dữ liệu từ server');
        }
    } catch (error) {
        console.error('Lỗi khi đọc dữ liệu:', error);
    }
    updateHouseholdList();
    updateIndividualList();
}

// Cập nhật hàm writeData để gửi dữ liệu đến server
async function writeData() {
    try {
        // Format date fields before sending to the server
        households.forEach(household => {
            if (household.ngay_cap_ho_khau) {
                household.ngay_cap_ho_khau = new Date(household.ngay_cap_ho_khau).toISOString().split('T')[0];
            }
        });

        individuals.forEach(individual => {
            if (individual.ngay_sinh) {
                individual.ngay_sinh = new Date(individual.ngay_sinh).toISOString().split('T')[0];
            }
            if (individual.ngay_cap_cmnd) {
                individual.ngay_cap_cmnd = new Date(individual.ngay_cap_cmnd).toISOString().split('T')[0];
            }
            if (individual.ngay_dang_ky_thuong_tru) {
                individual.ngay_dang_ky_thuong_tru = new Date(individual.ngay_dang_ky_thuong_tru).toISOString().split('T')[0];
            }
        });

        console.log('Sending data:', { households, individuals });
        const response = await fetch(`${API_BASE_URL}/api/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ households, individuals }),
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
        }
        
        const result = JSON.parse(responseText);
        console.log('Server response:', result);
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
        console.log('Processing household:', household); // Thêm dòng này
        const li = document.createElement('li');
        li.className = 'household-item';
        li.innerHTML = `
            <div class="household-info">
                <h4>Số hộ khẩu: ${household.so_ho_khau || 'N/A'}</h4>
                <p><strong>Chủ hộ:</strong> ${household.ten_chu_ho || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> ${household.dia_chi_thuong_tru || 'N/A'}</p>
            </div>
            <div class="action-buttons">
                <button onclick="showHouseholdDetails(${index})">Xem chi tiết</button>
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
                <h4>${individual.ho_ten} ${individual.la_chu_ho ? '(Chủ hộ)' : ''}</h4>
                <p><strong>Ngày sinh:</strong> ${individual.ngay_sinh.split('T')[0]}</p>
                <p><strong>Giới tính:</strong> ${individual.gioi_tinh}</p>
                <p><strong>Quan hệ với chủ hộ:</strong> ${individual.quan_he_voi_chu_ho}</p>
                <p><strong>Số hộ khẩu:</strong> ${individual.so_ho_khau}</p>
                ${individual.cmnd ? `<p><strong>CMND:</strong> ${individual.cmnd}</p>` : ''}
                ${individual.nghe_nghiep ? `<p><strong>Nghề nghiệp:</strong> ${individual.nghe_nghiep}</p>` : ''}
            </div>
            <div class="action-buttons">
                <button onclick="showIndividualDetails(${index})">Xem chi tiết</button>
                <button onclick="showEditIndividualForm(${index})">Sửa</button>
                <button onclick="deleteIndividual(${index})">Xóa</button>
            </div>
        `;
        individualList.appendChild(li);
    });
}

function showEditHouseholdForm(index) {
    const household = households[index];
    console.log('Editing household:', household); // Thêm log này để kiểm tra dữ liệu

    document.getElementById('editHouseholdIndex').value = index;
    document.getElementById('editSoHoKhau').value = household.so_ho_khau || '';
    document.getElementById('editTenChuHo').value = household.ten_chu_ho || '';
    document.getElementById('editDiaChiThuongTru').value = household.dia_chi_thuong_tru || '';
    document.getElementById('editNgayCapHoKhau').value = household.ngay_cap_ho_khau || '';

    showModal('editHouseholdModal');
}

async function updateHousehold() {
    const index = document.getElementById('editHouseholdIndex').value;
    const so_ho_khau = document.getElementById('editSoHoKhau').value;
    const ten_chu_ho = document.getElementById('editTenChuHo').value;
    const dia_chi_thuong_tru = document.getElementById('editDiaChiThuongTru').value;
    const ngay_cap_ho_khau = document.getElementById('editNgayCapHoKhau').value;

    households[index] = { so_ho_khau, ten_chu_ho, dia_chi_thuong_tru, ngay_cap_ho_khau };

    // Cập nhật thông tin chủ hộ trong danh sách individuals
    const individualIndex = individuals.findIndex(individual => individual.so_ho_khau === so_ho_khau && individual.la_chu_ho);
    if (individualIndex !== -1) {
        individuals[individualIndex].ho_ten = ten_chu_ho;
    } else {
        // Nếu không tìm thấy chủ hộ, thêm mới
        individuals.push({
            ho_ten: ten_chu_ho,
            so_ho_khau: so_ho_khau,
            la_chu_ho: true,
            ngay_sinh: '', // Có thể cập nhật sau
            cmnd: '', // Có thể cập nhật sau
            nghe_nghiep: '' // Có thể cập nhật sau
        });
    }

    await writeData();
    updateHouseholdList();
    updateIndividualList();
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
    document.getElementById('editHoTen').value = individual.ho_ten;
    document.getElementById('editBiDanh').value = individual.bi_danh;
    document.getElementById('editNgaySinh').value = individual.ngay_sinh;
    document.getElementById('editNoiSinh').value = individual.noi_sinh;
    document.getElementById('editNguyenQuan').value = individual.nguyen_quan;
    document.getElementById('editDanToc').value = individual.dan_toc;
    document.getElementById('editNgheNghiep').value = individual.nghe_nghiep;
    document.getElementById('editNoiLamViec').value = individual.noi_lam_viec;
    document.getElementById('editCmnd').value = individual.cmnd;
    document.getElementById('editNgayCapCMND').value = individual.ngay_cap_cmnd;
    document.getElementById('editNoiCapCMND').value = individual.noi_cap_cmnd;
    document.getElementById('editNgayDangKyThuongTru').value = individual.ngay_dang_ky_thuong_tru;
    document.getElementById('editDiaChiTruocKhiChuyenDen').value = individual.dia_chi_truoc_khi_chuyen_den;
    document.getElementById('editQuanHeVoiChuHo').value = individual.quan_he_voi_chu_ho;
    document.getElementById('editLaChuHo').checked = individual.la_chu_ho;
    showModal('editIndividualModal');
}

async function updateIndividual() {
    const index = document.getElementById('editIndividualIndex').value;
    const ho_ten = document.getElementById('editHoTen').value;
    const bi_danh = document.getElementById('editBiDanh').value;
    const ngay_sinh = document.getElementById('editNgaySinh').value;
    const noi_sinh = document.getElementById('editNoiSinh').value;
    const nguyen_quan = document.getElementById('editNguyenQuan').value;
    const dan_toc = document.getElementById('editDanToc').value;
    const nghe_nghiep = document.getElementById('editNgheNghiep').value;
    const noi_lam_viec = document.getElementById('editNoiLamViec').value;
    const cmnd = document.getElementById('editCmnd').value;
    const ngay_cap_cmnd = document.getElementById('editNgayCapCMND').value;
    const noi_cap_cmnd = document.getElementById('editNoiCapCMND').value;
    const ngay_dang_ky_thuong_tru = document.getElementById('editNgayDangKyThuongTru').value;
    const dia_chi_truoc_khi_chuyen_den = document.getElementById('editDiaChiTruocKhiChuyenDen').value;
    const quan_he_voi_chu_ho = document.getElementById('editQuanHeVoiChuHo').value;
    const la_chu_ho = document.getElementById('editLaChuHo').checked;

    individuals[index] = {
        ho_ten,
        bi_danh,
        ngay_sinh,
        noi_sinh,
        nguyen_quan,
        dan_toc,
        nghe_nghiep,
        noi_lam_viec,
        cmnd,
        ngay_cap_cmnd,
        noi_cap_cmnd,
        ngay_dang_ky_thuong_tru,
        dia_chi_truoc_khi_chuyen_den,
        quan_he_voi_chu_ho,
        la_chu_ho
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

function showModal(modalId, content = null) {
    const modal = document.getElementById(modalId);
    if (content) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            ${content}
        `;
        
        // Thêm event listener cho nút đóng
        const closeButton = modalContent.querySelector('.close');
        closeButton.onclick = function() {
            closeModal(modalId);
        };
    }
    modal.style.display = 'block';
}

function closeModal(modalId) {
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
    document.getElementById('tenChuHo').value = '';
    document.getElementById('diaChiThuongTru').value = '';
    document.getElementById('ngayCapHoKhau').value = '';
}

// Thêm log vào hàm addHousehold
async function addHousehold() {
    console.log('addHousehold called');
    const so_ho_khau = document.getElementById('soHoKhau').value;
    const ten_chu_ho = document.getElementById('tenChuHo').value;
    const dia_chi_thuong_tru = document.getElementById('diaChiThuongTru').value;
    const ngay_cap_ho_khau = document.getElementById('ngayCapHoKhau').value;

    console.log('Household data:', { so_ho_khau, ten_chu_ho, dia_chi_thuong_tru, ngay_cap_ho_khau });

    const householdData = {
        so_ho_khau,
        ten_chu_ho,
        dia_chi_thuong_tru,
        ngay_cap_ho_khau,
        thanh_vien: [ten_chu_ho] // Thêm chủ hộ vào danh sách thành viên
    };

    households.push(householdData);

    // Thêm chủ hộ vào danh sách individuals
    individuals.push({
        ho_ten: ten_chu_ho,
        so_ho_khau: so_ho_khau,
        quan_he_voi_chu_ho: 'Chủ hộ',
        la_chu_ho: true,
        ngay_sinh: '', // Có thể thêm trường này vào form nếu cần
        gioi_tinh: '', // Có thể thêm trường này vào form nếu cần
        cmnd: '', // Có thể thêm trường này vào form nếu cần
        nghe_nghiep: '' // Có thể thêm trường này vào form nếu cần
    });

    await writeData();
    updateHouseholdList();
    showNotification('Thêm hộ khẩu thành công!');
    closeModal('householdModal');
    clearHouseholdForm();
}

function toggleNewbornFields() {
    const laMoiSinh = document.getElementById('laMoiSinh').checked;
    const adultFields = document.getElementById('adultFields');
    adultFields.style.display = laMoiSinh ? 'none' : 'block';
}

async function addIndividual() {
    const laMoiSinh = document.getElementById('laMoiSinh').checked;
    const ho_ten = document.getElementById('hoTen').value;
    const ngay_sinh = document.getElementById('ngaySinh').value;
    const gioi_tinh = document.getElementById('gioiTinh').value;
    const quan_he_voi_chu_ho = document.getElementById('quanHeVoiChuHo').value;
    const so_ho_khau = document.getElementById('soHoKhau').value;

    const individual = {
        ho_ten,
        ngay_sinh,
        gioi_tinh,
        quan_he_voi_chu_ho,
        so_ho_khau,
        bi_danh: '',
        noi_sinh: laMoiSinh ? 'Mới sinh' : '',
        nguyen_quan: '',
        dan_toc: '',
        ngay_dang_ky_thuong_tru: new Date().toISOString().split('T')[0], // Ngày hiện tại
        la_chu_ho: false
    };

    if (laMoiSinh) {
        individual.nghe_nghiep = '';
        individual.noi_lam_viec = '';
        individual.cmnd = '';
        individual.ngay_cap_cmnd = '';
        individual.noi_cap_cmnd = '';
        individual.dia_chi_truoc_khi_chuyen_den = 'Mới sinh';
    } else {
        individual.nghe_nghiep = document.getElementById('ngheNghiep').value;
        individual.noi_lam_viec = document.getElementById('noiLamViec').value;
        individual.cmnd = document.getElementById('cmnd').value;
        individual.ngay_cap_cmnd = document.getElementById('ngayCapCMND').value;
        individual.noi_cap_cmnd = document.getElementById('noiCapCMND').value;
        individual.dia_chi_truoc_khi_chuyen_den = document.getElementById('diaChiTruocKhiChuyenDen').value;
    }

    individuals.push(individual);

    // Cập nhật hộ khẩu tương ứng
    const household = households.find(h => h.so_ho_khau === so_ho_khau);
    if (household) {
        if (!household.thanh_vien) {
            household.thanh_vien = [];
        }
        household.thanh_vien.push(individual.ho_ten);
    }

    await writeData();
    updateIndividualList();
    updateHouseholdList();
    showNotification('Thêm nhân khẩu thành công!');
    closeModal('individualModal');
    clearIndividualForm();
}

function clearIndividualForm() {
    document.getElementById('laMoiSinh').checked = false;
    document.getElementById('hoTen').value = '';
    document.getElementById('ngaySinh').value = '';
    document.getElementById('gioiTinh').value = 'Nam';
    document.getElementById('quanHeVoiChuHo').value = '';
    document.getElementById('soHoKhau').value = '';
    document.getElementById('ngheNghiep').value = '';
    document.getElementById('noiLamViec').value = '';
    document.getElementById('cmnd').value = '';
    document.getElementById('ngayCapCMND').value = '';
    document.getElementById('noiCapCMND').value = '';
    document.getElementById('diaChiTruocKhiChuyenDen').value = '';
    toggleNewbornFields();
}

// Thêm hàm này vào cuối file
window.addEventListener('load', function() {
    document.getElementById('laMoiSinh').addEventListener('change', toggleNewbornFields);
});

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
        const age = new Date().getFullYear() - new Date(individual.ngay_sinh).getFullYear();
        if (age < 18) ageGroups['Dưới 18 tuổi']++;
        else if (age <= 60) ageGroups['18-60 tuổi']++;
        else ageGroups['Trên 60 tuổi']++;

        // Đếm nghề nghiệp
        occupations[individual.nghe_nghiep] = (occupations[individual.nghe_nghiep] || 0) + 1;
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
        const age = new Date().getFullYear() - new Date(individual.ngay_sinh).getFullYear();
        if (age < 18) ageGroups['Dưới 18 tuổi']++;
        else if (age <= 60) ageGroups['18-60 tuổi']++;
        else ageGroups['Trên 60 tuổi']++;

        // Đếm nghề nghiệp
        occupations[individual.nghe_nghiep] = (occupations[individual.nghe_nghiep] || 0) + 1;
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

function showIndividualDetails(index) {
    const individual = individuals[index];
    const detailsHTML = `
        <h3>Chi tiết nhân khu</h3>
        <p><strong>Họ và tên:</strong> ${individual.ho_ten}</p>
        <p><strong>Bí danh:</strong> ${individual.bi_danh || 'Không có'}</p>
        <p><strong>Ngày sinh:</strong> ${individual.ngay_sinh.split('T')[0]}</p>
        <p><strong>Nơi sinh:</strong> ${individual.noi_sinh}</p>
        <p><strong>Nguyên quán:</strong> ${individual.nguyen_quan}</p>
        <p><strong>Dân tộc:</strong> ${individual.dan_toc}</p>
        <p><strong>Nghề nghiệp:</strong> ${individual.nghe_nghiep}</p>
        <p><strong>Nơi làm việc:</strong> ${individual.noi_lam_viec || 'Không có'}</p>
        <p><strong>CMND/CCCD:</strong> ${individual.cmnd}</p>
        <p><strong>Ngày cấp CMND/CCCD:</strong> ${individual.ngay_cap_cmnd.split('T')[0]}</p>
        <p><strong>Nơi cấp CMND/CCCD:</strong> ${individual.noi_cap_cmnd}</p>
        <p><strong>Ngày đăng ký thường trú:</strong> ${individual.ngay_dang_ky_thuong_tru.split('T')[0]}</p>
        <p><strong>Địa chỉ trước khi chuyển đến:</strong> ${individual.dia_chi_truoc_khi_chuyen_den || 'Không có'}</p>
        <p><strong>Quan hệ với chủ hộ:</strong> ${individual.quan_he_voi_chu_ho || 'Không có'}</p>
        <p><strong>Là chủ hộ:</strong> ${individual.la_chu_ho ? 'Có' : 'Không'}</p>
    `;
    showModal('detailsModal', detailsHTML);
}

// Cập nhật hàm showModal để hỗ trợ nội dung tùy chỉnh
function showModal(modalId, content = null) {
    const modal = document.getElementById(modalId);
    if (content) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            ${content}
        `;
        
        // Thêm event listener cho nút đóng
        const closeButton = modalContent.querySelector('.close');
        closeButton.onclick = function() {
            closeModal(modalId);
        };
    }
    modal.style.display = 'block';
}

function showHouseholdDetails(index) {
    const household = households[index];
    const householdMembers = individuals.filter(individual => individual.so_ho_khau === household.so_ho_khau);
    
    let detailsHTML = `
        <h3>Chi tiết hộ khẩu</h3>
        <p><strong>Số hộ khẩu:</strong> ${household.so_ho_khau}</p>
        <p><strong>Chủ hộ:</strong> ${household.ten_chu_ho}</p>
        <p><strong>Địa chỉ:</strong> ${household.dia_chi_thuong_tru}</p>
        <p><strong>Ngày cấp:</strong> ${household.ngay_cap_ho_khau.split('T')[0]}</p>
        <h4>Thành viên trong hộ:</h4>
        <ul>
    `;
    
    householdMembers.forEach((member, memberIndex) => {
        detailsHTML += `
            <li>
                ${member.ho_ten} (${member.quan_he_voi_chu_ho})
                <button onclick="showIndividualDetails(${individuals.indexOf(member)})">Xem chi tiết</button>
            </li>
        `;
    });
    
    detailsHTML += `
        </ul>
    `;
    
    showModal('detailsModal', detailsHTML);
}
