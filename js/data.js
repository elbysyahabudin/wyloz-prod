 // Initialize Supabase client
 const supabaseUrl = 'https://trqvushwhkvchkgqhmge.supabase.co';
 const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycXZ1c2h3aGt2Y2hrZ3FobWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDU1MjUsImV4cCI6MjA1MzQ4MTUyNX0.J-yggfqvHPQtP-Zk-bwOxTRqD64J6jgQ_DOLCCp-JxY';
 const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Initialize date picker for single date selection
flatpickr("#date-filter", {
    dateFormat: "Y-m-d",
    locale: "id",
    allowInput: true,
    placeholder: "Pilih tanggal"
});

// Initialize date picker for edit modal
flatpickr("#editPurchaseDate", {
    dateFormat: "Y-m-d",
    locale: "id",
    allowInput: true,
    placeholder: "Pilih tanggal"
});

// Modal elements
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const closeEditModal = document.getElementById('closeEditModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelEdit = document.getElementById('cancelEdit');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const editForm = document.getElementById('editForm');

// Global variables for pagination and modals
let currentPage = 1;
const itemsPerPage = 8;
let currentData = [];
let itemToDelete = null;

// Function to capitalize first letter of each word
function capitalizeFirstLetter(string) {
return string.replace(/\b\w/g, char => char.toUpperCase());
}

async function fetchData() {
    try {
    const { data, error } = await supabaseClient
        .from('tabel_produk')
        .select('*')
        .order('no', { ascending: true });
    
    if (error) throw error;
    
    if (!Array.isArray(data)) {
        console.error('Unexpected data format:', data);
        return [];
    }
    
    return data.map(item => ({
        no: item.no,
        customerName: item.nama_pelanggan,
        productName: item.nama_produk,
        quantity: item.kuantitas,
        category: item.kategori,
        shippingMethod: item.pengiriman,
        paymentMethod: item.metode_pembayaran,
        courier: item.kurir,
        customerCity: item.kota_pelanggan,
        customerProvince: item.provinsi,
        purchaseDate: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : ''
        }));
        } catch (error) {
        console.error('Error fetching data:', error);
        return [];
        }
    }

    // Function to populate table with data for current page
    function populateTable(data, page = 1) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach(item => {
 const row = document.createElement('tr');
 
 row.innerHTML = `
     <td><input type="checkbox" class="row-checkbox" data-id="${item.no}"></td>
     <td>${item.no}</td>
     <td>${item.customerName}</td>
     <td>${item.productName}</td>
     <td>${item.quantity}</td>
     <td>${item.category}</td>
     <td>${item.shippingMethod}</td>
     <td>${item.paymentMethod}</td>
     <td>${item.courier}</td>
     <td>${item.customerCity}</td>
     <td>${item.customerProvince}</td>
     <td>${item.purchaseDate}</td>
     <td>
         <div class="action-btns">
             <button class="edit-btn" title="Edit" onclick="openEditModal(${item.no})">
                 <i class="fas fa-edit"></i>
             </button>
             <button class="delete-btn" title="Delete" onclick="openDeleteModal(${item.no})">
                 <i class="fas fa-trash"></i>
             </button>
         </div>
     </td>
 `;
 
 tableBody.appendChild(row);
});

// Update pagination controls
updatePagination(data.length, page);
setupSelectAllCheckbox();
}

function setupSelectAllCheckbox() {
    const selectAll = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    
    selectAll.addEventListener('change', function() {
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    // Also make sure to uncheck "select all" if any row checkbox is unchecked
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (!this.checked) {
                selectAll.checked = false;
            } else {
                // Check if all checkboxes are now checked
                const allChecked = [...rowCheckboxes].every(cb => cb.checked);
                selectAll.checked = allChecked;
            }
        });
    });
}
function getSelectedIds() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.id));
}
async function deleteSelectedItems() {
    const selectedIds = getSelectedIds();
    
    if (selectedIds.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Peringatan',
            text: 'Tidak ada data yang dipilih untuk dihapus.',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const { isConfirmed } = await Swal.fire({
        icon: 'question',
        title: 'Konfirmasi',
        text: `Anda yakin ingin menghapus ${selectedIds.length} data terpilih?`,
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    });

    if (!isConfirmed) return;
    
    try {
        const { error } = await supabaseClient
            .from('tabel_produk')
            .delete()
            .in('no', selectedIds);
        
        if (error) throw error;
        
        // Refresh the data
        const { data, error: fetchError } = await supabaseClient
            .from('tabel_produk')
            .select('*')
            .order('no', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        currentData = data.map(item => ({
            no: item.no,
            customerName: item.nama_pelanggan,
            productName: item.nama_produk,
            quantity: item.kuantitas,
            category: item.kategori,
            shippingMethod: item.pengiriman,
            paymentMethod: item.metode_pembayaran,
            courier: item.kurir,
            customerCity: item.kota_pelanggan,
            customerProvince: item.provinsi,
            purchaseDate: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : ''
        }));
        
        // Adjust current page if we're now on an empty page
        const totalPages = Math.ceil(currentData.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1;
        }
        
        populateTable(currentData, currentPage);
        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: `${selectedIds.length} data berhasil dihapus.`,
            confirmButtonText: 'OK'
        });
    } catch (error) {
        console.error('Error deleting selected items:', error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Gagal menghapus data terpilih.',
            confirmButtonText: 'OK'
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchData();
    currentData = [...data];
    populateTable(currentData, 1);
});

// Add event listener for delete selected button
document.getElementById('delete-selected-btn').addEventListener('click', deleteSelectedItems);

// Function to update pagination controls
function updatePagination(totalItems, currentPage) {
const paginationDiv = document.getElementById('pagination');
paginationDiv.innerHTML = '';

const totalPages = Math.ceil(totalItems / itemsPerPage);

if (totalPages <= 1) return;

// Previous button
const prevButton = document.createElement('button');
prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
prevButton.disabled = currentPage === 1;
prevButton.addEventListener('click', () => {
 if (currentPage > 1) {
     currentPage--;
     populateTable(currentData, currentPage);
 }
});
paginationDiv.appendChild(prevButton);

// Page buttons
const maxVisiblePages = 5;
let startPage, endPage;

if (totalPages <= maxVisiblePages) {
 startPage = 1;
 endPage = totalPages;
} else {
 const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
 const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
 
 if (currentPage <= maxPagesBeforeCurrent) {
     startPage = 1;
     endPage = maxVisiblePages;
 } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
     startPage = totalPages - maxVisiblePages + 1;
     endPage = totalPages;
 } else {
     startPage = currentPage - maxPagesBeforeCurrent;
     endPage = currentPage + maxPagesAfterCurrent;
 }
}

// Add first page and ellipsis if needed
if (startPage > 1) {
 const firstPageButton = document.createElement('button');
 firstPageButton.textContent = '1';
 firstPageButton.addEventListener('click', () => {
     populateTable(currentData, 1);
 });
 paginationDiv.appendChild(firstPageButton);
 
 if (startPage > 2) {
     const ellipsis = document.createElement('span');
     ellipsis.textContent = '...';
     paginationDiv.appendChild(ellipsis);
 }
}

// Add page buttons
for (let i = startPage; i <= endPage; i++) {
 const pageButton = document.createElement('button');
 pageButton.textContent = i;
 if (i === currentPage) {
     pageButton.classList.add('active');
 }
 pageButton.addEventListener('click', () => {
     populateTable(currentData, i);
 });
 paginationDiv.appendChild(pageButton);
}

// Add last page and ellipsis if needed
if (endPage < totalPages) {
 if (endPage < totalPages - 1) {
     const ellipsis = document.createElement('span');
     ellipsis.textContent = '...';
     paginationDiv.appendChild(ellipsis);
 }
 
 const lastPageButton = document.createElement('button');
 lastPageButton.textContent = totalPages;
 lastPageButton.addEventListener('click', () => {
     populateTable(currentData, totalPages);
 });
 paginationDiv.appendChild(lastPageButton);
}

// Next button
const nextButton = document.createElement('button');
nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
nextButton.disabled = currentPage === totalPages;
nextButton.addEventListener('click', () => {
 if (currentPage < totalPages) {
     currentPage++;
     populateTable(currentData, currentPage);
 }
});
paginationDiv.appendChild(nextButton);
}

// Function to apply filters
async function applyFilters() {
const categoryFilter = document.getElementById('category-filter').value.toLowerCase();
const courierFilter = document.getElementById('courier-filter').value.toLowerCase();
const paymentFilter = document.getElementById('payment-filter').value.toLowerCase();
const provinceFilter = document.getElementById('province-filter').value.toLowerCase();
const dateFilter = document.getElementById('date-filter').value;

try {
 let query = supabaseClient
     .from('tabel_produk')
     .select('*')
     .order('no', { ascending: false });
 
 if (categoryFilter) {
     query = query.ilike('kategori', `%${categoryFilter}%`);
 }
 
 if (courierFilter) {
     query = query.ilike('kurir', `%${courierFilter}%`);
 }
 
 if (paymentFilter) {
     query = query.ilike('metode_pembayaran', `%${paymentFilter}%`);
 }
 
 if (provinceFilter) {
     query = query.ilike('provinsi', `%${provinceFilter}%`);
 }
 
 if (dateFilter) {
     query = query.eq('tanggal_pembelian', dateFilter);
 }
 
 const { data, error } = await query;
 
 if (error) throw error;
 
 currentData = data.map(item => ({
     no: item.no,
     customerName: item.nama_pelanggan,
     productName: item.nama_produk,
     quantity: item.kuantitas,
     category: item.kategori,
     shippingMethod: item.pengiriman,
     paymentMethod: item.metode_pembayaran,
     courier: item.kurir,
     customerCity: item.kota_pelanggan,
     customerProvince: item.provinsi,
     purchaseDate: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : ''
 }));
 
 currentPage = 1;
 populateTable(currentData, currentPage);
} catch (error) {
 console.error('Error applying filters:', error);
}
}

// Function to reset filters
async function resetFilters() {
document.getElementById('category-filter').value = '';
document.getElementById('courier-filter').value = '';
document.getElementById('payment-filter').value = '';
document.getElementById('province-filter').value = '';
document.getElementById('date-filter').value = '';

try {
 const { data, error } = await supabaseClient
     .from('tabel_produk')
     .select('*')
     .order('no', { ascending: false });
 
 if (error) throw error;
 
 currentData = data.map(item => ({
     no: item.no,
     customerName: item.nama_pelanggan,
     productName: item.nama_produk,
     quantity: item.kuantitas,
     category: item.kategori,
     shippingMethod: item.pengiriman,
     paymentMethod: item.metode_pembayaran,
     courier: item.kurir,
     customerCity: item.kota_pelanggan,
     customerProvince: item.provinsi,
     purchaseDate: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : ''
 }));
 
 currentPage = 1;
 populateTable(currentData, currentPage);
} catch (error) {
 console.error('Error resetting filters:', error);
}
}

// Function to open edit modal with item data
function openEditModal(id) {
const item = currentData.find(item => item.no === id);
if (!item) {
 // alert('Item not found');
 return;
}

// Populate form with item data
document.getElementById('editId').value = item.no;
document.getElementById('editCustomerName').value = capitalizeFirstLetter(item.customerName);
document.getElementById('editProductName').value = capitalizeFirstLetter(item.productName);
document.getElementById('editQuantity').value = item.quantity;
document.getElementById('editCategory').value = item.category;
document.getElementById('editShippingMethod').value = item.shippingMethod;
document.getElementById('editPaymentMethod').value = item.paymentMethod;
document.getElementById('editCourier').value = item.courier;
document.getElementById('editCustomerCity').value = capitalizeFirstLetter(item.customerCity);
document.getElementById('editCustomerProvince').value = item.customerProvince;
document.getElementById('editPurchaseDate').value = item.purchaseDate;

// Show modal
editModal.style.display = 'flex';
}

// Function to open delete confirmation modal
function openDeleteModal(id) {
itemToDelete = id;
deleteModal.style.display = 'flex';
}

// Function to handle form submission
async function handleEditFormSubmit(e) {
e.preventDefault();

const id = parseInt(document.getElementById('editId').value);
const updatedItem = {
 nama_pelanggan: document.getElementById('editCustomerName').value,
 nama_produk: document.getElementById('editProductName').value,
 harga: 0, // You might want to add a field for this in your form
 kuantitas: parseInt(document.getElementById('editQuantity').value),
 kategori: document.getElementById('editCategory').value,
 pengiriman: document.getElementById('editShippingMethod').value,
 metode_pembayaran: document.getElementById('editPaymentMethod').value,
 kurir: document.getElementById('editCourier').value,
 kota_pelanggan: document.getElementById('editCustomerCity').value,
 provinsi: document.getElementById('editCustomerProvince').value,
 tanggal_pembelian: document.getElementById('editPurchaseDate').value
};

try {
 const { data, error } = await supabaseClient
     .from('tabel_produk')
     .update(updatedItem)
     .eq('no', id)
     .select();
 
 if (error) throw error;
 
 // Refresh the data
 const { data: newData, error: fetchError } = await supabaseClient
     .from('tabel_produk')
     .select('*')
     .order('no', { ascending: false });
 
 if (fetchError) throw fetchError;
 
 currentData = newData.map(item => ({
     no: item.no,
     customerName: item.nama_pelanggan,
     productName: item.nama_produk,
     quantity: item.kuantitas,
     category: item.kategori,
     shippingMethod: item.pengiriman,
     paymentMethod: item.metode_pembayaran,
     courier: item.kurir,
     customerCity: item.kota_pelanggan,
     customerProvince: item.provinsi,
     purchaseDate: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : ''
 }));
 
 populateTable(currentData, currentPage);
 
 // Close modal
 editModal.style.display = 'none';
} catch (error) {
 console.error('Error updating item:', error);
 // alert('Failed to update item');
}
}

// Function to handle delete confirmation
async function handleDelete() {
    if (!itemToDelete) return;

    const id = itemToDelete;

    try {
    const { error } = await supabaseClient
        .from('tabel_produk')
        .delete()
        .eq('no', id);
    
    if (error) throw error;
    
    // Refresh the data
    const { data, error: fetchError } = await supabaseClient
        .from('tabel_produk')
        .select('*')
        .order('no', { ascending: false });
    
    if (fetchError) throw fetchError;
    
    currentData = data.map(item => ({
        no: item.no,
        customerName: item.nama_pelanggan,
        productName: item.nama_produk,
        quantity: item.kuantitas,
        category: item.kategori,
        shippingMethod: item.pengiriman,
        paymentMethod: item.metode_pembayaran,
        courier: item.kurir,
        customerCity: item.kota_pelanggan,
        customerProvince: item.provinsi,
        purchaseDate: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : ''
    }));
    
    // Adjust current page if we're now on an empty page
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (totalPages === 0) {
        currentPage = 1;
    }
    
    // Refresh the table
    populateTable(currentData, currentPage);
    
    // Reset and close modal
    itemToDelete = null;
    deleteModal.style.display = 'none';
    } catch (error) {
    console.error('Error deleting item:', error);
    // alert('Failed to delete item');
    }
}

// Event listeners for modals
closeEditModal.addEventListener('click', () => {
editModal.style.display = 'none';
});

closeDeleteModal.addEventListener('click', () => {
deleteModal.style.display = 'none';
itemToDelete = null;
});

cancelEdit.addEventListener('click', () => {
editModal.style.display = 'none';
});

cancelDelete.addEventListener('click', () => {
deleteModal.style.display = 'none';
itemToDelete = null;
});

confirmDelete.addEventListener('click', handleDelete);

editForm.addEventListener('submit', handleEditFormSubmit);

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
if (e.target === editModal) {
 editModal.style.display = 'none';
}
if (e.target === deleteModal) {
 deleteModal.style.display = 'none';
 itemToDelete = null;
}
});

// Event listeners for filters
document.getElementById('apply-filters').addEventListener('click', applyFilters);
document.getElementById('reset-filters').addEventListener('click', resetFilters);

// Auto-capitalize first letter for text inputs in edit modal
document.getElementById('editCustomerName').addEventListener('input', function(e) {
this.value = capitalizeFirstLetter(this.value);
});

document.getElementById('editProductName').addEventListener('input', function(e) {
this.value = capitalizeFirstLetter(this.value);
});

document.getElementById('editCustomerCity').addEventListener('input', function(e) {
this.value = capitalizeFirstLetter(this.value);
});

document.getElementById('editCustomerProvince').addEventListener('input', function(e) {
this.value = capitalizeFirstLetter(this.value);
});

// Initialize table with data from Supabase
document.addEventListener('DOMContentLoaded', async () => {
const data = await fetchData();
currentData = [...data];
populateTable(currentData, 1);
});

// Get modal elements
const deleteAllModal = document.getElementById('deleteAllModal');
const closeDeleteAllModal = document.getElementById('closeDeleteAllModal');
const cancelDeleteAll = document.getElementById('cancelDeleteAll');
const confirmDeleteAll = document.getElementById('confirmDeleteAll');
const deleteAllBtn = document.getElementById('delete-all-btn');

// Function to open delete all modal
function openDeleteAllModal() {
deleteAllModal.style.display = 'flex';
}
async function resetTableSequence() {
  const client = await pool.connect();
  
  try {
    // Execute the TRUNCATE command
    await client.query('TRUNCATE TABLE tabel_produk RESTART IDENTITY');
    console.log('Table truncated and sequence reset successfully');
  } catch (error) {
    console.error('Error resetting table:', error);
  } finally {
    client.release();
  }
}
// Function to handle delete all confirmation
async function handleDeleteAll() {
    try {
        const { error } = await supabaseClient
            .from('tabel_produk')
            .delete()
            .neq('no', 0); // Delete all records

        if (error) throw error;
const { error: resetError } = await supabaseClient.rpc('reset_tabel_produk');
if (resetError) throw resetError;
        // Refresh the data
        const { data, error: fetchError } = await supabaseClient
            .from('tabel_produk')
            .select('*')
            .order('no', { ascending: false });

        if (fetchError) throw fetchError;

        currentData = data.map(item => ({
            no: item.no,
            customerName: item.nama_pelanggan,
            productName: item.nama_produk,
            quantity: item.kuantitas,
            category: item.kategori,
            shippingMethod: item.pengiriman,
            paymentMethod: item.metode_pembayaran,
            courier: item.kurir,
            customerCity: item.kota_pelanggan,
            customerProvince: item.provinsi,
            purchaseDate: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : ''
        }));

        currentPage = 1;
        populateTable(currentData, currentPage);

        // Show success SweetAlert
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Semua data telah berhasil dihapus.',
            confirmButtonText: 'OK',
            timer: 3000, // Auto close after 3 seconds
            timerProgressBar: true
        });
   
        // Close modal
        deleteAllModal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting all items:', error);
        
        // Show error SweetAlert
        Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Terjadi kesalahan saat menghapus semua data.',
            confirmButtonText: 'OK'
        });
    }
}

// Event listeners for delete all
deleteAllBtn.addEventListener('click', openDeleteAllModal);
closeDeleteAllModal.addEventListener('click', () => {
deleteAllModal.style.display = 'none';
});
cancelDeleteAll.addEventListener('click', () => {
deleteAllModal.style.display = 'none';
});
confirmDeleteAll.addEventListener('click', handleDeleteAll);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
if (e.target === deleteAllModal) {
 deleteAllModal.style.display = 'none';
}
});

// Add this near your other event listeners
document.getElementById('print-btn').addEventListener('click', printToPDF);

function printToPDF() {
    // Clone the table to avoid modifying the original
    const table = document.querySelector('.data-table').cloneNode(true);
    
    // Remove action buttons from the cloned table
    const actionCells = table.querySelectorAll('td:last-child, th:last-child');
    actionCells.forEach(cell => cell.remove());
    
    // Remove checkboxes from the cloned table
    const checkboxCells = table.querySelectorAll('td:first-child, th:first-child');
    checkboxCells.forEach(cell => cell.remove());
    
    // Create a temporary div to hold the table
    const printDiv = document.createElement('div');
    printDiv.appendChild(table);
    
    // Add title and date
    const title = document.createElement('h2');
    title.textContent = 'Laporan Data Transaksi Wyloz';
    printDiv.insertBefore(title, table);
    
    const date = document.createElement('p');
    date.textContent = 'Dicetak pada: ' + new Date().toLocaleString();
    printDiv.insertBefore(date, table);
    
    // Apply print styles
    printDiv.style.padding = '20px';
    printDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Store original body content
    const originalContent = document.body.innerHTML;
    
    // Replace body content with our printable content
    document.body.innerHTML = printDiv.outerHTML;
    
    // Print the page
    window.print();
    
    // Restore original content
    document.body.innerHTML = originalContent;
    
    // Re-attach event listeners (since we replaced the DOM)
    initializeEventListeners();
}
