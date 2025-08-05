import React from 'react'
import { FiX, FiPrinter } from 'react-icons/fi'

export default function InvoiceModal({ order, onClose }) {
  const generatePDF = async () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${order.transactionId}</title>
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Redressed&family=Ubuntu:wght@400;700&display=swap");

            :root {
              --bg-clr: #b3b3b3;
              --white: #fff;
              --invoice-bg: #e7e7e9;
              --primary-clr: #2f2929;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: "Ubuntu", sans-serif;
            }

            body {
              background: var(--bg-clr);
              font-size: 12px;
              line-height: 20px;
              color: var(--primary-clr);
              padding: 0 20px;
            }

            .main_title{
              font-weight: 700;
              font-size: 16px;
              text-transform: uppercase;
              color: var(--primary-clr);
              margin-bottom: 10px;
            }

            .p_title {
              font-weight: 700;
              font-size: 14px;
            }

            .p_title > span{
              font-weight: 400;
              font-size: 12px;
            }

            .text_right {
              text-align: right;
            }

            .text_center {
              text-align: center;
            }

            .i_row{
              display: flex;
            }

            .invoice {
              width: 800px;
              max-width: 100%;
              height: auto;
              background: var(--white);
              margin: 20px auto;
            }

            .invoice > div{
              width: 100%;
              padding: 40px;
            }

            .invoice .invoice_info .i_row,
            .invoice .invoice_payment .i_row{
              justify-content: space-between;
            }

            .invoice .invoice_info,
            .invoice .invoice_terms,
            .invoice .invoice_payment{
              background: var(--invoice-bg);
            }

            .invoice .invoice_payment{
              border-bottom: 1px dashed var(--primary-clr);
            }

            .invoice .invoice_info > div:not(:last-child){
              margin-bottom: 40px;
            } 

            .invoice .invoice_info h1{
              font-size: 38px;
              line-height: 44px;
              color: var(--primary-clr);
            }

            .invoice .w_15 {
              width: 15%;
            }

            .invoice .w_50 {
              width: 50%;
            }

            .invoice .w_55 {
              width: 55%;
            }

            .invoice .i_table .i_row {
              padding: 12px 10px; 
              border: 1px dashed var(--primary-clr); 
              border-bottom: 0;
            }

            .invoice .i_table .i_table_foot .i_row:last-child{
              border-bottom: 1px dashed var(--primary-clr);  
            }

            .invoice .i_table .i_row p{
              margin: 0;
              font-weight: 700;
            }

            .invoice .i_table .i_table_head .i_row,
            .invoice .i_table .i_table_foot .grand_total_wrap{
              background: var(--invoice-bg);
            }

            .invoice .invoice_right .terms{
              margin: 0;
            }

            /* Print Styles */
            @media print {
              body { background: white; padding: 0; }
              .invoice { margin: 0; }
            }
          </style>
        </head>
        <body>
          <section>
            <div class="invoice">
              <div class="invoice_info">
                <div class="i_row">
                  <div class="i_logo">
                    <h1>BEEJA ACADEMY</h1>
                  </div>
                  <div class="title">
                    <h1>INVOICE</h1>
                  </div>
                </div>
                <div class="i_row">
                  <div class="i_to">
                    <div class="main_title">
                      <p>Invoice To</p>
                    </div>
                    <div class="p_title">
                      <p>${`${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'N/A'}</p>
                      <span>Student</span>
                    </div>
                    <div class="p_title">
                      <p>${order.user?.email || 'N/A'}</p>
                      <p>${order.user?.additionalDetails?.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div class="i_details text_right">
                    <div class="main_title">
                      <p>Invoice details</p>
                    </div>
                    <div class="p_title">
                      <p>Invoice No:</p>
                      <span>INV-${order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div class="p_title">
                      <p>Invoice Date:</p>
                      <span>${new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="invoice_table">
                <div class="i_table">
                  <div class="i_table_head">
                    <div class="i_row">
                      <div class="i_col w_55">
                        <p class="p_title">DESCRIPTION</p>
                      </div>
                      <div class="i_col w_15 text_center">
                        <p class="p_title">QTY</p>
                      </div>
                      <div class="i_col w_15 text_center">
                        <p class="p_title">PRICE</p>
                      </div>
                      <div class="i_col w_15 text_right">
                        <p class="p_title">TOTAL</p>
                      </div>
                    </div>
                  </div>
                  <div class="i_table_body">
                    <div class="i_row">
                      <div class="i_col w_55">
                        <p>${order.course?.courseName || 'N/A'}</p>
                        <span>Lifetime Access • Digital Course • Instructor: ${order.course?.instructor?.firstName || 'DineshKumar'}</span>
                      </div>
                      <div class="i_col w_15 text_center">
                        <p>1</p>
                      </div>
                      <div class="i_col w_15 text_center">
                        <p>${order.originalPrice > 0 ? `Rs. ${order.originalPrice}` : (order.amount === 0 ? 'Free' : `Rs. ${order.amount}`)}</p>
                      </div>
                      <div class="i_col w_15 text_right">
                        <p>${order.originalPrice > 0 ? `Rs. ${order.originalPrice}` : (order.amount === 0 ? 'Free' : `Rs. ${order.amount}`)}</p>
                      </div>
                    </div>
                  </div>
                  <div class="i_table_foot">
                    <div class="i_row">
                      <div class="i_col w_50">
                        <p>Sub Total</p>
                        ${(order.couponUsed?.code || order.discountAmount > 0) ? '<p>Discount</p>' : ''}
                      </div>
                      <div class="i_col w_50 text_right">
                        <p>${order.originalPrice > 0 ? `Rs. ${order.originalPrice}` : (order.amount === 0 ? 'Free' : `Rs. ${order.amount}`)}</p>
                        ${(order.couponUsed?.discountAmount > 0 || order.discountAmount > 0) ? `<p style="color: #059669;">Rs. ${((order.couponUsed?.discountAmount || 0) + (order.discountAmount || 0)).toFixed(2)}</p>` : ''}
                      </div>
                    </div>
                    <div class="i_row grand_total_wrap">
                      <div class="i_col w_50">
                        <p>GRAND TOTAL:</p>
                      </div>
                      <div class="i_col w_50 text_right">
                        <p>${order.amount === 0 ? 'Free' : `Rs. ${order.amount}`}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="invoice_payment">
                <div class="i_row">
                  <div class="i_payment">
                    <div class="main_title">
                      <p>Payment Method</p>
                    </div>
                    <div class="p_title">
                      <p>Payment Method:</p>
                      <span>${order.paymentMethod}</span>
                    </div>
                    <div class="p_title">
                      <p>Transaction ID:</p>
                      <span>${order.transactionId}</span>
                    </div>
                  </div>
                  <div class="i_duetotal text_right">
                    <div class="main_title">
                      <p>Payment Status</p>
                    </div>
                    <div class="p_title">
                      <p>Status:</p>
                      <span>✓ Paid</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="invoice_terms">
                <div class="main_title">
                  <p>Company Information</p>
                </div>
                <p><strong>Beeja Academy</strong> - Excellence in Education<br>
                Contact: DineshKumar | Phone: +91 9585113955 | Email: dinesh@beejaacademy.com<br>
                Website: www.beejaacademy.com<br><br>
                Thank you for choosing Beeja Academy! This is a computer-generated invoice.</p>
              </div>
            </div>
          </section>
        </body>
        </html>
      `;
      
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="w-11/12 max-w-4xl rounded-lg border border-richblack-400 bg-richblack-800 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-richblack-700 pb-4">
          <h2 className="text-xl font-semibold text-richblack-5">Order Invoice</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 rounded-md bg-yellow-50 px-4 py-2 text-richblack-900 hover:bg-yellow-25"
            >
              <FiPrinter />
              Print
            </button>
            <button
              onClick={onClose}
              className="text-richblack-300 hover:text-richblack-100"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="mt-6">
          {/* Modern Header with Logo */}
          <div className="bg-gradient-to-r from-richblack-700 to-richblack-800 p-8 rounded-t-lg text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-3xl">🎓</div>
              <div className="text-2xl font-bold text-yellow-50">Beeja Academy</div>
            </div>
            <h1 className="text-4xl font-bold text-yellow-50 mb-3 tracking-wider">INVOICE</h1>
            <p className="text-richblack-25 text-lg">
              Date: {new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-50 to-yellow-100"></div>
          </div>

          {/* From/To Section */}
          <div className="bg-richblack-800 p-6 rounded-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-richblack-700 p-6 rounded-lg border-l-4 border-yellow-50">
                <h3 className="text-lg font-semibold text-yellow-50 mb-4 flex items-center gap-2">
                  <span className="text-blue-400">🏢</span> Bill From:
                </h3>
                <div className="space-y-2">
                  <p className="font-bold text-richblack-5 text-lg">Beeja Academy</p>
                  <p className="text-richblack-300">DineshKumar</p>
                  <p className="text-richblack-300">📞 +91 9585113955</p>
                  <p className="text-richblack-300">✉️ dinesh@beejaacademy.com</p>
                  <p className="text-richblack-300">🌐 www.beejaacademy.com</p>
                </div>
              </div>
              <div className="bg-richblack-700 p-6 rounded-lg border-l-4 border-green-400">
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <span className="text-green-400">👤</span> Bill To:
                </h3>
                <div className="space-y-2">
                  <p className="font-bold text-richblack-5 text-lg">
                    {`${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'N/A'}
                  </p>
                  <p className="text-richblack-300">📞 {order.user?.additionalDetails?.contactNumber || 'N/A'}</p>
                  <p className="text-richblack-300">✉️ {order.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-8 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-richblack-5">Order ID: </span>
                <span className="text-richblack-300">{order._id}</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Transaction ID: </span>
                <span className="text-richblack-300">{order.transactionId}</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Payment Method: </span>
                <span className="text-richblack-300">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Currency: </span>
                <span className="text-richblack-300">INR</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Payment Status: </span>
                <span className="text-green-400">Received</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Enroll On: </span>
                <span className="text-richblack-300">
                  {new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-richblack-800 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-yellow-50 mb-6 flex items-center gap-2">
              <span className="text-yellow-100">📚</span> Course Details
            </h3>
            <div className="overflow-hidden rounded-lg border border-richblack-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-richblack-700 to-richblack-600">
                    <th className="p-4 text-left text-sm font-semibold text-yellow-50">Course Name</th>
                    <th className="p-4 text-left text-sm font-semibold text-yellow-50">Instructor</th>
                    <th className="p-4 text-right text-sm font-semibold text-yellow-50">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-richblack-700 bg-richblack-700 bg-opacity-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-richblack-5">{order.course?.courseName || 'N/A'}</p>
                        <p className="text-xs text-richblack-300">Lifetime Access</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-richblack-5">{order.course?.instructor?.firstName || 'DineshKumar'}</p>
                        <p className="text-xs text-richblack-300">{order.course?.instructor?.email || 'dinesh@beejaacademy.com'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-medium text-yellow-50">{order.amount === 0 ? 'Free' : `Rs. ${order.amount}`}</p>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-richblack-600 bg-richblack-700">
                    <td colSpan="2" className="p-4 text-right font-semibold text-richblack-5">Total Amount:</td>
                    <td className="p-4 text-right">
                      <p className="text-lg font-bold text-yellow-50">{order.amount === 0 ? 'Free' : `Rs. ${order.amount}`}</p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-richblack-800 p-6 rounded-lg mt-8 text-center border-t-2 border-richblack-700">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <p className="text-lg font-semibold text-yellow-50 mb-2">Thank you for choosing Beeja Academy!</p>
                <p className="text-richblack-300">Your trust in our educational platform means a lot to us.</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-50">📧</span>
                  <a href="mailto:dinesh@beejaacademy.com" className="text-yellow-50 hover:text-yellow-100 transition-colors">
                    dinesh@beejaacademy.com
                  </a>
                </div>
                <div className="hidden md:block text-richblack-500">|</div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-50">📱</span>
                  <a href="tel:+919585113955" className="text-yellow-50 hover:text-yellow-100 transition-colors">
                    +91 9585113955
                  </a>
                </div>
              </div>

              <p className="mt-6 text-xs text-richblack-400">
                This is a computer-generated invoice. No signature is required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
