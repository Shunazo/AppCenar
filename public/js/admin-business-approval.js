async function viewDocuments(businessId) {
    try {
        const response = await fetch(`/admin/business/${businessId}/documents`);
        const documents = await response.json();
        
        const container = document.getElementById('documentsContainer');
        container.innerHTML = documents.map(doc => `
            <div class="card mb-3">
                <div class="card-header">
                    <h6>${doc.document_type}</h6>
                </div>
                <div class="card-body">
                    ${getDocumentPreview(doc)}
                </div>
            </div>
        `).join('');
        
        $('#documentsModal').modal('show');
    } catch (error) {
        showAlert('Error al cargar documentos', 'error');
    }
}

function getDocumentPreview(doc) {
    const extension = doc.file_path.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png'].includes(extension)) {
        return `<img src="${doc.file_path}" class="img-fluid">`;
    } else if (extension === 'pdf') {
        return `
            <iframe src="${doc.file_path}" width="100%" height="500px">
                Este navegador no soporta la visualización de PDFs.
            </iframe>
        `;
    }
    return `<a href="${doc.file_path}" target="_blank" class="btn btn-primary">Ver Documento</a>`;
}

async function approveBusiness(businessId) {
    const notes = prompt('Notas de aprobación (opcional):');
    if (notes !== null) {
        try {
            const response = await fetch(`/admin/business/${businessId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notes })
            });
            
            if (response.ok) {
                location.reload();
            } else {
                throw new Error('Error al aprobar comercio');
            }
        } catch (error) {
            showAlert('Error al aprobar comercio', 'error');
        }
    }
}

async function rejectBusiness(businessId) {
    const reason = prompt('Motivo del rechazo:');
    if (reason) {
        try {
            const response = await fetch(`/admin/business/${businessId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            
            if (response.ok) {
                location.reload();
            } else {
                throw new Error('Error al rechazar comercio');
            }
        } catch (error) {
            showAlert('Error al rechazar comercio', 'error');
        }
    }
}
