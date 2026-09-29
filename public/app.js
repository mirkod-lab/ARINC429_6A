const form = document.querySelector('#instrument-form');
const descriptionInput = document.querySelector('#ins_descripcion');
const list = document.querySelector('#instrument-list');
const status = document.querySelector('#status');
const emptyState = document.querySelector('#empty-state');
const formTitle = document.querySelector('#form-title');
const formMode = document.querySelector('#form-mode');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const refreshButton = document.querySelector('#refresh-button');

let editingId = null;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || `Error HTTP ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('status-error', isError);
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = 'Nuevo instrumento';
  formMode.textContent = 'CREAR';
  saveButton.textContent = 'Guardar';
  cancelButton.hidden = true;
}

function renderInstruments(instruments) {
  list.replaceChildren();
  emptyState.hidden = instruments.length > 0;

  instruments.forEach((instrument) => {
    const row = document.createElement('tr');
    const idCell = document.createElement('td');
    const descriptionCell = document.createElement('td');
    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    idCell.textContent = instrument.ins_id;
    idCell.className = 'id-cell';
    descriptionCell.textContent = instrument.ins_descripcion;
    actions.className = 'actions';
    editButton.type = 'button';
    editButton.className = 'button button-small button-secondary';
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', () => {
      editingId = instrument.ins_id;
      descriptionInput.value = instrument.ins_descripcion;
      formTitle.textContent = `Editar instrumento #${instrument.ins_id}`;
      formMode.textContent = 'EDITAR';
      saveButton.textContent = 'Guardar cambios';
      cancelButton.hidden = false;
      descriptionInput.focus();
    });

    deleteButton.type = 'button';
    deleteButton.className = 'button button-small button-danger';
    deleteButton.textContent = 'Eliminar';
    deleteButton.addEventListener('click', async () => {
      if (!window.confirm(`¿Eliminar el instrumento #${instrument.ins_id}?`)) {
        return;
      }
      try {
        await request(`/api/instrumentos/${instrument.ins_id}`, { method: 'DELETE' });
        if (editingId === instrument.ins_id) {
          resetForm();
        }
        showStatus('Instrumento eliminado.');
        await loadInstruments();
      } catch (error) {
        showStatus(error.message, true);
      }
    });

    actions.append(editButton, deleteButton);
    actionsCell.append(actions);
    row.append(idCell, descriptionCell, actionsCell);
    list.append(row);
  });
}

async function loadInstruments() {
  try {
    const instruments = await request('/api/instrumentos');
    renderInstruments(instruments);
  } catch (error) {
    renderInstruments([]);
    showStatus(error.message, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const description = descriptionInput.value.trim();
  const isEditing = editingId !== null;

  try {
    await request(
      isEditing ? `/api/instrumentos/${editingId}` : '/api/instrumentos',
      {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({ ins_descripcion: description })
      }
    );
    resetForm();
    showStatus(isEditing ? 'Cambios guardados.' : 'Instrumento creado.');
    await loadInstruments();
  } catch (error) {
    showStatus(error.message, true);
  }
});

cancelButton.addEventListener('click', resetForm);
refreshButton.addEventListener('click', loadInstruments);
loadInstruments();
