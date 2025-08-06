document.addEventListener('DOMContentLoaded', async function () {
    // Initialize Supabase client
    const supabaseClient = supabase.createClient(
        'https://trqvushwhkvchkgqhmge.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycXZ1c2h3aGt2Y2hrZ3FobWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDU1MjUsImV4cCI6MjA1MzQ4MTUyNX0.J-yggfqvHPQtP-Zk-bwOxTRqD64J6jgQ_DOLCCp-JxY'
    );

    // Fetch data from Supabase
    const { data: products, error } = await supabaseClient
        .from('tabel_produk')
        .select('*');

    if (error) {
        console.error('Error fetching data from Supabase:', error.message);
        return;
    }

    // Update dashboard with fetched data
    updateDashboard(products);

    function updateDashboard(products) {
        updateSummaryCards(products);
        updateProvinceChart(products);
        updateMonthlySalesChart(products);
        updateTopAndLeastProducts(products);
        updateCategoryChart(products);
        updateShippingChart(products);
        updatePaymentChart(products);
    }

    function updateTopAndLeastProducts(products) {
        const productSales = {};
        
        // Calculate sales for each product
        products.forEach(product => {
            if (!productSales[product.nama_produk]) {
                productSales[product.nama_produk] = {
                    name: product.nama_produk,
                    quantity: 0
                };
            }
            productSales[product.nama_produk].quantity += parseInt(product.kuantitas);
        });

        // Convert to array and sort by quantity
        const productArray = Object.values(productSales);
        const sortedByQuantity = [...productArray].sort((a, b) => b.quantity - a.quantity);

        // Get top and least 3 products by quantity
        const topProductsByQuantity = sortedByQuantity.slice(0, 3);
        const leastProductsByQuantity = sortedByQuantity.slice(-3).reverse();

        // Create pie charts
        createProductPieChart('topProductsChart', 'Produk Terlaris', topProductsByQuantity);
        createProductPieChart('leastProductsChart', 'Produk Kurang Diminati', leastProductsByQuantity);
    }

    function createProductPieChart(canvasId, title, products) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Prepare data for the chart
        const labels = products.map(product => product.name);
        const data = products.map(product => product.quantity);
        
        // Generate distinct colors for each product
        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)'
        ];
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 20
                        }
                    },
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 14
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw} unit`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ... (keep all the other existing functions unchanged) ...
    function updateSummaryCards(products) {
        const totalProducts = products.reduce((sum, product) => sum + parseInt(product.kuantitas), 0);
        const totalRevenue = products.reduce((sum, product) => sum + (parseFloat(product.harga) * parseInt(product.kuantitas)), 0);
        const formattedRevenue = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(totalRevenue);
        document.querySelector('.card:nth-child(1) .card-value').textContent = totalProducts;
        document.querySelector('.card:nth-child(2) .card-value').textContent = formattedRevenue;
    }

    function updateProvinceChart(products) {
        const indonesianProvinces = [
            'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi',
            'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kep. Bangka Belitung',
            'Kep. Riau', 'Jakarta Province', 'West Java', 'Jawa Tengah', 'DI Yogyakarta',
            'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
            'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan',
            'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Utara', 'Sulawesi Tengah',
            'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
            'Maluku', 'Maluku Utara', 'Papua Barat', 'Papua'
        ];

        const provinceSales = {};
        indonesianProvinces.forEach(province => {
            provinceSales[province.toLowerCase()] = 0;
        });

        products.forEach(product => {
            const prov = product.provinsi.toLowerCase();
            for (const predefinedProv in provinceSales) {
                if (prov.includes(predefinedProv) || predefinedProv.includes(prov)) {
                    provinceSales[predefinedProv] += parseInt(product.kuantitas);
                    break;
                }
            }
        });

        const salesData = indonesianProvinces.map(prov => provinceSales[prov.toLowerCase()]);

        const provinceCtx = document.getElementById('provinceChart').getContext('2d');
        new Chart(provinceCtx, {
            type: 'bar',
            data: {
                labels: indonesianProvinces,
                datasets: [{
                    label: 'Jumlah Penjualan',
                    data: salesData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateMonthlySalesChart(products) {
        const monthlySales = Array(12).fill(0);
        products.forEach(product => {
            const date = new Date(product.tanggal_pembelian);
            const month = date.getMonth();
            monthlySales[month] += parseInt(product.kuantitas);
        });

        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        const monthlySalesCtx = document.getElementById('monthlySalesChart').getContext('2d');
        new Chart(monthlySalesCtx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Total Penjualan (jumlah produk)',
                    data: monthlySales,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateCategoryChart(products) {
        const categorySales = {};
        products.forEach(product => {
            const category = product.kategori.toLowerCase();
            categorySales[category] = (categorySales[category] || 0) + parseInt(product.kuantitas);
        });

        const categories = Object.keys(categorySales);
        const categoryData = categories.map(cat => categorySales[cat]);

        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
                datasets: [{
                    data: categoryData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    function updateShippingChart(products) {
        const shippingMethods = {};
        products.forEach(product => {
            const method = product.kurir.toLowerCase();
            shippingMethods[method] = (shippingMethods[method] || 0) + parseInt(product.kuantitas);
        });

        const methods = Object.keys(shippingMethods);
        const methodData = methods.map(method => shippingMethods[method]);

        const shippingCtx = document.getElementById('shippingChart').getContext('2d');
        new Chart(shippingCtx, {
            type: 'doughnut',
            data: {
                labels: methods.map(method => method.toUpperCase()),
                datasets: [{
                    data: methodData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    function updatePaymentChart(products) {
        const paymentMethods = {};
        products.forEach(product => {
            const method = product.metode_pembayaran.toLowerCase();
            paymentMethods[method] = (paymentMethods[method] || 0) + parseInt(product.kuantitas);
        });

        const methods = Object.keys(paymentMethods);
        const methodData = methods.map(method => paymentMethods[method]);

        const paymentCtx = document.getElementById('paymentChart').getContext('2d');
        new Chart(paymentCtx, {
            type: 'doughnut',
            data: {
                labels: methods.map(method => {
                    if (method === 'kredit') return 'Credit Card';
                    if (method === 'transfer') return 'Bank Transfer';
                    return method.toUpperCase();
                }),
                datasets: [{
                    data: methodData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
});