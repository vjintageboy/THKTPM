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
        console.error('Lỗi khi đc dữ liệu:', error);
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
        const li = document.createElement('li');
        li.className = 'household-item';
        li.innerHTML = `
            <div class="household-info">
                <h4>Số hộ khẩu: ${household.so_ho_khau || 'N/A'}</h4>
                <p><strong>Chủ hộ:</strong> ${household.ten_chu_ho || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> ${household.dia_chi_thuong_tru || 'N/A'}</p>
            </div>
            <div class="action-buttons">
                <button onclick="showHouseholdDetails1('${household.so_ho_khau}')">Xem chi tiết</button>
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

    // Lọc ra chỉ những cá nhân là chủ hộ
    const householdHeads = individuals.filter(individual => individual.la_chu_ho);

    // Sắp xếp chủ hộ theo số hộ khẩu
    householdHeads.sort((a, b) => {
        // Giả sử số hộ khẩu có dạng "HKxxx"
        const numA = parseInt(a.so_ho_khau.substring(2));
        const numB = parseInt(b.so_ho_khau.substring(2));
        return numA - numB;
    });

    householdHeads.forEach((head) => {
        const householdBox = document.createElement('div');
        householdBox.className = 'household-box';
        
        householdBox.innerHTML = `
            <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-color);">Hộ khẩu của ${head.ho_ten}</h4>
            <p>Số hộ khẩu: ${head.so_ho_khau}</p>
            <button class="toggle-members" onclick="showHouseholdDetails('${head.so_ho_khau}')">Xem chi tiết</button>
        `;
        
        individualList.appendChild(householdBox);
    });
}

function toggleHouseholdMembers(soHoKhau) {
    const membersList = document.getElementById(`members-${soHoKhau}`);
    if (membersList) {
        membersList.style.display = membersList.style.display === 'none' ? 'block' : 'none';
    }
}

function showEditHouseholdForm(index) {
    const household = households[index];
    console.log('Editing household:', household); // Thêm log này để kiểm tra dữ liệu

    document.getElementById('editHouseholdIndex').value = index;
    document.getElementById('editSoHoKhau').value = household.so_ho_khau || '';
    document.getElementById('editTenChuHo').value = household.ten_chu_ho || '';
    document.getElementById('editDiaChiThuongTru').value = household.dia_chi_thuong_tru || '';
    
    // Xử lý ngày cấp hộ khẩu
    if (household.ngay_cap_ho_khau) {
        const date = new Date(household.ngay_cap_ho_khau);
        if (!isNaN(date.getTime())) {
            // Định dạng ngày thành YYYY-MM-DD để hiển thị trong input type="date"
            document.getElementById('editNgayCapHoKhau').value = date.toISOString().split('T')[0];
        } else {
            console.error('Invalid date:', household.ngay_cap_ho_khau);
            document.getElementById('editNgayCapHoKhau').value = '';
        }
    } else {
        document.getElementById('editNgayCapHoKhau').value = '';
    }

    showModal('editHouseholdModal');
}

async function updateHousehold() {
    const index = document.getElementById('editHouseholdIndex').value;
    const so_ho_khau = document.getElementById('editSoHoKhau').value;
    const ten_chu_ho = document.getElementById('editTenChuHo').value;
    const dia_chi_thuong_tru = document.getElementById('editDiaChiThuongTru').value;
    const ngay_cap_ho_khau = document.getElementById('editNgayCapHoKhau').value;

    households[index] = { 
        so_ho_khau, 
        ten_chu_ho, 
        dia_chi_thuong_tru, 
        ngay_cap_ho_khau: ngay_cap_ho_khau ? new Date(ngay_cap_ho_khau).toISOString() : null 
    };

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
    const household = households[index];
    if (confirm(`Bạn có chắc chắn muốn xóa hộ khẩu số ${household.so_ho_khau}? Tất cả nhân khẩu trong hộ này cũng sẽ bị xóa.`)) {
        try {
            // Xóa tất cả nhân khẩu thuộc hộ khẩu này
            individuals = individuals.filter(individual => individual.so_ho_khau !== household.so_ho_khau);
            
            // Xóa hộ khẩu
            households.splice(index, 1);
            
            await writeData();
            updateHouseholdList();
            updateIndividualList();
            showNotification('Đã xóa hộ khẩu và các nhân khẩu liên quan thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa hộ khẩu:', error);
            showNotification('Có lỗi xảy ra khi xóa hộ khẩu. Vui lòng thử lại.', true);
        }
    }
}

function showEditIndividualForm(index) {
    const individual = individuals[index];
    document.getElementById('editIndividualIndex').value = index;
    document.getElementById('editHoTen').value = individual.ho_ten;
    document.getElementById('editBiDanh').value = individual.bi_danh || '';
    document.getElementById('editNgaySinh').value = formatDateForInput(individual.ngay_sinh);
    document.getElementById('editNoiSinh').value = individual.noi_sinh || '';
    document.getElementById('editNguyenQuan').value = individual.nguyen_quan || '';
    document.getElementById('editDanToc').value = individual.dan_toc || '';
    document.getElementById('editNgheNghiep').value = individual.nghe_nghiep || '';
    document.getElementById('editNoiLamViec').value = individual.noi_lam_viec || '';
    document.getElementById('editCmnd').value = individual.cmnd || '';
    document.getElementById('editNgayCapCMND').value = formatDateForInput(individual.ngay_cap_cmnd);
    document.getElementById('editNoiCapCMND').value = individual.noi_cap_cmnd || '';
    document.getElementById('editNgayDangKyThuongTru').value = formatDateForInput(individual.ngay_dang_ky_thuong_tru);
    document.getElementById('editDiaChiTruocKhiChuyenDen').value = individual.dia_chi_truoc_khi_chuyen_den || '';
    document.getElementById('editQuanHeVoiChuHo').value = individual.quan_he_voi_chu_ho || '';
    document.getElementById('editLaChuHo').checked = individual.la_chu_ho;
    document.getElementById('editGioiTinh').value = individual.gioi_tinh || 'Nam';
    document.getElementById('editSoHoKhau').value = individual.so_ho_khau || '';
    showModal('editIndividualModal');
}

// Thêm hàm mới để định dạng ngày tháng cho input
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
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
    const gioi_tinh = document.getElementById('editGioiTinh').value;
    const so_ho_khau = document.getElementById('editSoHoKhau').value;

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
        la_chu_ho,
        gioi_tinh,
        so_ho_khau,
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
    // Tạo danh sách các số hộ khẩu hiện có
    const householdOptions = households.map(h => 
        `<option value="${h.so_ho_khau}">${h.so_ho_khau} - ${h.ten_chu_ho}</option>`
    ).join('');

    const formHTML = `
        <h3>Thêm nhân khẩu mới</h3>
        <form id="addIndividualForm">
            <label for="soHoKhau">Số hộ khẩu:</label>
            <select id="soHoKhau" required>
                <option value="">-- Chọn số hộ khẩu --</option>
                ${householdOptions}
            </select>
            
            <label for="hoTen">Họ và tên:</label>
            <input type="text" id="hoTen" required>
            
            <label for="biDanh">Bí danh:</label>
            <input type="text" id="biDanh">
            
            <label for="ngaySinh">Ngày sinh:</label>
            <input type="date" id="ngaySinh" required>
            
            <label for="gioiTinh">Giới tính:</label>
            <select id="gioiTinh" required>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
            </select>
            
            <label for="noiSinh">Nơi sinh:</label>
            <input type="text" id="noiSinh">
            
            <label for="nguyenQuan">Nguyên quán:</label>
            <input type="text" id="nguyenQuan">
            
            <label for="danToc">Dân tộc:</label>
            <input type="text" id="danToc">
            
            <label for="ngheNghiep">Nghề nghiệp:</label>
            <input type="text" id="ngheNghiep">
            
            <label for="noiLamViec">Nơi làm việc:</label>
            <input type="text" id="noiLamViec">
            
            <label for="cmnd">Số CMND/CCCD:</label>
            <input type="text" id="cmnd">
            
            <label for="ngayCapCMND">Ngày cấp CMND/CCCD:</label>
            <input type="date" id="ngayCapCMND">
            
            <label for="noiCapCMND">Nơi cấp CMND/CCCD:</label>
            <input type="text" id="noiCapCMND">
            
            <label for="quanHeVoiChuHo">Quan hệ với chủ hộ:</label>
            <input type="text" id="quanHeVoiChuHo" required>
            
            <label for="ngayDangKyThuongTru">Ngày đăng ký thường trú:</label>
            <input type="date" id="ngayDangKyThuongTru">
            
            <label for="diaChiTruocKhiChuyenDen">Địa chỉ trước khi chuyển đến:</label>
            <input type="text" id="diaChiTruocKhiChuyenDen">
            
            <button type="submit">Thêm nhân khẩu</button>
        </form>
    `;

    showModal('individualModal', formHTML);

    document.getElementById('addIndividualForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addIndividual();
    });

    // Log để kiểm tra
    console.log('Số lượng hộ khẩu:', households.length);
    console.log('Danh sách hộ khẩu:', households);
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

    // Thêm ch hộ vào danh sách individuals
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
    const soHoKhau = document.getElementById('soHoKhau').value;
    const hoTen = document.getElementById('hoTen').value;
    const ngaySinh = document.getElementById('ngaySinh').value;
    const gioiTinh = document.getElementById('gioiTinh').value;
    const biDanh = document.getElementById('biDanh').value;
    const noiSinh = document.getElementById('noiSinh').value;
    const nguyenQuan = document.getElementById('nguyenQuan').value;
    const danToc = document.getElementById('danToc').value;
    const ngheNghiep = document.getElementById('ngheNghiep').value;
    const noiLamViec = document.getElementById('noiLamViec').value;
    const cmnd = document.getElementById('cmnd').value;
    const ngayCapCMND = document.getElementById('ngayCapCMND').value;
    const noiCapCMND = document.getElementById('noiCapCMND').value;
    const quanHeVoiChuHo = document.getElementById('quanHeVoiChuHo').value;
    const ngayDangKyThuongTru = document.getElementById('ngayDangKyThuongTru').value;
    const diaChiTruocKhiChuyenDen = document.getElementById('diaChiTruocKhiChuyenDen').value;

    if (!ngaySinh) {
        showNotification('Vui lòng nhập ngày sinh', true);
        return;
    }

    // Kiểm tra xem hộ khẩu đã tồn tại chưa
    const existingHousehold = households.find(h => h.so_ho_khau === soHoKhau);
    if (!existingHousehold) {
        showNotification('Hộ khẩu không tồn tại. Vui lòng tạo hộ khẩu trước.', true);
        return;
    }

    const newIndividual = {
        so_ho_khau: soHoKhau,
        ho_ten: hoTen,
        ngay_sinh: ngaySinh,
        gioi_tinh: gioiTinh,
        bi_danh: biDanh,
        noi_sinh: noiSinh,
        nguyen_quan: nguyenQuan,
        dan_toc: danToc,
        nghe_nghiep: ngheNghiep,
        noi_lam_viec: noiLamViec,
        cmnd: cmnd,
        ngay_cap_cmnd: ngayCapCMND,
        noi_cap_cmnd: noiCapCMND,
        quan_he_voi_chu_ho: quanHeVoiChuHo,
        ngay_dang_ky_thuong_tru: ngayDangKyThuongTru,
        dia_chi_truoc_khi_chuyen_den: diaChiTruocKhiChuyenDen,
        la_chu_ho: quanHeVoiChuHo.toLowerCase() === 'chủ hộ'
    };

    try {
        individuals.push(newIndividual);

        // Nếu là chủ hộ, cập nhật thông tin trong bảng hộ khẩu
        if (newIndividual.la_chu_ho) {
            const householdIndex = households.findIndex(h => h.so_ho_khau === soHoKhau);
            if (householdIndex !== -1) {
                households[householdIndex].ten_chu_ho = hoTen;
            }
        }

        await writeData();
        updateIndividualList();
        updateHouseholdList(); // Cập nhật lại danh sách hộ khẩu nếu có thay đổi
        closeModal('individualModal');
        showNotification('Thêm nhân khẩu thành công!');
    } catch (error) {
        console.error('Lỗi khi thêm nhân khẩu:', error);
        showNotification('Có lỗi xảy ra khi thêm nhân khẩu. Vui lòng thử lại.', true);
    }
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
    const laMoiSinhElement = document.getElementById('laMoiSinh');
    if (laMoiSinhElement) {
        laMoiSinhElement.addEventListener('change', toggleNewbornFields);
    }
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
function showHouseholdDetails1(soHoKhau) {
    const household = households.find(h => h.so_ho_khau === soHoKhau);
    const householdMembers = individuals.filter(individual => individual.so_ho_khau === soHoKhau);
    
    if (!household) {
        console.error(`Không tìm thấy hộ khẩu với số hộ khẩu: ${soHoKhau}`);
        alert('Không tìm thấy hộ khẩu này.');
        return; // Dừng hàm nếu không tìm thấy hộ khẩu
    }

    let detailsHTML = `
        <h3>Chi tiết hộ khẩu</h3>
        <p><strong>Số hộ khẩu:</strong> ${household.so_ho_khau}</p>
        <p><strong>Chủ hộ:</strong> ${household.ten_chu_ho}</p>
        <p><strong>Địa chỉ:</strong> ${household.dia_chi_thuong_tru}</p>
        <p><strong>Ngày cấp:</strong> ${formatDate(household.ngay_cap_ho_khau)}</p>
       
        <ul>
    `;
    
    householdMembers.forEach((member) => {
        detailsHTML += `
            
        `;
    });
    
    detailsHTML += `
        </ul>
        <button onclick="closeModal('detailsModal')">Đóng</button>
    `;

    showModal('detailsModal', detailsHTML); // Hiển thị nội dung trong modal
}
function showHouseholdDetails(soHoKhau) {
    const household = households.find(h => h.so_ho_khau === soHoKhau);
    const householdMembers = individuals.filter(individual => individual.so_ho_khau === soHoKhau);
    
    let detailsHTML = `
        <h3>Chi tiết hộ khẩu</h3>
        <p><strong>Số hộ khẩu:</strong> ${household.so_ho_khau}</p>
        <p><strong>Chủ hộ:</strong> ${household.ten_chu_ho}</p>
        <p><strong>Địa chỉ:</strong> ${household.dia_chi_thuong_tru}</p>
        <p><strong>Ngày cấp:</strong> ${formatDate(household.ngay_cap_ho_khau)}</p>
        <h4>Thành viên trong hộ:</h4>
        <ul>
    `;
    
    householdMembers.forEach((member) => {
        detailsHTML += `
            <li>
                ${member.ho_ten} (${member.quan_he_voi_chu_ho})
                <button style="
                display: flex; position: relative; right: 10px;"
                 onclick="showIndividualDetails(${individuals.indexOf(member)})">Xem chi tiết</button>
            </li>
            <br/>
        `;
    });
    
    detailsHTML += `
        </ul>
        <button 
        style="
        display: inline; position: relative; right: 10px;"
         onclick="showEditHouseholdForm(${households.indexOf(household)})">Sửa hộ khẩu</button>
        <button onclick="closeModal('detailsModal')">Đóng</button>
    `;
    
    showModal('detailsModal', detailsHTML);
}

function showIndividualDetails(index) {
    const individual = individuals[index];
    const detailsHTML = `
        <h3>Chi tiết nhân khẩu</h3>
        <p><strong>Họ và tên:</strong> ${individual.ho_ten}</p>
        <p><strong>Bí danh:</strong> ${individual.bi_danh || 'Không có'}</p>
        <p><strong>Ngày sinh:</strong> ${formatDate(individual.ngay_sinh)}</p>
        <p><strong>Giới tính:</strong> ${individual.gioi_tinh || 'Không xác định'}</p>
        <p><strong>Nơi sinh:</strong> ${individual.noi_sinh || 'Không có'}</p>
        <p><strong>Nguyên quán:</strong> ${individual.nguyen_quan || 'Không có'}</p>
        <p><strong>Dân tộc:</strong> ${individual.dan_toc || 'Không có'}</p>
        <p><strong>Nghề nghiệp:</strong> ${individual.nghe_nghiep || 'Không có'}</p>
        <p><strong>Nơi làm việc:</strong> ${individual.noi_lam_viec || 'Không có'}</p>
        <p><strong>CMND/CCCD:</strong> ${individual.cmnd || 'Không có'}</p>
        <p><strong>Ngày cấp CMND/CCCD:</strong> ${formatDate(individual.ngay_cap_cmnd)}</p>
        <p><strong>Nơi cấp CMND/CCCD:</strong> ${individual.noi_cap_cmnd || 'Không có'}</p>
        <p><strong>Ngày đăng ký thường trú:</strong> ${formatDate(individual.ngay_dang_ky_thuong_tru)}</p>
        <p><strong>Địa chỉ trước khi chuyển đến:</strong> ${individual.dia_chi_truoc_khi_chuyen_den || 'Không có'}</p>
        <p><strong>Quan hệ với chủ hộ:</strong> ${individual.quan_he_voi_chu_ho || 'Không có'}</p>
        <p><strong>Là chủ hộ:</strong> ${individual.la_chu_ho ? 'Có' : 'Không'}</p>
        <button onclick="showEditIndividualForm(${index})">Sửa nhân khẩu</button>
        <button onclick="closeModal('detailsModal')">Đóng</button>
    `;
    showModal('detailsModal', detailsHTML);
}

// Hàm hỗ trợ để định dạng ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'Không có';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Ngày không hợp lệ' : date.toLocaleDateString('vi-VN');
}

// Cập nhật hàm showModal để hỗ trợ nội dung tùy chỉnh
function showModal(modalId, content = null) {
    const modal = document.getElementById(modalId);
    if (content) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close" onclick="closeModal('${modalId}')">&times;</span>
            ${content}
        `;
    }
    modal.style.display = 'block';
}

// Thêm hàm closeModal nếu chưa có
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
