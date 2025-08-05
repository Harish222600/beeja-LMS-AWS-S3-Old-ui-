const Order = require('../models/order');
const mongoose = require('mongoose');

// ================ ORDER MANAGEMENT ================

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName')
            .sort({ purchaseDate: -1 });

        return res.status(200).json({
            success: true,
            orders,
            message: 'Orders fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await Order.findByIdAndDelete(orderId);

        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate('user', 'firstName lastName email')
         .populate('course', 'courseName');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Get order by user and course (for student invoice)
exports.getOrderByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID'
            });
        }

        const order = await Order.findOne({
            user: userId,
            course: courseId
        })
        .populate('user', 'firstName lastName email additionalDetails')
        .populate('course', 'courseName instructor')
        .populate({
            path: 'course',
            populate: {
                path: 'instructor',
                select: 'firstName lastName email'
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found for this course'
            });
        }

        return res.status(200).json({
            success: true,
            order,
            message: 'Order fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching order by course:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Generate Orders PDF
exports.generateOrdersPDF = async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        
        const orders = await Order.find({})
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName')
            .sort({ purchaseDate: -1 });

        console.log(`Found ${orders.length} orders for PDF generation`);

        // Create a new PDF document with basic options
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4'
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=orders-report.pdf');
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add title
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('Orders Report', { align: 'center' });
        
        doc.moveDown();
        
        // Add generation date
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Generated on: ${new Date().toLocaleDateString('en-IN', {
               day: '2-digit',
               month: 'long',
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
           })}`, { align: 'center' });
        
        doc.moveDown(2);

        // Add summary section
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
        const activeOrders = orders.filter(order => order.status).length;
        const freeOrders = orders.filter(order => order.amount === 0).length;
        const paidOrders = orders.filter(order => order.amount > 0).length;
        
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Summary:');
        
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Total Orders: ${orders.length}`)
           .text(`Total Revenue: Rs. ${totalRevenue}`)
           .text(`Active Orders: ${activeOrders}`)
           .text(`Inactive Orders: ${orders.length - activeOrders}`)
           .text(`Free Orders: ${freeOrders}`)
           .text(`Paid Orders: ${paidOrders}`);
        
        doc.moveDown(2);

        // Orders details section
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Order Details:');
        
        doc.moveDown();

        if (orders.length === 0) {
            doc.fontSize(12)
               .font('Helvetica')
               .text('No orders found.', { align: 'center' });
        } else {
            // Modern table layout
            const tableTop = doc.y;
            const tableLeft = 50;
            const colWidths = [40, 150, 120, 80, 60, 80];
            const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

            // Table headers with modern styling
            doc.rect(tableLeft, tableTop, tableWidth, 30)
               .fill('#2c3e50');

            let xPos = tableLeft;
            const headers = ['S.No', 'User Details', 'Course', 'Amount', 'Status', 'Date'];
            
            // Header text
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fill('#ffffff');
            
            headers.forEach((header, i) => {
                doc.text(header, xPos, tableTop + 10, {
                    width: colWidths[i],
                    align: i === 3 ? 'right' : 'center' // Right align Amount column
                });
                xPos += colWidths[i];
            });

            let yPos = tableTop + 35;
            doc.fill('#000000');

            // Add order data
            doc.font('Helvetica').fontSize(9);

            orders.forEach((order, index) => {
                // Check if we need a new page
                if (yPos > 700) {
                    doc.addPage();
                    yPos = 50;
                    
                    // Redraw header on new page
                    doc.rect(tableLeft, yPos - 5, tableWidth, 30)
                       .fill('#2c3e50');
                    
                    xPos = tableLeft;
                    doc.fontSize(10)
                       .font('Helvetica-Bold')
                       .fill('#ffffff');
                    
                    headers.forEach((header, i) => {
                        doc.text(header, xPos, yPos, {
                            width: colWidths[i],
                            align: i === 3 ? 'right' : 'center'
                        });
                        xPos += colWidths[i];
                    });
                    
                    yPos += 35;
                    doc.font('Helvetica').fontSize(9)
                       .fill('#000000');
                }

                // Draw row background
                doc.rect(tableLeft, yPos - 5, tableWidth, 30)
                   .fill(index % 2 === 0 ? '#ffffff' : '#f8f9fa')
                   .stroke('#e5e7eb');

                // Reset position for data
                xPos = tableLeft;
                
                // S.No
                doc.font('Helvetica')
                   .fill('#000000')
                   .text((index + 1).toString(), xPos + 5, yPos + 2, {
                    width: colWidths[0] - 10,
                    align: 'center'
                });
                xPos += colWidths[0];
                
                // User Details
                const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'N/A';
                const userEmail = order.user?.email || 'N/A';
                doc.text(`${userName}\n${userEmail}`, xPos + 5, yPos + 2, {
                    width: colWidths[1] - 10,
                    align: 'left'
                });
                xPos += colWidths[1];
                
                // Course
                const courseName = order.course?.courseName || 'N/A';
                doc.text(courseName, xPos + 5, yPos + 2, {
                    width: colWidths[2] - 10,
                    align: 'left'
                });
                xPos += colWidths[2];
                
                // Amount
                const amountText = order.amount === 0 ? 'Free' : `Rs. ${order.amount}`;
                doc.font('Helvetica-Bold')
                   .text(amountText, xPos + 5, yPos + 2, {
                    width: colWidths[3] - 10,
                    align: 'right'
                });
                xPos += colWidths[3];
                
                // Status
                doc.font('Helvetica')
                   .text(order.status ? 'Active' : 'Inactive', xPos + 5, yPos + 2, {
                    width: colWidths[4] - 10,
                    align: 'center'
                });
                xPos += colWidths[4];
                
                // Date
                const orderDate = new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                doc.text(orderDate, xPos + 5, yPos + 2, {
                    width: colWidths[5] - 10,
                    align: 'center'
                });
                
                yPos += 30;
            });

            // Draw table outer border
            doc.rect(tableLeft, tableTop, tableWidth, yPos - tableTop)
               .strokeColor('#2c3e50')
               .stroke();
        }

        // Add footer
        doc.fontSize(8)
           .text(`Generated by Beeja Academy | Page 1`, 50, doc.page.height - 50, { align: 'center' });

        // Finalize the PDF
        doc.end();
        
        console.log('PDF generation completed successfully');
        
    } catch (error) {
        console.error('Error generating orders PDF:', error);
        
        // Make sure we don't send headers twice
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Error generating orders PDF',
                error: error.message
            });
        }
    }
};
