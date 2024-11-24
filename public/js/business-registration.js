document.getElementById('businessRegistrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/business/register', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            setTimeout(() => {
                window.location.href = '/business/registration-success';
            }, 2000);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showAlert(error.message || 'Error al registrar comercio', 'error');
    }
});

// Preview logo image before upload
document.querySelector('input[name="logo"]').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.createElement('img');
            preview.src = e.target.result;
            preview.style.maxWidth = '200px';
            preview.style.marginTop = '10px';
            
            const container = document.querySelector('input[name="logo"]').parentNode;
            const oldPreview = container.querySelector('img');
            if (oldPreview) {
                container.removeChild(oldPreview);
            }
            container.appendChild(preview);
        }
        reader.readAsDataURL(file);
    }
});
