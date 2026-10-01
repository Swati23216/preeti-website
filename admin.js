// =====================================================
// CONFIGURATION
// =====================================================

const API_URL = "http://127.0.0.1:8000";


// =====================================================
// SHOW SECTION
// =====================================================

function showSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.add("hidden");

        });


    const section =
        document.getElementById(sectionId);


    if (!section) {

        console.error(
            "Section not found:",
            sectionId
        );

        return;
    }


    section.classList.remove("hidden");


    // Load required data

    if (sectionId === "dashboard") {
        loadDashboard();
    }

    if (sectionId === "bookings") {
        loadBookings();
    }

    if (sectionId === "followups") {
        loadFollowups();
    }

    if (sectionId === "transactions") {
        loadTransactions();
    }

    if (sectionId === "payments") {
        loadPayments();
    }

    if (sectionId === "subscribers") {
        loadSubscribers();
    }

}



// =====================================================
// DASHBOARD
// =====================================================

// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {

    console.log("Loading dashboard...");

    try {

        const response = await fetch(
            `${API_URL}/api/bookings`
        );

        console.log(
            "Dashboard API status:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "Dashboard API response:",
            data
        );


        // =================================================
        // SUPPORT BOTH RESPONSE FORMATS
        // =================================================

        let bookings = [];

        if (Array.isArray(data)) {

            bookings = data;

        } else if (Array.isArray(data.bookings)) {

            bookings = data.bookings;

        } else if (Array.isArray(data.data)) {

            bookings = data.data;

        }


        console.log(
            "Dashboard bookings count:",
            bookings.length
        );


        // =================================================
        // STATUS NORMALIZATION
        // =================================================

        const getStatus = (booking) => {

            return String(
                booking.status || "Pending"
            ).trim().toLowerCase();

        };


        // =================================================
        // CALCULATE STATISTICS
        // =================================================

        const total =
            bookings.length;


        const pending =
            bookings.filter(
                booking =>
                    getStatus(booking) === "pending"
            ).length;


        const confirmed =
            bookings.filter(
                booking =>
                    getStatus(booking) === "confirmed"
            ).length;


        const completed =
            bookings.filter(
                booking =>
                    getStatus(booking) === "completed"
            ).length;


        const cancelled =
            bookings.filter(
                booking =>
                    getStatus(booking) === "cancelled"
            ).length;


        const other =
            bookings.filter(
                booking =>
                    ![
                        "pending",
                        "confirmed",
                        "completed",
                        "cancelled"
                    ].includes(
                        getStatus(booking)
                    )
            ).length;


        const paid =
            bookings.filter(
                booking =>
                    String(
                        booking.payment_status || ""
                    )
                    .trim()
                    .toLowerCase() === "paid"
            ).length;


        // =================================================
        // UPDATE DASHBOARD CARDS
        // =================================================

        setText(
            "totalBookings",
            total
        );

        setText(
            "pendingBookings",
            pending
        );

        setText(
            "confirmedBookings",
            confirmed
        );

        setText(
            "completedBookings",
            completed
        );

        setText(
            "cancelledBookings",
            cancelled
        );

        setText(
            "paidBookings",
            paid
        );


        // Optional Other card
        setText(
            "otherBookings",
            other
        );


        // =================================================
        // UPDATE QUICK INFORMATION
        // =================================================

        const quickInfo =
            document.getElementById(
                "quickInfo"
            );

        if (quickInfo) {

            quickInfo.innerHTML = `

                <h3>Quick Information</h3>

                <p>
                    📊 All booking statistics are calculated
                    directly from your database.
                </p>

                <p>
                    📅 Total bookings:
                    <strong>${total}</strong>
                </p>

                <p>
                    ⏳ Pending bookings:
                    <strong>${pending}</strong>
                </p>

                <p>
                    ✅ Confirmed bookings:
                    <strong>${confirmed}</strong>
                </p>

                <p>
                    ✔ Completed bookings:
                    <strong>${completed}</strong>
                </p>

                <p>
                    ❌ Cancelled bookings:
                    <strong>${cancelled}</strong>
                </p>

                <p>
                    💰 Paid bookings:
                    <strong>${paid}</strong>
                </p>

            `;

        }


        console.log(
            "Dashboard statistics:",
            {
                total,
                pending,
                confirmed,
                completed,
                cancelled,
                paid,
                other
            }
        );


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );


        setText(
            "totalBookings",
            0
        );

        setText(
            "pendingBookings",
            0
        );

        setText(
            "confirmedBookings",
            0
        );

        setText(
            "completedBookings",
            0
        );

        setText(
            "cancelledBookings",
            0
        );

        setText(
            "paidBookings",
            0
        );

    }

}
// =====================================================
// BOOKINGS
// =====================================================

async function loadBookings() {

    const tableBody =
        document.getElementById(
            "bookingsTableBody"
        );


    if (!tableBody) {

        console.error(
            "bookingsTableBody not found"
        );

        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="9" class="loading">
                Loading bookings...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/api/bookings`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Bookings API response:",
            data
        );


        const bookings =
            data.bookings || [];


        if (!bookings.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="9"
                        class="no-data">

                        No bookings found.

                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML = "";


        bookings.forEach(
            booking => {

                const row =
                    document.createElement("tr");


                const amount =
                    booking.service_amount !== null &&
                    booking.service_amount !== undefined
                        ? `₹${booking.service_amount}`
                        : "—";


                const status =
                    booking.status ||
                    "Pending";


                const paymentStatus =
                    booking.payment_status ||
                    "NOT_DUE";


                row.innerHTML = `

                    <td>
                        <strong>
                            #${booking.booking_id ?? "—"}
                        </strong>
                    </td>


                    <td>
                        <strong>
                            ${escapeHtml(
                                booking.name || "—"
                            )}
                        </strong>
                    </td>


                    <td>
                        ${escapeHtml(
                            booking.phone || "—"
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            booking.event_type ||
                            booking.package ||
                            "—"
                        )}
                    </td>


                    <td>
                        ${formatDate(
                            booking.event_date
                        )}
                    </td>


                    <td>
                        ${amount}
                    </td>


                    <td>

                        <span
                            class="status-badge
                            ${getStatusClass(status)}">

                            ${escapeHtml(status)}

                        </span>

                    </td>


                    <td>

                        <span
                            class="payment-badge
                            ${getPaymentClass(
                                paymentStatus
                            )}">

                            ${formatPaymentStatus(
                                paymentStatus
                            )}

                        </span>

                    </td>


                    <td>

                        <div class="action-buttons">


                            <button
                                class="action-btn view-btn"
                                onclick="viewBooking('${booking._id}')"
                                title="View Booking">

                                👁

                            </button>


                            <button
                                class="action-btn amount-btn"
                                onclick="setAmount('${booking._id}')"
                                title="Set Amount">

                                ₹

                            </button>


                            ${
                                status !== "Confirmed"
                                    ? `
                                    <button
                                        class="action-btn confirm-btn"
                                        onclick="updateBookingStatus(
                                            '${booking._id}',
                                            'Confirmed'
                                        )"
                                        title="Confirm">

                                        ✓

                                    </button>
                                    `
                                    : ""
                            }


                            ${
                                status !== "Completed"
                                    ? `
                                    <button
                                        class="action-btn complete-btn"
                                        onclick="updateBookingStatus(
                                            '${booking._id}',
                                            'Completed'
                                        )"
                                        title="Complete">

                                        ✔

                                    </button>
                                    `
                                    : ""
                            }


                            ${
                                status !== "Cancelled"
                                    ? `
                                    <button
                                        class="action-btn cancel-btn"
                                        onclick="updateBookingStatus(
                                            '${booking._id}',
                                            'Cancelled'
                                        )"
                                        title="Cancel">

                                        ✕

                                    </button>
                                    `
                                    : ""
                            }


                        </div>

                    </td>

                `;


                tableBody.appendChild(row);

            }
        );


        console.log(
            `${bookings.length} bookings displayed`
        );


    } catch (error) {

        console.error(
            "Booking loading error:",
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td colspan="9"
                    class="error-message">

                    Unable to load bookings.

                    <br>

                    <small>
                        ${escapeHtml(
                            error.message
                        )}
                    </small>

                </td>

            </tr>

        `;

    }

}



// =====================================================
// VIEW BOOKING
// =====================================================

async function viewBooking(bookingId) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/bookings`
            );


        const data =
            await response.json();


        const booking =
            (data.bookings || [])
            .find(
                item =>
                    item._id === bookingId
            );


        if (!booking) {

            alert(
                "Booking details not found."
            );

            return;
        }


        alert(`

Booking ID: #${booking.booking_id}

Customer: ${booking.name}

Phone: ${booking.phone}

Email: ${booking.email || "Not provided"}

Service: ${booking.event_type || "-"}

Package: ${booking.package || "-"}

Event Date: ${booking.event_date || "-"}

Event Time: ${booking.event_time || "-"}

Location: ${booking.location || "-"}

Amount: ${
    booking.service_amount !== null &&
    booking.service_amount !== undefined
        ? "₹" + booking.service_amount
        : "Not Set"
}

Status: ${booking.status || "-"}

Payment: ${booking.payment_status || "NOT_DUE"}

Message:
${booking.message || "-"}

        `);


    } catch (error) {

        console.error(
            "View booking error:",
            error
        );

        alert(
            "Unable to load booking details."
        );

    }

}



// =====================================================
// UPDATE BOOKING STATUS
// =====================================================

async function updateBookingStatus(
    bookingId,
    newStatus
) {

    const confirmAction =
        confirm(
            `Change booking status to "${newStatus}"?`
        );


    if (!confirmAction) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/bookings/${bookingId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to update booking"
            );

        }


        alert(
            `Booking marked as ${newStatus}.`
        );


        await loadBookings();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            error.message
        );

    }

}



// =====================================================
// SET SERVICE AMOUNT
// =====================================================




// =====================================================
// SET SERVICE AMOUNT
// =====================================================

async function setAmount(bookingId) {

    console.log("SET AMOUNT");
    console.log("Booking ID:", bookingId);
    console.log("Booking ID type:", typeof bookingId);

    const amountInput = prompt(
        "Enter service amount:\n\nExample: 1000"
    );

    if (amountInput === null) {
        return;
    }

    // Remove ₹ and commas if user enters them
    const cleanedAmount = String(amountInput)
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .trim();

    const numericAmount = Number(cleanedAmount);

    console.log("Entered amount:", amountInput);
    console.log("Cleaned amount:", cleanedAmount);
    console.log("Numeric amount:", numericAmount);

    // Validate amount
    if (
        cleanedAmount === "" ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {
        alert(
            "Please enter a valid amount.\n\n" +
            "Example: 1000"
        );
        return;
    }

    try {

        console.log(
            "Sending amount update to:",
            `${API_URL}/api/bookings/${bookingId}/amount`
        );

        const response = await fetch(
            `${API_URL}/api/bookings/${bookingId}/amount`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    amount: numericAmount
                })
            }
        );

        const data = await response.json();

        console.log("Backend response:", data);

        if (!response.ok) {

            let message = "Unable to update service amount.";

            if (data.detail !== undefined) {

                if (typeof data.detail === "string") {
                    message = data.detail;
                } else {
                    message = JSON.stringify(
                        data.detail,
                        null,
                        2
                    );
                }
            }

            alert(message);
            return;
        }

        alert(
            `Service amount ₹${numericAmount} updated successfully.`
        );

        // Refresh bookings
        await loadBookings();

        // Refresh dashboard
        await loadDashboard();

    } catch (error) {

        console.error(
            "Amount update error:",
            error
        );

        alert(
            "Server error: " +
            (error.message || String(error))
        );
    }
}
// =====================================================
// FOLLOW UPS
// =====================================================

async function loadFollowups() {

    const table =
        document.getElementById(
            "followupsTable"
        );


    if (!table) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/followups`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Followups:",
            data
        );


        const followups =
            data.followups || [];


        table.innerHTML = "";


        if (!followups.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        No follow-ups found.
                    </td>
                </tr>
            `;

            return;
        }


        followups.forEach(
            followup => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            followup.followup_id ??
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            followup.booking_id ??
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            followup.status ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            followup.followup_date ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            followup.notes ||
                            followup.message ||
                            "-"
                        )}
                    </td>

                `;


                table.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Followups error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load follow-ups.
                </td>
            </tr>
        `;

    }

}



// =====================================================
// TRANSACTIONS
// =====================================================

async function loadTransactions() {

    const table =
        document.getElementById(
            "transactionsTable"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/api/transactions`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Transactions:",
            data
        );


        const transactions =
            data.transactions || [];


        table.innerHTML = "";


        if (!transactions.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        No transactions found.
                    </td>
                </tr>
            `;

            return;
        }


        transactions.forEach(
            transaction => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${transaction.booking_id ?? "-"}
                    </td>

                    <td>
                        ${escapeHtml(
                            transaction.transaction_number ||
                            transaction.transaction_id ||
                            "-"
                        )}
                    </td>

                    <td>
                        ₹${transaction.amount ?? "-"}
                    </td>

                    <td>
                        ${escapeHtml(
                            transaction.status ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            transaction.gateway_payment_id ||
                            transaction.payment_id ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${formatDateTime(
                            transaction.created_at
                        )}
                    </td>

                `;


                table.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Transactions error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load transactions.
                </td>
            </tr>
        `;

    }

}



// =====================================================
// PAYMENTS
// =====================================================

async function loadPayments() {

    const table =
        document.getElementById(
            "paymentsTable"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/api/payments`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Payments:",
            data
        );


        const payments =
            data.transactions ||
            data.payments ||
            [];


        table.innerHTML = "";


        if (!payments.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        No payments found.
                    </td>
                </tr>
            `;

            return;
        }


        payments.forEach(
            payment => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${payment.booking_id ?? "-"}
                    </td>

                    <td>
                        ₹${payment.amount ?? "-"}
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.status ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.gateway_payment_id ||
                            payment.payment_id ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.gateway_order_id ||
                            payment.order_id ||
                            "-"
                        )}
                    </td>

                `;


                table.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Payments error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load payments.
                </td>
            </tr>
        `;

    }

}



// =====================================================
// NEWSLETTER SUBSCRIBERS
// =====================================================

async function loadSubscribers() {

    const table =
        document.getElementById(
            "subscribersTable"
        );


    if (!table) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/newsletter/subscribers`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Subscribers:",
            data
        );


        const subscribers =
            data.subscribers || [];


        table.innerHTML = "";


        if (!subscribers.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="3">
                        No subscribers found.
                    </td>
                </tr>
            `;

            return;
        }


        subscribers.forEach(
            (subscriber, index) => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            subscriber.email ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${
                            subscriber.subscribed_at
                                ? formatDateTime(
                                    subscriber.subscribed_at
                                )
                                : "-"
                        }
                    </td>

                `;


                table.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Subscribers error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="3">
                    Unable to load subscribers.
                </td>
            </tr>
        `;

    }

}



// =====================================================
// HELPER FUNCTIONS
// =====================================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}



// =====================================================
// DATE
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }


    // YYYY-MM-DD

    if (
        /^\d{4}-\d{2}-\d{2}$/
        .test(dateValue)
    ) {

        const parts =
            dateValue.split("-");


        return `${parts[2]}-${parts[1]}-${parts[0]}`;

    }


    // DD-MM-YYYY

    if (
        /^\d{2}-\d{2}-\d{4}$/
        .test(dateValue)
    ) {

        return dateValue;

    }


    return dateValue;

}



// =====================================================
// DATE + TIME
// =====================================================

function formatDateTime(value) {

    if (!value) {
        return "—";
    }


    try {

        return new Date(value)
            .toLocaleString();

    } catch {

        return value;

    }

}



// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    switch (status) {

        case "Confirmed":
            return "status-confirmed";

        case "Completed":
            return "status-completed";

        case "Cancelled":
            return "status-cancelled";

        case "Pending":
        default:
            return "status-pending";

    }

}



// =====================================================
// PAYMENT CLASS
// =====================================================

function getPaymentClass(
    paymentStatus
) {

    switch (
        String(
            paymentStatus
        ).toUpperCase()
    ) {

        case "PAID":
            return "payment-paid";

        case "UNPAID":
            return "payment-unpaid";

        case "NOT_DUE":
        default:
            return "payment-not-due";

    }

}



// =====================================================
// PAYMENT DISPLAY
// =====================================================

function formatPaymentStatus(
    paymentStatus
) {

    switch (
        String(
            paymentStatus
        ).toUpperCase()
    ) {

        case "PAID":
            return "Paid";

        case "UNPAID":
            return "Unpaid";

        case "NOT_DUE":
            return "Not Due";

        default:
            return paymentStatus ||
                "Not Due";

    }

}



// =====================================================
// SECURITY
// =====================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Preeti Admin Dashboard Loaded"
        );


        loadDashboard();

    }
);