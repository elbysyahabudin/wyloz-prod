
const supabaseClient = supabase.createClient(
    'https://trqvushwhkvchkgqhmge.supabase.co', // 🔁 Replace with your Supabase project URL
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycXZ1c2h3aGt2Y2hrZ3FobWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDU1MjUsImV4cCI6MjA1MzQ4MTUyNX0.J-yggfqvHPQtP-Zk-bwOxTRqD64J6jgQ_DOLCCp-JxY' // 🔁 Replace with your public anon key
);
// Show selected file name
document.getElementById('fileInput').addEventListener('change', function(e) {
    const fileName = e.target.files.length ? e.target.files[0].name : 'No file chosen';
    document.getElementById('fileName').textContent = fileName;
});

// Smart capitalization that preserves manual caps
function smartCapitalize(inputElement) {
    const cursorPos = inputElement.selectionStart;
    const originalValue = inputElement.value;
    
    if (cursorPos === originalValue.length) {
        if (originalValue.length > 0 && originalValue[0] === originalValue[0].toLowerCase()) {
            inputElement.value = originalValue.charAt(0).toUpperCase() + originalValue.slice(1);
        }
        
        inputElement.value = inputElement.value.replace(/(\s+)([a-z])/g, (match, spaces, letter) => {
            return spaces + letter.toUpperCase();
        });
    }
}

// Format number with thousand separators
function formatNumber(input) {
    let num = input.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Set up smart capitalization for name fields
['input1', 'input2', 'input9'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('input', function() {
        smartCapitalize(this);
    });
});

// Set up number formatting for harga
const hargaInput = document.getElementById('input3');
hargaInput.addEventListener('input', function() {
    let cursorPosition = this.selectionStart;
    this.value = formatNumber(this.value);
    let separatorsAdded = this.value.match(/\./g) || [];
    let originalSeparators = this.defaultValue.match(/\./g) || [];
    cursorPosition += separatorsAdded.length - originalSeparators.length;
    this.setSelectionRange(cursorPosition, cursorPosition);
    this.defaultValue = this.value;
});

// Create error message elements for all fields
function createErrorElements() {
    const allFields = [
        'input1', 'input2', 'input3', 'input4', 'input5', 
        'input6', 'input7', 'input8', 'input9', 'input10', 'input11'
    ];
    
    allFields.forEach(id => {
        const inputGroup = document.getElementById(id).parentNode;
        if (!document.getElementById(`${id}-error`)) {
            const errorSpan = document.createElement('span');
            errorSpan.id = `${id}-error`;
            errorSpan.style.color = 'red';
            errorSpan.style.fontSize = '0.8em';
            errorSpan.style.marginTop = '5px';
            errorSpan.style.display = 'none'; // Hidden by default
            inputGroup.appendChild(errorSpan);
        }
    });
}

// Validate a single field (but don't show error yet)
function validateField(field) {
    return field.value.trim() !== '';
}

// Show/hide validation errors
function toggleValidationErrors(show) {
    const allFields = [
        'input1', 'input2', 'input3', 'input4', 'input5', 
        'input6', 'input7', 'input8', 'input9', 'input10', 'input11'
    ];
    
    allFields.forEach(id => {
        const field = document.getElementById(id);
        const errorSpan = document.getElementById(`${id}-error`);
        
        if (show && !validateField(field)) {
            field.style.borderColor = 'red';
            errorSpan.textContent = 'This field must be filled';
            errorSpan.style.display = 'block';
        } else {
            field.style.borderColor = '#ddd';
            errorSpan.style.display = 'none';
        }
    });
}

// Handle form submission
document.querySelector('.submit-btn').addEventListener('click', async function (e) {
    e.preventDefault();

    createErrorElements();

    const allFields = [
        document.getElementById('input1'),
        document.getElementById('input2'),
        document.getElementById('input3'),
        document.getElementById('input4'),
        document.getElementById('input5'),
        document.getElementById('input6'),
        document.getElementById('input7'),
        document.getElementById('input8'),
        document.getElementById('input9'),
        document.getElementById('input10'),
        document.getElementById('input11')
    ];

    const isValid = allFields.every(field => validateField(field));
    toggleValidationErrors(!isValid);

    if (!isValid) return;

    const formData = {
        nama_pelanggan: document.getElementById('input1').value,
        nama_produk: document.getElementById('input2').value,
        harga: parseInt(document.getElementById('input3').value.replace(/\./g, '')),
        kuantitas: parseInt(document.getElementById('input5').value),
        kategori: document.getElementById('input4').value,
        pengiriman: document.getElementById('input6').value,
        metode_pembayaran: document.getElementById('input7').value,
        kurir: document.getElementById('input8').value,
        kota_pelanggan: document.getElementById('input9').value,
        provinsi: document.getElementById('input10').value,
        tanggal_pembelian: document.getElementById('input11').value
    };

    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        const { data, error } = await supabaseClient.from('tabel_produk').insert([formData]);

        if (error) throw error;

        // Show success alert
        Swal.fire({
            title: 'Success!',
            text: 'Data telah tersimpan',
            icon: 'success',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true
        }).then(() => {
            // Redirect to data.html after alert is closed
            window.location.href = 'data.html';
        });

        document.querySelectorAll('input:not([type="file"]), select').forEach(el => {
            el.value = el.id === 'input5' ? '1' : '';
            el.style.borderColor = '#ddd';
        });

        document.getElementById('fileName').textContent = 'No file chosen';
        toggleValidationErrors(false);
    } catch (error) {
        console.error('Supabase insert error:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to submit data: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Submit';
    }
});
// Excel import functionality
// Replace the existing importBtn event listener with this improved version
document.getElementById('importBtn').addEventListener('click', async function() {
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

if (!file) {
// alert('Please select an Excel file first');
return;
}

// Show progress container
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

progressContainer.style.display = 'block';
successMessage.style.display = 'none';
errorMessage.style.display = 'none';

// Disable import button during processing
const importBtn = document.getElementById('importBtn');
importBtn.disabled = true;
importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

try {
// Read the Excel file
const data = await readExcelFile(file);

if (!data || data.length === 0) {
    throw new Error('No data found in the Excel file');
}

// Process the data in batches
const batchSize = 5;
const totalRecords = data.length;
let processedRecords = 0;
let successfulImports = 0;
const failedRecords = [];

// Update progress
function updateProgress() {
    const percent = Math.round((processedRecords / totalRecords) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `Memproses: ${percent}% (${processedRecords}/${totalRecords} data)`;
}

// Process in batches
for (let i = 0; i < totalRecords; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Process each record in the batch
    for (const [index, record] of batch.entries()) {
        const recordNumber = i + index + 1;
        try {
            console.log(`Processing record ${recordNumber}:`, record);
            
            // Validate required fields
            if (!record.nama_pelanggan || !record.nama_produk || !record.harga) {
                throw new Error('Missing required fields');
            }
            
            // Ensure harga is a number
            if (isNaN(record.harga)) {
                throw new Error('Invalid price value');
            }
            
            // Use Supabase only (removed fetch code)
            const { error } = await supabaseClient
                .from('tabel_produk')
                .insert([record]);

            if (error) {
                throw new Error(error.message);
            }
            
            successfulImports++;
        } catch (error) {
            console.error(`Error importing record ${recordNumber}:`, error);
            failedRecords.push({
                recordNumber,
                error: error.message,
                data: record
            });
        } finally {
            processedRecords++;
            updateProgress();
        }
    }
    
    // Small delay between batches to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
}

// Show results
if (failedRecords.length === 0) {
    successMessage.textContent = `Berhasil memasukkan ${totalRecords} data`;
    successMessage.style.display = 'block';
} else {
    successMessage.textContent = `Berhasil memasukkan ${successfulImports} dari ${totalRecords} data`;
    successMessage.style.display = 'block';
    
    errorMessage.innerHTML = `
        <strong>${failedRecords.length} records failed to import:</strong>
        <ul>
            ${failedRecords.slice(0, 5).map(f => 
                `<li>Record ${f.recordNumber}: ${f.error}</li>`
            ).join('')}
        </ul>
        ${failedRecords.length > 5 ? `<p>...and ${failedRecords.length - 5} more failures</p>` : ''}
        <p>Check browser console for complete error details.</p>
    `;
    errorMessage.style.display = 'block';
}

} catch (error) {
console.error('Error processing Excel file:', error);
errorMessage.textContent = `Error: ${error.message}`;
errorMessage.style.display = 'block';
} finally {
importBtn.disabled = false;
importBtn.innerHTML = '<i class="fas fa-file-import"></i> Masukkan Data';
}
});
// Function to read Excel file and map to our data structure
async function readExcelFile(file) {
return new Promise((resolve, reject) => {
const reader = new FileReader();

reader.onload = function(e) {
    try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!jsonData || jsonData.length === 0) {
            reject(new Error('No data found in the Excel sheet'));
            return;
        }
        
        // Map the Excel data to our data structure
        const mappedData = jsonData.map(row => {
            // Initialize the result object
            const result = {
                nama_pelanggan: '',
                nama_produk: '',
                harga: 0,
                kuantitas: 1,
                kategori: '',
                pengiriman: 'kurir',
                metode_pembayaran: '',
                kurir: '',
                kota_pelanggan: '',
                provinsi: '',
                tanggal_pembelian: ''
            };
            
            // Map each field with better date handling
            for (const key in row) {
                const value = row[key];
                
                // Skip empty values
                if (value === undefined || value === null || value === '') continue;
                
                // Determine the field based on header name
                if (key.includes('Product Name')) {
                    // Limit to 4 words
                    const fullName = String(value);
                    result.nama_produk = fullName.split(' ').slice(0, 4).join(' ');
                } else if (key.includes('Quantity')) {
                    result.kuantitas = parseInt(value) || 1;
                } else if (key.includes('SKU Unit Original Price')) {
                    // Handle various price formats
                    const price = String(value).replace(/[^\d.]/g, '');
                    result.harga = parseFloat(price) * 1000|| 0;
                } else if (key.includes('Created Time') || key.includes('Tanggal')) {
                    result.tanggal_pembelian = convertExcelDate(value);
                } else if (key.includes('Shipping Provider Name')) {
                    result.kurir = String(value);
                } else if (key.includes('Buyer Username')) {
                    result.nama_pelanggan = String(value);
                } else if (key.includes('Province')) {
                    result.provinsi = String(value);
                } else if (key.includes('Regency and City')) {
                    result.kota_pelanggan = String(value);
                } else if (key.includes('Payment Method')) {
                    result.metode_pembayaran = String(value);
                } else if (key.includes('Product Category')) {
                    result.kategori = String(value);
                }
            }
            
            return result;
        }).filter(item => 
            item.nama_pelanggan && item.nama_produk && item.harga > 0
        );
        
        resolve(mappedData);
    } catch (error) {
        reject(error);
    }
};

reader.onerror = function() {
    reject(new Error('Error reading the file'));
};

reader.readAsArrayBuffer(file);
});
}
// Helper function to convert various date formats to YYYY-MM-DD
function convertExcelDate(dateValue) {
// If it's already a Date object (from Excel)
if (dateValue instanceof Date) {
return dateValue.toISOString().split('T')[0];
}

// If it's a string in DD/MM/YYYY format
if (typeof dateValue === 'string') {
// Handle dates with time component like "31/03/2024 21:17:47"
const datePart = dateValue.split(' ')[0];
const parts = datePart.split('/');

// Check if it's DD/MM/YYYY format
if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to YYYY-MM-DD
}

// Handle other formats if needed
}

// Fallback - return as-is (will likely cause server error)
return dateValue;
}
// Initialize error elements when page loads
document.addEventListener('DOMContentLoaded', createErrorElements);



document.addEventListener('DOMContentLoaded', function () {
    const productNameInput = document.getElementById('input2');
    const priceInput = document.getElementById('input3');
    let products = [];

    async function fetchProducts() {
        try {
            const { data, error } = await supabaseClient
                .from('produk')
                .select('nama_produk, harga');

            if (error) throw error;
            products = data;
            setupAutocomplete();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    function setupAutocomplete() {
        const datalist = document.createElement('datalist');
        datalist.id = 'productSuggestions';
        document.body.appendChild(datalist);
        productNameInput.setAttribute('list', 'productSuggestions');
        productNameInput.setAttribute('autocomplete', 'off');

        productNameInput.addEventListener('input', function () {
            const input = this.value.toLowerCase();
            datalist.innerHTML = '';

            const matches = products.filter(product =>
                product.nama_produk.toLowerCase().includes(input)
            );

            matches.forEach(product => {
                const option = document.createElement('option');
                option.value = product.nama_produk;
                datalist.appendChild(option);
            });

            // Immediately check and update price if the input matches exactly
            updatePrice(this.value);
        });

        function updatePrice(inputValue) {
            const selectedProduct = products.find(
                product => product.nama_produk.toLowerCase() === inputValue.toLowerCase()
            );

            if (selectedProduct) {
                priceInput.value = selectedProduct.harga;
            } else {
                priceInput.value = '';
            }
        }
    }

    fetchProducts();
});
