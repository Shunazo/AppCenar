let addressModal;
let currentAction = 'add';

document.addEventListener('DOMContentLoaded', () => {
    addressModal = new bootstrap.Modal(document.getElementById('addressModal'));
    initializeEventListeners();
});

function initializeEventListeners() {
    // Add address button
    document.querySelector('[data-bs-target="#addressModal"]').addEventListener('click', () => {
        resetForm();
        currentAction = 'add';
        document.querySelector('#addressModal .modal-title').textContent = 'Nueva Dirección';
    });

    // Edit address buttons
    document.querySelectorAll('.edit-address').forEach(button => {
        button.addEventListener('click', (e) => {
            const addressData = JSON.parse(e.currentTarget.dataset.address);
            populateForm(addressData);
            currentAction = 'edit';
            document.querySelector('#addressModal .modal-title').textContent = 'Editar Dirección';
            addressModal.show();
        });
    });

    // Delete address buttons
    document.querySelectorAll('.delete-address').forEach(button => {
        button.addEventListener('click', async (e) => {
            const addressId = e.currentTarget.closest('[data-address-id]').dataset.addressId;
            if (confirm('¿Está seguro de eliminar esta dirección?')) {
                await deleteAddress(addressId);
            }
        });
    });

    // Set default address buttons
    document.querySelectorAll('.set-default').forEach(button => {
        button.addEventListener('click', async (e) => {
            const addressId = e.currentTarget.closest('[data-address-id]').dataset.addressId;
            await setDefaultAddress(addressId);
        });
    });

    // Save address button
    document.getElementById('saveAddress').addEventListener('click', async () => {
        if (validateForm()) {
            const formData = getFormData();
            if (currentAction === 'add') {
                await addAddress(formData);
            } else {
                await updateAddress(formData);
            }
        }
    });
}

async function addAddress(formData) {
    try {
        const response = await fetch('/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
            location.reload();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function updateAddress(formData) {
    try {
        const response = await fetch(`/addresses/${formData.addressId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
            location.reload();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function deleteAddress(addressId) {
    try {
        const response = await fetch(`/addresses/${addressId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            const addressElement = document.querySelector(`[data-address-id="${addressId}"]`);
            addressElement.remove();
            showAlert('Dirección eliminada exitosamente', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function setDefaultAddress(addressId) {
    try {
        const response = await fetch(`/addresses/${addressId}/default`, {
            method: 'PUT'
        });

        const data = await response.json();
        if (data.success) {
            location.reload();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function validateForm() {
    const form = document.getElementById('addressForm');
    return form.checkValidity();
}

function getFormData() {
    const form = document.getElementById('addressForm');
    const formData = new FormData(form);
    return Object.fromEntries(formData);
}

function populateForm(addressData) {
    const form = document.getElementById('addressForm');
    form.elements.addressId.value = addressData.id;
    form.elements.label.value = addressData.label;
    form.elements.address.value = addressData.address;
    form.elements.reference.value = addressData.reference;
    form.elements.is_default.checked = addressData.is_default;
}

function resetForm() {
    const form = document.getElementById('addressForm');
    form.reset();
    form.elements.addressId.value = '';
}
