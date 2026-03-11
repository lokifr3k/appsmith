export default {
    saveAll: async () => {
        const orders = tbl_bulk_preview.tableData;
        
        for (let i = 0; i < orders.length; i++) {
            await insert_bulk_order.run({
                order_no: orders[i].order_no,
                order_date: orders[i].order_date,
                size: orders[i].size,
                color: orders[i].color,
                logo: orders[i].logo,
                qty: orders[i].qty,
                instructions: orders[i].instructions
            });
        }
        
        showAlert("All orders saved successfully!", "success");
        await get_all_orders.run();
        resetWidget('inp_bulk_paste');
        closeModal(AddOrderModal.name);
    }
}