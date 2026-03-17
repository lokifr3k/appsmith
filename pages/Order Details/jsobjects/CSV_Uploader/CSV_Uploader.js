export default {
    uploadData: async () => {
        // Grab the data from your uploaded CSV
        const rows = FilePicker1.files[0].data;
        
        // Loop through every single row and push it to PostgreSQL
        for (let i = 0; i < rows.length; i++) {
            await import_csv_row.run(rows[i]);
        }
        
        showAlert("Upload Complete! All historical data imported.", "success");
    }
}