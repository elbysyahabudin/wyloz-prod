document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const burgerMenu = document.getElementById('burgerMenu');
    const notificationIcon = document.getElementById("notificationIcon");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const modal = document.getElementById("notificationModal");
    const closeModal = document.querySelector(".close-modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    const notificationBadge = document.getElementById("notificationBadge");
    const sendTelegramBtn = document.getElementById("sendTelegramBtn");
    
    // Initialize sidebar toggle
    if (burgerMenu) {
        burgerMenu.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Initialize notification dropdown
    notificationIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        notificationDropdown.style.display = 
            notificationDropdown.style.display === "block" ? "none" : "block";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!notificationIcon.contains(event.target)) {
            notificationDropdown.style.display = "none";
        }
    });

    // Modal controls
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Initialize notifications with top products
    initializeNotifications();
        // emailjs.init("O1GlX8I221Gimm6xY");
        (function() {
        emailjs.init("O1GlX8I221Gimm6xY"); // Your EmailJS public key
    })();

    // Telegram send button
    // if (sendTelegramBtn) {
    //     sendTelegramBtn.addEventListener('click', sendManualTelegramReport);
    // }

    if (sendTelegramBtn) {
        sendTelegramBtn.addEventListener('click', async function() {
            console.log("sendEmailReport() 12313 called");

           
            await sendManualTelegramReport();
             // Add this new function
        });
    }

    // Profile dropdown functionality
    const profileIcon = document.querySelector('.profile-icon');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileIcon && profileDropdown) {
        profileIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
            notificationDropdown.style.display = 'none';
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function() {
            profileDropdown.classList.remove('show');
            notificationDropdown.style.display = 'none';
        });

        // Prevent dropdown from closing when clicking inside it
        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout(); // Assuming you have a logout function
        });
    }
});

// async function sendEmailReport() {
//     try {
//         console.log('Starting email report function'); // Debug log
        
//         const topProducts = await fetchTopSellingProducts();
//         console.log('Fetched products:', topProducts); // Debug log
        
//         if (topProducts.length === 0) {
//             console.log('No products to email');
//             alert('No products found to send in email');
//             return;
//         }

//         // Prepare email content
//         let emailContent = '<h2>📊 Produk Terlaris</h2><ul>';
        
//         topProducts.slice(0, 3).forEach((product, index) => {
//             emailContent += `
//                 <li>
//                     <strong>${index + 1}. ${product.nama_produk}</strong><br>
//                     Kategori: ${product.kategori}<br>
//                     Terjual: ${product.total_sold} unit<br>
//                     Laba: Rp${product.total_revenue.toLocaleString('id-ID')}
//                 </li>
//             `;
//         });
        
//         emailContent += '</ul>';
//         console.log('Email content prepared:', emailContent); // Debug log

//         // Verify EmailJS is initialized
//         if (typeof emailjs === 'undefined') {
//             throw new Error('EmailJS is not loaded');
//         }

//         // Send email using EmailJS
//         const emailParams = {
//             to_email: 'edukasindonesia21@gmail.com', // Replace with actual recipient
//             from_name: 'Sales Report System',
//             subject: 'Laporan Produk Terlaris Harian',
//             message: emailContent
//         };

//         console.log('Attempting to send email with params:', emailParams); // Debug log
        
//         const response = await emailjs.send(
//             "service_vu7m6k9", // Verify this matches your EmailJS service ID
//             "barnabascollins", // Verify this matches your template ID
//             emailParams
//         );
        
//         console.log('EmailJS response:', response); // Debug log
//         alert('Email report sent successfully! Status: ' + response.status);
//     } catch (error) {
//         console.error('Error sending email report:', error);
//         alert('Failed to send email report: ' + error.message);
        
//         // Additional error details
//         if (error.response) {
//             console.error('EmailJS error response:', error.response);
//         }
//     }
// }



// Telegram functions

async function sendEmailReport() {
    console.log("sendEmailReport() called");

    const SERVICE_ID = "service_vu7m6k9";
    const TEMPLATE_ID = "barnabascollins";

    const templateParams = {
        from_name: "John Doe",
        reply_to: "johndoe@example.com",
        message: "Hello from JavaScript without a form!"
    };

    try {
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
        console.log("✅ Email sent successfully!", response.status, response.text);
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
}


async function sendTelegramMessage(message) {
    const botToken = '7399026635:AAEspm8TxqkgKvOJSBBgUzEeHsQ7EbpBwoY';
    const chatId = '5089184062';
    
    if (!message) return;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();
        console.log('Telegram message sent:', result);
         await sendEmailReport();
        return result;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        throw error;
    }
}

async function sendManualTelegramReport() {
    try {
        const topProducts = await fetchTopSellingProducts();
        let telegramMessage = '<b>📊Produk Terlaris</b>\n\n';
        
        if (topProducts.length === 0) {
            telegramMessage += 'No products found';
        } else {
            topProducts.slice(0, 3).forEach((product, index) => {
                telegramMessage += `🏆 <b>${index + 1}. ${product.nama_produk}</b>\n`;
                telegramMessage += `📦 Kategori: ${product.kategori}\n`;
                telegramMessage += `🛒 Terjual: ${product.total_sold} unit\n`;
                telegramMessage += `💰 Total Uang: Rp${(product.total_revenue).toLocaleString('id-ID')}\n\n`;
            });
        }
        
        await sendTelegramMessage(telegramMessage);
        alert('Report sent to Telegram successfully!');
    } catch (error) {
        console.error('Error sending report:', error);
        alert('Failed to send report to Telegram.');
    }
}

// Notification functions
async function initializeNotifications() {
    await updateNotifications();
    setInterval(updateNotifications, 30 * 60 * 1000); // Check every 30 minutes, but won't send unless a day has passed
}

function shouldSendNotifications() {
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    
    // If we've never sent a notification, or it's been more than 24 hours
    if (!lastNotificationDate) {
        return true;
    }
    
    const lastDate = new Date(lastNotificationDate);
    const now = new Date();
    const hoursDiff = (now - lastDate) / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
}

function updateLastNotificationDate() {
    localStorage.setItem('lastNotificationDate', new Date().toISOString());
}

// In the updateNotifications function
async function updateNotifications() {
    try {
        const topProducts = await fetchTopSellingProducts();
        const notificationDropdown = document.getElementById('notificationDropdown');
        const notificationBadge = document.getElementById('notificationBadge');
        
        // Clear existing notifications
        if (notificationDropdown) {
            notificationDropdown.innerHTML = '';
        }
        
        // Handle case when there's no data
        if (topProducts.length === 0) {
            if (notificationDropdown) {
                notificationDropdown.innerHTML = '<p>Tidak ada produk yang ditemukan</p>';
            }
            if (notificationBadge) {
                notificationBadge.style.display = 'none';
            }
            // Clear the last notification date from localStorage
            localStorage.removeItem('lastNotificationDate');
            return; // Exit early since there's no data
        }
        
        // Add top products to notifications (max 3)
        topProducts.slice(0, 3).forEach((product, index) => {
            if (notificationDropdown) {
                const notifItem = document.createElement('p');
                notifItem.className = 'notif-item';
                notifItem.innerHTML = `
                    <strong>${product.nama_produk}</strong><br>
                    Terjual: ${product.total_sold} | Total Uang: Rp${(product.total_revenue).toLocaleString('id-ID')}
                `;
                notifItem.dataset.details = `
                    Product: ${product.nama_produk}<br>
                    Kategori: ${product.kategori}<br>
                    Total terjual: ${product.total_sold} units<br>
                    Total Uang: Rp${(product.total_revenue).toLocaleString('id-ID')}

                `;
                notificationDropdown.appendChild(notifItem);
            }
        });
        
        // Update badge count
        if (notificationBadge) {
            const newCount = Math.min(topProducts.length, 3);
            notificationBadge.textContent = newCount.toString();
            notificationBadge.style.display = newCount > 0 ? 'flex' : 'none';
        }
        
        // Reattach click handlers
        attachNotificationClickHandlers();
        
        // Check if we should send Telegram notification (only once per day)
        if (shouldSendNotifications() && topProducts.length > 0) {
            let telegramMessage = '<b>📊 Produk Terlaris</b>\n\n';
            
            topProducts.slice(0, 3).forEach((product, index) => {
                telegramMessage += `🏆 <b>${index + 1}. ${product.nama_produk}</b>\n`;
                telegramMessage += `📦 Kategori: ${product.kategori}\n`;
                telegramMessage += `🛒 Terjual: ${product.total_sold} units\n`;
                telegramMessage += `💰 Total Uang: Rp${(product.total_revenue).toLocaleString('id-ID')}\n\n`;

            });
            
            // Send Telegram message
            await sendTelegramMessage(telegramMessage);
            
            // Update the last notification date
            updateLastNotificationDate();
        }
    } catch (error) {
        console.error('Error updating notifications:', error);
    }
}

// In the fetchTopSellingProducts function
async function fetchTopSellingProducts() {
    try {
        const supabaseUrl = 'https://trqvushwhkvchkgqhmge.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycXZ1c2h3aGt2Y2hrZ3FobWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDU1MjUsImV4cCI6MjA1MzQ4MTUyNX0.J-yggfqvHPQtP-Zk-bwOxTRqD64J6jgQ_DOLCCp-JxY';
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

        // Step 1: Count rows in the table
        const { count, error: countError } = await supabaseClient
            .from('tabel_produk')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        if (count <= 40) {
            console.log('Not enough data to fetch top selling products');
            return [];
        }

        // Step 2: Fetch and process data
        const { data, error } = await supabaseClient
            .from('tabel_produk')
            .select('nama_produk, kategori, kuantitas, harga');

        if (error) throw error;
        if (!data || data.length === 0) return [];

        const productMap = {};

        data.forEach(item => {
            if (!productMap[item.nama_produk]) {
                productMap[item.nama_produk] = {
                    nama_produk: item.nama_produk,
                    kategori: item.kategori,
                    total_sold: 0,
                    total_revenue: 0
                };
            }

            productMap[item.nama_produk].total_sold += item.kuantitas;
            productMap[item.nama_produk].total_revenue += item.harga * item.kuantitas;
        });

        const products = Object.values(productMap);
        products.sort((a, b) => {
            if (b.total_sold !== a.total_sold) {
                return b.total_sold - a.total_sold;
            }
            return b.total_revenue - a.total_revenue;
        });

        return products.slice(0, 3);

    } catch (error) {
        console.error('Error fetching top products:', error);
        return [];
    }
}

function attachNotificationClickHandlers() {
    const notificationItems = document.querySelectorAll('.notif-item');
    
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');
            const modal = document.getElementById('notificationModal');
            const notificationBadge = document.getElementById('notificationBadge');
            
            if (modalTitle && modalContent && modal) {
                modalTitle.textContent = 'Product Sales Details';
                modalContent.innerHTML = this.dataset.details;
                modal.style.display = 'flex';
            }
            
            // Decrement the notification badge count
            if (notificationBadge) {
                const currentCount = parseInt(notificationBadge.textContent);
                if (currentCount > 0) {
                    const newCount = currentCount - 1;
                    notificationBadge.textContent = newCount.toString();
                    
                    if (newCount === 0) {
                        notificationBadge.style.display = 'none';
                    }
                }
            }
            
            // Remove the clicked notification item
            this.remove();
            
            // Hide dropdown
            const notificationDropdown = document.getElementById('notificationDropdown');
            if (notificationDropdown) {
                notificationDropdown.style.display = 'none';
            }
        });
    });
}

// Mock logout function - replace with your actual implementation
function logout() {
    console.log('User logged out');
    // Add your logout logic here
    // e.g., clear session, redirect to login page, etc.
}
